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
}

export default UserProfileManagement;