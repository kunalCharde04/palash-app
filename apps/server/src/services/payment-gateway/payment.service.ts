import Razorpay from "razorpay";
import { createHmac } from "crypto";
import { ICreateCustomerParams, IOrderParams, IPaymentConfig, IPaymentDetails, IVerifyPaymentParams } from "../../@types/interfaces.js";
import { prisma } from "@palash/db-client";
import { v4 as uuidv4 } from 'uuid';
import { NotFoundError, ValidationError } from "../../utils/errors.js";

enum PaymentStatus {
  PENDING = "PENDING",
  PAID = "PAID",
  REFUNDED = "REFUNDED",
  FAILED = "FAILED"
}

class PaymentGateway {
  private razorpay: Razorpay;
  private keyId: string;
  private keySecret: string;

  constructor(config: IPaymentConfig) {
    this.keyId = config.keyId;
    this.keySecret = config.keySecret;

    this.razorpay = new Razorpay({
      key_id: this.keyId,
      key_secret: this.keySecret,
    });

    console.info('Payment gateway initialized');
  }
  async createOrder(order: IOrderParams): Promise<any> {

    const { userId, serviceId } = order;
    return prisma.$transaction(async (tx) => {

      const service = await tx.service.findUnique({
        where: { id: serviceId }
      });

      const isAlreadyBooked = await tx.booking.findFirst({
        where: {
          service_id: serviceId,
          user_id: userId,
          status: 'CONFIRMED'
        }
      })

      if (isAlreadyBooked) {
        throw new ValidationError('You have already booked this service');
      }


      if (!service) {
        throw new ValidationError(`Service with ID ${serviceId} not found`);
      }

      const user = await tx.user.findUnique({
        where: { id: userId }
      });


      if (!user) {
        throw new ValidationError(`User with ID ${userId} not found`);
      }

      const receiptId = `receipt_${uuidv4().replace(/-/g, '')}`;

      return await this.razorpay.orders.create({
        amount: Number(service.price) * 100,
        currency: "INR",
        receipt: receiptId,
        notes: {
          title: service.name,
          description: Array.isArray(service.description) ? service.description.join(' ').slice(0, 250) : (service.description as string).slice(0, 250),
          access: "QUARTERLY",
          category: service.category,
          price: service.price.toString(),
          userId: user.id,
          serviceId: service.id
        }
      });
    })

  }
  async verifyPaymentSignature(params: IVerifyPaymentParams): Promise<boolean> {
    console.log("params", params);
    return await prisma.$transaction(async (tx) => {
      const generatedSig = createHmac('sha256', this.keySecret)
        .update(`${params.orderId}|${params.paymentId}`)
        .digest('hex');

      const isValid = generatedSig === params.signature;

      await tx.payment.create({
        data: {
          order_id: params.orderId,
          payment_id: params.paymentId,
          signature: params.signature,
          user_id: params.userId,
          service_id: params.serviceId,
          date: params.date,
          time_slot: params.timeSlot,
          email: params.email,
          amount: params.amount,
          currency: params.currency,
          status: params.status as PaymentStatus
        }
      })

      if (isValid) {
        console.info(`Payment verified successfully: ${params.paymentId}`);
      } else {
        console.warn(`Invalid payment signature: ${params.paymentId}`);
      }
      return isValid;

    })

  }
  async createRazorpayCustomer(params: ICreateCustomerParams): Promise<any> {
    try {
      return await this.razorpay.customers.create({
        name: params.name,
        contact: params.email_or_phone,
        notes: params.notes
      })
    }
    catch (err: any) {
      throw new Error(`Razorpay customer created: ${err.message}`);
    }
  }
  async getPaymentDetails(userId: string): Promise<any> {
    try {

      const payment = await prisma.payment.findMany({
        where: {
          user_id: userId
        }
      })

      if (!payment) {
        throw new NotFoundError(`Payment details not found for ID ${userId}`);
      }


      // Fetch payments from Razorpay API for this user
      // We can use the payment records from our database to get the payment IDs
      const paymentDetails = await Promise.all(
        payment.map(async (p) => {
          if (p.payment_id) {
            return await this.razorpay.payments.fetch(p.payment_id);
          }
          return null;
        })
      ).then(results => results.filter(result => result !== null));
      console.log("paymentDetails: ", paymentDetails);

      return paymentDetails;
    }
    catch (err: any) {
      throw new Error(`Failed to get payment details: ${err.message}`);
    }
  }
  
  async processRefund(paymentId: string, amount: string): Promise<any> {
    const refundOption: any = {}
    try {
      if (amount) {
        refundOption.amount = parseInt(amount) * 100;
      }
      return await this.razorpay.payments.refund(paymentId, refundOption);
    }
    catch (err: any) {
      throw new Error(`Failed to process refund: ${err.message}`);
    }
  }
}

export default PaymentGateway;