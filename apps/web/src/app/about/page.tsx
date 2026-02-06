"use client"
// pages/about.tsx
import React from 'react';
import Image from 'next/image';
import Head from 'next/head';
import Link from 'next/link';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { useAuth } from '../hooks/useAuth';

const AboutPage: React.FC = () => {
  const { user, loading } = useAuth();
  return (
    <>
      <main className="min-h-screen bg-[#F5F7F5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          {/* Hero Section */}
          <Navbar user={user} isLoading={loading} />
          <div className="relative h-96 rounded-sm overflow-hidden mb-16 mt-20">
            <Image 
              src="https://images.pexels.com/photos/6628529/pexels-photo-6628529.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" 
              alt="The Palash Club - Journey to Wellness" 
              layout="fill"
              objectFit="cover"
              priority
            />
            <div className="absolute inset-0 bg-[#2D3E2D]/70 flex items-center">
              <div className="container mx-auto px-6">
                <h1 className="text-4xl md:text-5xl font-light text-white mb-4">
                  Journey to Wellness
                </h1>
                <p className="text-xl text-white/90 max-w-2xl">
                  Ancient Ayurvedic wisdom meets modern wellness at The Palash Club
                </p>
              </div>
            </div>
          </div>

          {/* Mission Section */}
          <section className="mb-20">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl font-light text-[#2D3E2D] mb-6 tracking-wide">Our Philosophy</h2>
              <p className="text-base sm:text-lg text-[#4A5F4A] mb-8 leading-relaxed">
                Ayurveda not only focus on disease. But also, Ayurveda maintains that all life must be supported by energy in balance. When there is minimal stress and the flow of energy within a person is balanced, the body's natural defense systems will be strong and can more easily defend against disease. The basic principle of Ayurveda is to prevent mankind from the illness. Palash here follow the same concept and bring not only ayurveda but 4 more parallel medicine into day to day life of people to balance the energy everyday and keep your body balance, healthy and rejuvenate. At the Palash Club you will enjoy various activities which can be enjoy individually or with family and friend. all these activity will certainly balance your body energy to keep your immunity strong
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="bg-[#FAFBFA] p-6 rounded-sm shadow-sm">
                  <h3 className="font-normal text-lg sm:text-xl mb-3 text-[#2D3E2D] tracking-wide">Holistic Wellness</h3>
                  <p className="text-sm sm:text-base text-[#4A5F4A] leading-relaxed">
                    We bring not only Ayurveda but 4 more parallel medicines into daily life to balance energy and keep your body healthy.
                  </p>
                </div>
                <div className="bg-[#FAFBFA] p-6 rounded-sm shadow-sm">
                  <h3 className="font-normal text-lg sm:text-xl mb-3 text-[#2D3E2D] tracking-wide">Five Elements</h3>
                  <p className="text-sm sm:text-base text-[#4A5F4A] leading-relaxed">
                    Perfect blend of ancient wisdom with modern amenities under the five Tatva: water, earth, air, space, and fire.
                  </p>
                </div>
                <div className="bg-[#FAFBFA] p-6 rounded-sm shadow-sm">
                  <h3 className="font-normal text-lg sm:text-xl mb-3 text-[#2D3E2D] tracking-wide">Family Wellness</h3>
                  <p className="text-sm sm:text-base text-[#4A5F4A] leading-relaxed">
                    A place where your enjoyment leads you towards health - enjoy activities individually or with family and friends.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Director's Message Section */}
          <section className="my-32">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-2xl sm:text-3xl font-light text-[#2D3E2D] mb-6 tracking-wide">Director's Message</h2>
                <p className="text-base sm:text-lg text-[#4A5F4A] mb-6 leading-relaxed">
                  "Ayurveda, the science of life, it is not just the subject we study, it is a science of healthier and harmonious world. Our Amrutwel Ayurveda research Centre through the Palash club, We are giving every individual healthy and stress-free life. Here you can come with the family to destress from all the diseases and tension. we the Palash having perfect blend of ancient wisdom with modern amenities, under the five Tatva (elements) that is water, earth, air, space, and fire."
                </p>
                <p className="text-base sm:text-lg text-[#4A5F4A] mb-6 leading-relaxed">
                 "We are committed to offer you a healthy organic food with naturopathy, acupressure, Reiki, sound therapy, and Ayurveda with luxury. You can feel the divine energy in the Palash club, Ayurveda always has side benefit, not side-effect. Come in the side of Ayurveda, come close to healthy life."
                </p>
                <p className="text-base sm:text-lg font-normal text-[#2D3E2D]">- Dr. Komal Kashikar</p>
              </div>
              <div className='p-3 rounded-sm border border-[#C8D8C8] bg-white'>
                <div className="relative h-[600px] rounded-sm overflow-hidden">
                  <Image 
                    src="/images/komal.jpg" 
                    alt="Dr. Komal Kashikar, Director" 
                    layout="fill" 
                    objectFit="cover" 
                    objectPosition='center'
                  />
                </div>
              </div>
            </div>
          </section>

        {/* Wellness Therapies Section */}
        {/* <section className="mb-20">
          <h2 className="text-3xl font-bold text-gray-900 mb-10 text-center">Our Wellness Approaches</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {therapyServices.map((service) => (
              <div key={service.id} className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="relative h-48">
                  <Image 
                    src={service.image} 
                    alt={service.name} 
                    layout="fill" 
                    objectFit="cover" 
                  />
                </div>
                <div className="p-6">
                  <h3 className="font-bold text-xl mb-2">{service.name}</h3>
                  <p className="text-gray-700 mb-4">{service.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {service.benefits.map((benefit, index) => (
                      <span key={index} className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                        {benefit}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section> */}

          {/* Core Values */}
          <section className="mb-20">
            <h2 className="text-2xl sm:text-3xl font-light text-[#2D3E2D] mb-10 text-center tracking-wide">Our Core Values</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-10">
              <div className="flex">
                <div className="flex-shrink-0 h-12 w-12 flex items-center justify-center rounded-sm bg-[#D4E4D4] text-[#2D3E2D]">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <h3 className="text-base sm:text-lg font-normal text-[#2D3E2D] tracking-wide">Ancient Wisdom</h3>
                  <p className="mt-2 text-sm sm:text-base text-[#4A5F4A] leading-relaxed">
                    Combining traditional Ayurvedic principles with complementary healing practices for holistic wellness.
                  </p>
                </div>
              </div>
              <div className="flex">
                <div className="flex-shrink-0 h-12 w-12 flex items-center justify-center rounded-sm bg-[#D4E4D4] text-[#2D3E2D]">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <div className="ml-4">
                  <h3 className="text-base sm:text-lg font-normal text-[#2D3E2D] tracking-wide">Preventive Healthcare</h3>
                  <p className="mt-2 text-sm sm:text-base text-[#4A5F4A] leading-relaxed">
                    Our focus is on preventing illness by maintaining energy balance and strengthening natural defense systems.
                  </p>
                </div>
              </div>
              <div className="flex">
                <div className="flex-shrink-0 h-12 w-12 flex items-center justify-center rounded-sm bg-[#D4E4D4] text-[#2D3E2D]">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <h3 className="text-base sm:text-lg font-normal text-[#2D3E2D] tracking-wide">Family-Centered Approach</h3>
                  <p className="mt-2 text-sm sm:text-base text-[#4A5F4A] leading-relaxed">
                    Creating wellness experiences that bring families together for healing and rejuvenation.
                  </p>
                </div>
              </div>
              <div className="flex">
                <div className="flex-shrink-0 h-12 w-12 flex items-center justify-center rounded-sm bg-[#D4E4D4] text-[#2D3E2D]">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <h3 className="text-base sm:text-lg font-normal text-[#2D3E2D] tracking-wide">Luxury with Purpose</h3>
                  <p className="mt-2 text-sm sm:text-base text-[#4A5F4A] leading-relaxed">
                    Providing premium wellness experiences with organic food, modern amenities, and divine energy.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Location & Contact */}
          <section className="mb-20 bg-white border border-[#C8D8C8] rounded-sm p-8">
            <div className="text-center">
              <h2 className="text-2xl sm:text-3xl font-light text-[#2D3E2D] mb-6 tracking-wide">Visit The Palash Club</h2>
              <p className="text-base sm:text-lg text-[#4A5F4A] mb-6 leading-relaxed">
                Experience the perfect blend of ancient wisdom and modern luxury in our serene wellness sanctuary.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                <div className="text-left">
                  <h3 className="font-normal text-lg sm:text-xl mb-3 text-[#2D3E2D] tracking-wide">Location</h3>
                  <p className="text-sm sm:text-base text-[#4A5F4A] leading-relaxed">
                    Khasra No. 107, Village Sawangi (Amgaon Deoli)<br/>
                    Taluka Hingna, District Nagpur
                  </p>
                </div>
                <div className="text-left">
                  <h3 className="font-normal text-lg sm:text-xl mb-3 text-[#2D3E2D] tracking-wide">Contact</h3>
                  <p className="text-sm sm:text-base text-[#4A5F4A] leading-relaxed">
                    Phone: +91 9422115180<br/>
                    Email: thepalashclub@gmail.com<br/>
                    Website: www.palash.club.com
                  </p>
                </div>
              </div>
              <div className="mt-8">
                <Link href="/pricing">
                  <span className="inline-flex items-center bg-[#2D3E2D] hover:bg-[#4A5F4A] text-white px-6 py-3 rounded-sm font-normal transition-colors duration-300">
                    Explore Membership Options
                    <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </span>
                </Link>
              </div>
            </div>
          </section>
        </div>
      </main>

      <div className='w-full mb-12'>
        <Footer />
      </div>
    </>
  );
};

// Therapy services data based on Palash Club offerings
const therapyServices = [
  {
    id: 1,
    name: "Ayurveda",
    image: "https://images.pexels.com/photos/3985163/pexels-photo-3985163.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    description: "Traditional Ayurvedic treatments focusing on balancing the three doshas and promoting natural healing through herbal medicines and therapies.",
    benefits: ["Panchakarma", "Herbal Medicine", "Dosha Balancing"]
  },
  {
    id: 2,
    name: "Naturopathy",
    image: "https://images.pexels.com/photos/4506102/pexels-photo-4506102.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    description: "Natural healing approaches using the body's inherent ability to heal itself through nutrition, lifestyle changes, and natural remedies.",
    benefits: ["Detoxification", "Natural Remedies", "Lifestyle Guidance"]
  },
  {
    id: 3,
    name: "Acupressure",
    image: "https://images.pexels.com/photos/7524671/pexels-photo-7524671.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    description: "Ancient pressure point therapy that stimulates healing by applying pressure to specific points on the body to restore energy flow.",
    benefits: ["Pain Relief", "Energy Balance", "Stress Reduction"]
  },
  {
    id: 4,
    name: "Reiki",
    image: "https://images.pexels.com/photos/3985167/pexels-photo-3985167.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    description: "Energy healing technique that promotes relaxation, reduces stress, and supports emotional and physical healing through universal life energy.",
    benefits: ["Energy Healing", "Stress Relief", "Emotional Balance"]
  },
  {
    id: 5,
    name: "Sound Therapy",
    image: "https://images.pexels.com/photos/3544322/pexels-photo-3544322.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    description: "Therapeutic use of sound frequencies and vibrations to promote healing, relaxation, and mental clarity through various instruments and techniques.",
    benefits: ["Deep Relaxation", "Mental Clarity", "Vibrational Healing"]
  },
  {
    id: 6,
    name: "Yoga & Meditation",
    image: "https://images.pexels.com/photos/3822359/pexels-photo-3822359.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    description: "Ancient practices combining physical postures, breathing techniques, and meditation to achieve physical, mental, and spiritual well-being.",
    benefits: ["Flexibility", "Mindfulness", "Spiritual Growth"]
  }
];

export default AboutPage;