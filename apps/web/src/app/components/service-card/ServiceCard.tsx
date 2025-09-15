"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/app/components/ui/card/Card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/app/components/ui/dialog/Dialog";
import { PrimaryButton as Button } from "@/app/components/ui/buttons/PrimaryButton";
import { Badge } from "@/app/components/badge/badge";
import {
  Clock,
  MapPin,
  Star,
  User,
  Video,
  Award,
  Briefcase,
} from "lucide-react";
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
import { getReviews } from "@/app/api/review";
import { formatTime } from "@/app/utils/format-time";
interface Coordinates {
  latitude: number;
  longitude: number;
}

interface Location {
  city: string;
  state: string;
  address: string;
  country: string;
  postalCode: string;
  coordinates: Coordinates;
}

interface VirtualMeetingDetails {
  joinLink: string;
  password: string;
  platform: string;
}

interface Service {
  id: string;
  name: string;
  description: string[];
  shortDescription: string;
  media: string[];
  category: string;
  tags: string[];
  price: string;
  currency: string;
  discountPrice: string | null;
  duration: number;
  instructorId: string | null;
  instructorName: string;
  instructorBio: string;
  cancellationPolicy: string;
  featured: boolean;
  isActive: boolean;
  isOnline: boolean;
  isRecurring: boolean | null;
  location: Location;
  virtualMeetingDetails: VirtualMeetingDetails;
  created_at: string;
  updated_at: string;
}

interface ServiceCardProps {
  service: Service;
}

export interface ReviewResponse {
  status: string;
  data: {
    reviews: Review[];
    pagination: Pagination;
  };
}

export interface Review {
  id: string;
  rating: number;
  comment: string;
  user_id: string;
  service_id: string;
  booking_id: string | null;
  created_at: string;
  updated_at: string;
  user: {
    id: string;
    name: string;
    username: string;
  };
}

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

export function ServiceCard({ service }: ServiceCardProps) {
  const [showDetails, setShowDetails] = useState(false);
  const [showBooking, setShowBooking] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);
  const [reviews, setReviews] = useState<ReviewResponse | null>(null);
  const [email, setEmail] = useState<string>("");
  const { user } = useAuth();
  const { toast } = useToast();
  const [availability, setAvailability] = useState<any[]>([]);
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

  useEffect(() => {
    const fetchReviews = async () => {
      const response = await getReviews(service.id);
      setReviews(response);
    };
    fetchReviews();
  }, [service.id]);

  const renderCurrencySymbol = (currency: string | null) => {
    if (currency === null) return "₹";
    if (currency === "INR") return "₹";
    if (currency === "USD") return "$";
    if (currency === "EUR") return "€";
    if (currency === "GBP") return "£";
    if (currency === "AUD") return "A$";
    if (currency === "CAD") return "C$";
    if (currency === "NZD") return "NZ$";
    if (currency === "SGD") return "S$";
    if (currency === "HKD") return "HK$";
    if (currency === "JPY") return "¥";
    if (currency === "CHF") return "CHF";
    if (currency === "CNY") return "¥";
    if (currency === "RUB") return "₽";
    if (currency === "MXN") return "MX$";
    if (currency === "BRL") return "R$";
    if (currency === "ARS") return "$";
    if (currency === "CLP") return "$";
    if (currency === "COP") return "$";
    if (currency === "PEN") return "S/";
    if (currency === "UYU") return "$U";
    if (currency === "VEF") return "Bs";
    return currency;
  };

  const renderRating = (reviews: Review[]) => {
    if (!reviews || reviews.length === 0) {
      return (
        <div className="flex items-center gap-1">
          <span className="text-sm text-muted-foreground">No reviews yet</span>
        </div>
      );
    }

    const totalRating = reviews.reduce((acc, review) => acc + review.rating, 0);
    const averageRating = (totalRating / reviews.length).toFixed(1);

    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center">
          {[...Array(5)].map((_, index) => (
            <Star
              key={index}
              className={`w-4 h-4 ${
                index < Math.floor(Number(averageRating))
                  ? "text-yellow-400 fill-yellow-400"
                  : "text-gray-300"
              }`}
            />
          ))}
        </div>
        <span className="text-sm font-medium">{averageRating}</span>
        <span className="text-sm text-muted-foreground">
          ({reviews.length})
        </span>
      </div>
    );
  };

  const imageUrl =
    service.media && service.media.length > 0
      ? `${process.env.NEXT_PUBLIC_API_URL}/api/v1${service.media[currentImageIndex]}`
      : "/placeholder.svg?height=400&width=600";

  console.log("imageUrl: ", imageUrl);

  const handlePayment = async () => {
    try {
      if (!user) {
        toast({
          title: "Authentication Required",
          description: "Please login to book this service",
          variant: "destructive",
        });
        return;
      }

      if (!email) {
        toast({
          title: "Email Required",
          description: "Please enter your email",
          variant: "destructive",
        });
      }

      if (!selectedDate || !selectedTimeSlot) {
        toast({
          title: "Selection Required",
          description: "Please select a date and time slot",
          variant: "destructive",
        });
        return;
      }

      setIsProcessing(true);
      const orderData = await createOrder({
        userId: user.id,
        serviceId: service.id,
      });

      setShowBooking(false);

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Palash Wellness",
        description: `Payment for ${service.name} on ${selectedDate.toLocaleDateString()} at ${selectedTimeSlot}`,
        order_id: orderData.id,
        handler: async (response: any) => {
          try {
            const {
              razorpay_payment_id,
              razorpay_order_id,
              razorpay_signature,
            } = response;

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
              variant: "default",
            });

            setShowBooking(false);
          } catch (error: any) {
            console.error(
              "Payment verification failed:",
              error.response.data.message
            );
            toast({
              title:
                "Payment Verification Failed, If the amount is deducted from your account, it will be refunded within 24 hours. Please contact support if the amount is not refunded.",
              description: error.response.data.message,
              variant: "destructive",
            });
          }
        },
        prefill: {
          name: user.name,
          email: user.phone_or_email,
          contact: user.phone_or_email,
        },
        theme: {
          color: "#012b2b",
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error: any) {
      console.error("Payment initiation failed:", error);
      toast({
        title:
          "Payment Verification Failed, If the amount is deducted from your account, it will be refunded within 24 hours. Please contact support if the amount is not refunded.",
        description: error.response.data.message,
        variant: "destructive",
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
      <Card
        className="overflow-hidden group cursor-pointer transition-all duration-300 hover:shadow-lg border-none"
        onClick={() => setShowDetails(true)}
        style={{
          background: "linear-gradient(to bottom, #f8f9fa, #ffffff)",
          boxShadow: "0 4px 20px rgba(1, 43, 43, 0.08)",
        }}
      >
        <div className="relative w-full h-56 overflow-hidden">
          {!imageError ? (
            <>
              <div className="absolute inset-0 bg-gradient-to-t from-[#012b2b]/30 to-transparent z-10" />
              <Image
                src={imageUrl || "/placeholder.svg"}
                alt={service.name}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                onError={() => setImageError(true)}
              />
              <Badge className="absolute top-4 right-4 z-20 bg-white/90 text-[#012b2b] hover:bg-white/80">
                {service.category}
              </Badge>
              {service.featured && (
                <Badge
                  variant="secondary"
                  className="absolute bg-yellow-200 text-black top-4 flex items-center justify-center gap-2 left-4 z-20"
                >
                  <Star className="w-3 h-3" />
                  <span className="text-xs">Featured</span>
                </Badge>
              )}
            </>
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-[#012b2b]/10 to-[#517d64]/10 flex items-center justify-center">
              <span className="text-[#012b2b]/60">Image not available</span>
            </div>
          )}
        </div>

        <CardContent className="p-6">
          <div className="mb-2 flex justify-between items-start">
            <h3 className="text-xl font-semibold text-[#012b2b] leading-tight">
              {service.name}
            </h3>
            <div className="flex items-center text-lg font-bold text-green-700">
              <span>
                {renderCurrencySymbol(service.currency)}
                {service.price}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 mb-3 text-[#517d64]">
            <User className="w-4 h-4" />
            <span className="text-sm">{service.instructorName}</span>
          </div>

          <div className="mb-3">
            {renderRating(reviews?.data.reviews || [])}
          </div>

          <div className="flex flex-wrap gap-2 mb-4">
            <Badge
              variant="outline"
              className="bg-green-100 text-green-800 hover:bg-green-300/80"
            >
              {service.category}
            </Badge>
            <Badge
              variant="outline"
              className="bg-green-100 text-green-800 hover:bg-green-300/80"
            >
              {formatTime(service.duration)}
            </Badge>
            <Badge
              variant="outline"
              className="bg-green-100 text-green-800 hover:bg-green-300/80"
            >
              {service.isOnline ? "Online" : "In-Person"}
            </Badge>
          </div>
          <span className="text-xs text-gray-400">
            Added on{" "}
            {new Date(service.created_at).toLocaleString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </span>

          <div className="mt-4 pt-4 border-t border-[#517d64]/20">
            {user ? (
              <Button
                className="w-full bg-[#012b2b] hover:bg-[#012b2b]/90 text-white transition-all"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowDetails(true);
                }}
              >
                Book Session
              </Button>
            ) : (
              <SecondaryButton
                className="w-full"
                onClick={(e) => {
                  e.stopPropagation();
                  router.push("/sign-in");
                }}
              >
                Sign In to Book Session
              </SecondaryButton>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Primary dialog below */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-3xl bg-white sm:rounded-2xl overflow-hidden p-0 max-h-[90vh] flex flex-col">
          <div className="relative w-full h-72 flex-shrink-0">
            {!imageError && service.media && service.media.length > 0 ? (
              <>
                <div className="absolute inset-0 bg-gradient-to-t from-[#012b2b]/60 to-transparent z-10" />
                <Image
                  src={imageUrl || "/placeholder.svg"}
                  alt={service.name}
                  fill
                  className="object-cover"
                  onError={() => setImageError(true)}
                />
                {service.media.length > 1 && (
                  <div className="absolute bottom-6 right-6 z-20 flex gap-2">
                    {service.media.map((_, index) => (
                      <button
                        key={index}
                        className={`w-2.5 h-2.5 rounded-full ${
                          index === currentImageIndex
                            ? "bg-white"
                            : "bg-white/50"
                        }`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setCurrentImageIndex(index);
                        }}
                      />
                    ))}
                  </div>
                )}
                <div className="absolute bottom-6 left-6 z-20">
                  <div className="flex gap-2 mb-2">
                    <Badge className="bg-white/90 text-[#012b2b]">
                      {service.category}
                    </Badge>
                    {service.featured && (
                      <Badge variant="secondary">Featured</Badge>
                    )}
                  </div>
                  <h2 className="text-3xl font-bold text-white">
                    {service.name}
                  </h2>
                </div>
              </>
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-[#012b2b]/10 to-[#517d64]/10 flex items-center justify-center">
                <span className="text-[#012b2b]/60">Image not available</span>
              </div>
            )}
          </div>

          <div className="p-6 overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center gap-2 text-[#517d64]">
                    <User className="w-5 h-5" />
                    <span>{service.instructorName}</span>
                  </div>
                  <div className="flex items-center">
                    {renderRating(reviews?.data.reviews || [])}
                  </div>
                </div>

                <div className="mb-6 text-sm text-[#517d64]">
                  {service.description && service.description.length > 0 ? (
                    <ul className="space-y-1 list-disc list-inside">
                      {service.description.map((point, index) => (
                        <li key={index}>{point}</li>
                      ))}
                    </ul>
                  ) : (
                    <p>{service.shortDescription}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-6 mb-12">
                  {service.isOnline ? (
                    <div className="flex items-center gap-2 text-[#517d64]">
                      <Video className="w-5 h-5" />
                      <span>{service.virtualMeetingDetails?.platform}</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-[#517d64]">
                      <MapPin className="w-5 h-5" />
                      <span>
                        {service.location?.city}, {service.location?.state}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-[#517d64]">
                    <Award className="w-5 h-5" />
                    <span>{service.category}</span>
                  </div>

                
                </div>

                {service.cancellationPolicy && (
                  <div className="bg-red-50 p-4 rounded-lg text-sm">
                    <h3 className="font-medium text-destructive mb-1">
                      Cancellation Policy
                    </h3>
                    <p className="text-[#517d64]">
                      {service.cancellationPolicy}
                    </p>
                  </div>
                )}

                <div className="mt-8">
                  <h3 className="font-medium text-[#012b2b] mb-4">Reviews</h3>
                  {reviews?.data.reviews && reviews.data.reviews.length > 0 ? (
                    <div className="space-y-4">
                      {reviews.data.reviews.map((review) => (
                        <div
                          key={review.id}
                          className="border-b border-[#517d64]/20 pb-4"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-[#517d64]/20 flex items-center justify-center">
                                <User className="w-4 h-4 text-[#517d64]" />
                              </div>
                              <div>
                                <p className="font-medium text-[#012b2b]">
                                  {review.user.name}
                                </p>
                                <p className="text-xs text-[#517d64]">
                                  {new Date(
                                    review.created_at
                                  ).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center">
                              {[...Array(5)].map((_, index) => (
                                <Star
                                  key={index}
                                  className={`w-4 h-4 ${
                                    index < review.rating
                                      ? "text-yellow-400 fill-yellow-400"
                                      : "text-gray-300"
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                          <p className="text-sm text-[#517d64]">
                            {review.comment}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-[#517d64]">No reviews yet</p>
                  )}
                </div>
              </div>

              <div className="bg-[#f8f9fa] p-6 rounded-xl">
                <div className="text-center mb-4">
                  <div className="text-sm text-[#517d64] mb-1">
                    Price per session
                  </div>
                  <div className="text-3xl font-bold text-[#012b2b]">
                    {renderCurrencySymbol(service.currency)}
                    {service.price}
                  </div>
                  {service.discountPrice && (
                    <div className="text-sm line-through text-[#517d64]/70 mt-1">
                      {renderCurrencySymbol(service.currency)}
                      {service.discountPrice}
                    </div>
                  )}
                </div>

                {user ? (
                  <Button
                    className="w-full bg-[#012b2b] hover:bg-[#012b2b]/90 text-white mb-3"
                    onClick={(e) => {
                      setShowDetails(false);
                      setShowBooking(true);
                    }}
                  >
                    Book Now
                  </Button>
                ) : (
                  <SecondaryButton
                    className="w-full"
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push("/sign-in");
                    }}
                  >
                    Sign In
                  </SecondaryButton>
                )}
                {service.instructorBio && (
                  <div className="mt-6 pt-6 border-t border-[#517d64]/20">
                    <h3 className="font-medium text-[#012b2b] mb-6">
                      About the Instructor
                    </h3>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-full bg-[#517d64]/20 flex items-center justify-center text-[#517d64]">
                        <User className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-medium">
                          {service.instructorName}
                        </div>
                        <div className="text-xs text-[#517d64] mt-2">
                          Wellness Expert
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-[#517d64] mt-4">
                      {service.instructorBio}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showBooking} onOpenChange={setShowBooking}>
        <DialogContent className="max-w-md bg-white sm:rounded-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl text-[#012b2b] font-semibold">
              Book {service.name}
            </DialogTitle>
          </DialogHeader>

          <div className="mt-4 space-y-4">
            <div className="flex items-start flex-col justify-center py-3 border-b border-[#517d64]/20">
              <span className="text-[#517d64] mb-3 text-sm ml-2">
                Enter your email where you want to receive the booking
                confirmation and invoice
              </span>
              <Input
                type="email"
                placeholder="eg. example@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="flex items-center justify-between py-3 border-b border-[#517d64]/20">
              <span className="text-[#517d64]">Service</span>
              <span className="font-medium">{service.name}</span>
            </div>

            <div className="flex items-center justify-between py-3 border-b border-[#517d64]/20">
              <span className="text-[#517d64]">Instructor</span>
              <span className="font-medium">{service.instructorName}</span>
            </div>

            <div className="py-6 border-b border-t border-solid border-[#517d64]/20">
              {/* <h3 className=" text-[#517d64] mb-4">Select Date and Time</h3> */}
              <BookingCalendar
                availability={availability as any}
                onSelectTimeSlot={(date, timeSlot) => {
                  setSelectedDate(date);
                  setSelectedTimeSlot(timeSlot);
                }}
                selectedDate={selectedDate}
                selectedTimeSlot={selectedTimeSlot}
              />
            </div>

            <div className="flex items-center justify-between py-3 border-b border-[#517d64]/20">
              <span className="text-[#517d64]">Selected Date</span>
              <span className="font-medium">
                {selectedDate
                  ? selectedDate.toLocaleDateString()
                  : "Not selected"}
              </span>
            </div>

            <div className="flex items-center justify-between py-3 border-b border-[#517d64]/20">
              <span className="text-[#517d64]">Selected Time</span>
              <span className="font-medium">
                {selectedTimeSlot || "Not selected"}
              </span>
            </div>

            <div className="flex items-center justify-between py-3 border-b border-[#517d64]/20">
              <span className="text-[#517d64]">Location</span>
              <span className="font-medium">
                {service.isOnline
                  ? `Online (${service.virtualMeetingDetails?.platform})`
                  : `${service.location?.city}, ${service.location?.state}`}
              </span>
            </div>

            <div className="flex items-center justify-between py-3 border-b border-[#517d64]/20">
              <span className="text-[#517d64]">Price</span>
              <div>
                <span className="font-bold text-[#012b2b]">
                  {renderCurrencySymbol(service.currency)}
                  {service.price}
                </span>
                {service.discountPrice && (
                  <span className="text-sm line-through text-[#517d64]/70 ml-2">
                    {renderCurrencySymbol(service.currency)}
                    {service.discountPrice}
                  </span>
                )}
              </div>
            </div>

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
  );
}
