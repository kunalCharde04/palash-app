import {WebhookEventType} from "./types.js";

export interface RequestBody_Create {
    // Basic info
    name: string;
    description: string[]; // Array of description points
    shortDescription?: string; // Brief summary for cards/listings
    
    // Media
    media: File | File[]; // Support for multiple images/videos
    
    // Categorization
    category: string; // Main category (e.g., "Yoga", "Meditation", "Breathing")
    tags?: string[]; // Additional tags for searchability
    
    // Pricing
    price: string; // Base price
    currency?: string; // USD, EUR, etc.
    discountPrice?: string; // Optional sale price
    
    // Scheduling
    duration: number; // Length in minutes
    
    // Instructor/provider info
    instructorId?: string;
    instructorName?: string;
    instructorBio?: string;
    
    cancellationPolicy?: string;
    
    // Flags
    featured: boolean;
    isActive: boolean;
    isOnline: boolean; // Virtual vs in-person
    isRecurring?: boolean; // One-time vs recurring
    
    // Location (for in-person services)
    location?: {
      address?: string;
      city?: string;
      state?: string;
      country?: string;
      postalCode?: string;
      coordinates?: {
        latitude: number;
        longitude: number;
      };
    };
    
    // Virtual meeting details (for online services)
    virtualMeetingDetails?: {
      platform: string; // Zoom, Google Meet, etc.
      joinLink?: string;
      password?: string;
    };
    
    // Administrative
    createdAt?: Date;
    updatedAt?: Date;
  }
 

  export interface RequestBody_Update {
    // Basic info
    name?: string;
    description?: string[]; // Array of description points
    shortDescription?: string; // Brief summary for cards/listings
    
    // Media
    media?: File | File[]; // Support for multiple images/videos
    
    // Categorization
    category?: string; // Main category (e.g., "Yoga", "Meditation", "Breathing")
    tags?: string[]; // Additional tags for searchability
    
    // Pricing
    price?: string; // Base price
    currency?: string; // USD, EUR, etc.
    discountPrice?: string; // Optional sale price
    
    // Scheduling
    duration?: number; // Length in minutes
    
    // Instructor/provider info
    instructorId?: string;
    instructorName?: string;
    instructorBio?: string;
    
    // Booking/availability
    availableDays?: string[]; // e.g., ["Monday", "Wednesday", "Friday"]
    availableTimeSlots?: string[]; // e.g., ["09:00", "14:00", "18:00"]
    leadTimeHours?: number; // How many hours in advance booking is required
    cancellationPolicy?: string;
    
    // Flags
    featured?: string;
    isActive?: string;
    isOnline?: string; // Virtual vs in-person
    isRecurring?: string; // One-time vs recurring
    
    // Location (for in-person services)
    location?: {
      address?: string;
      city?: string;
      state?: string;
      country?: string;
      postalCode?: string;
      coordinates?: {
        latitude: number;
        longitude: number;
      };
    };
    
    // Virtual meeting details (for online services)
    virtualMeetingDetails?: {
      platform: string; // Zoom, Google Meet, etc.
      joinLink?: string;
      password?: string;
    };
    
 
    // Administrative
    createdAt?: Date;
    updatedAt?: Date;
  }


export interface SignUpDTO {
   name: string;
   phoneOrEmail: string;
   is_agreed_to_terms: boolean;
   is_verified: boolean;
}


export interface SignInDTO {
   phoneOrEmail: string;
}


export interface VerifyOtpDTO {
   phoneOrEmail: string;
   otp: string;
}

export interface JWTKeysConfig {
   secretKey: string;
   accessTokenExpiry: string;
   refreshTokenExpiry: string;
}


export interface CreateBookingInput {
  userId: string;
  serviceId: string;
  date: Date;
  timeSlot: string;
  paymentId: string;
  email: string;
}

export interface ITimeSlot {
    startTime: string; // HH:mm format
    endTime: string;   // HH:mm format
}

export interface ICreateInBulkAvailablityInput {
    dates: string[];
    isBookable: boolean;
    timeSlots: ITimeSlot[];
}


export interface IPaymentConfig {
    keyId: string;
    keySecret: string;
    webhookSecret?: string;
}

export interface IOrderParams {
    userId: string;
    serviceId: string;
}

// Razorpay (orderID, paymentID, client Signature)
export interface IVerifyPaymentParams {
    orderId: string;    
    paymentId: string;  
    signature: string;
    userId: string;
    serviceId: string;
    date: Date;
    timeSlot: string;  
    email: string;
    amount: string;
    currency: string;
    status: string;
}

export interface ICreateCustomerParams {
    name: string;
    email_or_phone: string;
    notes?: Record<string, string>;
}

export interface IPaymentDetails {
    id: string;
    entity: string;
    amount: number | string;
    currency: string;
    status: string;
    order_id: string;
    method: string;
    created_at: number;
}

export interface IWebhookEvent {
    entity: string;
    account_id: string;
    event: WebhookEventType;
    contains: string[];
    payload: {
        payment?: any;
        order?: any;
        refund?: any;
    };
    created_at: number;
}

export interface RefreshTokenDTO {
  refreshToken: string;
}

export interface AdminCreateUserDTO {
  name: string;
  phoneOrEmail: string;
  planId?: string;
  memberEmails?: string[]; // For backward compatibility
  beneficiaries?: Array<{ name: string; email: string }>; // New format with names
  paymentStatus?: 'PENDING' | 'PAID' | 'REFUNDED' | 'FAILED';
}
