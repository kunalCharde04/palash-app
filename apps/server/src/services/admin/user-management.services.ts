import { prisma } from "@palash/db-client";
import { startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear } from "date-fns";

class UserManagementServices {
    async deleteUser(userId: string) {
        console.log(userId);
        await Promise.all([
            await prisma.booking.deleteMany({where: {user_id: userId}}),
            await prisma.review.deleteMany({where: {user_id: userId}}),
        ])
        await prisma.user.delete({
            where: {
                id: userId
            }
        })
    }
    async fetchUsers() {
        const users = await prisma.user.findMany();
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
        const timeToAccessAgain = 6  * 60 * 60 * 1000;
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
        // Find all primary memberships that have RFID cards assigned
        const primaryMemberships = await prisma.userMembership.findMany({
            where: { 
                isPrimary: true,
                isActive: true
                // rfidCardId: { not: null } // Only get memberships with RFID cards
            },
            include: {
                user: true,
                memberMemberships: { 
                    include: { user: true },
                    where: { isActive: true } // Only active beneficiaries
                },
            },
        });
        
        // Structure the response
        return primaryMemberships.map(primary => ({
            primaryUser: {
                id: primary.user.id,
                name: primary.user.name,
                isActive: primary.isActive,
                email: primary.user.phone_or_email,
            },
            rfidCardId: primary.rfidCardId,
            totalGroupMembers: 1 + primary.memberMemberships.length, // Primary + beneficiaries
            beneficiaries: primary.memberMemberships.map(benef => ({
                id: benef.user.id,
                name: benef.user.name,
                email: benef.user.phone_or_email,
                isActive: benef.isActive,
            })),
        }));
    }

    async getRFIDUsage() {
        // Fetch all memberships that have an RFID card assigned
        const memberships = await prisma.userMembership.findMany({
            where: { rfidCardId: { not: null }, isPrimary: true, isActive: true },
            include: {
                user: true
            }
        });

        // Return only necessary fields
        return memberships.map(m => ({
            membershipId: m.id,
            rfidCardId: m.rfidCardId,
            rfidScanHistory: m.rfidScanHistory,
            lastScanTime: m.lastScanTime,
            counter: m.counter,
            user: {
                id: m.user.id,
                name: m.user.name,
                email: m.user.phone_or_email
            }
        }));
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
}

export default UserManagementServices;