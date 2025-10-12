"use client"

import { useState } from 'react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { useAuth } from '../hooks/useAuth';

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

const faqData: FAQItem[] = [
  // General Questions
  {
    category: "General",
    question: "What is The Palash Club?",
    answer: "The Palash Club is a holistic wellness center that combines ancient Ayurvedic wisdom with modern amenities. We offer a perfect blend of five parallel medicine systems - Ayurveda, Naturopathy, Acupressure, Reiki, and Sound Therapy - under the five Tatva (elements): water, earth, air, space, and fire. Our mission is to help you achieve a healthy, stress-free life through preventive healthcare and natural healing."
  },
  {
    category: "General",
    question: "Where is The Palash Club located?",
    answer: "The Palash Club is located at Khasra No. 107, Village Sawangi (Amgaon Deoli), Taluka Hingna, District Nagpur. You can contact us at +91 9422115180 or email thepalashclub@gmail.com for directions and more information."
  },
  {
    category: "General",
    question: "What are your operating hours?",
    answer: "Our wellness center is open daily from 6:00 AM to 9:00 PM. However, specific services and therapies may have different schedules. We recommend booking in advance to ensure availability of your preferred time slot."
  },
  {
    category: "General",
    question: "Can I visit The Palash Club with my family?",
    answer: "Absolutely! The Palash Club is designed as a family-centered wellness destination. We offer activities and treatments that can be enjoyed individually or with family and friends. We believe in bringing families together for healing and rejuvenation."
  },

  // Membership Questions
  {
    category: "Membership",
    question: "What types of memberships do you offer?",
    answer: "We offer various membership plans tailored to different needs - including individual memberships, family packages, and corporate wellness programs. Each membership provides access to our facilities, services, and wellness activities. Visit our Pricing page for detailed information about membership tiers and benefits."
  },
  {
    category: "Membership",
    question: "How do I purchase a membership?",
    answer: "You can purchase a membership online through our website by visiting the Pricing page and selecting your preferred plan. Alternatively, you can visit our center in person or call us at +91 9422115180 for assistance with membership registration."
  },
  {
    category: "Membership",
    question: "What is included in the membership?",
    answer: "Membership benefits vary by plan but typically include access to our wellness facilities, complimentary sessions of select therapies, discounts on additional services, priority booking, access to special events and workshops, and personalized wellness consultations. Check your specific membership tier for detailed benefits."
  },
  {
    category: "Membership",
    question: "Can I upgrade or downgrade my membership?",
    answer: "Yes, you can upgrade your membership at any time by paying the difference. For downgrades, please contact our support team at thepalashclub@gmail.com, and changes will be applied from your next billing cycle."
  },
  {
    category: "Membership",
    question: "What is the membership validity period?",
    answer: "Most memberships are valid for one year from the date of purchase. Some special plans may have different validity periods. You can check your membership details in your account dashboard or contact our support team."
  },

  // Services & Treatments
  {
    category: "Services",
    question: "What wellness services do you offer?",
    answer: "We offer a comprehensive range of wellness services including Ayurvedic treatments (Panchakarma, herbal therapies), Naturopathy, Yoga and Meditation, Acupressure, Reiki healing, Sound Therapy, Hydrotherapy, Spa treatments, and Organic wellness cuisine. Each service is designed to balance your energy and promote holistic health."
  },
  {
    category: "Services",
    question: "Do I need to book services in advance?",
    answer: "Yes, we highly recommend booking your services in advance to ensure availability, especially for specialized therapies and consultations. You can book online through your member dashboard, call us at +91 9422115180, or visit our center."
  },
  {
    category: "Services",
    question: "Are your treatments suitable for beginners?",
    answer: "Absolutely! Our experienced practitioners customize treatments based on your individual needs, health conditions, and experience level. Whether you're new to Ayurveda or a wellness enthusiast, we'll guide you through every step of your healing journey."
  },
  {
    category: "Services",
    question: "What should I bring for my first visit?",
    answer: "For your first visit, please bring comfortable clothing suitable for yoga or spa treatments, any relevant medical records if you're seeking therapeutic treatments, and an open mind ready to embrace holistic wellness. We provide towels, robes, and basic amenities."
  },
  {
    category: "Services",
    question: "Do you offer consultations with Ayurvedic doctors?",
    answer: "Yes, we have experienced Ayurvedic practitioners and wellness consultants available for personalized consultations. Our director, Dr. Komal Kashikar, leads our team of experts who can assess your constitution (Prakriti), recommend customized treatment plans, and guide your wellness journey."
  },

  // Bookings
  {
    category: "Bookings",
    question: "How do I book a service or treatment?",
    answer: "Members can book services through their online dashboard after logging in. Simply navigate to the Services section, select your desired treatment, choose a date and time slot, and confirm your booking. You'll receive a confirmation email and SMS with booking details."
  },
  {
    category: "Bookings",
    question: "Can I cancel or reschedule my booking?",
    answer: "Yes, you can cancel or reschedule bookings through your member dashboard or by contacting us. Please note that cancellations made less than 24 hours before the scheduled time may incur charges. Refer to our Cancellation Policy for complete details."
  },
  {
    category: "Bookings",
    question: "What is your cancellation policy?",
    answer: "Cancellations made 24 hours or more before the scheduled time are eligible for a full refund or rescheduling. Cancellations within 24 hours may incur a 50% charge. No-shows will be charged the full amount. Emergency situations are evaluated on a case-by-case basis."
  },
  {
    category: "Bookings",
    question: "Can I book services for multiple people?",
    answer: "Yes, you can book services for family members or friends. When booking, you'll have the option to add multiple participants. Group packages and family sessions are also available at special rates."
  },

  // Payments
  {
    category: "Payments",
    question: "What payment methods do you accept?",
    answer: "We accept various payment methods including credit/debit cards, UPI, net banking, and digital wallets through our secure payment gateway. All transactions are encrypted and secure. We also accept cash payments at our center."
  },
  {
    category: "Payments",
    question: "Is my payment information secure?",
    answer: "Yes, we use industry-standard encryption and secure payment gateways (Razorpay) to protect your financial information. We do not store your complete card details on our servers. All transactions are PCI DSS compliant."
  },
  {
    category: "Payments",
    question: "Will I receive an invoice for my purchases?",
    answer: "Yes, you'll receive a detailed invoice via email immediately after every transaction. You can also download invoices from your account dashboard under the 'My Bookings' or 'Payment History' section."
  },
  {
    category: "Payments",
    question: "Do you offer refunds?",
    answer: "Refunds are processed according to our Refund Policy. Generally, membership fees are non-refundable, but service bookings cancelled within the allowed timeframe are eligible for refunds. Refunds typically take 5-7 business days to reflect in your account."
  },

  // Health & Safety
  {
    category: "Health & Safety",
    question: "Are there any health restrictions for using your services?",
    answer: "Certain treatments may have restrictions based on health conditions, pregnancy, or recent surgeries. During your consultation or booking, please inform us about any medical conditions, allergies, or concerns. Our practitioners will recommend suitable treatments for your specific situation."
  },
  {
    category: "Health & Safety",
    question: "What safety measures do you follow?",
    answer: "We maintain strict hygiene and safety protocols including regular sanitization of facilities, sterilization of equipment, use of quality organic products, trained and certified practitioners, and adherence to traditional Ayurvedic and modern wellness standards."
  },
  {
    category: "Health & Safety",
    question: "Do you use organic and natural products?",
    answer: "Yes, we prioritize organic and natural products in all our treatments and food offerings. Our Ayurvedic medicines and herbal preparations are prepared using authentic traditional methods with quality-tested ingredients. We believe in the principle that Ayurveda has side benefits, not side effects."
  },

  // Facilities
  {
    category: "Facilities",
    question: "What facilities are available at The Palash Club?",
    answer: "Our facilities include treatment rooms for various therapies, yoga and meditation halls, hydrotherapy pools, steam and sauna rooms, organic wellness café, relaxation lounges, library with wellness resources, and outdoor spaces designed around the five elements for natural healing."
  },
  {
    category: "Facilities",
    question: "Do you have parking facilities?",
    answer: "Yes, we have ample parking space available for all our members and visitors free of charge."
  },
  {
    category: "Facilities",
    question: "Is the center accessible for people with disabilities?",
    answer: "Yes, we strive to make our facilities accessible to everyone. We have wheelchair-friendly pathways and accessible treatment rooms. Please contact us in advance if you have specific accessibility needs so we can make appropriate arrangements."
  },

  // Account & Technical
  {
    category: "Account",
    question: "How do I create an account?",
    answer: "Click on the 'Sign Up' button on our website, enter your mobile number to receive an OTP, verify the OTP, and complete your profile with basic information. Once registered, you can purchase memberships and book services."
  },
  {
    category: "Account",
    question: "I forgot my password. How do I reset it?",
    answer: "Our system uses OTP-based authentication, so you don't need to remember a password. Simply enter your registered mobile number during login, and you'll receive an OTP to access your account."
  },
  {
    category: "Account",
    question: "How do I update my profile information?",
    answer: "Log in to your account and navigate to the Profile or Settings section. You can update your personal information, contact details, and preferences. Make sure to save changes before logging out."
  },
  {
    category: "Account",
    question: "Can I have multiple RFID cards for my membership?",
    answer: "Membership cards are typically issued per individual. For family memberships, each member receives their own RFID card for facility access. Contact our support team if you need additional cards or replacements."
  }
];

export default function FAQPage() {
  const { user, loading } = useAuth();
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  const categories = ["All", ...Array.from(new Set(faqData.map(faq => faq.category)))];
  
  const filteredFAQs = selectedCategory === "All" 
    ? faqData 
    : faqData.filter(faq => faq.category === selectedCategory);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <>
      <Navbar user={user} isLoading={loading} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Hero Section */}
        <div className="relative h-64 rounded-xl overflow-hidden mb-16 mt-20">
          <div className="absolute inset-0 bg-gradient-to-r from-[#012b2b]/70 to-[#517d64]/70 flex items-center">
            <div className="container mx-auto px-6">
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                Frequently Asked Questions
              </h1>
              <p className="text-xl text-white max-w-2xl">
                Find answers to common questions about The Palash Club
              </p>
            </div>
          </div>
        </div>

        {/* Category Filter */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-3 justify-center">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-6 py-2 rounded-full font-medium transition-all duration-300 ${
                  selectedCategory === category
                    ? 'bg-[#012b2b] text-white shadow-lg'
                    : 'bg-white text-[#012b2b] hover:bg-gray-100 shadow'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* FAQ Items */}
        <div className="max-w-4xl mx-auto space-y-4">
          {filteredFAQs.map((faq, index) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md"
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full px-6 py-5 text-left flex items-center justify-between group"
              >
                <div className="flex-1">
                  <span className="inline-block px-3 py-1 text-xs font-medium bg-[#517d64]/10 text-[#012b2b] rounded-full mb-2">
                    {faq.category}
                  </span>
                  <h3 className="text-lg font-semibold text-gray-900 group-hover:text-[#012b2b] transition-colors">
                    {faq.question}
                  </h3>
                </div>
                <div className="ml-4 flex-shrink-0">
                  <svg
                    className={`w-6 h-6 text-[#012b2b] transform transition-transform duration-300 ${
                      openIndex === index ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </button>
              
              <div
                className={`overflow-hidden transition-all duration-300 ${
                  openIndex === index ? 'max-h-96' : 'max-h-0'
                }`}
              >
                <div className="px-6 pb-5">
                  <p className="text-gray-700 leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Still Have Questions Section */}
        <div className="mt-16 bg-gradient-to-r from-[#012b2b] to-[#517d64] rounded-xl p-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Still Have Questions?
          </h2>
          <p className="text-xl text-white mb-6 max-w-2xl mx-auto">
            We're here to help! Contact our support team for personalized assistance.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <a
              href="tel:+919422115180"
              className="inline-flex items-center bg-white text-[#012b2b] px-6 py-3 rounded-full font-semibold hover:bg-gray-100 transition-colors"
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                />
              </svg>
              Call Us: +91 9422115180
            </a>
            <a
              href="mailto:thepalashclub@gmail.com"
              className="inline-flex items-center bg-white text-[#012b2b] px-6 py-3 rounded-full font-semibold hover:bg-gray-100 transition-colors"
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
              Email Us
            </a>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-500 text-center">
            Last updated: October 12, 2025
          </p>
          <p className="text-sm text-gray-500 text-center mt-2">
            &ldquo;Come in the side of Ayurveda, come close to healthy life.&rdquo; - Dr. Komal Kashikar
          </p>
        </div>
      </main>
      
      <div className='w-full mb-12'>
        <Footer />
      </div>
    </>
  );
}

