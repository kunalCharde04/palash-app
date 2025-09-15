"use client"

import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { useAuth } from '../hooks/useAuth';

export default function PrivacyPolicy() {
  const { user, loading } = useAuth();
  
  return (
    <>
      <Navbar user={user} isLoading={loading} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Hero Section */}
        <div className="relative h-64 rounded-xl overflow-hidden mb-16 mt-20">
          <div className="absolute inset-0 bg-gradient-to-r from-[#012b2b]/70 to-[#517d64]/70 flex items-center">
            <div className="container mx-auto px-6">
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                Privacy Policy
              </h1>
              <p className="text-xl text-white max-w-2xl">
                Your privacy is important to us - Learn how we protect and use your information.
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto space-y-8">
          <section className="bg-white p-8 rounded-xl shadow-sm">
            <h2 className="text-2xl font-semibold mb-4 text-[#012b2b]">
              Last Updated: 10 Sep 2025
            </h2>
            <p className="text-gray-700">
              At Amrutwel Ayurveda, we respect your privacy and are committed to protecting your personal information.
            </p>
          </section>

          <section className="bg-white p-8 rounded-xl shadow-sm">
            <h2 className="text-2xl font-semibold mb-4 text-[#012b2b]">
              Information We Collect
            </h2>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li><strong>Personal details:</strong> name, email, phone number, address</li>
              <li><strong>Health-related information</strong> (only if voluntarily provided for consultation/treatment)</li>
              <li><strong>Payment and transaction details</strong></li>
              <li><strong>Browsing data</strong> (cookies, device info, IP address)</li>
            </ul>
          </section>

          <section className="bg-white p-8 rounded-xl shadow-sm">
            <h2 className="text-2xl font-semibold mb-4 text-[#012b2b]">
              How We Use Your Data
            </h2>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>To process your orders and bookings</li>
              <li>To provide consultations and treatments</li>
              <li>To personalize your experience</li>
              <li>For marketing & promotional communication (with your consent)</li>
              <li>For legal and security purposes</li>
            </ul>
          </section>

          <section className="bg-white p-8 rounded-xl shadow-sm">
            <h2 className="text-2xl font-semibold mb-4 text-[#012b2b]">
              Sharing of Data
            </h2>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>With trusted service providers (payment gateways, delivery partners, IT support)</li>
              <li>When required by law</li>
            </ul>
          </section>

          <section className="bg-white p-8 rounded-xl shadow-sm">
            <h2 className="text-2xl font-semibold mb-4 text-[#012b2b]">
              Data Security
            </h2>
            <p className="text-gray-700">
              We use encryption, secure servers, and limited access protocols to safeguard your data.
            </p>
          </section>

          <section className="bg-white p-8 rounded-xl shadow-sm">
            <h2 className="text-2xl font-semibold mb-4 text-[#012b2b]">
              Your Rights
            </h2>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>Access, correct, or delete your data</li>
              <li>Opt out of marketing emails/SMS at any time</li>
            </ul>
          </section>

          <section className="bg-white p-8 rounded-xl shadow-sm">
            <h2 className="text-2xl font-semibold mb-4 text-[#012b2b]">
              Contact
            </h2>
            <div className="text-gray-700 space-y-2">
              <p>For privacy concerns, email: <a href="mailto:support@amrutwelayurveda.com" className="text-[#012b2b] hover:underline">support@amrutwelayurveda.com</a></p>
            </div>
          </section>

          <div className="mt-12 pt-8 border-t border-gray-200">
            <p className="text-sm text-gray-500 text-center">
              Last updated: 10 Sep 2025
            </p>
            <p className="text-sm text-gray-500 text-center mt-2">
              &ldquo;Come in the side of Ayurveda, come close to healthy life.&rdquo; - Dr. Komal Kashikar
            </p>
          </div>
        </div>
      </main>
      <div className='w-full mb-12'>
        <Footer />
      </div>
    </>
  )
}
