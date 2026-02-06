import {Request, Response, NextFunction} from "express";
import { ICreateCustomerParams, IVerifyPaymentParams, IOrderParams, CreateBookingInput } from "../../@types/interfaces.js";
import PaymentGateway from "../../services/payment-gateway/payment.service.js";
import { razorpayConfig } from "../../config/razorpay.config.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { ValidationError, UnauthorizedError, NotFoundError } from "../../utils/errors.js";

class PaymentGatewayController {
    private paymentGatewayInstance: PaymentGateway;

    constructor() {
        this.paymentGatewayInstance = new PaymentGateway(razorpayConfig);
    }

    createOrder = asyncHandler(async (req: Request, res: Response) => {
        const params: IOrderParams = req.body;
        
        if (!params.userId || !params.serviceId) {
            throw new ValidationError('Send, User ID, Service ID are required');
        }
        const order = await this.paymentGatewayInstance.createOrder(params);
        return res.json(order);
    }); 
    

    verifyPayment = asyncHandler(async (req: Request, res: Response) => {
        const params: IVerifyPaymentParams = req.body;
        
        // Log incoming request for debugging
        console.log('💳 Payment verification request:', {
            orderId: params.orderId,
            paymentId: params.paymentId,
            signature: params.signature ? '***' : undefined,
            userId: params.userId,
            serviceId: params.serviceId,
            date: params.date,
            timeSlot: params.timeSlot,
            email: params.email,
            amount: params.amount,
            currency: params.currency,
            status: params.status,
        });
        
        // Basic validation for required fields
        if (!params.orderId || !params.paymentId || !params.signature) {
            console.error('❌ Missing required payment fields');
            throw new ValidationError('Order ID, payment ID and signature are required');
        }

        // Razorpay signature verification
        const verifiedPayment = await this.paymentGatewayInstance.verifyPaymentSignature(params);
        
        if (!verifiedPayment) {
            console.error('❌ Payment signature verification failed');
            throw new UnauthorizedError('Payment verification failed');
        }

        console.log('✅ Payment verified successfully:', params.paymentId);
        return res.json({ 
            message: "Verified transaction",
            verified: true 
        });
    });

    newRazorpayCustomer = asyncHandler(async (req: Request, res: Response) => {
        const params: ICreateCustomerParams = req.body;
        
        if (!params.name || !params.email_or_phone) {
            throw new ValidationError('Name and email/phone are required');
        }

        const customer = await this.paymentGatewayInstance.createRazorpayCustomer(params);
        return res.json({ message: "New customer created!", customer });
    });

    fetchPaymentDetails = asyncHandler(async (req: Request, res: Response) => {
        const { userId } = req.params;
        
        if (!userId) {
            throw new ValidationError('Payment ID is required');
        }

        const details = await this.paymentGatewayInstance.getPaymentDetails(userId);
        
        if (!details) {
            throw new NotFoundError(`Payment details not found for ID ${userId}`);
        }

        return res.json(details);
    });

    processRefund = asyncHandler(async (req: Request, res: Response) => {
        const { paymentId, amount }: { paymentId: string; amount: string } = req.body;
        
        if (!paymentId || !amount) {
            throw new ValidationError('Payment ID and amount are required');
        }

        await this.paymentGatewayInstance.processRefund(paymentId, amount);
        return res.json({ message: "Refund Issued" });
    });
}

export default  PaymentGatewayController;