"use client"

import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card/Card';
import { Badge } from '../components/badge/badge';
import { CheckCircle, Crown, ArrowRight, X, User, Mail, Phone, MessageSquare } from 'lucide-react';
import { LoadingScreen } from '../components/ui/loader/loading';
import Navbar from '../components/layout/Navbar';
import { Button } from '../components/ui/Button';
import { useRouter } from 'next/navigation';
import { submitMembershipInterest } from '../api/memberships';
import { useToast } from '../components/ui/toast/use-toast';
import { Toaster } from '../components/ui/toast/toaster';

interface AvailableMembershipPlan {
  id: string;
  name: string;
  cost: number;
  duration: number;
  members: number;
  renewalPeriod: number;
  benefits: {
    clubActivities: number;
    dining: number;
    accommodations: number;
    spa: number;
    medicalWellness: number;
    referenceBenefits: number;
    priorityBenefits: boolean;
    exploringHobbies: boolean;
    guestDiscount: number;
    freeYogaGuidance: boolean;
    freeDietChart: string;
    freeDoctorConsultation: boolean;
    panchkarmaWorth: number;
  };
}

const AVAILABLE_MEMBERSHIP_PLANS: AvailableMembershipPlan[] = [
  {
    id: 'silver',
    name: 'Silver',
    cost: 198000,
    duration: 25,
    members: 4,
    renewalPeriod: 5,
    benefits: {
      clubActivities: 25,
      dining: 25,
      accommodations: 25,
      spa: 25,
      medicalWellness: 10,
      referenceBenefits: 5,
      priorityBenefits: true,
      exploringHobbies: true,
      guestDiscount: 0,
      freeYogaGuidance: true,
      freeDietChart: 'No',
      freeDoctorConsultation: true,
      panchkarmaWorth: 0
    }
  },
  {
    id: 'gold',
    name: 'Gold',
    cost: 298000,
    duration: 25,
    members: 4,
    renewalPeriod: 7,
    benefits: {
      clubActivities: 25,
      dining: 25,
      accommodations: 25,
      spa: 25,
      medicalWellness: 15,
      referenceBenefits: 5,
      priorityBenefits: true,
      exploringHobbies: true,
      guestDiscount: 10,
      freeYogaGuidance: true,
      freeDietChart: 'For 2 people',
      freeDoctorConsultation: true,
      panchkarmaWorth: 150000
    }
  },
  {
    id: 'platinum',
    name: 'Platinum',
    cost: 395000,
    duration: 25,
    members: 6,
    renewalPeriod: 7,
    benefits: {
      clubActivities: 25,
      dining: 25,
      accommodations: 25,
      spa: 25,
      medicalWellness: 15,
      referenceBenefits: 5,
      priorityBenefits: true,
      exploringHobbies: true,
      guestDiscount: 10,
      freeYogaGuidance: true,
      freeDietChart: 'For 6 people',
      freeDoctorConsultation: true,
      panchkarmaWorth: 250000
    }
  }
];

interface AvailablePlanCardProps {
  plan: AvailableMembershipPlan;
  onSelectPlan: (plan: AvailableMembershipPlan) => void;
}

interface InterestFormModalProps {
  isOpen: boolean;
  plan: AvailableMembershipPlan | null;
  onClose: () => void;
  onSubmit: (formData: any) => void;
  isLoading: boolean;
}

const InterestFormModal: React.FC<InterestFormModalProps> = ({
  isOpen,
  plan,
  onClose,
  onSubmit,
  isLoading
}) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  if (!isOpen || !plan) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b p-6 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">
              Request {plan.name} Membership
            </h3>
            <p className="text-sm text-gray-600 mt-1">₹{plan.cost.toLocaleString()}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Full Name <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#012b2b] focus:border-transparent"
                placeholder="Enter your full name"
              />
            </div>
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email Address <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#012b2b] focus:border-transparent"
                placeholder="your.email@example.com"
              />
            </div>
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#012b2b] focus:border-transparent"
                placeholder="+91 XXXXX XXXXX"
              />
            </div>
          </div>

          <div>
            <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
              Message (Optional)
            </label>
            <div className="relative">
              <MessageSquare className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                rows={3}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#012b2b] focus:border-transparent resize-none"
                placeholder="Any questions or special requirements..."
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-[#012b2b] text-white hover:bg-[#012b2b]/90"
            >
              {isLoading ? 'Submitting...' : 'Submit Request'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

const AvailablePlanCard: React.FC<AvailablePlanCardProps> = ({ plan, onSelectPlan }) => {
  const getBadgeColor = (planName: string) => {
    switch (planName.toLowerCase()) {
      case 'silver':
        return 'bg-gray-400 text-white';
      case 'gold':
        return 'bg-yellow-500 text-white';
      case 'platinum':
        return 'bg-purple-600 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  return (
    <Card className="overflow-hidden hover:shadow-2xl transition-all duration-300 border-2">
      <CardHeader className={`${getBadgeColor(plan.name)} text-white`}>
        <div className="text-center">
          <Badge className="mb-2 bg-white/20 text-white border-white/30">
            MEMBERSHIP {plan.name.toUpperCase()}
          </Badge>
          <CardTitle className="text-2xl font-bold mb-2">{plan.name} Membership</CardTitle>
          <div className="text-3xl font-bold mb-1">₹{plan.cost.toLocaleString()}</div>
          <div className="text-sm opacity-90">{plan.duration} Years Plan</div>
        </div>
      </CardHeader>

      <CardContent className="p-6 space-y-4">
        <div className="bg-gray-50 rounded-lg p-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Number of Members:</span>
            <span className="font-semibold text-gray-900">{plan.members}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Renewal Period:</span>
            <span className="font-semibold text-gray-900">{plan.renewalPeriod} years</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Duration:</span>
            <span className="font-semibold text-gray-900">{plan.duration} years</span>
          </div>
        </div>

        <div className="space-y-3">
          <div className="font-semibold text-gray-900 text-sm">Discounts & Benefits:</div>
          <div className="grid grid-cols-1 gap-2">
            <div className="flex items-center justify-between text-sm bg-green-50 p-2 rounded">
              <span className="text-gray-700">Club Activities</span>
              <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300">
                {plan.benefits.clubActivities}% OFF
              </Badge>
            </div>
            <div className="flex items-center justify-between text-sm bg-green-50 p-2 rounded">
              <span className="text-gray-700">Dining</span>
              <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300">
                {plan.benefits.dining}% OFF
              </Badge>
            </div>
            <div className="flex items-center justify-between text-sm bg-green-50 p-2 rounded">
              <span className="text-gray-700">Accommodations</span>
              <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300">
                {plan.benefits.accommodations}% OFF
              </Badge>
            </div>
            <div className="flex items-center justify-between text-sm bg-green-50 p-2 rounded">
              <span className="text-gray-700">Spa Activities</span>
              <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300">
                {plan.benefits.spa}% OFF
              </Badge>
            </div>
            <div className="flex items-center justify-between text-sm bg-green-50 p-2 rounded">
              <span className="text-gray-700">Medical Wellness</span>
              <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300">
                {plan.benefits.medicalWellness}% OFF
              </Badge>
            </div>
          </div>
        </div>

        <div className="space-y-2 pt-2 border-t">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-700">Reference Benefits</span>
            <span className="font-medium text-gray-900">{plan.benefits.referenceBenefits}%</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-700">Priority Benefits</span>
            <span className="font-medium text-green-600">
              {plan.benefits.priorityBenefits ? 'Yes' : 'No'}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-700">Exploring Hobbies</span>
            <span className="font-medium text-green-600">
              {plan.benefits.exploringHobbies ? 'Yes' : 'No'}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-700">Guest Discount</span>
            <span className="font-medium text-gray-900">
              {plan.benefits.guestDiscount > 0 ? `${plan.benefits.guestDiscount}%` : 'No'}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-700">Free Yoga Guidance</span>
            <span className="font-medium text-green-600">
              {plan.benefits.freeYogaGuidance ? 'Yes' : 'No'}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-700">Free Diet Chart</span>
            <span className="font-medium text-gray-900">{plan.benefits.freeDietChart}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-700">Free Doctor Consultation</span>
            <span className="font-medium text-green-600">
              {plan.benefits.freeDoctorConsultation ? 'Yes' : 'No'}
            </span>
          </div>
          {plan.benefits.panchkarmaWorth > 0 && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-700">Panchkarma Benefits</span>
              <span className="font-medium text-purple-600">
                ₹{plan.benefits.panchkarmaWorth.toLocaleString()} Worth
              </span>
            </div>
          )}
        </div>

        <Button 
          className="w-full mt-4"
          variant="outline"
          onClick={() => onSelectPlan(plan)}
        >
          Select {plan.name} Plan
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </CardContent>
    </Card>
  );
};

export default function BuyMembershipPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<AvailableMembershipPlan | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSelectPlan = (plan: AvailableMembershipPlan) => {
    setSelectedPlan(plan);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedPlan(null);
  };

  const handleSubmitInterest = async (formData: any) => {
    if (!selectedPlan) return;

    try {
      setIsSubmitting(true);
      await submitMembershipInterest({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        planName: selectedPlan.name,
        planCost: selectedPlan.cost,
        message: formData.message
      });

      toast({
        title: "Request Submitted Successfully!",
        description: "Our team will contact you soon to discuss your membership.",
        variant: "default"
      });

      handleCloseModal();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to submit request. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading) {
    return <LoadingScreen text="Loading membership plans..." fullScreen={true} size="md" color="primary" />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster />
      <InterestFormModal
        isOpen={isModalOpen}
        plan={selectedPlan}
        onClose={handleCloseModal}
        onSubmit={handleSubmitInterest}
        isLoading={isSubmitting}
      />
      <Navbar user={user} isLoading={authLoading} />

      <div className="container mx-auto px-4 py-8 pt-32 max-w-7xl">
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Crown className="w-10 h-10 text-[#012b2b]" />
          </div>
          <h1 className="text-4xl font-bold text-[#012b2b] mb-3">Buy Membership Plan</h1>
          <p className="text-[#517d64] text-lg max-w-2xl mx-auto">
            Choose the perfect membership plan for you and your family. Unlock exclusive benefits, discounts, and wellness services.
          </p>
        </div>

        {/* Benefits Overview */}
        <div className="mb-12 bg-gradient-to-r from-[#012b2b]/5 to-[#517d64]/5 rounded-2xl p-8">
          <h2 className="text-2xl font-semibold text-[#012b2b] mb-6 text-center">Why Choose Our Membership?</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Exclusive Discounts</h3>
                <p className="text-sm text-gray-600">Save up to 25% on all wellness services, dining, and accommodations</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Family Coverage</h3>
                <p className="text-sm text-gray-600">Include up to 4-6 family members depending on your plan</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Premium Services</h3>
                <p className="text-sm text-gray-600">Free yoga guidance, diet charts, doctor consultations, and more</p>
              </div>
            </div>
          </div>
        </div>

        {/* Membership Plans */}
        <div className="grid gap-8 lg:grid-cols-3 mb-12">
          {AVAILABLE_MEMBERSHIP_PLANS.map((plan) => (
            <AvailablePlanCard key={plan.id} plan={plan} onSelectPlan={handleSelectPlan} />
          ))}
        </div>

        {/* FAQ Section */}
        <div className="bg-white rounded-xl p-8 shadow-sm">
          <h2 className="text-2xl font-semibold text-[#012b2b] mb-6">Frequently Asked Questions</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">How long is the membership valid?</h3>
              <p className="text-gray-600">All our membership plans are valid for 25 years with renewal periods of 5-7 years depending on the plan.</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Can I add family members to my membership?</h3>
              <p className="text-gray-600">Yes! Silver and Gold plans include up to 4 members, while Platinum includes up to 6 members.</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">What payment methods do you accept?</h3>
              <p className="text-gray-600">We accept all major credit cards, debit cards, UPI, and net banking.</p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-12 text-center">
          <p className="text-gray-600 mb-4">Need help choosing the right plan?</p>
          <Button
            onClick={() => router.push('/support')}
            variant="outline"
            className="text-[#012b2b] hover:bg-[#012b2b] hover:text-white"
          >
            Contact Support
          </Button>
        </div>
      </div>
    </div>
  );
}
