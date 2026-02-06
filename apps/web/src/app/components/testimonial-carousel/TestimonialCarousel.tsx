"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/app/lib/utils"
import {SecondaryButton} from "@/app/components/ui/buttons/index"
import Leafs from "@/app/assets/leafs.png";
import Image from "next/image";

interface Testimonial {
  id: number
  quote: string
  author: string
  location: string
  avatar: string
}

const testimonials: Testimonial[] = [
  {
    id: 1,
    quote:
      "Palash gave me the strength to overcome my anxiety. The compassionate therapists provided unwavering support, and I've found a renewed sense of purpose and tranquility in my life.",
    author: "Madhukar.D",
    location: "Client from New Delhi",
    avatar: "https://i.pravatar.cc/150",
  },
  {
    id: 2,
    quote:
      "The holistic approach to wellness transformed my perspective. The team's dedication and expertise helped me achieve balance and inner peace.",
    author: "Sarah M.",
    location: "Client from Mumbai",
    avatar: "https://i.pravatar.cc/150",
  },
  {
    id: 3,
    quote:
      "Finding this therapeutic community was life-changing. The personalized care and support system helped me rebuild my confidence.",
    author: "Raj K.",
    location: "Client from Bangalore",
    avatar: "https://i.pravatar.cc/150",
  },
]

export default function TestimonialCarousel() {
  const [currentIndex, setCurrentIndex] = React.useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = React.useState(true)
  const autoPlayRef = React.useRef<NodeJS.Timeout>(null)

  const nextSlide = React.useCallback(() => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % testimonials.length)
  }, [])

  const prevSlide = React.useCallback(() => {
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? testimonials.length - 1 : prevIndex - 1))
  }, [])

  React.useEffect(() => {
    if (isAutoPlaying) {
      autoPlayRef.current = setInterval(nextSlide, 5000)
    }
    return () => {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current)
      }
    }
  }, [isAutoPlaying, nextSlide])

  const handleMouseEnter = () => setIsAutoPlaying(false)
  const handleMouseLeave = () => setIsAutoPlaying(true)

  return (
    <section className="w-full py-8 sm:py-12 lg:py-16 bg-[#E8F0E8]">
      <div className="w-[96%] sm:w-[94%] mx-auto">
        <div
          className="relative min-h-[350px] sm:min-h-[400px] lg:min-h-[450px] w-full overflow-hidden rounded-sm bg-white border border-[#C8D8C8] p-4 sm:p-6 lg:p-8"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {/* Subtle Background Pattern */}
          <div className="absolute inset-0 opacity-[0.02]">
            <div className="absolute top-0 left-0 w-full h-full" style={{
              backgroundImage: `radial-gradient(circle at 25% 25%, #2D3E2D 1px, transparent 1px),
                               radial-gradient(circle at 75% 75%, #2D3E2D 1px, transparent 1px)`,
              backgroundSize: '60px 60px'
            }}></div>
          </div>

          <div className="relative z-10">
            {/* Label */}
            <div className="mb-6 sm:mb-8">
              <span className="inline-block bg-[#F5F7F5] border border-[#C8D8C8] px-3 sm:px-4 py-1 sm:py-2 text-xs sm:text-sm text-[#2D3E2D] font-light tracking-wide">
                # Testimonials
              </span>
            </div>

            {/* Section Header */}
            <div className="text-center mb-6 sm:mb-8 lg:mb-10">
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-light text-[#2D3E2D] mb-2 sm:mb-4">
                What Our Clients Say
              </h2>
              <p className="text-sm sm:text-base text-[#4A5F4A] max-w-2xl mx-auto">
                Real stories from people who found healing and transformation through our wellness programs.
              </p>
            </div>

            {/* Carousel */}
            <div className="relative mx-auto max-w-4xl">
              <div className="relative overflow-hidden">
                <div
                  className="transition-transform duration-500 ease-in-out"
                  style={{ transform: `translateX(-${currentIndex * 100}%)` }}
                >
                  <div className="flex">
                    {testimonials.map((testimonial) => (
                      <div key={testimonial.id} className="w-full flex-shrink-0 px-2 sm:px-4" style={{ width: "100%" }}>
                        <div className="text-center">
                          <blockquote className="mb-6 sm:mb-8">
                            <p className="text-base sm:text-lg lg:text-xl xl:text-2xl font-light leading-relaxed text-[#2D3E2D] px-4 sm:px-8">
                              &quot;{testimonial.quote}&quot;
                            </p>
                          </blockquote>
                          <div className="flex flex-col items-center gap-2 sm:gap-3">
                            <div className="h-12 w-12 sm:h-14 sm:w-14 lg:h-16 lg:w-16 overflow-hidden rounded-full border-2 border-[#7A9B7A] bg-[#D4E4D4] flex items-center justify-center">
                              <span className="text-[#2D3E2D] font-normal text-sm sm:text-base lg:text-lg">
                                {testimonial.author.charAt(0)}
                              </span>
                            </div>
                            <div className="text-center">
                              <div className="font-normal text-[#2D3E2D] text-sm sm:text-base lg:text-lg">
                                {testimonial.author}
                              </div>
                              <div className="text-xs sm:text-sm text-[#4A5F4A]">
                                {testimonial.location}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Navigation Buttons - Hidden on mobile, visible on larger screens */}
              <div className="hidden sm:block">
                <SecondaryButton
                  className="absolute left-2 lg:left-4 top-1/2 border-[#C8D8C8] hover:text-[#2D3E2D] -translate-y-1/2 transform rounded-full bg-white text-[#4A5F4A] hover:bg-[#F5F7F5] p-2 lg:p-3"
                  onClick={prevSlide}
                >
                  <ChevronLeft className="h-4 w-4 lg:h-6 lg:w-6" />
                </SecondaryButton>
                <SecondaryButton
                  className="absolute right-2 lg:right-4 top-1/2 -translate-y-1/2 border-[#C8D8C8] hover:text-[#2D3E2D] transform rounded-full bg-white text-[#4A5F4A] hover:bg-[#F5F7F5] p-2 lg:p-3"
                  onClick={nextSlide}
                >
                  <ChevronRight className="h-4 w-4 lg:h-6 lg:w-6" />
                </SecondaryButton>
              </div>

              {/* Mobile Navigation - Swipe indicators */}
              <div className="block sm:hidden mt-4">
                <div className="flex justify-center gap-3">
                  <button
                    onClick={prevSlide}
                    className="bg-[#F5F7F5] hover:bg-[#D4E4D4] border border-[#C8D8C8] text-[#2D3E2D] p-2 rounded-full transition-colors"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    onClick={nextSlide}
                    className="bg-[#F5F7F5] hover:bg-[#D4E4D4] border border-[#C8D8C8] text-[#2D3E2D] p-2 rounded-full transition-colors"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Dots */}
              <div className="mt-6 sm:mt-8 flex justify-center gap-2">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    className={cn(
                      "h-2 w-2 sm:h-2.5 sm:w-2.5 rounded-full transition-all",
                      currentIndex === index ? "bg-[#2D3E2D] w-4 sm:w-6" : "bg-[#C8D8C8]",
                    )}
                    onClick={() => setCurrentIndex(index)}
                  />
                ))}
              </div>

              {/* Auto-play indicator */}
              <div className="text-center mt-4 sm:mt-6">
                <button
                  onClick={() => setIsAutoPlaying(!isAutoPlaying)}
                  className="text-xs sm:text-sm text-[#4A5F4A] hover:text-[#2D3E2D] transition-colors"
                >
                  {isAutoPlaying ? '⏸️ Auto-playing' : '▶️ Paused'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

