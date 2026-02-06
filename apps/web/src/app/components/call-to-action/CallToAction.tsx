import {SecondaryButton} from "@/app/components/ui/buttons/index";
import { ArrowRight } from 'lucide-react'
import CallToActionImage from "@/app/assets/call_to_action.png";
import Image from "next/image";
import React from 'react'

function CallToAction() {
  return (
    <div className="w-full bg-white py-16 sm:py-20 lg:py-24 px-6 sm:px-8 lg:px-12">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Hero Section */}
        <div className="space-y-6 max-w-3xl">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-light leading-tight text-[#2D3E2D]">
            Ready to embark on the journey of wellness?
          </h2>
          <p className="text-base sm:text-lg text-[#4A5F4A] leading-relaxed">
            Start your health transformation with our experienced therapists today. Get to be in your ultimate inner
            peace and lasting well-being with our programs, tailored special to your health needs.
          </p>
          <SecondaryButton
            variant="outline"
            className="group text-[#2D3E2D] hover:text-[#2D3E2D] border-[#2D3E2D] hover:bg-[#F5F7F5]"
          >
            Get Started
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </SecondaryButton>
        </div>

        {/* Banner Section */}
        <div className="grid sm:grid-cols-2 gap-6">
          <div className="bg-[#E8F0E8] border border-[#C8D8C8] text-[#2D3E2D] p-8 rounded-sm flex items-center justify-center transition-all duration-300 hover:shadow-md">
            <span className="text-lg sm:text-xl font-light tracking-wide">#LetsStayHealthy</span>
          </div>
          <div className="bg-[#D4E4D4] border border-[#C8D8C8] text-[#2D3E2D] p-8 rounded-sm flex items-center justify-center transition-all duration-300 hover:shadow-md">
            <span className="text-lg sm:text-xl font-light tracking-wide">50% Discount</span>
          </div>
        </div>

        {/* Image Section */}
        <div className="relative w-full h-[300px] sm:h-[400px] lg:h-[500px] rounded-sm overflow-hidden border border-[#C8D8C8] group">
          <Image
            src={CallToActionImage}
            alt="Hands reaching towards each other representing wellness and care"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            fill
          />
        </div>
      </div>
    </div>
  )
}

export default CallToAction
