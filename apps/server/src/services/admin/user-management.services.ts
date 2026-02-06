import { prisma } from "@palash/db-client";
import { startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear } from "date-fns";
import { generateOtp } from "../../utils/generate-otp.js";
import { storeAdminCreateUserOtp, getOtpData, deleteOtp, storeBeneficiaryOtp } from "../../utils/redis.utils.js";
import { sendMail } from "../../adapters/mailer.adapter.js";
import { AdminCreateUserDTO, VerifyOtpDTO } from "../../@types/interfaces.js";
import { ValidationError } from "../../utils/errors.js";
import { generateMembershipId, generateOrderId, generatePaymentId } from "../../utils/membership-id-generator.js";

class UserManagementServices {
    async deleteUser(userId: string) {
        console.log(userId);
        await Promise.all([
            await prisma.booking.deleteMany({ where: { user_id: userId } }),
            await prisma.review.deleteMany({ where: { user_id: userId } }),
        ])
        await prisma.user.delete({
            where: {
                id: userId
            }
        })
    }

    /**
     * Remove a specific membership from a user
     */
    async removeMembershipFromUser(userId: string, membershipId: string) {
        console.log(`🗑️ Removing membership ${membershipId} from user ${userId}`);

        // First, check if the membership exists and belongs to the user
        const membership = await prisma.userMembership.findFirst({
            where: {
                id: membershipId,
                userId: userId,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        phone_or_email: true,
                    },
                },
                plan: {
                    select: {
                        name: true,
                    },
                },
                memberMemberships: true, // Check if this is a primary membership with beneficiaries
            },
        });

        if (!membership) {
            throw new ValidationError('Membership not found or does not belong to this user.');
        }

        // Check if this is a primary membership with beneficiaries
        if (membership.isPrimary && membership.memberMemberships.length > 0) {
            throw new ValidationError(
                `This is a primary membership with ${membership.memberMemberships.length} beneficiaries. Please remove beneficiary memberships first or delete the entire group.`
            );
        }

        // Use a transaction to ensure data consistency
        return await prisma.$transaction(async (tx) => {
            // If membership has RFID assigned, we should unassign it first
            if (membership.rfidCardId) {
                console.log(`📍 Removing RFID ${membership.rfidCardId} from membership`);
            }

            // Delete associated payments
            await tx.payment.deleteMany({
                where: {
                    membership_id: membershipId,
                },
            });

            // Delete the membership
            await tx.userMembership.delete({
                where: {
                    id: membershipId,
                },
            });

            console.log(`✅ Successfully removed membership ${membershipId}`);

            return {
                success: true,
                message: `Successfully removed ${membership.plan.name} membership from ${membership.user.name}`,
                removedMembership: {
                    id: membershipId,
                    planName: membership.plan.name,
                    userName: membership.user.name,
                },
            };
        });
    }

    /**
     * Remove all memberships from a user (deactivate instead of delete)
     */
    async deactivateUserMemberships(userId: string) {
        console.log(`🔒 Deactivating all memberships for user ${userId}`);

        const memberships = await prisma.userMembership.findMany({
            where: {
                userId: userId,
                isActive: true,
            },
        });

        if (memberships.length === 0) {
            throw new ValidationError('No active memberships found for this user.');
        }

        // Deactivate all memberships instead of deleting
        await prisma.userMembership.updateMany({
            where: {
                userId: userId,
                isActive: true,
            },
            data: {
                isActive: false,
            },
        });

        console.log(`✅ Deactivated ${memberships.length} memberships`);

        return {
            success: true,
            message: `Successfully deactivated ${memberships.length} membership(s)`,
            deactivatedCount: memberships.length,
        };
    }

    /**
     * Update payment status for a membership
     */
    async updateMembershipPaymentStatus(membershipId: string, paymentStatus: 'PENDING' | 'PAID' | 'REFUNDED' | 'FAILED') {
        console.log(`💳 Updating payment status for membership ${membershipId} to ${paymentStatus}`);

        // Find the payment associated with this membership
        const payment = await prisma.payment.findFirst({
            where: {
                membership_id: membershipId,
            },
            include: {
                user: {
                    select: {
                        name: true,
                        phone_or_email: true,
                    },
                },
            },
        });

        if (!payment) {
            throw new ValidationError('Payment record not found for this membership.');
        }

        // Update the payment status
        const updatedPayment = await prisma.payment.update({
            where: {
                id: payment.id,
            },
            data: {
                status: paymentStatus,
            },
        });

        console.log(`✅ Successfully updated payment status to ${paymentStatus}`);

        return {
            success: true,
            message: `Payment status updated to ${paymentStatus}`,
            payment: {
                id: updatedPayment.id,
                status: updatedPayment.status,
                amount: updatedPayment.amount,
                userName: payment.user.name,
            },
        };
    }

    /**
     * Cancel a booking (service) for a user
     */
    async cancelUserBooking(userId: string, bookingId: string) {
        console.log(`❌ Cancelling booking ${bookingId} for user ${userId}`);

        const booking = await prisma.booking.findFirst({
            where: {
                id: bookingId,
                user_id: userId,
            },
            include: {
                service: {
                    select: {
                        name: true,
                    },
                },
                user: {
                    select: {
                        name: true,
                        phone_or_email: true,
                    },
                },
            },
        });

        if (!booking) {
            throw new ValidationError('Booking not found or does not belong to this user.');
        }

        // Update booking status to cancelled
        const updatedBooking = await prisma.booking.update({
            where: {
                id: bookingId,
            },
            data: {
                status: 'CANCELLED',
            },
        });

        console.log(`✅ Successfully cancelled booking ${bookingId}`);

        return {
            success: true,
            message: `Successfully cancelled ${booking.service.name} booking for ${booking.user.name}`,
            cancelledBooking: {
                id: bookingId,
                serviceName: booking.service.name,
                userName: booking.user.name,
                status: updatedBooking.status,
            },
        };
    }
    async fetchUsers() {
        const users = await prisma.user.findMany({
            include: {
                memberships: {
                    where: {
                        isActive: true
                    },
                    select: {
                        id: true,
                        planId: true,
                        isActive: true,
                        isPrimary: true,
                        parentMembershipId: true,
                        plan: {
                            select: {
                                name: true
                            }
                        },
                        // Include beneficiary memberships if this is a primary membership
                        memberMemberships: {
                            where: {
                                isActive: true
                            },
                            select: {
                                id: true,
                                userId: true,
                                user: {
                                    select: {
                                        id: true,
                                        name: true,
                                        phone_or_email: true
                                    }
                                }
                            }
                        },
                        // Include payment information
                        payments: {
                            select: {
                                id: true,
                                status: true,
                                amount: true
                            },
                            orderBy: {
                                date: 'desc'
                            },
                            take: 1 // Get only the latest payment
                        }
                    }
                },
                bookings: {
                    select: {
                        id: true,
                        service: {
                            select: {
                                name: true
                            }
                        }
                    }
                }
            }
        });
        return users;
    }
    async assignRFIDToUser({ userId, email, rfidCardId }: { userId?: string, email?: string, rfidCardId: string }) {
        // Find the user by id or email
        const user = await prisma.user.findFirst({
            where: {
                OR: [
                    userId ? { id: userId } : undefined,
                    email ? { phone_or_email: email } : undefined
                ].filter(Boolean) as any
            }
        });
        if (!user) throw new Error('User not found');

        // Find the active membership for the user
        const membership = await prisma.userMembership.findFirst({
            where: {
                userId: user.id,
                isActive: true
            }
        });
        if (!membership) throw new Error('User does not have an active membership');

        // Find the primary membership for this group
        let primaryMembership: any;
        if (membership.isPrimary) {
            primaryMembership = membership;
        } else if (membership.parentMembershipId) {
            primaryMembership = await prisma.userMembership.findFirst({
                where: { id: membership.parentMembershipId }
            });
        } else {
            // If this is a standalone membership (no group), treat it as primary
            primaryMembership = membership;
        }

        if (!primaryMembership) {
            throw new Error('Primary membership not found');
        }

        // First, clear any existing assignment of this RFID card
        await prisma.userMembership.updateMany({
            where: { rfidCardId },
            data: { rfidCardId: null }
        });

        // Then assign RFID ONLY to the primary membership
        await prisma.userMembership.update({
            where: { id: primaryMembership.id },
            data: { rfidCardId }
        });

        return {
            success: true,
            membershipId: primaryMembership.id,
            message: 'RFID assigned to primary membership. All group members can use this RFID card through the primary membership.'
        };
    }

    // Helper method to check if a user has access to a specific RFID card
    async checkUserRFIDAccess({ userId, rfidCardId }: { userId: string, rfidCardId: string }) {
        // First, find the membership that has this RFID card
        const membershipWithRFID = await prisma.userMembership.findFirst({
            where: { rfidCardId }
        });

        if (!membershipWithRFID) {
            return { hasAccess: false, message: 'RFID card not found in system' };
        }

        // Find the user's active membership
        const userMembership = await prisma.userMembership.findFirst({
            where: {
                userId,
                isActive: true
            }
        });

        if (!userMembership) {
            return { hasAccess: false, message: 'User has no active membership' };
        }

        // Check if user has access through group relationship
        let hasAccess = false;
        let accessType = '';

        if (userMembership.id === membershipWithRFID.id) {
            // User is the primary member with the RFID
            hasAccess = true;
            accessType = 'primary';
        } else if (userMembership.parentMembershipId === membershipWithRFID.id) {
            // User is a beneficiary of the primary membership with RFID
            hasAccess = true;
            accessType = 'beneficiary';
        } else if (membershipWithRFID.parentMembershipId && userMembership.parentMembershipId === membershipWithRFID.parentMembershipId) {
            // Both users are beneficiaries of the same primary membership
            hasAccess = true;
            accessType = 'group_beneficiary';
        }

        return {
            hasAccess,
            accessType,
            message: hasAccess
                ? `User has ${accessType} access to RFID card`
                : 'User does not have access to this RFID card'
        };
    }

    // Helper method to get all users who can use a specific RFID card
    async getUsersWithRFIDAccess({ rfidCardId }: { rfidCardId: string }) {
        // Find the membership that has this RFID card
        const membershipWithRFID = await prisma.userMembership.findFirst({
            where: { rfidCardId },
            include: {
                user: true,
                memberMemberships: {
                    include: { user: true }
                }
            }
        });

        if (!membershipWithRFID) {
            return { users: [], message: 'RFID card not found in system' };
        }

        const users = [
            {
                id: membershipWithRFID.user.id,
                name: membershipWithRFID.user.name,
                email: membershipWithRFID.user.phone_or_email,
                accessType: 'primary'
            },
            ...membershipWithRFID.memberMemberships.map(beneficiary => ({
                id: beneficiary.user.id,
                name: beneficiary.user.name,
                email: beneficiary.user.phone_or_email,
                accessType: 'beneficiary'
            }))
        ];

        return {
            users,
            message: `Found ${users.length} users with access to RFID card`
        };
    }

    // Record attendance when RFID card is tapped
    async recordRFIDAttendance({ rfidCardId, userId }: { rfidCardId: string, userId?: string }) {
        // Find the membership that has this RFID card
        const membership = await prisma.userMembership.findFirst({
            where: { rfidCardId }
        });

        if (!membership) {
            throw new Error('RFID card not found in system');
        }

        // Check if membership is active
        if (!membership.isActive) {
            throw new Error('Membership is not active');
        }

        // Check if membership has not expired
        if (membership.endDate < new Date()) {
            throw new Error('Membership has expired');
        }

        // Enforce 6-hour cooldown between taps for the same RFID card
        const timeToAccessAgain = 6 * 60 * 60 * 1000;
        if (membership.lastScanTime) {
            const SIX_HOURS_MS = timeToAccessAgain;
            const now = new Date();
            const lastScan = new Date(membership.lastScanTime);
            const elapsed = now.getTime() - lastScan.getTime();
            if (elapsed < SIX_HOURS_MS) {
                const remainingMs = SIX_HOURS_MS - elapsed;
                // Format remaining time as hours and minutes
                const hours = Math.floor(remainingMs / (60 * 60 * 1000));
                const minutes = Math.floor((remainingMs % (60 * 60 * 1000)) / (60 * 1000));
                return {
                    success: false,
                    message: `RFID card can only be used once every 6 hours. Please try again in ${hours} hour(s) and ${minutes} minute(s).`,
                    data: {
                        remainingMs,
                        nextAllowedScan: new Date(lastScan.getTime() + SIX_HOURS_MS)
                    }
                };
            }
        }

        // If userId is provided, verify the user has access to this RFID card
        if (userId) {
            const accessCheck = await this.checkUserRFIDAccess({ userId, rfidCardId });
            if (!accessCheck.hasAccess) {
                throw new Error('User does not have access to this RFID card');
            }
        }

        // Generate current timestamp
        const currentTime = new Date();

        // Create scan record
        const scanRecord = {
            rfidCardId,
            userId: userId || null,
            lastScanTime: currentTime,
            scanTimestamp: currentTime
        };

        // Update the membership with new scan history and last scan time
        const updatedMembership = await prisma.userMembership.update({
            where: { id: membership.id },
            data: {
                rfidScanHistory: {
                    push: scanRecord
                },
                lastScanTime: currentTime,
                counter: {
                    increment: 1
                }
            }
        });

        return {
            success: true,
            message: 'RFID attendance recorded successfully',
            data: {
                membershipId: membership.id,
                rfidCardId,
                userId: userId || 'Anonymous',
                scanTime: currentTime,
                totalScans: updatedMembership.counter
            }
        };
    }
    // async updateRFIDForMembership({ userId, email, rfidCardId }: { userId?: string, email?: string, rfidCardId: string }) {
    //     // Find the user by id or email
    //     const user = await prisma.user.findFirst({
    //         where: {
    //             OR: [
    //                 userId ? { id: userId } : undefined,
    //                 email ? { phone_or_email: email } : undefined
    //             ].filter(Boolean) as any
    //         }
    //     });
    //     if (!user) throw new Error('User not found');

    //     const membership = await prisma.userMembership.findFirst({
    //         where: {
    //             userId: user.id,
    //             isActive: true
    //         }
    //     });
    //     if (!membership) throw new Error('User does not have an active membership');

    //     // Find the primary membership for this group
    //     let primaryMembership: any;
    //     if (membership.isPrimary) {
    //         primaryMembership = membership;
    //     } else if (membership.parentMembershipId) {
    //         primaryMembership = await prisma.userMembership.findFirst({
    //             where: { id: membership.parentMembershipId }
    //         });
    //     } else {
    //         // If this is a standalone membership (no group), treat it as primary
    //         primaryMembership = membership;
    //     }

    //     if (!primaryMembership) {
    //         throw new Error('Primary membership not found');
    //     }

    //     // First, clear any existing assignment of this RFID card
    //     await prisma.userMembership.updateMany({
    //         where: { rfidCardId },
    //         data: { rfidCardId: null }
    //     });

    //     // Then assign RFID ONLY to the primary membership
    //     await prisma.userMembership.update({
    //         where: { id: primaryMembership.id },
    //         data: { rfidCardId }
    //     });

    //     return { 
    //         success: true, 
    //         membershipId: primaryMembership.id,
    //         message: 'RFID updated for primary membership. All group members can use this RFID card through the primary membership.'
    //     };
    // }
    async unassignRFIDForMembership({ userId, email }: { userId?: string, email?: string }) {
        // Find the user by id or email
        const user = await prisma.user.findFirst({
            where: {
                OR: [
                    userId ? { id: userId } : undefined,
                    email ? { phone_or_email: email } : undefined
                ].filter(Boolean) as any
            }
        });
        console.log("USER: ", user);
        if (!user) throw new Error('User not found');

        const membership = await prisma.userMembership.findFirst({
            where: {
                userId: user.id,
                isActive: true
            }
        });
        if (!membership) throw new Error('User does not have an active membership');

        // Find the primary membership for this group
        let primaryMembership: any;
        if (membership.isPrimary) {
            primaryMembership = membership;
        } else if (membership.parentMembershipId) {
            primaryMembership = await prisma.userMembership.findFirst({
                where: { id: membership.parentMembershipId }
            });
        } else {
            // If this is a standalone membership (no group), treat it as primary
            primaryMembership = membership;
        }

        if (!primaryMembership) {
            throw new Error('Primary membership not found');
        }

        // Remove RFID from the primary membership
        await prisma.userMembership.update({
            where: { id: primaryMembership.id },
            data: { rfidCardId: null }
        });

        return {
            success: true,
            membershipId: primaryMembership.id,
            message: 'RFID unassigned from primary membership.'
        };
    }
    async fetchAllMembershipGroupsWithRFID() {
        // Find ONLY users with PRIMARY memberships (exclude beneficiaries)
        const allUsersWithMemberships = await prisma.user.findMany({
            where: {
                memberships: {
                    some: {
                        isActive: true,
                        isPrimary: true  // Only include primary members
                    }
                }
            },
            include: {
                memberships: {
                    where: {
                        isActive: true,
                        isPrimary: true  // Only include primary memberships
                    },
                    include: {
                        plan: {
                            select: {
                                name: true,
                                cost: true
                            }
                        }
                    }
                }
            }
        });

        console.log("Found primary users with memberships:", allUsersWithMemberships.length);

        // Now fetch beneficiaries for each primary user
        const groupedData = await Promise.all(allUsersWithMemberships.map(async (user) => {
            // Get the primary membership
            const primaryMembership = user.memberships[0]; // Since we filtered for isPrimary: true

            // Fetch beneficiaries for this primary membership
            let beneficiaries: any[] = [];
            if (primaryMembership) {
                const beneficiaryMemberships = await prisma.userMembership.findMany({
                    where: {
                        parentMembershipId: primaryMembership.id,
                        isActive: true,
                    },
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                phone_or_email: true,
                            },
                        },
                    },
                });

                beneficiaries = beneficiaryMemberships.map(bm => ({
                    id: bm.user.id,
                    name: bm.user.name,
                    email: bm.user.phone_or_email,
                    membershipId: bm.id,
                    isActive: bm.isActive,
                }));
            }

            return {
                primaryUser: {
                    id: user.id,
                    name: user.name,
                    isActive: primaryMembership?.isActive || false,
                    email: user.phone_or_email,
                },
                rfidCardId: primaryMembership?.rfidCardId || null,
                totalGroupMembers: 1 + beneficiaries.length,
                beneficiaries: beneficiaries,
                membership: {
                    id: primaryMembership?.id,
                    planName: primaryMembership?.plan?.name,
                    cost: primaryMembership?.plan?.cost,
                    isPrimary: true  // Always true now since we only fetch primary users
                }
            };
        }));

        console.log(`📊 Returning ${groupedData.length} primary membership groups with beneficiaries`);
        return groupedData;
    }

    async getRFIDUsage() {
        console.log('📊 Fetching RFID usage data...');
        
        // Fetch all memberships that have an RFID card assigned (removed isPrimary filter)
        const memberships = await prisma.userMembership.findMany({
            where: { 
                rfidCardId: { not: null }, 
                isActive: true 
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
            },
            orderBy: {
                lastScanTime: 'desc' // Order by most recent scan
            }
        });

        console.log(`✅ Found ${memberships.length} memberships with RFID cards`);

        // Return only necessary fields with enhanced data
        const result = memberships.map(m => ({
            membershipId: m.id,
            rfidCardId: m.rfidCardId,
            rfidScanHistory: m.rfidScanHistory || [],
            lastScanTime: m.lastScanTime,
            counter: m.counter,
            isPrimary: m.isPrimary,
            user: {
                id: m.user.id,
                name: m.user.name,
                email: m.user.phone_or_email
            },
            plan: m.plan ? {
                name: m.plan.name,
                cost: m.plan.cost
            } : null
        }));

        console.log(`📈 Returning ${result.length} RFID usage records`);
        return result;
    }
    // ... existing code ...
    async fetchAllUserMemberships() {
        return prisma.userMembership.findMany({
            select: {
                id: true,
                userId: true,
                planId: true,
                startDate: true,
                endDate: true,
                isPrimary: true,
                isActive: true,
                parentMembershipId: true,
                // Exclude rfidCardId and rfidScanHistory
                lastScanTime: true, // Only keep this RFID-related field
                counter: true,
                createdAt: true,
                // Include user details
                user: {
                    select: {
                        id: true,
                        name: true,
                        phone_or_email: true,
                        // Add more user fields as needed
                    }
                },
                // Optionally, include plan details or other relations if needed
            }
        });
    }

    // Admin creates user with OTP verification
    async adminCreateUser(data: AdminCreateUserDTO) {
        const { name, phoneOrEmail, planId, memberEmails, beneficiaries, paymentStatus } = data;

        // Validate phoneOrEmail
        if (!phoneOrEmail || phoneOrEmail.trim() === '') {
            throw new ValidationError('Email is required.');
        }

        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(phoneOrEmail)) {
            throw new ValidationError('Invalid email format.');
        }

        // Check if user already exists
        const isUserExists = await prisma.user.findFirst({
            where: { phone_or_email: phoneOrEmail },
        });

        if (isUserExists) {
            throw new ValidationError('User with this email already exists.');
        }

        // Generate OTP
        const otp: string = generateOtp();

        // Convert beneficiaries to the format needed
        // Support both old format (memberEmails) and new format (beneficiaries)
        let finalBeneficiaries: Array<{ name: string; email: string }> = [];
        
        if (beneficiaries && beneficiaries.length > 0) {
            finalBeneficiaries = beneficiaries;
        } else if (memberEmails && memberEmails.length > 0) {
            // Convert old format to new format (use email prefix as name)
            finalBeneficiaries = memberEmails.map(email => ({
                name: email.split('@')[0],
                email: email
            }));
        }

        // Store user data temporarily in Redis
        const tempUserData = {
            otp,
            name,
            phoneOrEmail,
            planId: planId || null,
            memberEmails: memberEmails || [], // Keep for backward compatibility
            beneficiaries: finalBeneficiaries,
            paymentStatus: paymentStatus || 'PENDING',
        };

        await storeAdminCreateUserOtp(tempUserData);

        console.log(`📧 Sending OTP to: ${phoneOrEmail}`);
        console.log(`🔑 PRIMARY USER OTP: ${otp}`);

        // Send OTP via email using the existing sendMail function
        await sendMail({
            phoneOrEmail: phoneOrEmail,
            otp: otp,
        });

        return { message: "OTP sent to user's email for verification." };
    }

    // Verify OTP and create primary user (beneficiaries will be created after their OTP verification)
    async verifyAdminCreateUserOtp(data: VerifyOtpDTO) {
        const { phoneOrEmail, otp } = data;

        const savedData = await getOtpData(phoneOrEmail, "admin-create-user");
        if (!savedData) throw new ValidationError("OTP expired. Please request a new OTP.");

        if (savedData.otp !== otp) throw new ValidationError("Invalid OTP. Please try again.");

        await deleteOtp(phoneOrEmail, "admin-create-user");

        // Create user and optionally assign membership in a transaction
        return await prisma.$transaction(async (tx) => {
            // Create the primary user
            const user = await tx.user.create({
                data: {
                    phone_or_email: phoneOrEmail,
                    name: savedData.name,
                    is_verified: true,
                    is_agreed_to_terms: true,
                },
            });

            let membershipData = null;
            let beneficiariesPendingVerification: Array<{ name: string; email: string }> = [];

            // If planId is provided, create membership
            if (savedData.planId) {
                const membershipPlan = await tx.membershipPlan.findUnique({
                    where: { id: savedData.planId },
                });

                if (!membershipPlan) {
                    throw new ValidationError('Invalid membership plan.');
                }

                const startDate = new Date();
                const endDate = new Date();
                endDate.setFullYear(startDate.getFullYear() + membershipPlan.renewalPeriodYears);

                // Generate meaningful membership ID
                const membershipId = await generateMembershipId();
                console.log(`📝 Generated membership ID: ${membershipId}`);

                // Create primary membership
                const primaryMembership = await tx.userMembership.create({
                    data: {
                        id: membershipId,
                        userId: user.id,
                        planId: savedData.planId,
                        startDate,
                        endDate,
                        isPrimary: true,
                        isActive: true,
                        parentMembershipId: null,
                    },
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                phone_or_email: true,
                            },
                        },
                        plan: {
                            select: {
                                name: true,
                                cost: true,
                            },
                        },
                    },
                });

                // Generate meaningful order and payment IDs
                const orderId = await generateOrderId();
                const paymentId = await generatePaymentId();
                console.log(`💳 Generated order ID: ${orderId}, payment ID: ${paymentId}`);

                // Create payment record if membership was created
                await tx.payment.create({
                    data: {
                        user_id: user.id,
                        email: phoneOrEmail,
                        membership_id: primaryMembership.id,
                        order_id: orderId,
                        payment_id: paymentId,
                        signature: 'ADMIN_CREATED',
                        date: new Date(),
                        amount: membershipPlan.cost,
                        currency: 'INR',
                        status: savedData.paymentStatus || 'PENDING',
                        payment_type: 'MEMBERSHIP',
                    },
                });

                membershipData = {
                    primaryMembership,
                    primaryMembershipId: primaryMembership.id,
                    planId: savedData.planId,
                    startDate,
                    endDate,
                };

                // Store beneficiaries for later verification
                if (savedData.beneficiaries && savedData.beneficiaries.length > 0) {
                    beneficiariesPendingVerification = savedData.beneficiaries;
                }
            }

            return {
                message: "Primary user created successfully. Please verify beneficiaries.",
                user,
                membership: membershipData,
                beneficiariesPendingVerification,
            };
        });
    }

    // Send OTP to a beneficiary
    async sendBeneficiaryOtp(data: { beneficiaryEmail: string; beneficiaryName: string; primaryUserEmail: string }) {
        const { beneficiaryEmail, beneficiaryName, primaryUserEmail } = data;

        // Validate email
        if (!beneficiaryEmail || beneficiaryEmail.trim() === '') {
            throw new ValidationError('Beneficiary email is required.');
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(beneficiaryEmail)) {
            throw new ValidationError('Invalid beneficiary email format.');
        }

        // Generate OTP
        const otp: string = generateOtp();

        // Store OTP in Redis
        await storeBeneficiaryOtp({
            otp,
            beneficiaryEmail,
            primaryUserEmail,
            beneficiaryName,
        });

        console.log(`📧 Sending OTP to beneficiary: ${beneficiaryEmail}`);
        console.log(`🔑 BENEFICIARY OTP for ${beneficiaryName} (${beneficiaryEmail}): ${otp}`);

        // Send OTP via email
        await sendMail({
            phoneOrEmail: beneficiaryEmail,
            otp: otp,
        });

        return { message: "OTP sent to beneficiary's email for verification." };
    }

    // Verify beneficiary OTP and create beneficiary membership
    async verifyBeneficiaryOtp(data: { beneficiaryEmail: string; otp: string; primaryMembershipId: string }) {
        const { beneficiaryEmail, otp, primaryMembershipId } = data;

        const savedData = await getOtpData(beneficiaryEmail, "beneficiary-verify");
        if (!savedData) throw new ValidationError("OTP expired. Please request a new OTP.");

        if (savedData.otp !== otp) throw new ValidationError("Invalid OTP. Please try again.");

        await deleteOtp(beneficiaryEmail, "beneficiary-verify");

        // Get primary membership to get plan details
        const primaryMembership = await prisma.userMembership.findUnique({
            where: { id: primaryMembershipId },
            include: {
                plan: true,
            },
        });

        if (!primaryMembership) {
            throw new ValidationError('Primary membership not found.');
        }

        return await prisma.$transaction(async (tx) => {
            // Check if beneficiary user exists
            let beneficiaryUser = await tx.user.findFirst({
                where: { phone_or_email: beneficiaryEmail },
            });

            // If user doesn't exist, create them
            if (!beneficiaryUser) {
                beneficiaryUser = await tx.user.create({
                    data: {
                        phone_or_email: beneficiaryEmail,
                        name: savedData.beneficiaryName,
                        is_verified: true,
                        is_agreed_to_terms: true,
                    },
                });
            } else {
                // Update user to verified if already exists
                beneficiaryUser = await tx.user.update({
                    where: { id: beneficiaryUser.id },
                    data: { is_verified: true },
                });
            }

            // Generate meaningful membership ID for beneficiary
            const beneficiaryMembershipId = await generateMembershipId();
            console.log(`📝 Generated beneficiary membership ID: ${beneficiaryMembershipId}`);

            // Create beneficiary membership
            const beneficiaryMembership = await tx.userMembership.create({
                data: {
                    id: beneficiaryMembershipId,
                    userId: beneficiaryUser.id,
                    planId: primaryMembership.planId,
                    startDate: primaryMembership.startDate,
                    endDate: primaryMembership.endDate,
                    isPrimary: false,
                    isActive: true,
                    parentMembershipId: primaryMembership.id,
                },
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            phone_or_email: true,
                        },
                    },
                    plan: {
                        select: {
                            name: true,
                            cost: true,
                        },
                    },
                },
            });

            return {
                message: "Beneficiary verified and added to membership successfully.",
                beneficiary: beneficiaryUser,
                membership: beneficiaryMembership,
            };
        });
    }

    async updateUser(userId: string, data: { name?: string; email?: string; role?: string; isVerified?: boolean; isAgreedToTerms?: boolean }) {
        const { name, email, role, isVerified, isAgreedToTerms } = data;

        // Build update data object with only provided fields
        const updateData: any = {};

        if (name !== undefined) updateData.name = name;
        if (email !== undefined) updateData.phone_or_email = email;
        if (role !== undefined) updateData.role = role;
        if (isVerified !== undefined) updateData.is_verified = isVerified;
        if (isAgreedToTerms !== undefined) updateData.is_agreed_to_terms = isAgreedToTerms;

        // Update the user
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: updateData,
        });

        return {
            success: true,
            message: 'User updated successfully',
            user: updatedUser,
        };
    }

    async assignMembershipToUser(userId: string, planId: string, paymentStatus: 'PENDING' | 'PAID' | 'REFUNDED' | 'FAILED' = 'PENDING') {
        console.log(`📝 Assigning membership plan ${planId} to user ${userId}`);

        // Check if user exists
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                memberships: {
                    where: { isActive: true }
                }
            }
        });

        if (!user) {
            throw new ValidationError('User not found');
        }

        // Check if plan exists
        const membershipPlan = await prisma.membershipPlan.findUnique({
            where: { id: planId },
        });

        if (!membershipPlan) {
            throw new ValidationError('Invalid membership plan');
        }

        // Check if user already has an active membership
        if (user.memberships && user.memberships.length > 0) {
            throw new ValidationError('User already has an active membership. Please remove or deactivate existing memberships first.');
        }

        return await prisma.$transaction(async (tx) => {
            const startDate = new Date();
            const endDate = new Date();
            endDate.setFullYear(startDate.getFullYear() + membershipPlan.renewalPeriodYears);

            // Generate meaningful membership ID
            const membershipId = await generateMembershipId();
            console.log(`📝 Generated membership ID: ${membershipId}`);

            // Create primary membership
            const membership = await tx.userMembership.create({
                data: {
                    id: membershipId,
                    userId: user.id,
                    planId: planId,
                    startDate,
                    endDate,
                    isPrimary: true,
                    isActive: true,
                    parentMembershipId: null,
                },
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            phone_or_email: true,
                        },
                    },
                    plan: {
                        select: {
                            name: true,
                            cost: true,
                        },
                    },
                },
            });

            // Generate meaningful order and payment IDs
            const orderId = await generateOrderId();
            const paymentId = await generatePaymentId();
            console.log(`💳 Generated order ID: ${orderId}, payment ID: ${paymentId}`);

            // Create payment record
            await tx.payment.create({
                data: {
                    user_id: user.id,
                    email: user.phone_or_email,
                    membership_id: membership.id,
                    order_id: orderId,
                    payment_id: paymentId,
                    signature: 'ADMIN_ASSIGNED',
                    date: new Date(),
                    amount: membershipPlan.cost,
                    currency: 'INR',
                    status: paymentStatus,
                    payment_type: 'MEMBERSHIP',
                },
            });

            console.log(`✅ Successfully assigned membership ${membershipId} to user ${userId}`);

            return {
                success: true,
                message: `Successfully assigned ${membership.plan.name} membership to ${membership.user.name}`,
                membership: {
                    id: membership.id,
                    planName: membership.plan.name,
                    userName: membership.user.name,
                    startDate: membership.startDate,
                    endDate: membership.endDate,
                },
            };
        });
    }
}

export default UserManagementServices;