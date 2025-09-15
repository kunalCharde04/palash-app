export interface Review {
  id: string
  name: string
  rating: number
  comment: string
  date: string
}

export interface BookingData {
  userId: string;
  serviceId: string;
  date: string;
  timeSlot: string;
  paymentId: string;
  email: string;
}

export interface Service {
  id: string
  name: string
  description: string[]
  shortDescription?: string
  media: string[]
  category: string
  tags: string[]
  price: string
  currency?: string | null
  discountPrice?: string | null
  duration: number
  instructorId?: string | null
  instructorName?: string | null
  instructorBio?: string | null
  cancellationPolicy?: string | null
  featured: boolean
  isActive: boolean
  isOnline: boolean
  isRecurring?: boolean | null
  location?: {
    city?: string
    state?: string
    address?: string
    country?: string
    postalCode?: string
    coordinates?: {
      latitude: number
      longitude: number
    }
  } | null
  virtualMeetingDetails?: {
    joinLink?: string
    password?: string
    platform: string
  } | null
  created_at: string
  updated_at: string
}

export interface ServicesResponse {
  message: string
  createResponse: {
    pagination: {
      currentPage: number
      totalPages: number
      totalServices: number
      hasNextPage: boolean
      hasPrevPage: boolean
    }
    services: Service[]
  }
}

export interface AvailableDate {
  date: string
  available: boolean
}

