import { Router } from "express";
import {ManagementRouter} from './admin-router/index.js';
import ServiceListingRouter from "./service-listing-router/index.js";
import UserRouter from "./user-router/index.js";
import { BookingRouter } from "./booking-router/index.js";
import { authMiddleware, authorizeRoles } from "../middlewares/auth.middleware.js";
import { PaymentRouter } from "./payment-router/index.js";
import { ReviewRouter } from "./review-router/index.js";
import NotificationRouter from "./notifications-router/notification.routes.js"; 
import { MembershipRouter } from "./membership-router/index.js";
import { ContactRouter } from "./contact-router/index.js";

const router = Router();

router.use('/admin', authMiddleware, authorizeRoles(['ADMIN']),  ManagementRouter);
router.use('/services', ServiceListingRouter);
router.use('/payment', authMiddleware, PaymentRouter);
router.use('/booking', authMiddleware, BookingRouter);
router.use('/users', UserRouter);
router.use('/reviews', ReviewRouter);
router.use('/notifications', authMiddleware, NotificationRouter);
router.use('/memberships', MembershipRouter);
router.use('/contact', ContactRouter);

export default router;