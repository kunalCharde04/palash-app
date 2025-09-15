"use client"

import React, { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { getBookingsByUserId } from '../api/booking';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card/Card';
import { Badge } from '../components/badge/badge';
import { Calendar, Clock, MapPin, CheckCircle, XCircle, User, ArrowRight, Crown, Star, AlertTriangle, IndianRupee } from 'lucide-react';
import { LoadingScreen } from '../components/ui/loader/loading';
import { useToast } from '../components/ui/toast/use-toast';
import { Toaster } from '../components/ui/toast/toaster';
import Navbar from '../components/layout/Navbar';
import { format, parseISO, isBefore, addDays } from 'date-fns';
import Image from 'next/image';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs/tabs';
import { Button } from '../components/ui/Button';
import { useRouter } from 'next/navigation';
import { getUserMemberships, cancelUserMembership } from '../api/memberships';

interface Booking {
  id: string;
  user_id: string;
  service_id: string;
  date: string;
  time_slot: string;
  invoice_id: string | null;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED';
  payment_status: 'PENDING' | 'PAID' | 'REFUNDED' | 'FAILED';
  payment_intent_id: string | null;
  total_amount: string; // Backend sends as string
  created_at: string;
  updated_at: string;
  service: {
    id: string;
    name: string;
    description: string[];
    shortDescription: string;
    media: string[];
    category: string;
    tags: string[];
    price: string; // Backend sends as string
    currency: string;
    average_rating: number | null;
    total_reviews: number | null;
    discountPrice: string | null;
    duration: number; // Minutes
    instructorId: string | null;
    instructorName: string;
    instructorBio: string;
    cancellationPolicy: string;
    featured: boolean;
    isActive: boolean;
    isOnline: boolean;
    isRecurring: boolean | null;
    location: {
      city: string;
      state: string;
      address: string;
      country: string;
      postalCode: string;
      coordinates: {
        latitude: number;
        longitude: number;
      };
    } | null;
    virtualMeetingDetails: any;
    created_at: string;
    updated_at: string;
  };
}

interface MembershipPlan {
  id: string;
  name: string;
  durationYears: number;
  maxMembers: number;
  renewalPeriodYears: number;
  discountClubActivities: number;
  discountDining: number;
  discountAccommodations: number;
  discountSpaActivities: number;
  discountMedicalWellness: number;
  referenceBenefits: number;
  guestDiscount: number;
  includesYogaGuidance: boolean;
  includesDietChartFor: number;
  includesDoctorConsultation: boolean;
  panchkarmaWorth: number;
  cost: number;
  createdAt: string;
}

interface UserMembership {
  id: string;
  userId: string;
  planId: string;
  startDate: string;
  endDate: string;
  isPrimary: boolean;
  isActive: boolean;
  parentMembershipId: string | null;
  createdAt: string;
  plan: MembershipPlan;
  user: {
    id: string;
    name: string;
    phone_or_email: string;
  };
}

interface MembershipResponse {
  message: string;
  activeMemberships: UserMembership[];
  inactiveMemberships: UserMembership[];
}

const formatDuration = (minutes: number): string => {
  if (minutes < 60) return `${minutes} min`;
  if (minutes < 1440) return `${Math.round(minutes / 60)} hr`;
  return `${Math.round(minutes / 1440)} days`;
};

const formatCurrency = (amount: string, currency: string): string => {
  const symbols: { [key: string]: string } = {
    'INR': '₹',
    'USD': '$',
    'EUR': '€',
    'GBP': '£'
  };
  return `${symbols[currency] || currency} ${amount}`;
};

interface BookingCardProps {
  booking: Booking;
  isActive: boolean;
}

interface MembershipCardProps {
  membership: UserMembership;
  onCancel: (membership: UserMembership) => void;
  isLoading: boolean;
}

interface CancelMembershipModalProps {
  isOpen: boolean;
  membership: UserMembership | null;
  onClose: () => void;
  onConfirm: () => void;
  isLoading: boolean;
}

const CancelMembershipModal: React.FC<CancelMembershipModalProps> = ({
  isOpen,
  membership,
  onClose,
  onConfirm,
  isLoading
}) => {
  if (!isOpen || !membership) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-xl shadow-2xl p-6 max-w-md w-full mx-4 border">
        <div className="flex items-center justify-center mb-4">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 text-red-600" />
          </div>
        </div>

        <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">
          Cancel Membership?
        </h3>

        <p className="text-gray-600 text-center mb-6">
          Are you sure you want to cancel your <strong>{membership.plan.name} Membership</strong>?
          This action cannot be undone and you will lose access to all membership benefits.
        </p>

        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            className="flex-1"
          >
            Keep Membership
          </Button>
          <Button
            variant="outline"
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
          >
            {isLoading ? 'Cancelling...' : 'Yes, Cancel'}
          </Button>
        </div>
      </div>
    </div>
  );
};

const MembershipCard: React.FC<MembershipCardProps> = ({ membership, onCancel, isLoading }) => {
  const startDate = parseISO(membership.startDate);
  const endDate = parseISO(membership.endDate);
  const currentDate = new Date();

  // Calculate remaining time
  const timeRemaining = endDate.getTime() - currentDate.getTime();
  const isExpired = timeRemaining <= 0;
  const daysRemaining = Math.max(0, Math.ceil(timeRemaining / (1000 * 60 * 60 * 24)));
  const yearsRemaining = Math.floor(daysRemaining / 365);

  const getBenefits = (plan: MembershipPlan): string[] => {
    const benefits: string[] = [];

    if (plan.discountClubActivities > 0) {
      benefits.push(`${plan.discountClubActivities}% off club activities`);
    }
    if (plan.discountDining > 0) {
      benefits.push(`${plan.discountDining}% off dining`);
    }
    if (plan.discountAccommodations > 0) {
      benefits.push(`${plan.discountAccommodations}% off accommodations`);
    }
    if (plan.discountSpaActivities > 0) {
      benefits.push(`${plan.discountSpaActivities}% off spa activities`);
    }
    if (plan.discountMedicalWellness > 0) {
      benefits.push(`${plan.discountMedicalWellness}% off medical wellness`);
    }
    if (plan.includesYogaGuidance) {
      benefits.push('Yoga guidance included');
    }
    if (plan.includesDoctorConsultation) {
      benefits.push('Doctor consultation included');
    }
    if (plan.referenceBenefits > 0) {
      benefits.push(`${plan.referenceBenefits}% reference benefits`);
    }
    if (plan.maxMembers > 1) {
      benefits.push(`Up to ${plan.maxMembers} family members`);
    }
    if (plan.panchkarmaWorth > 0) {
      benefits.push(`₹${plan.panchkarmaWorth} Panchkarma benefits`);
    }

    return benefits;
  };

  return (
    <Card className={`overflow-hidden hover:shadow-lg transition-shadow ${membership.isActive ? 'border-purple-200 bg-purple-50/30' : 'border-gray-200'
      }`}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-xl text-[#012b2b] mb-1 flex items-center gap-2">
              <Crown className="w-5 h-5 text-purple-600" />
              {membership.plan.name} Membership
            </CardTitle>
            <div className="flex gap-2">
              <Badge variant={membership.isActive ? 'success' : 'secondary'}>
                {membership.isActive ? 'ACTIVE' : 'INACTIVE'}
              </Badge>
              {membership.isPrimary && (
                <Badge variant="outline" className="text-xs">
                  Primary
                </Badge>
              )}
            </div>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold text-[#012b2b]">
              ₹{membership.plan.cost.toLocaleString()}
            </div>
            <div className="text-xs text-gray-500">
              {membership.plan.durationYears} year plan
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {membership.isActive && !isExpired && (
          <div className="bg-purple-100 border border-purple-200 rounded-lg p-3">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="font-medium text-purple-800">Membership Active</span>
              <span className="text-purple-700">
                {yearsRemaining >= 1
                  ? `${yearsRemaining} year${yearsRemaining > 1 ? 's' : ''} remaining`
                  : `${daysRemaining} day${daysRemaining > 1 ? 's' : ''} remaining`
                }
              </span>
            </div>
          </div>
        )}

        <div className="space-y-2">
          <div className="text-sm font-medium text-[#012b2b]">Benefits:</div>
          <ul className="space-y-1 max-h-32 overflow-y-auto">
            {getBenefits(membership.plan).map((benefit, index) => (
              <li key={index} className="text-sm text-gray-600 flex items-center gap-2">
                <CheckCircle className="w-3 h-3 text-green-600 flex-shrink-0" />
                {benefit}
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-2 pt-2 border-t border-gray-100">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Start Date:</span>
            <span className="font-medium">{format(startDate, 'MMM d, yyyy')}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Valid Until:</span>
            <span className="font-medium">{format(endDate, 'MMM d, yyyy')}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Renewal Period:</span>
            <span className="font-medium">{membership.plan.renewalPeriodYears} years</span>
          </div>
        </div>

        <div className="pt-4 border-t border-gray-100 space-y-2">
          {
            membership.isPrimary && (
              membership.isActive ? (
                <Button
                  variant="outline"
                  className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
                  onClick={() => onCancel(membership)}
                  disabled={isLoading}
                >
                  Cancel Membership
                </Button>
              ) : (
                <div className="text-center">
                  <div className="text-sm text-gray-500 mb-2">
                    This membership is no longer active
                  </div>
                  <Button variant="outline" disabled className="w-full">
                    Renew Membership
                  </Button>
                </div>
              )
            )
          }

          {
            !membership.isPrimary && !membership.isActive && (
              <div className="text-center">
                <div className="text-sm text-red-800 mb-2">
                  This membership is no longer active
                </div>
              </div>
            )
          }
        </div>
      </CardContent>
    </Card>
  );
};

const BookingCard: React.FC<BookingCardProps> = ({ booking, isActive }) => {
  const [imageError, setImageError] = useState(false);

  const bookingDate = parseISO(booking.created_at);
  const currentDate = new Date();

  // Calculate actual service duration in minutes from the booking date
  const serviceDurationMinutes = booking.service.duration; // Duration in minutes
  const expirationDate = new Date(bookingDate.getTime() + serviceDurationMinutes * 60 * 1000);

  // Calculate remaining time
  const timeRemaining = expirationDate.getTime() - currentDate.getTime();
  const totalServiceDuration = serviceDurationMinutes * 60 * 1000; // Total duration in milliseconds

  // Calculate progress percentage based on actual service duration
  const elapsed = totalServiceDuration - timeRemaining;
  const progressPercentage = Math.min(100, Math.max(0, (elapsed / totalServiceDuration) * 100));

  // Calculate remaining time for display
  const minutesRemaining = Math.max(0, Math.ceil(timeRemaining / (1000 * 60)));
  const hoursRemaining = Math.max(0, Math.ceil(timeRemaining / (1000 * 60 * 60)));
  const daysRemaining = Math.max(0, Math.ceil(timeRemaining / (1000 * 60 * 60 * 24)));

  return (
    <Card className={`overflow-hidden hover:shadow-lg transition-shadow ${isActive ? 'border-green-200 bg-green-50/30' : 'border-gray-200'}`}>
      <div className="relative h-48 bg-gradient-to-br from-[#012b2b]/10 to-[#517d64]/10">
        {!imageError ? (
          <div className="absolute inset-0">
            <Image
              src={booking.service.media?.[0] ? `${process.env.NEXT_PUBLIC_API_URL}${booking.service.media[0]}` : "/placeholder.jpg"}
              alt={booking.service.name}
              fill
              className="object-cover"
              onError={() => setImageError(true)}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-[#012b2b]/20 via-[#012b2b]/60 to-[#012b2b]/90" />
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[#012b2b]/60">
            <span className="text-4xl">🧘‍♀️</span>
          </div>
        )}
        <div className="absolute top-4 right-4 flex gap-2 z-10">
          {isActive ? (
            <Badge className="bg-green-600 text-white">Active</Badge>
          ) : (
            <Badge variant="secondary" className="bg-gray-500 text-white">Inactive</Badge>
          )}
          <Badge className="bg-white/90 text-[#012b2b]">
            {booking.service.category}
          </Badge>
        </div>
        {booking.service.featured && (
          <div className="absolute top-4 left-4 z-10">
            <Badge variant="secondary" className="bg-yellow-200 text-black flex items-center gap-1">
              <Star className="w-3 h-3" />
              Featured
            </Badge>
          </div>
        )}
      </div>

      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-xl text-[#012b2b] mb-1">
              {booking.service.name}
            </CardTitle>
            <div className="flex items-center gap-2 text-sm text-[#517d64]">
              <User className="w-4 h-4" />
              <span className="capitalize">{booking.service.instructorName}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {booking.status === 'CONFIRMED' ? (
              <CheckCircle className="w-5 h-5 text-green-600" />
            ) : (
              <XCircle className="w-5 h-5 text-red-600" />
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {isActive && (
          <div className="bg-green-100 border border-green-200 rounded-lg p-3 overflow-hidden">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="font-medium text-green-800">Service Active</span>
              <span className="text-green-700">
                {timeRemaining > 0
                  ? daysRemaining >= 1
                    ? `${daysRemaining} day${daysRemaining > 1 ? 's' : ''} remaining`
                    : hoursRemaining >= 1
                      ? `${hoursRemaining} hour${hoursRemaining > 1 ? 's' : ''} remaining`
                      : `${minutesRemaining} minute${minutesRemaining > 1 ? 's' : ''} remaining`
                  : 'Expired'
                }
              </span>
            </div>
            <div className="w-full bg-green-200 rounded-full h-2 overflow-hidden">
              <div
                className="h-2 bg-green-600 rounded-full transition-all duration-300"
                style={{
                  width: `${progressPercentage}%`,
                  maxWidth: '100%'
                }}
              />
            </div>
            <div className="flex justify-between text-xs text-green-600 mt-1">
              <span>Started: {format(bookingDate, 'MMM d, yyyy HH:mm')}</span>
              <span>Expires: {format(expirationDate, 'MMM d, yyyy HH:mm')}</span>
            </div>
            <div className="text-xs text-green-600 mt-1 text-center">
              {formatDuration(booking.service.duration)} session duration
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-100">
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="w-4 h-4 text-[#517d64]" />
            <span>{format(bookingDate, 'MMM d, yyyy')}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Clock className="w-4 h-4 text-[#517d64]" />
            <span>{booking.time_slot}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <IndianRupee className="w-4 h-4 text-[#517d64]" />
            <span>{formatCurrency(booking.total_amount, booking.service.currency)}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="w-4 h-4 text-[#517d64]" />
            <span>
              {booking.service.isOnline
                ? 'Online'
                : booking.service.location
                  ? `${booking.service.location.city}, ${booking.service.location.state}`
                  : 'In-person'
              }
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <div className="flex gap-2">
            <Badge variant={booking.status === 'CONFIRMED' ? 'success' : booking.status === 'PENDING' ? 'warning' : 'destructive'}>
              {booking.status}
            </Badge>
            <Badge variant={booking.payment_status === 'PAID' ? 'success' : booking.payment_status === 'PENDING' ? 'warning' : 'destructive'}>
              {booking.payment_status}
            </Badge>
          </div>
        </div>
{/* 
        <div className="flex flex-wrap gap-2 pt-2">
          <Badge variant="outline" className="text-xs">
            {formatDuration(booking.service.duration)}
          </Badge>
          <Badge variant="outline" className="text-xs">
            {booking.service.category}
          </Badge>
          {booking.service.isOnline ? (
            <Badge variant="outline" className="text-xs">
              Online
            </Badge>
          ) : (
            <Badge variant="outline" className="text-xs">
              In-Person
            </Badge>
          )}
        </div> */}
      </CardContent>
    </Card>
  );
};

export default function BookingsPage() {
  const { user, loading: authLoading } = useAuth();
  const [activeBookings, setActiveBookings] = useState<Booking[]>([]);
  const [cancelledBookings, setCancelledBookings] = useState<Booking[]>([]);
  const [activeMemberships, setActiveMemberships] = useState<UserMembership[]>([]);
  const [inactiveMemberships, setInactiveMemberships] = useState<UserMembership[]>([]);
  const [bookingStats, setBookingStats] = useState({ totalBookings: 0, expiredCount: 0 });
  const [loading, setLoading] = useState(true);
  const [membershipLoading, setMembershipLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [membershipToCancel, setMembershipToCancel] = useState<UserMembership | null>(null);
  const { toast } = useToast();
  const router = useRouter();


  useEffect(() => {
    const fetchBookings = async () => {
      if (!user?.id) return;

      try {
        setLoading(true);
        const response = await getBookingsByUserId(user.id);

        // Handle new response structure
        if (response?.activeBookings && response?.cancelledBookings) {
          setActiveBookings(response.activeBookings || []);
          setCancelledBookings(response.cancelledBookings || []);
          setBookingStats({
            totalBookings: response.totalBookings || 0,
            expiredCount: response.expiredCount || 0
          });

          // Show notification if bookings expired
          if (response.expiredCount > 0) {
            toast({
              title: "Bookings Updated",
              description: `${response.expiredCount} booking(s) have expired and been moved to cancelled.`,
              variant: "default"
            });
          }
        } else {
          // Fallback for old response format (array)
          const bookingsArray = Array.isArray(response) ? response : [];
          setActiveBookings(bookingsArray.filter((b: Booking) => b.status === 'CONFIRMED'));
          setCancelledBookings(bookingsArray.filter((b: Booking) => b.status === 'CANCELLED'));
          setBookingStats({ totalBookings: bookingsArray.length, expiredCount: 0 });
        }
      } catch (err: any) {
        const errorMessage = err.response?.data?.message || 'Failed to fetch bookings';
        setError(errorMessage);
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) {
      fetchBookings();
    }
  }, [user?.id, toast]);

  const allBookings = [...activeBookings, ...cancelledBookings];
  const allMemberships = [...activeMemberships, ...inactiveMemberships];

  const openCancelModal = (membership: UserMembership) => {
    setMembershipToCancel(membership);
    setCancelModalOpen(true);
  };

  const closeCancelModal = () => {
    setCancelModalOpen(false);
    setMembershipToCancel(null);
  };

  const confirmCancelMembership = async () => {
    if (!membershipToCancel) return;

    try {
      setMembershipLoading(true);
      const response = await cancelUserMembership(membershipToCancel.id);

      // Update local state to move the membership from active to inactive
      setActiveMemberships(prev => prev.filter(m => m.id !== membershipToCancel.id));
      setInactiveMemberships(prev => [...prev, { ...membershipToCancel, isActive: false }]);

      toast({
        title: "Success",
        description: response.message || "Membership cancelled successfully",
        variant: "default"
      });

      closeCancelModal();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to cancel membership",
        variant: "destructive"
      });
    } finally {
      setMembershipLoading(false);
    }
  };

  useEffect(() => {
    const fetchUserMemberships = async () => {
      try {
        setMembershipLoading(true);
        const response: MembershipResponse = await getUserMemberships();
        console.log("Membership response: ", response);

        if (response.activeMemberships && response.inactiveMemberships) {
          setActiveMemberships(response.activeMemberships);
          setInactiveMemberships(response.inactiveMemberships);
        }
      } catch (error: any) {
        console.error("Failed to fetch memberships:", error);
        toast({
          title: "Warning",
          description: "Failed to load memberships. Some features may not be available.",
          variant: "default"
        });
      } finally {
        setMembershipLoading(false);
      }
    };

    if (user?.id) {
      fetchUserMemberships();
    }
  }, [user?.id, toast]);

  if (authLoading) {
    return <LoadingScreen text="Loading your bookings..." fullScreen={true} size="md" color="primary" />;
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Navbar user={user} isLoading={authLoading} />
        <Card className="p-8 text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Please sign in</h2>
          <p className="text-gray-600">You need to be signed in to view your bookings.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster />
      <CancelMembershipModal
        isOpen={cancelModalOpen}
        membership={membershipToCancel}
        onClose={closeCancelModal}
        onConfirm={confirmCancelMembership}
        isLoading={membershipLoading}
      />
      <Navbar user={user} isLoading={authLoading} />

      <div className="container mx-auto px-4 py-8 pt-32 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#012b2b] mb-2">My Wellness Dashboard</h1>
          <p className="text-[#517d64]">Manage your bookings and membership plans</p>
        </div>

        {error && (
          <Card className="mb-6 border-red-200 bg-red-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-red-700">
                <XCircle className="w-5 h-5" />
                <span>{error}</span>
              </div>
            </CardContent>
          </Card>
        )}

        {allBookings.length === 0 && allMemberships.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <div className="text-6xl mb-4">🧘‍♀️</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No bookings yet</h3>
              <p className="text-gray-600 mb-6">Start your wellness journey by booking your first service!</p>
              <Button
                onClick={() => router.push('/services')}
                variant="outline"
                className="text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full"
              >
                Browse Services
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Tabs defaultValue="bookings" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-8">
              <TabsTrigger value="bookings" className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Service Bookings ({allBookings.length})
              </TabsTrigger>
              <TabsTrigger value="memberships" className="flex items-center gap-2">
                <Crown className="w-4 h-4" />
                Membership Plans ({allMemberships.length})
              </TabsTrigger>
              <TabsTrigger value="active" className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Active Only ({activeBookings.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="bookings" className="space-y-6">
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-[#012b2b] mb-4">All Service Bookings</h2>
                <Tabs defaultValue="active" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-6">
                    <TabsTrigger value="active" className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      Active ({activeBookings.length})
                    </TabsTrigger>
                    <TabsTrigger value="inactive" className="flex items-center gap-2">
                      <XCircle className="w-4 h-4" />
                      Inactive ({cancelledBookings.length})
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="active" className="space-y-6">
                    {activeBookings.length === 0 ? (
                      <Card className="text-center py-8">
                        <CardContent>
                          <div className="text-4xl mb-4">✨</div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">No active bookings</h3>
                          <p className="text-gray-600">Book a service to see your active sessions here.</p>
                        </CardContent>
                      </Card>
                    ) : (
                      <div className="grid gap-6 lg:grid-cols-2">
                        {activeBookings.map(booking => (
                          <BookingCard key={booking.id} booking={booking} isActive={true} />
                        ))}
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="inactive" className="space-y-6">
                    {cancelledBookings.length === 0 ? (
                      <Card className="text-center py-8">
                        <CardContent>
                          <div className="text-4xl mb-4">📝</div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">No cancelled bookings</h3>
                          <p className="text-gray-600">Your expired or cancelled bookings will appear here.</p>
                        </CardContent>
                      </Card>
                    ) : (
                      <div className="grid gap-6 lg:grid-cols-2">
                        {cancelledBookings.map(booking => (
                          <BookingCard key={booking.id} booking={booking} isActive={false} />
                        ))}
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </div>
            </TabsContent>

            <TabsContent value="memberships" className="space-y-6">
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-[#012b2b] mb-4">Membership Plans</h2>
                {membershipLoading ? (
                  <div className="text-center py-8">
                    <LoadingScreen text="Loading memberships..." fullScreen={false} size="sm" color="primary" />
                  </div>
                ) : allMemberships.length === 0 ? (
                  <Card className="text-center py-8">
                    <CardContent>
                      <div className="text-4xl mb-4">👑</div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">No memberships yet</h3>
                      <p className="text-gray-600">Purchase a membership plan to unlock exclusive benefits.</p>
                    </CardContent>
                  </Card>
                ) : (
                  <Tabs defaultValue="active" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 mb-6">
                      <TabsTrigger value="active" className="flex items-center gap-2">
                        <Crown className="w-4 h-4" />
                        Active ({activeMemberships.length})
                      </TabsTrigger>
                      <TabsTrigger value="inactive" className="flex items-center gap-2">
                        <XCircle className="w-4 h-4" />
                        Inactive ({inactiveMemberships.length})
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="active" className="space-y-6">
                      {activeMemberships.length === 0 ? (
                        <Card className="text-center py-8">
                          <CardContent>
                            <div className="text-4xl mb-4">✨</div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">No active memberships</h3>
                            <p className="text-gray-600">Your active membership plans will appear here.</p>
                          </CardContent>
                        </Card>
                      ) : (
                        <div className="grid gap-6 lg:grid-cols-2">
                          {activeMemberships.map((membership) => (
                            <MembershipCard
                              key={membership.id}
                              membership={membership}
                              onCancel={openCancelModal}
                              isLoading={membershipLoading}
                            />
                          ))}
                        </div>
                      )}
                    </TabsContent>

                    <TabsContent value="inactive" className="space-y-6">
                      {inactiveMemberships.length === 0 ? (
                        <Card className="text-center py-8">
                          <CardContent>
                            <div className="text-4xl mb-4">📋</div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">No inactive memberships</h3>
                            <p className="text-gray-600">Your expired or cancelled memberships will appear here.</p>
                          </CardContent>
                        </Card>
                      ) : (
                        <div className="grid gap-6 lg:grid-cols-2">
                          {inactiveMemberships.map((membership) => (
                            <MembershipCard
                              key={membership.id}
                              membership={membership}
                              onCancel={openCancelModal}
                              isLoading={membershipLoading}
                            />
                          ))}
                        </div>
                      )}
                    </TabsContent>
                  </Tabs>
                )}
              </div>
            </TabsContent>

            <TabsContent value="active" className="space-y-6">
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-[#012b2b] mb-4">All Active Items</h2>

                {/* Active Memberships */}
                {activeMemberships.length > 0 && (
                  <div className="mb-8">
                    <h3 className="text-lg font-medium text-[#012b2b] mb-4">Active Memberships</h3>
                    <div className="grid gap-4 lg:grid-cols-2">
                      {activeMemberships.map((membership) => (
                        <Card key={membership.id} className="border-purple-200 bg-purple-50/30">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Crown className="w-5 h-5 text-purple-600" />
                                <span className="font-medium">{membership.plan.name} Membership</span>
                              </div>
                              <Badge className="bg-purple-600 text-white">Active</Badge>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {/* Active Bookings */}
                {activeBookings.length > 0 && (
                  <div>
                    <h3 className="text-lg font-medium text-[#012b2b] mb-4">Active Service Bookings</h3>
                    <div className="grid gap-6 lg:grid-cols-2">
                      {activeBookings.map(booking => (
                        <BookingCard key={booking.id} booking={booking} isActive={true} />
                      ))}
                    </div>
                  </div>
                )}

                {activeBookings.length === 0 && activeMemberships.length === 0 && (
                  <Card className="text-center py-8">
                    <CardContent>
                      <div className="text-4xl mb-4">🌟</div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">No active items</h3>
                      <p className="text-gray-600">Your active bookings and memberships will appear here.</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>
          </Tabs>
        )}

        {/* Quick Stats */}
        {allBookings.length > 0 && (
          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-2xl font-bold text-[#012b2b]">
                  {bookingStats.totalBookings}
                </div>
                <div className="text-sm text-[#517d64]">Total Bookings</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-2xl font-bold text-green-600">
                  {activeBookings.length}
                </div>
                <div className="text-sm text-[#517d64]">Active</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-2xl font-bold text-gray-600">
                  {cancelledBookings.length}
                </div>
                <div className="text-sm text-[#517d64]">Cancelled</div>
              </CardContent>
            </Card>
            {/* <Card>
              <CardContent className="p-6 text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {bookingStats.expiredCount}
                </div>
                <div className="text-sm text-[#517d64]">Just Expired</div>
              </CardContent>
            </Card> */}
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-2xl font-bold text-[#012b2b]">
                  ₹{allBookings.reduce((sum, b) => sum + Number(b.total_amount), 0).toFixed(2)}
                </div>
                <div className="text-sm text-[#517d64]">Total Spent</div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
