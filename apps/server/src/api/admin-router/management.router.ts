import { Router } from "express";
import AdminServiceManagementController from "../../controllers/admin/admin-services-management.controller.js"
import BookingManagementController from "../../controllers/admin/booking-management.controller.js";
import {handleUploadErrors, upload} from "../../middlewares/upload.middleware.js";
import UserManagementController from "../../controllers/admin/user-management.controller.js";
const ManagementRouter = Router();

const bookingManagementControllerInstance = new BookingManagementController();
const userManagementControllerInstance = new UserManagementController();

ManagementRouter.post('/services/create-service', upload.array("media", 10), handleUploadErrors, AdminServiceManagementController.createService);
ManagementRouter.put('/services/update-service-images/:serviceId',upload.array("media", 10), AdminServiceManagementController.updateServiceImages)
ManagementRouter.put('/services/update-service-data/:serviceId', AdminServiceManagementController.updateServiceData)
ManagementRouter.delete('/services/delete-service', AdminServiceManagementController.deleteService);
ManagementRouter.post('/bookings/availability/bulk/:serviceId', bookingManagementControllerInstance.createAvailablityDatesInBulk);
ManagementRouter.put('/bookings/availability/:serviceId/:date', bookingManagementControllerInstance.updateAvailablityForSpecificDate);
ManagementRouter.delete('/users/delete-user/:userId', userManagementControllerInstance.deleteUser);
ManagementRouter.get('/users/fetch-users', userManagementControllerInstance.fetchUsers);
ManagementRouter.post('/users/assign-rfid', userManagementControllerInstance.assignRFIDToUser);
ManagementRouter.get('/users/membership-groups', userManagementControllerInstance.fetchAllMembershipGroupsWithRFID);
// ManagementRouter.patch('/users/update-rfid', userManagementControllerInstance.updateRFIDForMembership);
ManagementRouter.delete('/users/unassign-rfid', userManagementControllerInstance.unassignRFIDForMembership);
ManagementRouter.post('/users/check-rfid-access', userManagementControllerInstance.checkUserRFIDAccess);
ManagementRouter.get('/users/rfid-access/:rfidCardId', userManagementControllerInstance.getUsersWithRFIDAccess);
ManagementRouter.post('/attendance/rfid-tap', userManagementControllerInstance.recordRFIDAttendance);
ManagementRouter.get('/attendance/rfid-usage', userManagementControllerInstance.getRFIDUsage);
ManagementRouter.get('/fetch-all-subscribed-memberships', userManagementControllerInstance.fetchAllUserMemberships)

export default ManagementRouter;