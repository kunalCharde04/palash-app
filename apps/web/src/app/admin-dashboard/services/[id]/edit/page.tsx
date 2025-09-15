"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { ServiceForm } from "@/app/components/admin-dashboard/services/ServiceForm"
import { fetchServiceById } from "@/app/api/services"
import { Service } from "@/app/api/services"
import { toast } from "@/app/components/ui/toast/use-toast"
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card/Card"
import { ArrowLeft, Loader2 } from "lucide-react"
import { PrimaryButton as Button } from "@/app/components/ui/buttons/PrimaryButton"

export default function EditServicePage() {
  const [service, setService] = useState<Service | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const params = useParams()
  const router = useRouter()
  const serviceId = params.id as string

  useEffect(() => {
    const fetchService = async () => {
      try {
        setLoading(true)
        const response = await fetchServiceById(serviceId)
        setService(response.service)
      } catch (error) {
        console.error("Error fetching service:", error)
        setError("Failed to load service data")
        toast({
          title: "Error",
          description: "Failed to load service data. Please try again.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    if (serviceId) {
      fetchService()
    }
  }, [serviceId])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading service data...</span>
        </div>
      </div>
    )
  }

  if (error || !service) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-red-600">Error</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p>{error || "Service not found"}</p>
            <Button onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Transform service data to match form format
  const formData = {
    name: service.name,
    description: service.description || [],
    shortDescription: service.shortDescription || "",
    media: [], // Will be handled separately for existing images
    category: service.category,
    tags: service.tags || [],
    price: service.price,
    currency: service.currency || "INR",
    discountPrice: service.discountPrice || "",
    duration: service.duration,
    instructorName: service.instructorName || "",
    instructorBio: service.instructorBio || "",
    cancellationPolicy: service.cancellationPolicy || "",
    featured: service.featured,
    isActive: service.isActive,
    isOnline: service.isOnline,
    isRecurring: service.isRecurring || false,
    location: service.location || {
      address: "",
      city: "",
      state: "",
      country: "",
      postalCode: "",
      coordinates: {
        latitude: undefined,
        longitude: undefined,
      },
    },
    virtualMeetingDetails: service.virtualMeetingDetails || {
      platform: "",
      joinLink: "",
      password: "",
    },
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Services
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">Edit Service</h1>
          <p className="text-gray-600 mt-2">
            Update the details for "{service.name}"
          </p>
        </div>

        <ServiceForm 
          initialData={formData} 
          serviceId={serviceId}
          isEditMode={true}
          existingImages={service.media || []}
        />
      </div>
    </div>
  )
}
