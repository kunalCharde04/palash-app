"use client"

import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { useAuth } from '../hooks/useAuth';

export default function TermsAndConditions() {
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
                Terms and Conditions
              </h1>
              <p className="text-xl text-white max-w-2xl">
                Journey to Wellness - Please read these terms carefully before using our services.
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
              By using Palash Club&apos;s services, you agree to the following terms and conditions:
            </p>
          </section>

          <section className="bg-white p-8 rounded-xl shadow-sm">
            <h2 className="text-2xl font-semibold mb-4 text-[#012b2b]">
              1. Service Overview
            </h2>
            <p className="text-gray-700">
              Palash Club offers Ayurvedic and holistic health therapies such as Shirodhara, Potli Massage, Leech Therapy, and more.
            </p>
          </section>

          <section className="bg-white p-8 rounded-xl shadow-sm">
            <h2 className="text-2xl font-semibold mb-4 text-[#012b2b]">
              2. Appointments and Booking
            </h2>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>All appointments must be booked in advance</li>
              <li>Please provide accurate personal and health information for safe therapy delivery</li>
            </ul>
          </section>

          <section className="bg-white p-8 rounded-xl shadow-sm">
            <h2 className="text-2xl font-semibold mb-4 text-[#012b2b]">
              3. User Responsibility
            </h2>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>Clients must disclose any medical conditions prior to therapy</li>
              <li>Clients should arrive on time and follow therapist instructions</li>
            </ul>
          </section>

          <section className="bg-white p-8 rounded-xl shadow-sm">
            <h2 className="text-2xl font-semibold mb-4 text-[#012b2b]">
              4. Limitation of Liability
            </h2>
            <p className="text-gray-700">
              Palash Club is not liable for any adverse effects caused by undisclosed health issues or failure to follow therapy instructions.
            </p>
          </section>

          <section className="bg-white p-8 rounded-xl shadow-sm">
            <h2 className="text-2xl font-semibold mb-4 text-[#012b2b]">
              5. Modifications
            </h2>
            <p className="text-gray-700">
              We reserve the right to update these terms at any time. Continued use of our services implies your acceptance of any changes.
            </p>
          </section>

          <section className="bg-white p-8 rounded-xl shadow-sm">
            <h2 className="text-2xl font-semibold mb-4 text-[#012b2b]">
              Contact Information
            </h2>
            <div className="text-gray-700 space-y-2">
              <p>For any inquiries, contact us at:</p>
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