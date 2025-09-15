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
            <h2 className="text-2xl font-semibold mb-6 text-[#012b2b]">
              Products
            </h2>
            <div className="space-y-4">
              <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
                <h3 className="font-semibold text-gray-800 mb-2">Eligible for Refund/Exchange:</h3>
                <ul className="list-disc pl-6 space-y-1 text-gray-700">
                  <li>Product is damaged</li>
                  <li>Product is expired</li>
                  <li>Wrong item delivered</li>
                </ul>
              </div>
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg">
                <p className="text-gray-700">
                  <strong>Important:</strong> Must raise a request within 7 days of delivery.
                </p>
              </div>
            </div>
          </section>

          <section className="bg-white p-8 rounded-xl shadow-sm">
            <h2 className="text-2xl font-semibold mb-6 text-[#012b2b]">
              Consultations/Treatments
            </h2>
            <div className="space-y-4">
              <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded-r-lg">
                <p className="text-gray-700">
                  <strong>Refund Policy:</strong> Refund as per cancellation rules above.
                </p>
              </div>
              <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-r-lg">
                <p className="text-gray-700">
                  <strong>No Refund:</strong> No refund once service is availed.
                </p>
              </div>
            </div>
          </section>

          <section className="bg-white p-8 rounded-xl shadow-sm">
            <h2 className="text-2xl font-semibold mb-6 text-[#012b2b]">
              Refund Processing
            </h2>
            <div className="bg-gray-50 p-6 rounded-lg">
              <p className="text-gray-700 text-lg">
                <strong>Processing Time:</strong> Refunds will be processed within 7–10 business days to the original payment method.
              </p>
            </div>
          </section>

          <section className="bg-white p-8 rounded-xl shadow-sm">
            <h2 className="text-2xl font-semibold mb-4 text-[#012b2b]">
              How to Request a Refund
            </h2>
            <div className="space-y-3 text-gray-700">
              <div className="flex items-start space-x-3">
                <span className="flex-shrink-0 w-6 h-6 bg-[#012b2b] text-white rounded-full flex items-center justify-center text-sm font-semibold">1</span>
                <p>Contact our support team with your order details</p>
              </div>
              <div className="flex items-start space-x-3">
                <span className="flex-shrink-0 w-6 h-6 bg-[#012b2b] text-white rounded-full flex items-center justify-center text-sm font-semibold">2</span>
                <p>Provide reason for refund (damage, expiry, wrong item)</p>
              </div>
              <div className="flex items-start space-x-3">
                <span className="flex-shrink-0 w-6 h-6 bg-[#012b2b] text-white rounded-full flex items-center justify-center text-sm font-semibold">3</span>
                <p>Submit required documentation (photos, order number)</p>
              </div>
              <div className="flex items-start space-x-3">
                <span className="flex-shrink-0 w-6 h-6 bg-[#012b2b] text-white rounded-full flex items-center justify-center text-sm font-semibold">4</span>
                <p>Wait for approval and processing (7-10 business days)</p>
              </div>
            </div>
          </section>

          <section className="bg-white p-8 rounded-xl shadow-sm">
            <h2 className="text-2xl font-semibold mb-4 text-[#012b2b]">
              Important Notes
            </h2>
            <div className="space-y-3 text-gray-700">
              <p>• All refund requests are subject to verification and approval</p>
              <p>• Original packaging and receipt may be required for product refunds</p>
              <p>• Refunds are processed to the original payment method only</p>
              <p>• Partial refunds may apply based on the condition of returned items</p>
              <p>• For consultations and treatments, refer to our cancellation policy for specific timelines</p>
            </div>
          </section>

          <section className="bg-white p-8 rounded-xl shadow-sm">
            <h2 className="text-2xl font-semibold mb-4 text-[#012b2b]">
              Contact for Refund Requests
            </h2>
            <div className="text-gray-700 space-y-2">
              <p><strong>Phone:</strong> +91 9422115180</p>
              <p><strong>Email:</strong> <a href="mailto:thepalashclub@gmail.com" className="text-[#012b2b] hover:underline">thepalashclub@gmail.com</a></p>
              <p><strong>Support:</strong> <a href="mailto:support@amrutwelayurveda.com" className="text-[#012b2b] hover:underline">support@amrutwelayurveda.com</a></p>
            </div>
          </section>

          <div className="mt-12 pt-8 border-t border-gray-200">
            <p className="text-sm text-gray-500 text-center">
              Last updated: {new Date().toLocaleDateString()}
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
