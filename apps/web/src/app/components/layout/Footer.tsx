"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowUpCircle, MapPin, Phone, Mail } from "lucide-react"
import Logo from "@/app/assets/logo.png";
import Image from "next/image";

export default function Footer() {
  const [showBackToTop, setShowBackToTop] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 300)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    })
  }

  const footerLinks = {
    services: [
      { label: "About Us", href: "/about" },
      { label: "Wellness Programs", href: "/services" },
      { label: "Pricing", href: "/pricing" },
      // { label: "Testimonials", href: "/testimonials" }
    ],
    support: [
      { label: "FAQ", href: "/faq" },
      { label: "Support", href: "/support" },
      { label: "Privacy Policy", href: "/privacy-policy" },
      { label: "Terms of Service", href: "/terms-and-conditions" },
      { label: "Cancellation Policy", href: "/cancellation-policy" },
      { label: "Refund Policy", href: "/refund-policy" }
    ],
    contact: [
      { label: "+91 9422115180", href: "tel:+919422115180", icon: Phone },
      { label: "thepalashclub@gmail.com", href: "mailto:thepalashclub@gmail.com", icon: Mail },
      { label: "Khasra No. 107, Village Sawangi (Amgaon Deoli), Taluka Hingna, District Nagpur", href: "#", icon: MapPin }
    ]
  }

  return (
    <footer className="bg-[#104844] w-[96%] sm:w-[94%] mx-auto rounded-xl text-gray-300 py-8 sm:py-12 lg:py-16 relative">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 lg:gap-12 mb-8 sm:mb-12">
          {/* Logo and Description */}
          <div className="lg:col-span-1">
            <div className="mb-6">
              <Image 
                src={Logo} 
                alt="Palash Logo" 
                className="w-32 sm:w-40 lg:w-48 mb-4" 
              />
              <p className="text-sm sm:text-base text-[#FF7F50] leading-relaxed max-w-md">
                Empowering your mental wellness journey with compassionate care and expert guidance.
              </p>
            </div>
          </div>

          {/* Quick Links */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-6 lg:gap-8 lg:col-span-3">
            {/* Services Column */}
            <div>
              <h3 className="text-white font-semibold text-sm sm:text-base mb-3 sm:mb-4">Services</h3>
              <ul className="space-y-2">
                {footerLinks.services.map((link, index) => (
                  <li key={index}>
                    <Link 
                      href={link.href} 
                      className="text-xs sm:text-sm text-gray-300 hover:text-[#FF7F50] transition-colors duration-200"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Support Column */}
            <div>
              <h3 className="text-white font-semibold text-sm sm:text-base mb-3 sm:mb-4">Support</h3>
              <ul className="space-y-2">
                {footerLinks.support.map((link, index) => (
                  <li key={index}>
                    <Link 
                      href={link.href} 
                      className="text-xs sm:text-sm text-gray-300 hover:text-[#FF7F50] transition-colors duration-200"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact Column */}
            <div className="col-span-2 sm:col-span-1">
              <h3 className="text-white font-semibold text-sm sm:text-base mb-3 sm:mb-4">Contact</h3>
              <ul className="space-y-3">
                {footerLinks.contact.map((contact, index) => {
                  const IconComponent = contact.icon;
                  return (
                    <li key={index}>
                      <Link 
                        href={contact.href} 
                        className="flex items-center space-x-2 text-xs sm:text-sm text-gray-300 hover:text-[#FF7F50] transition-colors duration-200 group"
                      >
                        <IconComponent className="h-3 w-3 sm:h-4 sm:w-4 group-hover:text-[#FF7F50]" />
                        <span>{contact.label}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="border-t border-gray-600/30 pt-6 sm:pt-8">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
            {/* Copyright */}
            <div className="text-xs sm:text-sm text-[#FF7F50] text-center sm:text-left">
              <p>© 2024 Palash Wellness. All rights reserved.</p>
            </div>

            {/* Social Links - Simple text links */}
            <div className="flex items-center space-x-4 sm:space-x-6">
              <Link 
                href="https://www.instagram.com/thepalashclub/" 
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs sm:text-sm text-gray-300 hover:text-[#FF7F50] transition-colors duration-200"
              >
                Instagram
              </Link>
              <Link 
                href="https://www.linkedin.com/in/the-palash-club-14b6aa362/" 
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs sm:text-sm text-gray-300 hover:text-[#FF7F50] transition-colors duration-200"
              >
                LinkedIn
              </Link>
            </div>
          </div>
        </div>

        {/* Back to Top Button */}
        {showBackToTop && (
          <button
            onClick={scrollToTop}
            className="fixed bottom-6 sm:bottom-8 right-6 sm:right-8 bg-[#FF7F50] text-white p-2 sm:p-3 rounded-full hover:bg-[#FF7F50]/80 transition-all duration-200 shadow-lg z-50"
            aria-label="Back to top"
          >
            <ArrowUpCircle className="h-5 w-5 sm:h-6 sm:w-6" />
          </button>
        )}
      </div>
    </footer>
  )
}

