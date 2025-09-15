"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/app/components/ui/card/Card"
import { PrimaryButton as Button, SecondaryButton } from "@/app/components/ui/buttons/index"
import Link from "next/link"
import { Edit, Trash2, Plus, Clock, Star } from "lucide-react"
import { Badge } from "@/app/components/badge/badge"
import { toast } from "../../ui/toast/use-toast"
import { fetchServices, Service, ServicesResponse, deleteService as delService} from "@/app/api/services"
import Image from "next/image"
import { formatTime } from "@/app/utils/format-time"
import { Dialog, DialogDescription, DialogTitle, DialogHeader, DialogContent, DialogFooter } from "../../ui/dialog/Dialog"
// Define the Service interface

export function ServiceList() {
  const [services, setServices] = useState<ServicesResponse | null>(null)
  const [isServiceLoading, setIsServiceLoading] = useState(true)
  const [serviceError, setServiceError] = useState("")
  const [deleteService, setDeleteService] = useState(false);
  const [deleteServiceId, setDeleteServiceId] = useState("");
  const [imageError, setImageError] = useState(false)

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


  // Function to delete a service (would connect to API in a real app)
  const handleDelete = async (id: string) => {
    try {
      const response = await delService(id);
      if(response.message){
        toast({
          title: "Success",
          description: "Service deleted successfully"
        })
      setDeleteService(false);
      setDeleteServiceId("");
        window.location.reload();
      }else{
        toast({
          title: "Error",
          description: "Service deletion failed"
        })  
      }
    } catch (error) {
      console.error("Error deleting service:", error);
      toast({
        title: "Error",
        description: "Service deletion failed"
      })
    }
  }

  // Format price as currency
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price)
  }

  // Format date
  const formatDate = (dateString: any) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', 
      month: 'long', 
      day: 'numeric'
    })
  }


const getImageUrl = (service: Service) => {
  return services?.createResponse.services[0].media && services?.createResponse.services[0].media.length > 0
    ? `${process.env.NEXT_PUBLIC_API_URL}${services?.createResponse.services[0].media[0]}`
    : "/placeholder.svg?height=400&width=600"
}


  return (
    <div className="space-y-6">
      {isServiceLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <Card key={i} className="opacity-70">
              <div className="h-48 bg-gray-200 animate-pulse rounded-t-lg"></div>
              <CardContent className="p-4 space-y-4">
                <div className="h-6 bg-gray-200 animate-pulse rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 animate-pulse rounded w-1/4"></div>
                <div className="h-16 bg-gray-200 animate-pulse rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : serviceError ? (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-red-500">{serviceError}</p>
            <Button 
              className="mt-4"
              onClick={() => window.location.reload()}
            >
              Try Again
            </Button>
          </CardContent>
        </Card>
      ) : services?.createResponse.services.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-gray-500 mb-4">No wellness services found. Create your first service to get started.</p>
            {/* <Link href="/services/new" passHref>
              <Button className="flex items-center gap-2">
                <Plus size={16} />
                <span>Add Service</span>
              </Button>
            </Link> */}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services?.createResponse.services.map(service => {
return (
<Card key={service.id} className="overflow-hidden flex flex-col h-full hover:shadow-lg transition-shadow duration-300">
              {/* Image Gallery (showing only first image for simplicity) */}
               <div className="relative w-full h-56 overflow-hidden">
          {service.media && service.media.length > 0 ? (
            <>
              <div className="absolute inset-0 bg-gradient-to-t from-[#012b2b]/30 to-transparent z-10" />
              <Image
                src={`${process.env.NEXT_PUBLIC_API_URL}/api/v1${service.media[0]}`}
                alt={service.name}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                onError={() => setImageError(true)}
              />
              <Badge className="absolute top-4 right-4 z-20 bg-white/90 text-[#012b2b] hover:bg-white/80">
                {service.category}
              </Badge>
              {service.featured && (
                <Badge className="absolute bg-yellow-200 text-black top-4 flex items-center justify-center gap-2 left-4 z-20">
                  <Star className="w-3 h-3" />
                  <span className="text-xs">Featured</span>
                </Badge>
              )}
            </>
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-[#012b2b]/10 to-[#517d64]/10 flex items-center justify-center">
              <span className="text-[#012b2b]/60">Image not available</span>
            </div>
          )}
        </div>
              
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-xl">{service.name}</CardTitle>
                  <span className="font-bold text-green-600">{service.currency} {service.price}</span>
                </div>
                {service.duration && (
                  <Badge variant="default" className="max-w-fit" >
                    <Clock size={14} className="mr-1" />
                    <span>{formatTime(service.duration)}</span>
                  </Badge>
                )}
              </CardHeader>
              
              <CardContent className="pb-2 flex-grow">
                <div className="text-gray-600 text-sm line-clamp-3">
                  {service.description && service.description.length > 0 ? (
                    <ul className="space-y-1 list-disc list-inside">
                      {service.description.slice(0, 3).map((point, index) => (
                        <li key={index}>{point}</li>
                      ))}
                      {service.description.length > 3 && (
                        <li>...and {service.description.length - 3} more points</li>
                      )}
                    </ul>
                  ) : (
                    <p>No description available</p>
                  )}
                </div>
                <p className="text-gray-400 text-xs mt-2">Added on {formatDate(service.created_at)}</p>
              </CardContent>
              
              <CardFooter className="flex justify-between pt-2 mt-auto">
                <div className="flex gap-2 w-full">
                  <Link href={`/admin-dashboard/services/${service.id}/edit`} passHref className="w-1/2">
                    <Button 
                      className="p-2 h-10 w-full flex items-center justify-center"
                      aria-label={`Edit ${service.name}`}
                    >
                      <Edit size={16} /> Edit
                    </Button>
                  </Link>
                  <Button 
                    className="p-2 h-10 w-1/2 flex items-center justify-center bg-destructive hover:bg-red-600"
                    onClick={() => {
setDeleteService(true)
setDeleteServiceId(service.id)
                    }}
                    aria-label={`Delete ${service.name}`}
                  >
                    <Trash2 size={16} /> Delete
                  </Button>
                </div>
              </CardFooter>
            </Card>
)
})}
        </div>
      )}

<Dialog
        open={deleteService}
        onOpenChange={setDeleteService}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Service</DialogTitle>
          </DialogHeader>
          <DialogDescription>
            Are you sure you want to delete this service?
          </DialogDescription>
          <DialogFooter>
            <SecondaryButton onClick={() => setDeleteService(false)}>Cancel</SecondaryButton>
            <Button onClick={() => handleDelete(deleteServiceId as string)} className="bg-red-600 hover:bg-red-700">Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}