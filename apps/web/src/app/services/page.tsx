"use client"
import  {ServiceCard}  from "@/app/components/service-card/ServiceCard"
import Navbar from "../components/layout/Navbar";
import { useEffect, useState } from "react";
import { getUserProfile, UserProfile } from "../api/user";
import { fetchServices, ServicesResponse } from "../api/services";
import {Loader2} from "lucide-react"
import { PrimaryButton } from "../components/ui/buttons/PrimaryButton";
import { useToast } from "../components/ui/toast/use-toast";
import { useAuth } from "../hooks/useAuth";
import { Toaster } from "../components/ui/toast/toaster";
import { FeaturedServiceCard } from "@/app/components/service-card/FeaturedServiceCard";

export default function Page() {
  const [serviceError, setServiceError] = useState("");
  const [services, setServices] = useState<ServicesResponse | null>(null);
  const [isServiceLoading, setIsServiceLoading] = useState(true);
  const { toast } = useToast();
  const { user, loading, error } = useAuth();

  useEffect(() => {
    const fetchS = async () => {
      try {
        const serviceData = await fetchServices();

        toast({
          title: "Info",
          description: "Services fetched successfully"
        })
        setServices(serviceData);
      } catch (error) {
        // If error occurs, user is likely not logged in
        setServiceError("Unable to load services. Please check your internet connection")
        console.log("User not authenticated");
      } finally {
        setIsServiceLoading(false);
      }
    };

    fetchS();
  }, []);

  // Separate featured and non-featured services
  const featuredServices = services?.createResponse.services.filter(service => service.featured) || [];
  const regularServices = services?.createResponse.services.filter(service => !service.featured) || [];

  return (
    <div className="min-h-screen bg-[#F5F7F5]">
      <Toaster />
      <Navbar user={user} isLoading={loading} />
      <div className="container mx-auto px-6 py-12">
        <header className="mb-16 text-center mt-32 sm:mt-40">
          <h1 className="mb-4 text-4xl font-light tracking-tight text-[#2D3E2D] md:text-5xl lg:text-6xl">
            Find Your <span className="text-[#7A9B7A] font-normal">Inner Balance</span>
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-[#4A5F4A] md:text-xl">
            Discover our curated wellness services designed to nurture your mind, body, and spirit.
          </p>
        </header>

        {isServiceLoading ? (
          <div className="flex justify-center items-center min-h-[200px]">
            <div className="text-center">
              <div className="rounded-full h-12 w-12 border-b-2 border-[#7A9B7A] mx-auto mb-4">
                <Loader2 size={30} className="animate-spin text-[#7A9B7A]" />
              </div>
              <p className="text-lg text-[#4A5F4A]">Loading available services...</p>
            </div>
          </div>
        ) : serviceError ? (
          <div className="flex justify-center items-center min-h-[200px]">
            <div className="text-center bg-white border border-[#C8D8C8] p-8 rounded-sm">
              <svg className="h-12 w-12 text-[#7A9B7A] mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-lg text-[#2D3E2D] font-normal mb-2">Oops! Something went wrong</p>
              <p className="text-[#4A5F4A]">{serviceError}</p>
            </div>
          </div>
        ) : (
          <>
            {/* Featured Services Section */}
            {featuredServices.length > 0 && (
               <section className="mt-24">
                <h2 className="text-2xl font-light mb-8 text-[#2D3E2D]">Featured Services</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {featuredServices.map((service) => (
                    <ServiceCard key={service.id} service={service as any} />
                  ))}
                </div>
              </section>
           
            )}

            {/* Regular Services Section */}
            {regularServices.length > 0 && (
              <section className="mt-16">
                <h2 className="text-2xl font-light mb-8 text-[#2D3E2D]">All Services</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {regularServices.map((service) => (
                    <ServiceCard key={service.id} service={service as any} />
                  ))}
                </div>
              </section>
            )}

            {services?.createResponse.services.length === 0 && (
              <div className="text-center bg-white border border-[#C8D8C8] p-8 rounded-sm">
                <svg className="h-12 w-12 text-[#7A9B7A] mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
                <p className="text-lg text-[#2D3E2D] font-normal">No Services Available</p>
                <p className="text-[#4A5F4A] mt-2">Please check back later for new services</p>
              </div>
            )}
          </>
        )}

        {services?.createResponse.pagination && (
          <div className="mt-8 flex justify-center">
            <nav className="flex items-center gap-2">
              <button
                disabled={!services.createResponse.pagination.hasPrevPage}
                className="px-3 py-1 rounded-sm bg-white border border-[#C8D8C8] text-sm text-[#2D3E2D] disabled:opacity-50 hover:bg-[#F5F7F5] transition-colors"
                onClick={() => {/* Add pagination logic */}}
              >
                Previous
              </button>
              <span className="text-sm text-[#4A5F4A]">
                Page {services.createResponse.pagination.currentPage} of {services.createResponse.pagination.totalPages}
              </span>
              <button
                disabled={!services.createResponse.pagination.hasNextPage}
                className="px-3 py-1 rounded-sm bg-white border border-[#C8D8C8] text-sm text-[#2D3E2D] disabled:opacity-50 hover:bg-[#F5F7F5] transition-colors"
                onClick={() => {/* Add pagination logic */}}
              >
                Next
              </button>
            </nav>
          </div>
        )}
      </div>
    </div>
  );
}

