import React from 'react'
import Image from "next/image";
import WellnessPath from "@/app/assets/wellnes_path.png";

function HowItsWork() {
    const steps = [
        {
            number: 1,
            title: "Assessment",
            description: "Our experienced therapist will assess and understand your mental health needs during counseling through some tests.",
            marginTop: "mt-4"
        },
        {
            number: 2,
            title: "Sessions", 
            description: "We will decide on regular counseling or group support and execute based on the health test curated by our expert therapist.",
            marginTop: "mt-8 lg:mt-8"
        },
        {
            number: 3,
            title: "Tracking",
            description: "The therapist assigned to your case will monitor and adjust your therapy session progress to make sure you get the best experience.",
            marginTop: "mt-7 lg:mt-7"
        }
    ];

    return (
        <div className="min-h-screen mt-4 sm:mt-6 lg:mt-8 p-3 sm:p-4 lg:p-6 flex items-center justify-center bg-[#E8F0E8]">
            <div className="w-full max-w-7xl mx-auto">
                {/* Section Header */}
                <div className="text-center mb-8 sm:mb-12 lg:mb-16">
                    <h2 className="text-2xl sm:text-3xl lg:text-4xl font-light text-[#2D3E2D] mb-4">
                        How It Works
                    </h2>
                    <p className="text-base sm:text-lg text-[#4A5F4A] max-w-3xl mx-auto">
                        Your journey to wellness in three simple steps. We guide you through every stage of your mental health transformation.
                    </p>
                </div>

                <div className="relative bg-transparent">
                    {/* Mobile Layout - Stacked */}
                    <div className="block lg:hidden">
                        {/* Image Section for Mobile */}
                        <div className="w-full h-48 sm:h-64 relative mb-8 sm:mb-12">
                            <Image 
                                src={WellnessPath} 
                                alt="wellness path" 
                                className='w-full h-full object-contain'
                                priority
                            />
                        </div>

                        {/* Steps for Mobile */}
                        <div className="space-y-6 sm:space-y-8">
                            {steps.map((step, index) => (
                                <div key={step.number} className="flex gap-4 sm:gap-6">
                                    <div className="flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#D4E4D4] border border-[#C8D8C8] flex items-center justify-center text-[#2D3E2D] font-light text-sm sm:text-base">
                                        {step.number}
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-lg sm:text-xl text-[#2D3E2D] mb-2 font-normal">
                                            {step.title}
                                        </h3>
                                        <p className="text-sm sm:text-base text-[#4A5F4A] leading-relaxed">
                                            {step.description}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Desktop Layout - Side by Side */}
                    <div className="hidden lg:flex lg:items-center lg:justify-center p-4 xl:p-8 overflow-hidden">
                        {/* Image Section for Desktop */}
                        <div className="w-full max-w-2xl h-64 xl:h-96 relative mr-8 xl:mr-12">
                            <Image 
                                src={WellnessPath} 
                                alt="wellness path" 
                                className='w-full h-full object-contain'
                                priority
                            />
                        </div>

                        {/* Steps for Desktop */}
                        <div className="flex-shrink-0 max-w-md xl:max-w-lg">
                            <div className="space-y-6 xl:space-y-8">
                                {steps.map((step, index) => (
                                    <div key={step.number} className="flex gap-6">
                                        <div className={`flex-shrink-0 w-12 h-12 xl:w-14 xl:h-14 -ml-6 xl:-ml-7 ${step.marginTop} rounded-full bg-[#D4E4D4] border border-[#C8D8C8] flex items-center justify-center text-[#2D3E2D] font-light`}>
                                            {step.number}
                                        </div>
                                        <div>
                                            <h3 className="text-xl xl:text-2xl text-[#2D3E2D] mb-2 font-normal">
                                                {step.title}
                                            </h3>
                                            <p className="text-base xl:text-lg text-[#4A5F4A] leading-relaxed">
                                                {step.description}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Tablet Layout - Medium Screens */}
                    <div className="hidden md:block lg:hidden">
                        <div className="flex flex-col items-center">
                            {/* Image Section for Tablet */}
                            <div className="w-full max-w-lg h-48 relative mb-8">
                                <Image 
                                    src={WellnessPath} 
                                    alt="wellness path" 
                                    className='w-full h-full object-contain'
                                    priority
                                />
                            </div>

                            {/* Steps for Tablet */}
                            <div className="w-full max-w-2xl">
                                <div className="space-y-6">
                                    {steps.map((step, index) => (
                                        <div key={step.number} className="flex gap-6">
                                            <div className="flex-shrink-0 w-14 h-14 rounded-full bg-[#D4E4D4] border border-[#C8D8C8] flex items-center justify-center text-[#2D3E2D] font-light">
                                                {step.number}
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="text-xl text-[#2D3E2D] mb-2 font-normal">
                                                    {step.title}
                                                </h3>
                                                <p className="text-base text-[#4A5F4A] leading-relaxed">
                                                    {step.description}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Call to Action */}
                <div className="text-center mt-8 sm:mt-12 lg:mt-16">
                    <div className="inline-flex items-center justify-center space-x-2 bg-white border border-[#C8D8C8] px-4 sm:px-6 py-2 sm:py-3 rounded-full">
                        <span className="text-[#2D3E2D] text-sm sm:text-base font-light">
                            Ready to start your wellness journey?
                        </span>
                        <span className="text-[#7A9B7A] text-lg">→</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default HowItsWork