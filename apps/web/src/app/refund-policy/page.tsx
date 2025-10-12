"use client"

import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { useAuth } from '../hooks/useAuth';

export default function RefundPolicy() {
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
                Refund Policy
              </h1>
              <p className="text-xl text-white max-w-2xl">
                Understanding our refund terms for products, consultations, and treatments.
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto space-y-8">
          <section className="bg-white p-8 rounded-xl shadow-sm">
            <h2 className="text-2xl font-semibold mb-4 text-[#012b2b]">
              Effective Date: October 12, 2025
            </h2>
          </section>

          <section className="bg-white p-8 rounded-xl shadow-sm">
            <h2 className="text-2xl font-semibold mb-6 text-[#012b2b]">
              Refund Policy
            </h2>
            <div className="space-y-4 text-gray-700">
              <p>Refunds are applicable only if services are canceled according to our Cancellation Policy.</p>
              <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
                <p>
                  <strong>Submission Timeline:</strong> Refund requests must be submitted in writing to <a href="mailto:thepalashclub@gmail.com" className="text-[#012b2b] hover:underline">thepalashclub@gmail.com</a> within 7 days of service cancellation.
                </p>
              </div>
              <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded-r-lg">
                <p>
                  <strong>Processing Time:</strong> Refunds (if approved) will be processed within 10 business days to the original payment method.
                </p>
              </div>
              <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-r-lg">
                <p>
                  <strong>Important:</strong> Palash Club reserves the right to reject refund requests if terms are violated or the service was delivered as agreed.
                </p>
              </div>
            </div>
          </section>

          <section className="bg-white p-8 rounded-xl shadow-sm">
            <h2 className="text-2xl font-semibold mb-4 text-[#012b2b]">
              Contact for Refund Requests
            </h2>
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
