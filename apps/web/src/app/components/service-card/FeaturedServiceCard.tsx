"use client"
import { motion } from "framer-motion";
import Image from "next/image";
import { Card, CardContent } from "@/app/components/ui/card/Card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/app/components/ui/dialog/Dialog";
import { PrimaryButton as Button } from "@/app/components/ui/buttons/PrimaryButton";
import { Badge } from "@/app/components/badge/badge";
import { Clock, MapPin, Star, User, Video, Award, Briefcase, ArrowRight } from "lucide-react";
import { createOrder, verifyPayment } from "@/app/api/payment";
import { useToast } from "@/app/components/ui/toast/use-toast";
import { useAuth } from "@/app/hooks/useAuth";
import Script from "next/script";
import { BookingCalendar } from "@/app/components/booking/BookingCalendar";
import { createBooking, getServiceAvailability } from "@/app/api/booking";
import { ToastProvider } from "@/app/components/ui/toast/toast";
import { useRouter } from "next/navigation";
import { SecondaryButton } from "../ui/buttons/SecondaryButton";
import { BookingData } from "@/app/@types/interface";
import { Input } from "../ui/input/input";
import { useState, useEffect } from "react";

interface FeaturedServiceCardProps {
  service: any;
  index: number;
}

export function FeaturedServiceCard({ service, index }: FeaturedServiceCardProps) {
  // Reuse all the state and handlers from ServiceCard
  const [showDetails, setShowDetails] = useState(false);
  const [showBooking, setShowBooking] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);
  const [email, setEmail] = useState<string>("");
  const [availability, setAvailability] = useState<any[]>([]);
  const { user } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    const fetchAvailability = async () => {
      try {
        const response = await getServiceAvailability(service.id);
        setAvailability(response);
      } catch (error) {
        console.error("Error fetching availability:", error);
      }
    };
    fetchAvailability();
  }, [service.id]);

  const handlePayment = async () => {
    try {
      if (!user) {
        toast({
          title: "Authentication Required",
          description: "Please login to book this service",
          variant: "destructive"
        });
        return;
      }

      if (!email) {
        toast({
          title: "Email Required",
          description: "Please enter your email",
          variant: "destructive"
        });
      }

      if (!selectedDate || !selectedTimeSlot) {
        toast({
          title: "Selection Required",
          description: "Please select a date and time slot",
          variant: "destructive"
        });
        return;
      }

      setIsProcessing(true);
      const orderData = await createOrder({
        userId: user.id,
        serviceId: service.id,
      });

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Palash Wellness",
        description: `Payment for ${service.name} on ${selectedDate.toLocaleDateString()} at ${selectedTimeSlot}`,
        order_id: orderData.id,
        handler: async (response: any) => {
          try {
            const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = response;
            
            await verifyPayment({
              orderId: razorpay_order_id,
              paymentId: razorpay_payment_id,
              signature: razorpay_signature,
              userId: user.id,
              serviceId: service.id,
              date: selectedDate.toISOString(),
              timeSlot: selectedTimeSlot,
              email: email,
            });

            const bookingData: BookingData = {
              userId: user.id,
              serviceId: service.id,
              date: selectedDate.toISOString(),
              timeSlot: selectedTimeSlot,
              paymentId: razorpay_payment_id,
              email: email,
            };

            await createBooking(bookingData);

            toast({
              title: "Payment and Booking Successful",
              description: "Your booking and payment has been confirmed",
              variant: "default"
            });

            setShowBooking(false);
          } catch (error) {
            console.error("Payment verification failed:", error);
            toast({
              title: "Payment Verification Failed",
              description: "Please contact support if amount was deducted",
              variant: "destructive"
            });
          }
        },
        prefill: {
          name: user.name,
          email: user.phone_or_email,
          contact: user.phone_or_email
        },
        theme: {
          color: "#012b2b"
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error("Payment initiation failed:", error);
      toast({
        title: "Payment Failed",
        description: "Unable to initiate payment. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="lazyOnload"
      />
      <ToastProvider />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.2 }}
        className="group relative w-full min-h-[500px] rounded-2xl overflow-hidden cursor-pointer"
        onClick={() => setShowDetails(true)}
      >
        {/* Background Image with Gradient Overlay */}
        <div className="absolute inset-0">
          <Image
            src={service.media?.[0] ? `${process.env.NEXT_PUBLIC_API_URL}${service.media[0]}` : "/placeholder.jpg"}
            alt={service.name}
            fill
            className="object-cover"
            onError={() => setImageError(true)}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#012b2b]/20 via-[#012b2b]/60 to-[#012b2b]/90" />
        </div>

        {/* Content */}
        <div className="relative h-full flex flex-col justify-end p-8 text-white">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Badge className="bg-emerald-50/20 text-white border-emerald-50/30">
                {service.category}
              </Badge>
              <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                Featured
              </Badge>
            </div>

            <h2 className="text-4xl font-bold">{service.name}</h2>

            <div className="flex items-center gap-4 text-white/90">
              <div className="flex items-center gap-2">
                <User className="w-5 h-5" />
                <span>{service.instructorName}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                <span>{service.duration} mins</span>
              </div>
              {service.isOnline ? (
                <div className="flex items-center gap-2">
                  <Video className="w-5 h-5" />
                  <span>Online</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  <span>{service.location?.city}</span>
                </div>
              )}
            </div>

            <div className="text-white/80 line-clamp-2 max-w-2xl">
              {service.description && service.description.length > 0 ? (
                <ul className="space-y-1 list-disc list-inside">
                  {service.description.slice(0, 2).map((point, index) => (
                    <li key={index}>{point}</li>
                  ))}
                  {service.description.length > 2 && (
                    <li>...and {service.description.length - 2} more points</li>
                  )}
                </ul>
              ) : (
                <p>{service.shortDescription}</p>
              )}
            </div>

            <div className="flex items-center gap-4 pt-4">
              <div className="text-2xl font-bold">
                {service.currency || "₹"}{service.price}
                {service.discountPrice && (
                  <span className="ml-2 text-base text-white/60 line-through">
                    {service.currency || "₹"}{service.discountPrice}
                  </span>
                )}
              </div>
              {user ? (
                <Button
                  className="bg-white text-[#012b2b] hover:bg-white/90"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowDetails(true);
                  }}
                >
                  Book Now
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              ) : (
                <SecondaryButton
                  className="bg-white/20 text-white hover:bg-white/30"
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push("/sign-in");
                  }}
                >
                  Sign In to Book
                </SecondaryButton>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-3xl bg-white sm:rounded-2xl overflow-hidden p-0 max-h-[90vh] flex flex-col">
          <div className="relative w-full h-72 flex-shrink-0">
            {!imageError && service.media && service.media.length > 0 ? (
              <>
                <div className="absolute inset-0 bg-gradient-to-t from-[#012b2b]/60 to-transparent z-10" />
                <Image
                  src={service.media?.[0] ? `${process.env.NEXT_PUBLIC_API_URL}${service.media[0]}` : "/placeholder.jpg"}
                  alt={service.name}
                  fill
                  className="object-cover"
                  onError={() => setImageError(true)}
                />
                <div className="absolute bottom-6 left-6 z-20">
                  <div className="flex gap-2 mb-2">
                    <Badge className="bg-white/90 text-[#012b2b]">{service.category}</Badge>
                    <Badge variant="secondary">Featured</Badge>
                  </div>
                  <h2 className="text-3xl font-bold text-white">{service.name}</h2>
                </div>
              </>
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-[#012b2b]/10 to-[#517d64]/10 flex items-center justify-center">
                <span className="text-[#012b2b]/60">Image not available</span>
              </div>
            )}
          </div>

          {/* ... rest of the dialog content from ServiceCard ... */}
        </DialogContent>
      </Dialog>

      <Dialog open={showBooking} onOpenChange={setShowBooking}>
        <DialogContent className="max-w-md bg-white sm:rounded-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl text-[#012b2b] font-semibold">Book {service.name}</DialogTitle>
          </DialogHeader>

          <div className="mt-4 space-y-4">
            <div className="flex items-start flex-col justify-center py-3 border-b border-[#517d64]/20">
              <span className="text-[#517d64] mb-3 text-sm ml-2">Enter your email where you want to receive the booking confirmation and invoice</span>
              <Input
                type="email"
                placeholder="eg. example@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            {/* ... rest of the booking dialog content from ServiceCard ... */}

            <div className="pt-4">
              <Button 
                className="w-full bg-[#012b2b] hover:bg-[#012b2b]/90 text-white"
                onClick={handlePayment}
                disabled={!selectedDate || !selectedTimeSlot || isProcessing}
              >
                {isProcessing ? "Processing..." : "Proceed to Payment"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
} 