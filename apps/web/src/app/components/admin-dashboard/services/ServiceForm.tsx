"use client"

import { useState } from "react"
import { useForm, Controller, Resolver } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useRouter } from "next/navigation"
import { ChevronRight, Check, Info } from "lucide-react"
import { PrimaryButton as Button } from "@/app/components/ui/buttons/PrimaryButton"
import { Input } from "@/app/components/ui/input/input"
import { Textarea } from "@/app/components/ui/textarea/textarea"
import { BulletPointsInput } from "@/app/components/ui/bullet-points-input/bullet-points-input"
import { Label } from "@/app/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/components/ui/select/select"
import { Switch } from "@/app/components/ui/switch/switch"
import { Separator } from "@/app/components/ui/separator/separator"
import { Card, CardContent } from "@/app/components/ui/card/Card"
import { toast } from "@/app/components/ui/toast/use-toast"
import { cn } from "@/lib/utils"
import { FileUploader } from "@/app/components/ui/file-uploader/file-uploader"
import { LocationPicker } from "@/app/components/ui/location-picker/location-picker"
import { TagInput } from "@/app/components/ui/tag-input/tag-input"
import { SubmitHandler } from "react-hook-form"
import { SecondaryButton } from "../../ui/buttons/SecondaryButton"
import { createService } from "@/app/api/services"
// Define the form schema using Zod
const serviceFormSchema = z.object({
  // Basic info
  name: z.string().min(3, { message: "Name must be at least 3 characters" }),
  description: z.array(z.string()).min(1, { message: "At least one description point is required" }),
  shortDescription: z.string().optional(),

  // Media
  media: z.any().refine((files) => files && files.length > 0, { message: "At least one image is required" }),

  // Categorization
  category: z.string().min(1, { message: "Category is required" }),
  tags: z.array(z.string()).optional(),

  // Pricing
  price: z.string().min(1, { message: "Price is required" }),
  currency: z.string().default("INR"),
  discountPrice: z.string().optional(),

  // Scheduling
  duration: z.number().min(15, { message: "Duration must be at least 15 minutes" }),

  // Instructor info
  instructorId: z.string().optional(),
  instructorName: z.string().optional(),
  instructorBio: z.string().optional(),

  cancellationPolicy: z.string().optional(),

  // Flags
  featured: z.boolean().default(false),
  isActive: z.boolean().default(true),
  isOnline: z.boolean().default(false),
  isRecurring: z.boolean().default(false),

  // Location
  location: z
    .object({
      address: z.string().optional(),
      city: z.string().optional(),
      state: z.string().optional(),
      country: z.string().optional(),
      postalCode: z.string().optional(),
      coordinates: z
        .object({
          latitude: z.number().optional(),
          longitude: z.number().optional(),
        })
        .optional(),
    })
    .optional(),

  // Virtual meeting details
  virtualMeetingDetails: z
    .object({
      platform: z.string().optional(),
      joinLink: z.string().optional(),
      password: z.string().optional(),
    })
    .optional(),
})

type ServiceFormValues = z.infer<typeof serviceFormSchema>

interface LocationData {
  address?: string
  city?: string
  state?: string
  country?: string
  postalCode?: string
  coordinates?: {
    latitude?: number
    longitude?: number
  }
}

const formSteps = [
  { id: "basic", label: "Basic Info" },
  { id: "media", label: "Media" },
  { id: "pricing", label: "Pricing" },
  { id: "scheduling", label: "Scheduling" },
  { id: "location", label: "Location" },
  { id: "settings", label: "Settings" },
]

export function ServiceForm({ initialData }: { initialData?: unknown }) {
  const [currentStep, setCurrentStep] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()

  // Set up form with react-hook-form and zod validation
  const form = useForm<ServiceFormValues>({
    resolver: zodResolver(serviceFormSchema) as Resolver<ServiceFormValues>,
    defaultValues: initialData || {
      name: "",
      description: [],
      shortDescription: "",
      media: [],
      category: "",
      tags: [],
      price: "",
      currency: "INR",
      discountPrice: "",
      duration: 15,
      instructorName: "",
      instructorBio: "",
      cancellationPolicy: "",
      featured: false,
      isActive: true,
      isOnline: false,
      isRecurring: false,
      location: {
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
      virtualMeetingDetails: {
        platform: "",
        joinLink: "",
        password: "",
      },
    },
  })


  // Handle form submission
  const onSubmit: SubmitHandler<ServiceFormValues> = async (data) => {
    setIsSubmitting(true)
    try {
      const formData = new FormData();
      
      // Add basic info
      formData.append("name", data.name);
      formData.append("description", JSON.stringify(data.description));
      if (data.shortDescription) formData.append("shortDescription", data.shortDescription);
      
      // Add categorization
      formData.append("category", data.category);
      if (data.tags && data.tags.length > 0) {
        formData.append("tags", JSON.stringify(data.tags));
      }
      
      // Add pricing
      formData.append("price", data.price);
      formData.append("currency", data.currency);
      if (data.discountPrice) formData.append("discountPrice", data.discountPrice);
      
      // Add scheduling
      formData.append("duration", data.duration.toString());
      
      // Add instructor details
      if (data.instructorName) formData.append("instructorName", data.instructorName);
      if (data.instructorBio) formData.append("instructorBio", data.instructorBio);
      if (data.cancellationPolicy) formData.append("cancellationPolicy", data.cancellationPolicy);
      
      // Add settings
      formData.append("featured", data.featured.toString());
      formData.append("isActive", data.isActive.toString());
      formData.append("isOnline", data.isOnline.toString());
      formData.append("isRecurring", data.isRecurring.toString());
      
      // Add location or virtual meeting details
      if (data.isOnline && data.virtualMeetingDetails) {
        formData.append("virtualMeetingDetails", JSON.stringify({
          platform: data.virtualMeetingDetails.platform,
          joinLink: data.virtualMeetingDetails.joinLink,
          password: data.virtualMeetingDetails.password
        }));
      } else if (data.location) {
        formData.append("location", JSON.stringify({
          address: data.location.address,
          city: data.location.city,
          state: data.location.state,
          country: data.location.country,
          postalCode: data.location.postalCode,
          coordinates: data.location.coordinates
        }));
      }
      
      // Add media files
      if (data.media && data.media.length > 0) {
        data.media.forEach((file: File) => {
          formData.append("media", file);
        });
      }

      await createService(formData)

      toast({
        variant: "default",
        title: "Service created successfully!",
        description: `${data.name} has been added to your services.`,
      })

      // Redirect to services list
      router.push("/admin-dashboard/services")
    } catch (error) {
      console.error("Error submitting form:", error)
      toast({
        title: "Error creating service",
        description: "There was a problem creating your service. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Navigation between form steps
  const nextStep = () => {
    const fieldsToValidate = getFieldsForStep(currentStep)
    form.trigger(fieldsToValidate as (keyof ServiceFormValues)[]).then((isValid) => {
      if (isValid) {
        setCurrentStep((prev) => Math.min(prev + 1, formSteps.length - 1))
        window.scrollTo(0, 0)
      }
    })
  }

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0))
    window.scrollTo(0, 0)
  }

  // Get fields that need validation for the current step
  const getFieldsForStep = (step: number): (keyof ServiceFormValues)[] => {
    switch (step) {
      case 0: // Basic Info
        return ["name", "description", "shortDescription", "category", "tags"]
      case 1: // Media
        return ["media"]
      case 2: // Pricing
        return ["price", "currency", "discountPrice"]
      case 3: // Scheduling
        return ["duration"]
      case 4: // Location
        return form.watch("isOnline") ? ["virtualMeetingDetails", "instructorName", "instructorBio", "cancellationPolicy"] : ["location", "instructorName", "instructorBio", "cancellationPolicy"]
      case 5: // Settings
        return ["featured", "isActive", "isOnline", "isRecurring"]
      default:
        return []
    }
  }

  // Handle location selection
  const handleLocationSelect = (location: LocationData) => {
    form.setValue("location", {
      ...form.getValues("location"),
      address: location.address,
      city: location.city,
      state: location.state,
      country: location.country,
      postalCode: location.postalCode,
      coordinates: {
        latitude: location.coordinates?.latitude,
        longitude: location.coordinates?.longitude,
      },
    })
  }

  // Categories for dropdown
  const categories = [
    "Yoga",
    "Meditation",
    "Ayurveda",
    "Bridal Package",
    "Naturopathy",
    "Reiki",
    "Sound",
    "Acupressure",
    "Food",
    "Hammam",
    "Other",
  ]

  return (
    <div className="mx-auto max-w-3xl">
      {/* Progress indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {formSteps.map((step, index) => (
            <div
              key={step.id}
              className={cn("flex flex-col items-center", index <= currentStep ? "text-emerald-600" : "text-gray-400")}
            >
              <div
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full border-2",
                  index < currentStep
                    ? "border-emerald-600 bg-emerald-600 text-white"
                    : index === currentStep
                      ? "border-emerald-600 text-emerald-600"
                      : "border-gray-300 text-gray-400",
                )}
              >
                {index < currentStep ? <Check className="h-4 w-4" /> : index + 1}
              </div>
              <span className="mt-1 hidden text-xs sm:block">{step.label}</span>
            </div>
          ))}
        </div>
        <div className="mt-2 grid grid-cols-6 gap-1">
          {formSteps.map((_, index) => (
            <div
              key={index}
              className={cn("h-1 rounded-full", index <= currentStep ? "bg-emerald-600" : "bg-gray-200")}
            />
          ))}
        </div>
      </div>

      <form onSubmit={form.handleSubmit((data) => onSubmit(data as unknown as ServiceFormValues))}>
        {/* Step 1: Basic Info */}
        {currentStep === 0 && (
          <div className="space-y-6">
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Basic Information</h2>
              <p className="text-sm text-gray-500">Provide the essential details about your wellness service.</p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">
                  Service Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  placeholder="e.g., Mindful Yoga Flow"
                  {...form.register("name")}
                  className={cn(form.formState.errors.name && "border-red-500")}
                />
                {form.formState.errors.name && (
                  <p className="text-xs text-red-500">{form.formState.errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="shortDescription">Short Description</Label>
                <Input
                  id="shortDescription"
                  placeholder="Brief summary for listings (optional)"
                  {...form.register("shortDescription")}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">
                  Service Description Points <span className="text-red-500">*</span>
                </Label>
                <Controller
                  name="description"
                  control={form.control}
                  render={({ field }) => (
                    <BulletPointsInput
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Add a description point..."
                      error={!!form.formState.errors.description}
                      maxPoints={10}
                    />
                  )}
                />
                {form.formState.errors.description && (
                  <p className="text-xs text-red-500">{form.formState.errors.description.message}</p>
                )}
                <p className="text-xs text-gray-500">Add key points about your service. Each point will be displayed as a bullet point.</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">
                  Category <span className="text-red-500">*</span>
                </Label>
                <Controller
                  name="category"
                  control={form.control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className={cn(form.formState.errors.category && "border-red-500")}>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {form.formState.errors.category && (
                  <p className="text-xs text-red-500">{form.formState.errors.category.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="tags">Tags <span className="text-xs text-gray-500">(comma seprated)</span></Label>
                <Controller
                  name="tags"
                  control={form.control}
                  render={({ field }) => (
                    <TagInput
                      placeholder="Add tags and press Enter"
                      tags={Array.isArray(field.value) ? field.value : []}
                      setTags={(newTags) => field.onChange(newTags)}
                    />
                  )}
                />
                <p className="text-xs text-gray-500">Add relevant tags to improve searchability</p>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Media */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Media</h2>
              <p className="text-sm text-gray-500">
                Upload images that showcase your service. You can add multiple images.
              </p>
            </div>

            <div className="space-y-4">
              <Controller
                name="media"
                control={form.control}
                render={({ field }) => (
                  <FileUploader
                    value={field.value}
                    onChange={field.onChange}
                    maxFiles={5}
                    maxSize={5 * 1024 * 1024} // 5MB
                    accept={{
                      "image/*": [".png", ".jpg", ".jpeg", ".webp"],
                    }}
                  />
                )}
              />
              {form.formState.errors.media && (
                <p className="text-xs text-red-500">{form.formState.errors.media.message as string}</p>
              )}
            </div>
          </div>
        )}

        {/* Step 3: Pricing */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Pricing</h2>
              <p className="text-sm text-gray-500">Set your pricing structure and options.</p>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">
                    Price <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="price"
                    type="text"
                    placeholder="e.g., 99.99"
                    {...form.register("price")}
                    className={cn(form.formState.errors.price && "border-red-500")}
                  />
                  {form.formState.errors.price && (
                    <p className="text-xs text-red-500">{form.formState.errors.price.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Controller
                    name="currency"
                    control={form.control}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select currency" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="INR">INR (₹)</SelectItem>
                          <SelectItem value="USD">USD ($)</SelectItem>
                          <SelectItem value="EUR">EUR (€)</SelectItem>
                          <SelectItem value="GBP">GBP (£)</SelectItem>
                          <SelectItem value="CAD">CAD ($)</SelectItem>
                          <SelectItem value="AUD">AUD ($)</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
              </div>


              <div className="space-y-2">
                <Label htmlFor="discountPrice">Discount Price (Optional)</Label>
                <Input id="discountPrice" type="text" placeholder="e.g., 79.99" {...form.register("discountPrice")} />
                <p className="text-xs text-gray-500">Leave empty if no discount applies</p>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Scheduling */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Scheduling</h2>
              <p className="text-sm text-gray-500">Define the duration and session type for your service.</p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="duration">
                  Duration (minutes) <span className="text-red-500">*</span>
                </Label>
                <Controller
                  name="duration"
                  control={form.control}
                  render={({ field }) => (
                    <Select
                      onValueChange={(value) => field.onChange(Number.parseFloat(value))}
                      value={field.value?.toString()}
                    >
                      <SelectTrigger className={cn(form.formState.errors.duration && "border-red-500")}>
                        <SelectValue placeholder="Select duration" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="15">15 minutes</SelectItem>
                        <SelectItem value="30">30 minutes</SelectItem>
                        <SelectItem value="45">45 minutes</SelectItem>
                        <SelectItem value="60">1 hour</SelectItem>
                        <SelectItem value="90">1.5 hours</SelectItem>
                        <SelectItem value="120">2 hours</SelectItem>
                        <SelectItem value="180">3 hours</SelectItem>
                        <SelectItem value="240">4 hours</SelectItem>
                        <SelectItem value="300">5 hours</SelectItem>
                        <SelectItem value="360">6 hours</SelectItem>
                        <SelectItem value="420">7 hours</SelectItem>
                        <SelectItem value="480">8 hours</SelectItem>
                        <SelectItem value="540">9 hours</SelectItem>
                        <SelectItem value="600">10 hours</SelectItem>
                        <SelectItem value="1440">1 day</SelectItem>
                        <SelectItem value="10080">1 week</SelectItem>
                        <SelectItem value="40320">1 month</SelectItem>
                        <SelectItem value="120960">3 month</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {form.formState.errors.duration && (
                  <p className="text-xs text-red-500">{form.formState.errors.duration.message}</p>
                )}
              </div>

                      </div>
                      </div>
        )}


        {/* Step 5: Location */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Location</h2>
              <p className="text-sm text-gray-500">Specify where your service will take place.</p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Controller
                  name="isOnline"
                  control={form.control}
                  render={({ field }) => (
                    <Switch checked={field.value} onCheckedChange={field.onChange} id="isOnline" />
                  )}
                />
                <Label htmlFor="isOnline">This is an online service</Label>
              </div>

              {form.watch("isOnline") ? (
                <Card>
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="platform">
                          Platform <span className="text-red-500">*</span>
                        </Label>
                        <Controller
                          name="virtualMeetingDetails.platform"
                          control={form.control}
                          render={({ field }) => (
                            <Select onValueChange={field.onChange} value={field.value}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select platform" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Zoom">Zoom</SelectItem>
                                <SelectItem value="Google Meet">Google Meet</SelectItem>
                                <SelectItem value="Microsoft Teams">Microsoft Teams</SelectItem>
                                <SelectItem value="Skype">Skype</SelectItem>
                                <SelectItem value="Other">Other</SelectItem>
                              </SelectContent>
                            </Select>
                          )}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="joinLink">Join Link</Label>
                        <Input
                          id="joinLink"
                          placeholder="e.g., https://zoom.us/j/123456789"
                          {...form.register("virtualMeetingDetails.joinLink")}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="password">Meeting Password</Label>
                        <Input
                          id="password"
                          placeholder="e.g., 123456"
                          {...form.register("virtualMeetingDetails.password")}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  <LocationPicker onLocationSelect={handleLocationSelect} />

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="address">Address</Label>
                      <Input id="address" placeholder="Street address" {...form.register("location.address")} />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="city">City</Label>
                      <Input id="city" placeholder="City" {...form.register("location.city")} />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="state">State/Province</Label>
                      <Input id="state" placeholder="State/Province" {...form.register("location.state")} />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="postalCode">Postal Code</Label>
                      <Input id="postalCode" placeholder="Postal code" {...form.register("location.postalCode")} />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="country">Country</Label>
                      <Input id="country" placeholder="Country" {...form.register("location.country")} />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="latitude">Latitude</Label>
                      <Input
                        id="latitude"
                        placeholder="e.g., 37.7749"
                        {...form.register("location.coordinates.latitude", {
                          setValueAs: (v) => (v === "" ? undefined : Number.parseFloat(v)),
                        })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="longitude">Longitude</Label>
                      <Input
                        id="longitude"
                        placeholder="e.g., -122.4194"
                        {...form.register("location.coordinates.longitude", {
                          setValueAs: (v) => (v === "" ? undefined : Number.parseFloat(v)),
                        })}
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Instructor Information</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="instructorName">Instructor Name</Label>
                  <Input id="instructorName" placeholder="e.g., Jane Smith" {...form.register("instructorName")} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="instructorBio">Instructor Bio</Label>
                  <Textarea
                    id="instructorBio"
                    placeholder="Brief bio of the instructor"
                    rows={3}
                    {...form.register("instructorBio")}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cancellationPolicy">Cancellation Policy</Label>
                  <Textarea
                    id="cancellationPolicy"
                    placeholder="Describe your cancellation policy"
                    rows={3}
                    {...form.register("cancellationPolicy")}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 6: Settings */}
        {currentStep === 5 && (
          <div className="space-y-6">
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Settings</h2>
              <p className="text-sm text-gray-500">Configure additional settings for your service.</p>
            </div>

            <div className="space-y-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="featured" className="text-base">
                          Featured Service
                        </Label>
                        <p className="text-sm text-gray-500">Featured services appear prominently on your website</p>
                      </div>
                      <Controller
                        name="featured"
                        control={form.control}
                        render={({ field }) => (
                          <Switch checked={field.value} onCheckedChange={field.onChange} id="featured" />
                        )}
                      />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="isActive" className="text-base">
                          Active
                        </Label>
                        <p className="text-sm text-gray-500">Inactive services won&apos;t be visible to customers</p>
                      </div>
                      <Controller
                        name="isActive"
                        control={form.control}
                        render={({ field }) => (
                          <Switch checked={field.value} onCheckedChange={field.onChange} id="isActive" />
                        )}
                      />
                    </div>
                    {/* <Separator />
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="isRecurring" className="text-base">
                          Recurring Service
                        </Label>
                        <p className="text-sm text-gray-500">Service repeats on a regular schedule</p>
                      </div>
                      <Controller
                        name="isRecurring"
                        control={form.control}
                        render={({ field }) => (
                          <Switch checked={field.value} onCheckedChange={field.onChange} id="isRecurring" />
                        )}
                      />
                    </div> */}
                  </div>
                </CardContent>
              </Card>

              <div className="rounded-lg border bg-amber-50 p-4">
                <div className="flex items-start gap-3">
                  <Info className="mt-0.5 h-5 w-5 text-amber-600" />
                  <div>
                    <h4 className="font-medium text-amber-800">Ready to publish?</h4>
                    <p className="mt-1 text-sm text-amber-700">
                      Review all information before submitting. You can edit this service later.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation buttons */}
        <div className="mt-8 flex justify-between">
            <SecondaryButton type="button" onClick={prevStep} disabled={currentStep === 0} className="gap-1">
            Previous
          </SecondaryButton>

          {currentStep < formSteps.length - 1 ? (
            <Button 
              type="button" 
              onClick={(e) => {
                e.preventDefault();
                nextStep();
              }} 
              className="gap-1"
            >
              Next <ChevronRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Service"}
            </Button>
          )}
        </div>
      </form>
    </div>
  )
}