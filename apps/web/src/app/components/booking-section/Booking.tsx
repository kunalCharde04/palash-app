import Image from "next/image"
import { Lock, Heart, Users } from "lucide-react"
import Ornament from "@/app/assets/Ornament.png";
import { PrimaryButton } from "../ui/buttons";
import Link from "next/link";

export default function WellnessHero() {
  return (
    <div className="w-full bg-white py-16 sm:py-20 lg:py-24 px-6 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
          {/* Left Column - Image Section */}
          <div className="relative rounded-sm overflow-hidden bg-[#E8F0E8] group">
            <div className="absolute top-6 left-6 z-10">
              <div className="bg-white px-5 py-2.5 text-sm text-[#2D3E2D] font-light tracking-wide">
                Therapy Session
              </div>
            </div>
            <Image
              src={Ornament}
              alt="Wellness therapy session"
              width={600}
              height={800}
              className="w-full object-cover aspect-[4/5] transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute bottom-0 left-0 right-0 py-6 px-6 bg-white/90 backdrop-blur-sm">
              <Link href="/services" className="block">
                <PrimaryButton className="w-full sm:w-auto px-8">
                  Book Session
                </PrimaryButton>
              </Link>
            </div>
          </div>

          {/* Right Column - Content Section */}
          <div className="space-y-8 lg:space-y-10">
            <div className="space-y-6">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-light leading-tight text-[#2D3E2D]">
                You Deserve to be Healthy
              </h2>
              <p className="text-[#4A5F4A] text-base sm:text-lg leading-relaxed">
                Ayurveda not only focus on disease. But also, Ayurveda maintains that all life must be supported by energy
                in balance. When there is minimal stress and the flow of energy within a person is balanced.
              </p>
            </div>

            {/* Feature Cards */}
            <div className="grid sm:grid-cols-3 gap-6">
              <div className="bg-[#F5F7F5] p-6 space-y-4 border border-[#C8D8C8] transition-all duration-300 hover:shadow-md">
                <div className="w-12 h-12 flex items-center justify-center bg-[#D4E4D4]">
                  <Lock className="w-5 h-5 text-[#2D3E2D]" strokeWidth={1.5} />
                </div>
                <h3 className="font-normal text-lg text-[#2D3E2D]">Confidentiality</h3>
                <p className="text-[#4A5F4A] text-sm leading-relaxed">
                  Your privacy is sacred; we maintain the highest level of confidentiality.
                </p>
              </div>

              <div className="bg-[#F5F7F5] p-6 space-y-4 border border-[#C8D8C8] transition-all duration-300 hover:shadow-md">
                <div className="w-12 h-12 flex items-center justify-center bg-[#D4E4D4]">
                  <Heart className="w-5 h-5 text-[#2D3E2D]" strokeWidth={1.5} />
                </div>
                <h3 className="font-normal text-lg text-[#2D3E2D]">Accessibility</h3>
                <p className="text-[#4A5F4A] text-sm leading-relaxed">
                  Accessible health support to all background and areas.
                </p>
              </div>

              <div className="bg-[#F5F7F5] p-6 space-y-4 border border-[#C8D8C8] transition-all duration-300 hover:shadow-md">
                <div className="w-12 h-12 flex items-center justify-center bg-[#D4E4D4]">
                  <Users className="w-5 h-5 text-[#2D3E2D]" strokeWidth={1.5} />
                </div>
                <h3 className="font-normal text-lg text-[#2D3E2D]">Community</h3>
                <p className="text-[#4A5F4A] text-sm leading-relaxed">
                  We foster a supportive community where you can connect and share.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
