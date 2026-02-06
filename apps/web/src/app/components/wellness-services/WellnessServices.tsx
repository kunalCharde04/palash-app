import Image from "next/image"
import { ArrowRight } from "lucide-react"
import { PrimaryButton } from "../ui/buttons"
import YogaImg from "@/app/assets/wellness-services-img.jpg";
import Link from "next/link";

export default function WellnessServices() {
  return (
    <div className="w-full bg-[#E8F0E8] py-16 sm:py-20 lg:py-24 px-6 sm:px-8 lg:px-12">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-light text-[#2D3E2D] mb-4">
            Our Services
          </h2>
          <div className="w-16 h-px bg-[#7A9B7A] mx-auto"></div>
        </div>

        {/* Main Content */}
        <div className="bg-white border border-[#C8D8C8] p-8 sm:p-12 lg:p-16">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
            {/* Left Column */}
            <div className="space-y-6 lg:space-y-8">
              <span className="inline-block px-5 py-2 bg-[#F5F7F5] border border-[#C8D8C8] text-[#2D3E2D] text-sm font-light tracking-wide">
                Yoga
              </span>
              <h3 className="text-2xl sm:text-3xl lg:text-4xl font-light text-[#2D3E2D] leading-tight">
                Experience wellness with our expert yoga services
              </h3>
              <p className="text-[#4A5F4A] text-base sm:text-lg leading-relaxed">
                We offer personalized sessions, group classes, and specialized practices like prenatal and therapeutic
                yoga. Led by certified instructors, our programs focus on flexibility, strength, stress relief, and
                mindfulness.
              </p>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Counseling Card */}
              <div className="bg-[#F5F7F5] border border-[#C8D8C8] overflow-hidden group">
                <div className="relative h-80 sm:h-96">
                  <Image
                    src={YogaImg}
                    alt="Person practicing yoga on beach"
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="p-6 sm:p-8">
                  <h4 className="text-2xl sm:text-3xl mb-3 font-light text-[#2D3E2D]">
                    Counseling
                  </h4>
                  <p className="text-[#4A5F4A] text-sm sm:text-base mb-6 leading-relaxed">
                    One-on-one sessions with our expert also experienced mental health therapists.
                  </p>
                  <Link href="/services">
                    <PrimaryButton className="inline-flex items-center space-x-2">
                      <span>Get Started</span>
                      <ArrowRight className="w-4 h-4" />
                    </PrimaryButton>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
