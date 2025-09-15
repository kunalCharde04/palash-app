"use client"

import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { useAuth } from '../hooks/useAuth';

export default function CancellationPolicy() {
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
                Cancellation Policy
              </h1>
              <p className="text-xl text-white max-w-2xl">
                Understanding our cancellation terms for consultations, treatments, and products.
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto space-y-8">
          <section className="bg-white p-8 rounded-xl shadow-sm">
            <h2 className="text-2xl font-semibold mb-6 text-[#012b2b]">
              Consultations
            </h2>
            <div className="space-y-4">
              <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded-r-lg">
                <p className="text-gray-700">
                  <strong>Full Refund:</strong> Can be cancelled before 48 hours before appointment for a full refund.
                </p>
              </div>
              <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-r-lg">
                <p className="text-gray-700">
                  <strong>Non-Refundable:</strong> Cancellations within 24-48 hours are non-refundable.
                </p>
              </div>
            </div>
          </section>

          <section className="bg-white p-8 rounded-xl shadow-sm">
            <h2 className="text-2xl font-semibold mb-6 text-[#012b2b]">
              Treatments/Retreats
            </h2>
            <div className="space-y-4">
              <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded-r-lg">
                <p className="text-gray-700">
                  <strong>Full Refund:</strong> Cancel before 15 days in advance for a refund.
                </p>
              </div>
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg">
                <p className="text-gray-700">
                  <strong>50% Charges:</strong> Cancellations within 15-7 days will attract 50% charges.
                </p>
              </div>
              <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-r-lg">
                <p className="text-gray-700">
                  <strong>Non-Refundable:</strong> Cancellations within 7 days will not be refundable.
                </p>
              </div>
            </div>
          </section>

          <section className="bg-white p-8 rounded-xl shadow-sm">
            <h2 className="text-2xl font-semibold mb-6 text-[#012b2b]">
              Products
            </h2>
            <div className="space-y-4">
              <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded-r-lg">
                <p className="text-gray-700">
                  <strong>12-Hour Window:</strong> Orders can be cancelled within 12 hours of placing if not yet shipped.
                </p>
              </div>
            </div>
          </section>

          <section className="bg-white p-8 rounded-xl shadow-sm">
            <h2 className="text-2xl font-semibold mb-4 text-[#012b2b]">
              Important Notes
            </h2>
            <div className="space-y-3 text-gray-700">
              <p>• All cancellation requests must be made through our official channels</p>
              <p>• Refunds will be processed within 5-7 business days</p>
              <p>• For emergency cancellations, please contact us directly</p>
              <p>• Special circumstances may be considered on a case-by-case basis</p>
            </div>
          </section>

          <section className="bg-white p-8 rounded-xl shadow-sm">
            <h2 className="text-2xl font-semibold mb-4 text-[#012b2b]">
              Contact for Cancellations
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
