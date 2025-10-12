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
              Effective Date: October 12, 2025
            </h2>
            <p className="text-gray-700">
              At Palash Club, we respect your privacy and are committed to protecting your personal information. This Privacy Policy explains how we collect, use, and protect your information when you visit our website or use our services.
            </p>
          </section>

          <section className="bg-white p-8 rounded-xl shadow-sm">
            <h2 className="text-2xl font-semibold mb-4 text-[#012b2b]">
              1. Information We Collect
            </h2>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>Personal details (name, contact number, email address)</li>
              <li>Health-related information (only if voluntarily provided for therapy purposes)</li>
              <li>Usage data (IP address, browser type, device information, pages visited)</li>
            </ul>
          </section>

          <section className="bg-white p-8 rounded-xl shadow-sm">
            <h2 className="text-2xl font-semibold mb-4 text-[#012b2b]">
              2. How We Use Your Information
            </h2>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>To provide and manage our wellness services (appointments, consultations)</li>
              <li>To improve our website and service offerings</li>
              <li>To communicate important updates, offers, or service-related information</li>
              <li>To respond to inquiries or support requests</li>
            </ul>
          </section>

          <section className="bg-white p-8 rounded-xl shadow-sm">
            <h2 className="text-2xl font-semibold mb-4 text-[#012b2b]">
              3. Data Sharing
            </h2>
            <p className="text-gray-700">
              We do not sell your personal data to third parties. We may share your data with trusted service providers strictly for business operations (e.g., payment processors, technical support).
            </p>
          </section>

          <section className="bg-white p-8 rounded-xl shadow-sm">
            <h2 className="text-2xl font-semibold mb-4 text-[#012b2b]">
              4. Data Security
            </h2>
            <p className="text-gray-700">
              We implement industry-standard security measures to protect your personal data from unauthorized access, alteration, or disclosure.
            </p>
          </section>

          <section className="bg-white p-8 rounded-xl shadow-sm">
            <h2 className="text-2xl font-semibold mb-4 text-[#012b2b]">
              5. Your Rights
            </h2>
            <p className="text-gray-700 mb-4">
              You can request access, correction, or deletion of your personal data at any time by contacting us at:
            </p>
            <div className="text-gray-700 space-y-2">
              <p>📧 <a href="mailto:thepalashclub@gmail.com" className="text-[#012b2b] hover:underline">thepalashclub@gmail.com</a></p>
              <p>📞 +91 9422115180</p>
              <p>📍 Khasra No. 107, Village Sawangi (Amgaon Deoli), Taluka Hingna, District Nagpur</p>
            </div>
          </section>

          <div className="mt-12 pt-8 border-t border-gray-200">
            <p className="text-sm text-gray-500 text-center">
              Last updated: October 12, 2025
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
