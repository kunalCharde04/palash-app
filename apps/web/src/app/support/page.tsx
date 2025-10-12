"use client"

import { useState } from 'react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { useAuth } from '../hooks/useAuth';
import { Phone, Mail, MapPin, Clock, MessageCircle, HelpCircle, FileText, Users } from 'lucide-react';
import { submitContactForm } from '../api/contact';

interface SupportChannel {
  icon: React.ElementType;
  title: string;
  description: string;
  action: string;
  href: string;
  color: string;
}

const supportChannels: SupportChannel[] = [
  {
    icon: Phone,
    title: "Call Us",
    description: "Speak directly with our support team",
    action: "+91 9422115180",
    href: "tel:+919422115180",
    color: "bg-blue-50 text-blue-600"
  },
  {
    icon: Mail,
    title: "Email Support",
    description: "Send us a detailed message",
    action: "thepalashclub@gmail.com",
    href: "mailto:thepalashclub@gmail.com",
    color: "bg-green-50 text-green-600"
  },
  {
    icon: MessageCircle,
    title: "WhatsApp",
    description: "Quick chat support on WhatsApp",
    action: "Message Us",
    href: "https://wa.me/919422115180",
    color: "bg-emerald-50 text-emerald-600"
  },
  {
    icon: MapPin,
    title: "Visit Us",
    description: "Come to our wellness center",
    action: "Get Directions",
    href: "#location",
    color: "bg-purple-50 text-purple-600"
  }
];

interface QuickLink {
  icon: React.ElementType;
  title: string;
  description: string;
  href: string;
}

const quickLinks: QuickLink[] = [
  {
    icon: HelpCircle,
    title: "FAQs",
    description: "Find quick answers to common questions",
    href: "/faq"
  },
  {
    icon: FileText,
    title: "Policies",
    description: "View our terms, privacy, and refund policies",
    href: "/privacy-policy"
  },
  {
    icon: Users,
    title: "About Us",
    description: "Learn more about The Palash Club",
    href: "/about"
  }
];

export default function SupportPage() {
  const { user, loading } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
    category: 'general'
  });
  const [formStatus, setFormStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormStatus('submitting');

    try {
      const response = await submitContactForm({
        name: formData.name,
        email: formData.email,
        phone: formData.phone || undefined,
        subject: formData.subject,
        message: formData.message,
        category: formData.category
      });

      if (response.success) {
        setFormStatus('success');
        setFormData({
          name: '',
          email: '',
          phone: '',
          subject: '',
          message: '',
          category: 'general'
        });
        
        // Reset status after 5 seconds
        setTimeout(() => {
          setFormStatus('idle');
        }, 5000);
      } else {
        setFormStatus('error');
        setTimeout(() => {
          setFormStatus('idle');
        }, 5000);
      }
    } catch (error: any) {
      console.error('Error submitting contact form:', error);
      setFormStatus('error');
      setTimeout(() => {
        setFormStatus('idle');
      }, 5000);
    }
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
                Support Center
              </h1>
              <p className="text-xl text-white max-w-2xl">
                We're here to help! Get in touch with us through your preferred channel.
              </p>
            </div>
          </div>
        </div>

        {/* Support Channels Grid */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            How Can We Help You?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {supportChannels.map((channel, index) => {
              const IconComponent = channel.icon;
              return (
                <a
                  key={index}
                  href={channel.href}
                  className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300 group"
                >
                  <div className={`w-12 h-12 rounded-lg ${channel.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <IconComponent className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {channel.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-3">
                    {channel.description}
                  </p>
                  <span className="text-[#012b2b] font-medium text-sm group-hover:underline">
                    {channel.action} →
                  </span>
                </a>
              );
            })}
          </div>
        </section>

        {/* Two Column Layout: Contact Form + Info */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Send Us a Message
              </h2>
              <p className="text-gray-600 mb-6">
                Fill out the form below and we'll get back to you within 24 hours.
              </p>

              {formStatus === 'success' && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-green-800 font-medium">
                    ✓ Your message has been sent successfully! We'll get back to you soon.
                  </p>
                </div>
              )}

              {formStatus === 'error' && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-800 font-medium">
                    ✗ Failed to send your message. Please try again or contact us directly.
                  </p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#012b2b] focus:border-transparent outline-none transition-all"
                      placeholder="Your name"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#012b2b] focus:border-transparent outline-none transition-all"
                      placeholder="your.email@example.com"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#012b2b] focus:border-transparent outline-none transition-all"
                      placeholder="+91 XXXXX XXXXX"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                      Category *
                    </label>
                    <select
                      id="category"
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#012b2b] focus:border-transparent outline-none transition-all bg-white"
                    >
                      <option value="general">General Inquiry</option>
                      <option value="membership">Membership</option>
                      <option value="booking">Booking Support</option>
                      <option value="technical">Technical Issue</option>
                      <option value="billing">Billing & Payments</option>
                      <option value="feedback">Feedback</option>
                      <option value="complaint">Complaint</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                    Subject *
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#012b2b] focus:border-transparent outline-none transition-all"
                    placeholder="Brief description of your inquiry"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                    Message *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    rows={6}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#012b2b] focus:border-transparent outline-none transition-all resize-none"
                    placeholder="Please provide details about your inquiry..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={formStatus === 'submitting'}
                  className="w-full bg-[#012b2b] text-white py-3 px-6 rounded-lg font-semibold hover:bg-[#517d64] transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {formStatus === 'submitting' ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            </div>
          </div>

          {/* Contact Information & Hours */}
          <div className="space-y-6">
            {/* Office Hours */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-amber-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 ml-3">
                  Support Hours
                </h3>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Monday - Friday</span>
                  <span className="font-medium text-gray-900">9:00 AM - 7:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Saturday</span>
                  <span className="font-medium text-gray-900">9:00 AM - 5:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Sunday</span>
                  <span className="font-medium text-gray-900">10:00 AM - 4:00 PM</span>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-xs text-gray-600">
                  Response time: Within 24 hours on business days
                </p>
              </div>
            </div>

            {/* Quick Links */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Quick Links
              </h3>
              <div className="space-y-3">
                {quickLinks.map((link, index) => {
                  const IconComponent = link.icon;
                  return (
                    <a
                      key={index}
                      href={link.href}
                      className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-[#517d64]/10 flex items-center justify-center flex-shrink-0 group-hover:bg-[#517d64]/20 transition-colors">
                        <IconComponent className="w-4 h-4 text-[#012b2b]" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 text-sm group-hover:text-[#012b2b] transition-colors">
                          {link.title}
                        </h4>
                        <p className="text-xs text-gray-600 mt-0.5">
                          {link.description}
                        </p>
                      </div>
                    </a>
                  );
                })}
              </div>
            </div>

            {/* Emergency Contact */}
            <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-xl shadow-sm p-6 border border-red-100">
              <h3 className="text-lg font-semibold text-red-900 mb-2">
                Emergency Support
              </h3>
              <p className="text-sm text-red-700 mb-3">
                For urgent matters related to ongoing treatments or medical emergencies:
              </p>
              <a
                href="tel:+919422115180"
                className="inline-flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 transition-colors"
              >
                <Phone className="w-4 h-4" />
                <span>Call Now</span>
              </a>
            </div>
          </div>
        </div>

        {/* Location Section */}
        <section id="location" className="mb-16 bg-white rounded-xl shadow-sm p-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Visit Our Center
              </h2>
              <p className="text-gray-600 mb-6">
                Experience our wellness sanctuary in person. Our team is ready to welcome you and guide you on your wellness journey.
              </p>
              
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <MapPin className="w-5 h-5 text-[#012b2b] mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Address</h4>
                    <p className="text-gray-600">
                      Khasra No. 107, Village Sawangi (Amgaon Deoli)<br />
                      Taluka Hingna, District Nagpur
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <Phone className="w-5 h-5 text-[#012b2b] mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Phone</h4>
                    <a href="tel:+919422115180" className="text-[#012b2b] hover:underline">
                      +91 9422115180
                    </a>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <Mail className="w-5 h-5 text-[#012b2b] mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Email</h4>
                    <a href="mailto:thepalashclub@gmail.com" className="text-[#012b2b] hover:underline">
                      thepalashclub@gmail.com
                    </a>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <a
                  href="https://maps.google.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center bg-[#012b2b] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#517d64] transition-colors"
                >
                  <MapPin className="w-5 h-5 mr-2" />
                  Get Directions
                </a>
              </div>
            </div>

            <div className="bg-gray-100 rounded-lg overflow-hidden h-[400px] flex items-center justify-center">
              {/* Placeholder for map - you can integrate Google Maps here */}
              <div className="text-center text-gray-500">
                <MapPin className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <p className="text-lg font-medium">Map Integration</p>
                <p className="text-sm">Google Maps can be embedded here</p>
              </div>
            </div>
          </div>
        </section>

        {/* Additional Support Resources */}
        <section className="bg-gradient-to-r from-[#012b2b] to-[#517d64] rounded-xl p-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Still Need Help?
          </h2>
          <p className="text-xl text-white mb-6 max-w-2xl mx-auto">
            Our dedicated support team is committed to ensuring you have the best experience at The Palash Club.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/faq"
              className="inline-flex items-center bg-white text-[#012b2b] px-6 py-3 rounded-full font-semibold hover:bg-gray-100 transition-colors"
            >
              <HelpCircle className="w-5 h-5 mr-2" />
              Browse FAQs
            </a>
            <a
              href="mailto:thepalashclub@gmail.com"
              className="inline-flex items-center bg-transparent border-2 border-white text-white px-6 py-3 rounded-full font-semibold hover:bg-white hover:text-[#012b2b] transition-colors"
            >
              <Mail className="w-5 h-5 mr-2" />
              Email Support Team
            </a>
          </div>
        </section>

        <div className="mt-12 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-500 text-center">
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

