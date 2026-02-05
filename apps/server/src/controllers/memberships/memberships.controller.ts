import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { withTransaction, prisma, NotificationType } from "@palash/db-client";
import { ValidationError } from "../../utils/errors.js";
import { createHmac } from "crypto";
import { razorpayConfig } from "../../config/razorpay.config.js";
import { v4 as uuidv4 } from 'uuid';
import Razorpay from "razorpay";

export default class MembershipController {
    private razorpay: Razorpay;

    constructor() {
        this.razorpay = new Razorpay({
            key_id: razorpayConfig.keyId,
            key_secret: razorpayConfig.keySecret
        });
    }

    fetchMembershipPlans = asyncHandler(async (req: Request, res: Response) => {
        try {
            const membershipPlans = await prisma.membershipPlan.findMany();
            return res.status(200).json({
                message: "Membership plans fetched successfully",
                membershipPlans: membershipPlans
            });
        } catch (error) {
            throw new ValidationError("Failed to fetch membership plans");
        }
    });

    fetchUserMembership = asyncHandler(async (req: Request, res: Response) => {
        try {
            const userId = req.user?.userId;
            console.log("Fetching user membership for user:", req.user);

            // Fetch all active memberships for the user
            const activeMemberships = await prisma.userMembership.findMany({
                where: {
                    userId: userId,
                    isActive: true
                },
                include: {
                    plan: true,
                    user: {
                        select: {
                            id: true,
                            name: true,
                            phone_or_email: true
                        }
                    }
                }
            });

            const currentTime = new Date(); // Current time in UTC
            const expiredMembershipIds: string[] = [];

            // Check for expired memberships
            for (const membership of activeMemberships) {
                const membershipEndTime = new Date(membership.endDate);

                // Check if the membership has expired
                if (currentTime > membershipEndTime) {
                    expiredMembershipIds.push(membership.id);
                }
            }

            // Update expired memberships to inactive status
            if (expiredMembershipIds.length > 0) {
                await prisma.userMembership.updateMany({
                    where: {
                        id: { in: expiredMembershipIds }
                    },
                    data: {
                        isActive: false
                    }
                });
            }

            // Fetch all memberships (active and inactive) for the user
            const allUserMemberships = await prisma.userMembership.findMany({
                where: {
                    userId: userId
                },
                include: {
                    plan: true,
                    user: {
                        select: {
                            id: true,
                            name: true,
                            phone_or_email: true
                        }
                    }
                },
                orderBy: {
                    createdAt: 'desc' // Latest memberships first
                }
            });

            // Separate active and inactive memberships
            const activeMembershipsList = allUserMemberships.filter(membership => membership.isActive);
            const inactiveMemberships = allUserMemberships.filter(membership => !membership.isActive);

            console.log("activeMembershipsList: ", activeMembershipsList.length);
            console.log("inactiveMemberships: ", inactiveMemberships.length);
            console.log("allUserMemberships: ", allUserMemberships.length);


            return res.status(200).json({
                message: "User membership fetched successfully",
                activeMemberships: activeMembershipsList,
                inactiveMemberships: inactiveMemberships
            });
        } catch (error) {
            throw new ValidationError("Failed to fetch user membership");
        }
    });

    subscribeToMembership = asyncHandler(async (req: Request, res: Response) => {
        const { planId, memberEmails = [], paymentId } = req.body;
        const primaryUserId = req.user?.userId;

        if (!primaryUserId) {
            return res.status(401).json({
                message: "User not authenticated"
            });
        }

        if (!planId) {
            return res.status(400).json({
                message: "Plan ID is required"
            });
        }

        try {
            // Fetch the membership plan to get maxMembers limit
            const membershipPlan = await prisma.membershipPlan.findUnique({
                where: { id: planId }
            });

            if (!membershipPlan) {
                return res.status(404).json({
                    message: "Membership plan not found"
                });
            }

            // Validate member count (including primary user)
            const totalMembers = memberEmails.length + 1; // +1 for primary user
            if (totalMembers > membershipPlan.maxMembers) {
                return res.status(400).json({
                    message: `Maximum ${membershipPlan.maxMembers} members allowed for this plan. You're trying to add ${totalMembers} members.`
                });
            }

            // Check if primary user already has an active membership
            const existingMembership = await prisma.userMembership.findFirst({
                where: {
                    userId: primaryUserId,
                    isActive: true
                }
            });

            if (existingMembership) {
                return res.status(400).json({
                    message: "User already has an active membership"
                });
            }

            // Get all member users by email
            const memberUsers = memberEmails.length > 0 ? await prisma.user.findMany({
                where: {
                    phone_or_email: {
                        in: memberEmails
                    }
                },
                select: {
                    id: true,
                    phone_or_email: true
                }
            }) : [];

            // Check if all provided emails have accounts
            if (memberUsers.length !== memberEmails.length) {
                const foundEmails = memberUsers.map(user => user.phone_or_email);
                const missingEmails = memberEmails.filter((email: string) => !foundEmails.includes(email));
                return res.status(400).json({
                    message: "Some members don't have accounts",
                    missingEmails
                });
            }

            // Calculate membership dates
            const startDate = new Date();
            const endDate = new Date();
            endDate.setFullYear(startDate.getFullYear() + membershipPlan.renewalPeriodYears);

            // Create memberships in a transaction
            const result = await withTransaction(async (prisma) => {
                
                const memberships = [];

                // Create primary membership
                const primaryMembership = await prisma.userMembership.create({
                    data: {
                        userId: primaryUserId,
                        planId: planId,
                        startDate,
                        endDate,
                        isPrimary: true,
                        isActive: true,
                        parentMembershipId: null // Primary has no parent
                    },
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                phone_or_email: true
                            }
                        },
                        plan: {
                            select: {
                                name: true,
                                cost: true
                            }
                        }
                    }
                });
                memberships.push(primaryMembership);

                // Create memberships for additional members
                for (const memberUser of memberUsers) {
                    const memberMembership = await prisma.userMembership.create({
                        data: {
                            userId: memberUser.id,
                            planId: planId,
                            startDate,
                            endDate,
                            isPrimary: false,
                            isActive: true,
                            parentMembershipId: primaryMembership.id // Link to primary
                        },
                        include: {
                            user: {
                                select: {
                                    id: true,
                                    name: true,
                                    phone_or_email: true
                                }
                            },
                            plan: {
                                select: {
                                    name: true,
                                    cost: true
                                }
                            }
                        }
                    });
                    memberships.push(memberMembership);
                }

                return memberships;
            });

            return res.status(201).json({
                message: "Membership created successfully for all members",
                memberships: result,
                summary: {
                    planName: membershipPlan.name,
                    totalMembers: result.length,
                    primaryMember: result.find(m => m.isPrimary)?.user.name,
                    additionalMembers: result.filter(m => !m.isPrimary).map(m => m.user.name),
                    startDate,
                    endDate
                }
            });

        } catch (error) {
            // If membership creation fails, refund the payment
            console.error('Membership creation failed, initiating refund:', error);
            
            try {
                // Import the payment service to call refund
                const PaymentService = (await import('../../services/payment-gateway/payment.service.js')).default;
                
                // Get payment config from environment
                const paymentConfig = {
                    keyId: razorpayConfig.keyId,
                    keySecret: razorpayConfig.keySecret
                };
                
                const paymentService = new PaymentService(paymentConfig);
                
                // Get membership plan cost for refund amount
                const membershipPlanForRefund = await prisma.membershipPlan.findUnique({
                    where: { id: planId }
                });

                
                await paymentService.processRefund(paymentId, membershipPlanForRefund?.cost?.toString() || '0');
                console.log(`Refund processed successfully for payment: ${paymentId}`);
                
            } catch (refundError) {
                console.error('Refund failed:', refundError);
                // Log refund failure but don't throw - the main error is membership creation failure
            }
            
            // Re-throw the original membership error
            console.error("Error subscribing to membership:", error);
            throw new ValidationError("Failed to subscribe to membership");
        }
    });

    cancelMembership = asyncHandler(async (req: Request, res: Response) => {
        try {
            const { membershipId } = req.body;
            const userId = req.user?.userId;

            if (!userId) {
                return res.status(401).json({
                    message: "User not authenticated"
                });
            }

            if (!membershipId) {
                return res.status(400).json({
                    message: "Membership ID is required"
                });
            }

            const userMembership = await prisma.userMembership.findFirst({
                where: { id: membershipId, userId: userId }
            });

            if (!userMembership) {
                return res.status(404).json({
                    message: "Membership not found"
                });
            }

            if (!userMembership.isPrimary) {
                return res.status(400).json({
                    message: "Only primary members can cancel membership"
                });
            }

            if (!userMembership.isActive) {
                return res.status(400).json({
                    message: "Membership is already cancelled"
                });
            }

            // Cancel the primary membership and all related member memberships
            const result = await withTransaction(async (prisma) => {
                // Cancel the primary membership
                const updatedPrimaryMembership = await prisma.userMembership.update({
                    where: { id: membershipId },
                    data: { isActive: false, rfidCardId: null }
                });

                // Find and cancel all related member memberships using parentMembershipId
                const relatedMemberships = await prisma.userMembership.findMany({
                    where: {
                        parentMembershipId: membershipId,
                        isActive: true
                    },
                    include: {
                        user: {
                            select: {
                                name: true,
                                phone_or_email: true
                            }
                        }
                    }
                });

                console.log(`Found ${relatedMemberships.length} related memberships to cancel`);

                // Cancel all related memberships
                if (relatedMemberships.length > 0) {
                    await prisma.userMembership.updateMany({
                        where: {
                            parentMembershipId: membershipId
                        },
                        data: { isActive: false }
                    });
                }

                return {
                    primaryMembership: updatedPrimaryMembership,
                    cancelledMembers: relatedMemberships.map(m => ({
                        id: m.id,
                        user: m.user
                    })),
                    totalCancelled: relatedMemberships.length + 1 // +1 for primary
                };
            });

            return res.status(200).json({
                message: "Membership cancelled successfully for all members",
                primaryMembership: result.primaryMembership,
                cancelledMembers: result.cancelledMembers,
                totalCancelled: result.totalCancelled
            });
        } catch (error) {
            throw new ValidationError("Failed to cancel membership");
        }
    });
    addMemberToMembership = asyncHandler(async (req: Request, res: Response) => {
        try {
            const { membershipId, memberEmails = [] } = req.body;
            const userId = req.user?.userId;

            if (!userId) {
                return res.status(401).json({
                    message: "User not authenticated"
                });
            }

            if (!membershipId) {
                return res.status(400).json({
                    message: "Membership ID is required"
                });
            }

            const userMembership = await prisma.userMembership.findFirst({
                where: { id: membershipId, userId: userId }
            });

            if (!userMembership) {
                return res.status(404).json({
                    message: "Membership not found"
                });
            }

            if (!userMembership.isPrimary) {
                return res.status(400).json({
                    message: "Only primary members can add members to membership"
                });
            }

            if (!userMembership.isActive) {
                return res.status(400).json({
                    message: "Membership is already cancelled"
                });
            }

            // Get the membership plan to check limits
            const membershipPlan = await prisma.membershipPlan.findUnique({
                where: { id: userMembership.planId }
            });

            if (!membershipPlan) {
                return res.status(404).json({
                    message: "Membership plan not found"
                });
            }

            // Count existing active members in the same membership group
            const existingMembers = await prisma.userMembership.findMany({
                where: {
                    OR: [
                        { id: membershipId }, // Primary membership
                        { parentMembershipId: membershipId } // Related members
                    ],
                    isActive: true
                }
            });

            const currentMemberCount = existingMembers.length;
            const newMemberCount = memberEmails.length;
            const totalAfterAdding = currentMemberCount + newMemberCount;

            if (totalAfterAdding > membershipPlan.maxMembers) {
                return res.status(400).json({
                    message: `Cannot add ${newMemberCount} members. Current: ${currentMemberCount}, Max allowed: ${membershipPlan.maxMembers}. You can add maximum ${membershipPlan.maxMembers - currentMemberCount} more members.`
                });
            }

            const memberUsers = memberEmails.length > 0 ? await prisma.user.findMany({
                where: {
                    phone_or_email: {
                        in: memberEmails
                    }
                },
                select: {
                    id: true,
                    phone_or_email: true
                }
            }) : [];

            if (memberUsers.length !== memberEmails.length) {
                const foundEmails = memberUsers.map(user => user.phone_or_email);
                const missingEmails = memberEmails.filter((email: string) => !foundEmails.includes(email));
                return res.status(400).json({
                    message: "Some members don't have accounts",
                    missingEmails
                });
            }

            // Check if any of the new members already have active memberships in this group
            const existingMemberIds = existingMembers.map(m => m.userId);
            const duplicateMembers = memberUsers.filter(user => existingMemberIds.includes(user.id));

            if (duplicateMembers.length > 0) {
                return res.status(400).json({
                    message: "Some users are already members of this membership",
                    duplicateMembers: duplicateMembers.map(u => u.phone_or_email)
                });
            }

            const result = await withTransaction(async (prisma) => {
                const memberships = [];

                // Create memberships for additional members
                for (const memberUser of memberUsers) {
                    const memberMembership = await prisma.userMembership.create({
                        data: {
                            userId: memberUser.id,
                            planId: userMembership.planId,
                            startDate: userMembership.startDate,
                            endDate: userMembership.endDate,
                            isPrimary: false,
                            isActive: true,
                            parentMembershipId: membershipId // Link to primary membership
                        },
                        include: {
                            user: {
                                select: {
                                    id: true,
                                    name: true,
                                    phone_or_email: true
                                }
                            },
                            plan: {
                                select: {
                                    name: true,
                                    cost: true
                                }
                            }
                        }
                    });
                    memberships.push(memberMembership);
                }

                return memberships;
            });

            return res.status(200).json({
                message: "Member added to membership successfully",
                memberships: result
            });
        } catch (error) {
            throw new ValidationError("Failed to add member to membership");
        }
    });
    removeMemberFromMembership = asyncHandler(async (req: Request, res: Response) => {
        try {
            const { membershipId, memberEmails = [] } = req.body;
            const userId = req.user?.userId;

            if (!userId) {
                return res.status(401).json({
                    message: "User not authenticated"
                });
            }

            if (!membershipId || memberEmails.length === 0) {
                return res.status(400).json({
                    message: "Membership ID and member emails are required"
                });
            }

            // Verify the requesting user is the primary member
            const primaryMembership = await prisma.userMembership.findFirst({
                where: { id: membershipId, userId: userId, isPrimary: true }
            });

            if (!primaryMembership) {
                return res.status(404).json({
                    message: "Primary membership not found or you don't have permission"
                });
            }

            if (!primaryMembership.isActive) {
                return res.status(400).json({
                    message: "Membership is already cancelled"
                });
            }

            // Find the related member memberships to remove using parentMembershipId
            const membersToRemove = await prisma.userMembership.findMany({
                where: {
                    parentMembershipId: membershipId,
                    isActive: true,
                    user: {
                        phone_or_email: {
                            in: memberEmails
                        }
                    }
                },
                include: {
                    user: {
                        select: {
                            name: true,
                            phone_or_email: true
                        }
                    }
                }
            });

            if (membersToRemove.length === 0) {
                return res.status(404).json({
                    message: "No matching members found to remove"
                });
            }

            if (membersToRemove.length !== memberEmails.length) {
                const foundEmails = membersToRemove.map(m => m.user.phone_or_email);
                const notFoundEmails = memberEmails.filter((email: string) => !foundEmails.includes(email));
                return res.status(400).json({
                    message: "Some members not found in this membership",
                    notFoundEmails
                });
            }

            // Remove the members by setting their memberships to inactive
            const result = await withTransaction(async (prisma) => {
                await prisma.userMembership.updateMany({
                    where: {
                        id: {
                            in: membersToRemove.map(m => m.id)
                        }
                    },
                    data: { isActive: false }
                });

                return membersToRemove.map(m => ({
                    id: m.id,
                    user: m.user
                }));
            });

            return res.status(200).json({
                message: "Members removed from membership successfully",
                removedMembers: result,
                totalRemoved: result.length
            });

        } catch (error) {
            throw new ValidationError("Failed to remove member from membership");
        }
    });
    createMembershipOrder = asyncHandler(async (req: Request, res: Response) => {
        try {
            const { userId, membershipPlanId } = req.body;
            return prisma.$transaction(async (tx) => {

                const membershipPlan = await tx.membershipPlan.findUnique({
                    where: { id: membershipPlanId }
                });


                if (!membershipPlan) {
                    throw new ValidationError(`Membership plan with ID ${membershipPlanId} not found`);
                }

                const isAlreadyMembershipBooked = await tx.userMembership.findFirst({
                    where: {
                        userId: userId,
                        planId: membershipPlanId,
                        isActive: true
                    }
                });

                if (isAlreadyMembershipBooked) {
                    throw new ValidationError('You have already booked this membership');
                }

                const user = await tx.user.findUnique({
                    where: { id: userId }
                });


                if (!user) {
                    throw new ValidationError(`User with ID ${userId} not found`);
                }

                const receiptId = `receipt_${uuidv4().replace(/-/g, '')}`;

                const order = await this.razorpay.orders.create({
                    amount: Number(50000) * 100,
                    currency: "INR",
                    receipt: receiptId,
                    notes: {
                        title: membershipPlan.name,
                        description: membershipPlan.name,
                        userId: user.id,
                        membershipPlanId: membershipPlanId
                    }
                });
                return res.status(200).json({
                    success: true,
                    message: "Membership order created successfully",
                    order: order
                });

            })
        } catch (error) {
            throw new ValidationError("Failed to create membership order");
        }
    });
    verifyMembershipOrder = asyncHandler(async (req: Request, res: Response) => {
        try {
            const { orderId, paymentId, signature, userId, membershipPlanId, amount, currency, status, email} = req.body;
            
            return await withTransaction(async (prisma) => {
                // 1. Verify payment signature
                const generatedSig = createHmac('sha256', razorpayConfig.keySecret)
                    .update(`${orderId}|${paymentId}`)
                    .digest('hex');

                const isValid = generatedSig === signature;

                if (!isValid) {
                    console.warn(`Invalid payment signature: ${paymentId}`);
                    return res.status(400).json({
                        success: false,
                        message: "Invalid payment signature"
                    });
                }

                await prisma.payment.create({
                    data: {
                        order_id: orderId,
                        payment_id: paymentId,
                        signature: signature,
                        email: email,
                        date: new Date(),
                        amount: amount,
                        currency: currency || "INR",
                        status: status || "PAID",
                        payment_type: "MEMBERSHIP",
                        // Only connect to user, not membership yet
                        user: {
                            connect: { id: userId }
                        }
                    }
                });

                if(isValid){
                    return res.status(200).json({
                        success: true,
                        message: "Payment verified successfully"
                    });
                }

                return res.status(400).json({
                    success: false,
                    message: "Payment verification failed"
                });
            });

        } catch (error) {
            console.error("Error verifying membership order:", error);
            throw new ValidationError("Failed to verify membership order");
        }
    });

    isAlreadySubscribed = asyncHandler(async (req: Request, res: Response) => {
        try {
            const { userId, membershipPlanId } = req.body;
            const isAlreadySubscribed = await prisma.userMembership.findFirst({
                where: {
                    userId: userId,
                    isActive: true
                }
            });
            return res.status(200).json({
                success: true,
                message: "User is already subscribed",
                isAlreadySubscribed: isAlreadySubscribed
            });
        } catch (error) {
            throw new ValidationError("Failed to check if user is already subscribed");
        }
    });

    submitMembershipInterest = asyncHandler(async (req: Request, res: Response) => {
        try {
            const { name, email, phone, planName, planCost, message } = req.body;

            if (!name || !email || !phone || !planName || !planCost) {
                return res.status(400).json({
                    success: false,
                    message: "Name, email, phone, plan name, and plan cost are required"
                });
            }

            const interest = await prisma.membershipInterest.create({
                data: {
                    name,
                    email,
                    phone,
                    planName,
                    planCost,
                    message: message || null,
                    status: 'PENDING'
                }
            });

            return res.status(201).json({
                success: true,
                message: "Thank you for your interest! Our team will contact you soon.",
                interest
            });
        } catch (error) {
            console.error("Error submitting membership interest:", error);
            throw new ValidationError("Failed to submit membership interest");
        }
    });

    getMembershipInterests = asyncHandler(async (req: Request, res: Response) => {
        try {
            const { status } = req.query;

            const where = status ? { status: status as any } : {};

            const interests = await prisma.membershipInterest.findMany({
                where,
                orderBy: {
                    createdAt: 'desc'
                }
            });

            const stats = await prisma.membershipInterest.groupBy({
                by: ['status'],
                _count: true
            });

            return res.status(200).json({
                success: true,
                message: "Membership interests fetched successfully",
                interests,
                stats
            });
        } catch (error) {
            console.error("Error fetching membership interests:", error);
            throw new ValidationError("Failed to fetch membership interests");
        }
    });

    updateInterestStatus = asyncHandler(async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const { status } = req.body;

            if (!status || !['PENDING', 'CONTACTED', 'CONVERTED', 'REJECTED'].includes(status)) {
                return res.status(400).json({
                    success: false,
                    message: "Valid status is required (PENDING, CONTACTED, CONVERTED, REJECTED)"
                });
            }

            const interest = await prisma.membershipInterest.update({
                where: { id },
                data: { status }
            });

            return res.status(200).json({
                success: true,
                message: "Interest status updated successfully",
                interest
            });
        } catch (error) {
            console.error("Error updating interest status:", error);
            throw new ValidationError("Failed to update interest status");
        }
    });

  
}