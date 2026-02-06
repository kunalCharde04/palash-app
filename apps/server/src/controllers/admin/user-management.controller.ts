import {Request, Response, NextFunction} from "express";
import UserManagementServices from "../../services/admin/user-management.services.js";

const userManagementServiceInstance = new UserManagementServices();

class UserProfileManagement {
    async deleteUser(req: Request, res: Response, next: NextFunction): Promise<any> {
        try {
            const userId = req.params.userId;
            const currentUser = req.user;
            if(!userId) {
                return res.status(403).json({message: "UserId is  not defined"});
            }
            if(currentUser?.role !== "ADMIN") {
                return res.status(403).json({message: "You are not authorized to delete this user"});
            }
            if(currentUser?.userId === userId) {
                return res.status(403).json({message: "You are not authorized to delete yourself"});
            }
      
            await userManagementServiceInstance.deleteUser(userId); 
            return res.json({message: "User is deleted"});
        }
        catch(err) {
            return res.status(500).json(err);
        }
    }
    async fetchUsers(req: Request, res: Response, next: NextFunction): Promise<any> {
        try {
            const users = await userManagementServiceInstance.fetchUsers();
            return res.json(users);
        }
        catch(err) {
            return res.status(500).json(err);
        }
    }
    async assignRFIDToUser(req: Request, res: Response, next: NextFunction): Promise<any> {
        try {
            const { userId, email, rfidCardId } = req.body;
            const currentUser = req.user;
            if(currentUser?.role !== "ADMIN") {
                return res.status(403).json({message: "You are not authorized to assign RFID"});
            }
            if (!rfidCardId || (!userId && !email)) {
                return res.status(400).json({message: "rfidCardId and either userId or email are required"});
            }
            const result = await userManagementServiceInstance.assignRFIDToUser({ userId, email, rfidCardId });
            return res.json(result);
        } catch (err: any) {
            return res.status(500).json({ success: false, message: err.message });
        }
    }
    async fetchAllMembershipGroupsWithRFID(req: Request, res: Response, next: NextFunction): Promise<any> {
        try {
            const currentUser = req.user;
            if(currentUser?.role !== "ADMIN") {
                return res.status(403).json({message: "You are not authorized to view this data"});
            }
            const result = await userManagementServiceInstance.fetchAllMembershipGroupsWithRFID();
            return res.json(result);
        } catch (err: any) {
            return res.status(500).json({ success: false, message: err.message });
        }
    }
    // async updateRFIDForMembership(req: Request, res: Response, next: NextFunction): Promise<any> {
    //     try {
    //         const { userId, email, rfidCardId } = req.body;
    //         const currentUser = req.user;
    //         if(currentUser?.role !== "ADMIN") {
    //             return res.status(403).json({message: "You are not authorized to update RFID"});
    //         }
    //         if (!rfidCardId || (!userId && !email)) {
    //             return res.status(400).json({message: "rfidCardId and either userId or email are required"});
    //         }
    //         const result = await userManagementServiceInstance.updateRFIDForMembership({ userId, email, rfidCardId });
    //         return res.json(result);
    //     } catch (err: any) {
    //         return res.status(500).json({ success: false, message: err.message });
    //     }
    // }
    async unassignRFIDForMembership(req: Request, res: Response, next: NextFunction): Promise<any> {
        try {
            const { userId, email } = req.body;
            const currentUser = req.user;
            if(currentUser?.role !== "ADMIN") {
                return res.status(403).json({message: "You are not authorized to unassign RFID"});
            }
            if (!userId && !email) {
                return res.status(400).json({message: "Either userId or email is required"});
            }
            const result = await userManagementServiceInstance.unassignRFIDForMembership({ userId, email });
            return res.json(result);
        } catch (err: any) {
            return res.status(500).json({ success: false, message: err.message });
        }
    }

    // Check if a user has access to a specific RFID card
    async checkUserRFIDAccess(req: Request, res: Response, next: NextFunction): Promise<any> {
        try {
            const { userId, rfidCardId } = req.body;
            const currentUser = req.user;
            if(currentUser?.role !== "ADMIN") {
                return res.status(403).json({message: "You are not authorized to check RFID access"});
            }
            if (!userId || !rfidCardId) {
                return res.status(400).json({message: "userId and rfidCardId are required"});
            }
            const result = await userManagementServiceInstance.checkUserRFIDAccess({ userId, rfidCardId });
            return res.json(result);
        } catch (err: any) {
            return res.status(500).json({ success: false, message: err.message });
        }
    }

    // Get all users who can use a specific RFID card
    async getUsersWithRFIDAccess(req: Request, res: Response, next: NextFunction): Promise<any> {
        try {
            const { rfidCardId } = req.params;
            const currentUser = req.user;
            if(currentUser?.role !== "ADMIN") {
                return res.status(403).json({message: "You are not authorized to view RFID access"});
            }
            if (!rfidCardId) {
                return res.status(400).json({message: "rfidCardId is required"});
            }
            const result = await userManagementServiceInstance.getUsersWithRFIDAccess({ rfidCardId });
            return res.json(result);
        } catch (err: any) {
            return res.status(500).json({ success: false, message: err.message });
        }
    }

    // Record attendance when RFID card is tapped
    async recordRFIDAttendance(req: Request, res: Response, next: NextFunction): Promise<any> {
        try {
            const { rfidCardId, userId } = req.body;
            
            if (!rfidCardId) {
                return res.status(400).json({ 
                    success: false, 
                    message: "rfidCardId is required" 
                });
            }

            const result = await userManagementServiceInstance.recordRFIDAttendance({ rfidCardId });
            return res.json(result);
        } catch (err: any) {
            return res.status(500).json({ 
                success: false, 
                message: err.message 
            });
        }
    }

    async getRFIDUsage(req: Request, res: Response, next: NextFunction): Promise<any> {
        try {
            const currentUser = req.user;
            if (currentUser?.role !== "ADMIN") {
                return res.status(403).json({ message: "You are not authorized to view this data" });
            }
            const result = await userManagementServiceInstance.getRFIDUsage();
            return res.json(result);
        } catch (err: any) {
            return res.status(500).json({ success: false, message: err.message });
        }
    }
    async fetchAllUserMemberships(req: Request, res: Response, next: NextFunction): Promise<any> {
        try {
            const result = await userManagementServiceInstance.fetchAllUserMemberships();
            return res.json(result);
        } catch (err: any) {
            return res.status(500).json({ success: false, message: err.message });
        }
    }

    async adminCreateUser(req: Request, res: Response, next: NextFunction): Promise<any> {
        try {
            const { name, phoneOrEmail, planId, memberEmails, beneficiaries, paymentStatus } = req.body;
            const currentUser = req.user;

            if (currentUser?.role !== "ADMIN") {
                return res.status(403).json({ message: "You are not authorized to create users" });
            }

            if (!name || !phoneOrEmail) {
                return res.status(400).json({ message: "Name and email are required" });
            }

            // Validate email format
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(phoneOrEmail)) {
                return res.status(400).json({ message: "Invalid email format" });
            }

            const result = await userManagementServiceInstance.adminCreateUser({
                name,
                phoneOrEmail,
                planId,
                memberEmails,
                beneficiaries,
                paymentStatus,
            });

            return res.json(result);
        } catch (err: any) {
            console.error('Error in adminCreateUser controller:', err);
            return res.status(500).json({ success: false, message: err.message || 'Internal server error' });
        }
    }

    async verifyAdminCreateUserOtp(req: Request, res: Response, next: NextFunction): Promise<any> {
        try {
            const { phoneOrEmail, otp } = req.body;
            const currentUser = req.user;

            if (currentUser?.role !== "ADMIN") {
                return res.status(403).json({ message: "You are not authorized to verify users" });
            }

            if (!phoneOrEmail || !otp) {
                return res.status(400).json({ message: "Email and OTP are required" });
            }

            const result = await userManagementServiceInstance.verifyAdminCreateUserOtp({
                phoneOrEmail,
                otp,
            });

            return res.json(result);
        } catch (err: any) {
            return res.status(500).json({ success: false, message: err.message });
        }
    }

    async sendBeneficiaryOtp(req: Request, res: Response, next: NextFunction): Promise<any> {
        try {
            const { beneficiaryEmail, beneficiaryName, primaryUserEmail } = req.body;
            const currentUser = req.user;

            if (currentUser?.role !== "ADMIN") {
                return res.status(403).json({ message: "You are not authorized to send OTP" });
            }

            if (!beneficiaryEmail || !beneficiaryName || !primaryUserEmail) {
                return res.status(400).json({ message: "Beneficiary email, name, and primary user email are required" });
            }

            const result = await userManagementServiceInstance.sendBeneficiaryOtp({
                beneficiaryEmail,
                beneficiaryName,
                primaryUserEmail,
            });

            return res.json(result);
        } catch (err: any) {
            return res.status(500).json({ success: false, message: err.message });
        }
    }

    async verifyBeneficiaryOtp(req: Request, res: Response, next: NextFunction): Promise<any> {
        try {
            const { beneficiaryEmail, otp, primaryMembershipId } = req.body;
            const currentUser = req.user;

            if (currentUser?.role !== "ADMIN") {
                return res.status(403).json({ message: "You are not authorized to verify beneficiaries" });
            }

            if (!beneficiaryEmail || !otp || !primaryMembershipId) {
                return res.status(400).json({ message: "Beneficiary email, OTP, and primary membership ID are required" });
            }

            const result = await userManagementServiceInstance.verifyBeneficiaryOtp({
                beneficiaryEmail,
                otp,
                primaryMembershipId,
            });

            return res.json(result);
        } catch (err: any) {
            return res.status(500).json({ success: false, message: err.message });
        }
    }

    async removeMembershipFromUser(req: Request, res: Response, next: NextFunction): Promise<any> {
        try {
            const { userId, membershipId } = req.body;
            const currentUser = req.user;
            
            if (currentUser?.role !== "ADMIN") {
                return res.status(403).json({ message: "You are not authorized to remove memberships" });
            }
            
            if (!userId || !membershipId) {
                return res.status(400).json({ message: "User ID and Membership ID are required" });
            }
            
            const result = await userManagementServiceInstance.removeMembershipFromUser(userId, membershipId);
            return res.json(result);
        } catch (err: any) {
            return res.status(500).json({ success: false, message: err.message });
        }
    }

    async deactivateUserMemberships(req: Request, res: Response, next: NextFunction): Promise<any> {
        try {
            const { userId } = req.body;
            const currentUser = req.user;
            
            if (currentUser?.role !== "ADMIN") {
                return res.status(403).json({ message: "You are not authorized to deactivate memberships" });
            }
            
            if (!userId) {
                return res.status(400).json({ message: "User ID is required" });
            }
            
            const result = await userManagementServiceInstance.deactivateUserMemberships(userId);
            return res.json(result);
        } catch (err: any) {
            return res.status(500).json({ success: false, message: err.message });
        }
    }

    async cancelUserBooking(req: Request, res: Response, next: NextFunction): Promise<any> {
        try {
            const { userId, bookingId } = req.body;
            const currentUser = req.user;
            
            if (currentUser?.role !== "ADMIN") {
                return res.status(403).json({ message: "You are not authorized to cancel bookings" });
            }
            
            if (!userId || !bookingId) {
                return res.status(400).json({ message: "User ID and Booking ID are required" });
            }
            
            const result = await userManagementServiceInstance.cancelUserBooking(userId, bookingId);
            return res.json(result);
        } catch (err: any) {
            return res.status(500).json({ success: false, message: err.message });
        }
    }

    async updateMembershipPaymentStatus(req: Request, res: Response, next: NextFunction): Promise<any> {
        try {
            const { membershipId, paymentStatus } = req.body;
            const currentUser = req.user;
            
            if (currentUser?.role !== "ADMIN") {
                return res.status(403).json({ message: "You are not authorized to update payment status" });
            }
            
            if (!membershipId || !paymentStatus) {
                return res.status(400).json({ message: "Membership ID and Payment Status are required" });
            }
            
            if (!['PENDING', 'PAID', 'REFUNDED', 'FAILED'].includes(paymentStatus)) {
                return res.status(400).json({ message: "Invalid payment status" });
            }
            
            const result = await userManagementServiceInstance.updateMembershipPaymentStatus(membershipId, paymentStatus);
            return res.json(result);
        } catch (err: any) {
            return res.status(500).json({ success: false, message: err.message });
        }
    }

    async updateUser(req: Request, res: Response, next: NextFunction): Promise<any> {
        try {
            const { userId } = req.params;
            const { name, email, role, isVerified, isAgreedToTerms } = req.body;
            const currentUser = req.user;
            
            if (currentUser?.role !== "ADMIN") {
                return res.status(403).json({ message: "You are not authorized to update users" });
            }
            
            if (!userId) {
                return res.status(400).json({ message: "User ID is required" });
            }
            
            const result = await userManagementServiceInstance.updateUser(userId, {
                name,
                email,
                role,
                isVerified,
                isAgreedToTerms
            });
            
            return res.json(result);
        } catch (err: any) {
            return res.status(500).json({ success: false, message: err.message });
        }
    }

    async assignMembershipToUser(req: Request, res: Response, next: NextFunction): Promise<any> {
        try {
            const { userId, planId, paymentStatus } = req.body;
            const currentUser = req.user;
            
            if (currentUser?.role !== "ADMIN") {
                return res.status(403).json({ message: "You are not authorized to assign memberships" });
            }
            
            if (!userId || !planId) {
                return res.status(400).json({ message: "User ID and Plan ID are required" });
            }
            
            const result = await userManagementServiceInstance.assignMembershipToUser(userId, planId, paymentStatus || 'PENDING');
            
            return res.json(result);
        } catch (err: any) {
            return res.status(500).json({ success: false, message: err.message });
        }
    }
}

export default UserProfileManagement;