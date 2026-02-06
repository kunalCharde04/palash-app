"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

function Hero() {
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <header className='w-full mx-auto relative min-h-[85vh] lg:min-h-[90vh] overflow-hidden'>
      {/* Background with subtle texture */}
      <div className="absolute inset-0 bg-[#E8F0E8]"></div>
      
      {/* Subtle decorative elements */}
      <div className="absolute inset-0 opacity-[0.03]">
        <div className="absolute top-0 left-0 w-full h-full" style={{
          backgroundImage: `radial-gradient(circle at 25% 25%, #2D3E2D 1px, transparent 1px),
                           radial-gradient(circle at 75% 75%, #2D3E2D 1px, transparent 1px)`,
          backgroundSize: '80px 80px'
        }}></div>
      </div>

      {/* Organic shape accents */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute top-40 -left-20 w-80 h-80 bg-[#D4E4D4] rounded-full blur-3xl transition-all duration-1000 ${isVisible ? 'opacity-40' : 'opacity-0'}`}></div>
        <div className={`absolute bottom-20 -right-20 w-96 h-96 bg-[#9DB99D] rounded-full blur-3xl transition-all duration-1000 delay-300 ${isVisible ? 'opacity-30' : 'opacity-0'}`}></div>
      </div>

      {/* Main content container */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-20 sm:py-24 lg:py-32">
        <div className="max-w-4xl">
          {/* Subtitle */}
          <div className={`flex items-center space-x-4 mb-6 sm:mb-8 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <div className="h-px w-16 bg-[#7A9B7A]"></div>
            <span className="text-xs sm:text-sm tracking-[0.3em] uppercase text-[#4A5F4A] font-light">
              Wellness Journey
            </span>
          </div>
          
          {/* Main Heading */}
          <h1 className={`text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-light leading-[1.1] mb-6 sm:mb-8 text-[#2D3E2D] transition-all duration-700 delay-100 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <span className='block mb-2 sm:mb-3'>A Journey to</span>
            <span className='block font-normal'>Mental Wellness</span>
          </h1>
          
          {/* Description */}
          <p className={`text-base sm:text-lg lg:text-xl text-[#4A5F4A] max-w-2xl leading-relaxed mb-10 sm:mb-12 transition-all duration-700 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            Discover tranquility through personalized wellness experiences designed to nurture your mind, body, and spirit.
          </p>

          {/* CTA Buttons */}
          <div className={`flex flex-col sm:flex-row gap-4 sm:gap-6 transition-all duration-700 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <button 
              onClick={() => router.push('/services')}
              className="group px-8 py-4 sm:px-10 sm:py-5 bg-[#2D3E2D] text-[#F5F7F5] text-base sm:text-lg font-light tracking-wide transition-all duration-300 hover:bg-[#4A5F4A] focus:outline-none focus:ring-2 focus:ring-[#7A9B7A] focus:ring-offset-2"
            >
              <span className="flex items-center justify-center space-x-3">
                <span>Start Your Journey</span>
                <span className="transform transition-transform group-hover:translate-x-1">→</span>
              </span>
            </button>
            
            <button 
              onClick={() => router.push('/about')}
              className="px-8 py-4 sm:px-10 sm:py-5 border border-[#2D3E2D] text-[#2D3E2D] text-base sm:text-lg font-light tracking-wide transition-all duration-300 hover:bg-[#2D3E2D] hover:text-[#F5F7F5] focus:outline-none focus:ring-2 focus:ring-[#7A9B7A] focus:ring-offset-2"
            >
              Learn More
            </button>
          </div>
        </div>
      </div>

      {/* Bottom decorative element */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#C8D8C8] to-transparent"></div>
    </header>
  );
}

export default Hero;
