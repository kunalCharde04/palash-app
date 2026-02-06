import { CreateBookingInput } from "../../@types/interfaces.js";
import { withTransaction, prisma, NotificationType } from "@palash/db-client";
import NotificationService from "../notification/notification.service.js";
import { ValidationError } from "../../utils/errors.js";
import { sendBookingConfirmationAndInvoice } from "../../adapters/mailer.adapter.js";

class BookingService {
    async createBooking(bookingData: CreateBookingInput): Promise<any> {
        const { serviceId, userId, date, timeSlot, paymentId, email }: CreateBookingInput = bookingData;
        
        try {
            return await withTransaction(async (tx: any) => {
                const service = await tx.service.findUnique({
                    where: {
                        id: serviceId
                    }
                })

                if (!service) {
                    throw new ValidationError('Service not found');
                }

                const user = await tx.user.findUnique({
                    where: {
                        id: userId
                    }
                })

                if (!user) {
                    throw new ValidationError('User not found');
                }

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


                const booking = await tx.booking.create({
                    data: {
                        user_id: userId,
                        service_id: serviceId,
                        total_amount: service.price,
                        date: new Date(date),
                        time_slot: timeSlot,
                        payment_status: 'PAID',
                        status: 'CONFIRMED',
                        payment_intent_id: paymentId
                    },
                });

                const payment = await tx.payment.findFirst({
                    where: {
                        payment_id: paymentId,
                        user_id: userId,
                    }
                })

                if (!payment) {
                    throw new ValidationError('Payment not found');
                }

                await tx.payment.update({
                    where: {
                        id: payment.id
                    },
                    data: {
                        booking_id: booking.id
                    }
                })
                
                // >> Send confirmation email
                await sendBookingConfirmationAndInvoice({
                    phoneOrEmail: email,
                    booking: { ...booking, service: service, user: user, payment: payment, time_slot: timeSlot, date: new Date(date) }
                });

                await NotificationService.getInstance().createNotification({
                    userId: userId,
                    type: NotificationType.BOOKING_CREATED,
                    title: "Booking Created",
                    message: "A new booking has been created",
                    data: { bookingId: booking.id }
                });

                return booking;
            });
        } catch (error) {
            // If booking creation fails, refund the payment
            console.error('Booking creation failed, initiating refund:', error);
            
            try {
                // Import the payment service to call refund
                const PaymentService = (await import('../payment-gateway/payment.service.js')).default;
                
                // Get payment config from environment
                const paymentConfig = {
                    keyId: process.env.RAZORPAY_KEY_ID!,
                    keySecret: process.env.RAZORPAY_KEY_SECRET!
                };
                
                const paymentService = new PaymentService(paymentConfig);
                
                // Get service price for refund amount
                const serviceForRefund = await prisma.service.findUnique({
                    where: { id: serviceId }
                });
                
                await paymentService.processRefund(paymentId, serviceForRefund?.price?.toString() || '0');
                console.log(`Refund processed successfully for payment: ${paymentId}`);
                
                // Send notification to user about refund
                await NotificationService.getInstance().createNotification({
                    userId: userId,
                    type: NotificationType.BOOKING_CANCELLED,
                    title: "Booking Failed - Refund Issued",
                    message: "Your booking could not be completed. Payment has been refunded.",
                    data: { paymentId: paymentId }
                });
                
            } catch (refundError) {
                console.error('Refund failed:', refundError);
                // Log refund failure but don't throw - the main error is booking failure
            }
            
            // Re-throw the original booking error
            throw error;
        }
    }

    async fetchBookings(): Promise<any> {
        try {
            // The include option tells Prisma to fetch the related user and service records
            // for each booking. Setting them to true means include all fields from those relations.
            // This is similar to a JOIN in SQL
            return await prisma.booking.findMany({
                include: {
                    user: true, // Includes all fields from the related user record
                    service: true // Includes all fields from the related service record
                }
            });
        }
        catch (err: any) {
            throw new Error(err);
        }
    }


    async fetchBookingById(bookingId: string): Promise<any> {
        try {
            return await prisma.booking.findUnique({
                where: {
                    id: bookingId
                },
                include: {
                    user: true,
                    service: true,
                    payments: true
                }
            })
        }
        catch (err: any) {
            throw new Error(err);
        }
    }

    async fetchAvailableDates(data: { serviceId: string; startDate: string; endDate: string; }): Promise<any> {
        try {
            const { serviceId, startDate, endDate } = data;

            return await prisma.availability.findMany({
                where: {
                    service_id: serviceId,
                    date: {
                        gte: new Date(startDate as string),
                        lte: new Date(endDate as string),
                    },
                    is_bookable: true, // Only fetch bookable dates
                },
                include: {
                    time_slots: {
                        where: {
                            status: 'AVAILABLE' // Only fetch available time slots
                        },
                        orderBy: {
                            start_time: 'asc'
                        }
                    }
                },
                orderBy: {
                    date: 'asc',
                },
            });
        }
        catch (err: any) {
            throw new Error(err);
        }
    }

    async fetchBookingsByUserId(userId: string): Promise<any> {
        try {
            const bookingsWithServices = await prisma.booking.findMany({
                where: {
                    user_id: userId,
                    status: "CONFIRMED"
                },
                include: {
                    service: true
                }
            });

            const currentTime = new Date(); // Current time in UTC
            const expiredBookingIds: string[] = [];

            for (const booking of bookingsWithServices) {
                // Ensure booking.created_at is treated as UTC
                // Prisma returns Date objects which are already in UTC
                const bookingStartTime = new Date(booking.created_at);
                
                // Calculate end time by adding service duration (in minutes)
                const bookingEndTime = new Date(bookingStartTime.getTime() + booking.service.duration * 60 * 1000);
                
                // Debug logging with IST conversion for better readability
                const toIST = (date: Date) => {
                    return new Date(date.getTime() + (5.5 * 60 * 60 * 1000)).toISOString().replace('Z', ' IST');
                };
                
                console.log(`Booking ${booking.id}:`);
                console.log(`  Service: ${booking.service.name} (${booking.service.duration} minutes)`);
                console.log(`  Created At (UTC): ${booking.created_at}`);
                console.log(`  Created At (IST): ${toIST(bookingStartTime)}`);
                console.log(`  Start Time (UTC): ${bookingStartTime.toISOString()}`);
                console.log(`  End Time (UTC): ${bookingEndTime.toISOString()}`);
                console.log(`  End Time (IST): ${toIST(bookingEndTime)}`);
                console.log(`  Current Time (UTC): ${currentTime.toISOString()}`);
                console.log(`  Current Time (IST): ${toIST(currentTime)}`);
                console.log(`  Is Expired: ${currentTime > bookingEndTime}`);
                
                // Check if the booking has expired
                if (currentTime > bookingEndTime) {
                    expiredBookingIds.push(booking.id);
                }
            }

            // Update expired bookings to CANCELLED status
            if (expiredBookingIds.length > 0) {
                await prisma.booking.updateMany({
                    where: {
                        id: { in: expiredBookingIds }
                    },
                    data: {
                        status: "CANCELLED"
                    }
                });
            }

            // Return both active and cancelled bookings for the user
            const allUserBookings = await prisma.booking.findMany({
                where: {
                    user_id: userId,
                    status: { in: ["CONFIRMED", "CANCELLED"] } // Include both confirmed and cancelled
                },
                include: {
                    service: true
                },
                orderBy: {
                    created_at: 'desc' // Latest bookings first
                }
            });

            // Separate active and cancelled bookings
            const activeBookings = allUserBookings.filter(booking => booking.status === "CONFIRMED");
            const cancelledBookings = allUserBookings.filter(booking => booking.status === "CANCELLED");

            console.log(`📊 Booking Summary for user ${userId}:`);
            console.log(`  Active bookings: ${activeBookings.length}`);
            console.log(`  Cancelled bookings: ${cancelledBookings.length}`);
            console.log(`  Just expired: ${expiredBookingIds.length}`);

            // Helper function to convert Decimal fields to numbers
            const normalizeBooking = (booking: any) => ({
                ...booking,
                total_amount: Number(booking.total_amount),
                service: booking.service ? {
                    ...booking.service,
                    price: Number(booking.service.price),
                    average_rating: Number(booking.service.average_rating),
                    total_reviews: Number(booking.service.total_reviews),
                } : null
            });

            return {
                activeBookings: activeBookings.map(normalizeBooking),
                cancelledBookings: cancelledBookings.map(normalizeBooking),
                totalBookings: allUserBookings.length,
                expiredCount: expiredBookingIds.length
            };
        }
        catch (err: any) {
            throw new Error(err);
        }
    }

    async cancelBooking(bookingId: string, userId: string): Promise<any> {
        try {
            return await prisma.booking.update({
                where: { id: bookingId, user_id: userId },
                data: {
                    status: 'CANCELLED',
                },
            });
        }
        catch (err: any) {
            throw new Error(err);
        }
    }
}

export default BookingService;