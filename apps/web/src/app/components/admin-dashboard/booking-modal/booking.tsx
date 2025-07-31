"use client"

import {
  Calendar,
  Clock,
  CreditCard,
  User,
  Package,
  Receipt,
  AlertCircle,
  Check,
  X,
  FileText,
  MoreHorizontal,
} from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/app/components/ui/dialog/Dialog"
import { PrimaryButton as Button } from "@/app/components/ui/buttons/PrimaryButton"
import { Badge } from "@/app/components/badge/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/app/components/ui/dropdown/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/components/ui/select/select"
import { Separator } from "@/app/components/ui/separator/separator"
import { useState } from "react"
import { SecondaryButton } from "../../ui/buttons"

interface BookingDetailModalProps {
  isOpen: boolean
  booking: any
  onClose: () => void
  getServiceName: (serviceId: string) => string
}

export function BookingDetailModal({ isOpen, booking, onClose, getServiceName }: BookingDetailModalProps) {
  const [bookingStatus, setBookingStatus] = useState<string>("")

  // Set booking status when booking changes
  if (booking && booking.status !== bookingStatus) {
    setBookingStatus(booking.status)
  }

  if (!booking) return null

  // Format date to readable string
  function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  // Format timestamp to readable string
  function formatTimestamp(dateString: string): string {
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  // Render status badge with appropriate color
  function renderStatusBadge(status: string) {
    let variant: "default" | "secondary" | "destructive" | "outline" = "default"
    let icon = null

    switch (status) {
      case "CONFIRMED":
        variant = "default"
        icon = <Check className="mr-1 h-3 w-3" />
        break
      case "PENDING":
        variant = "secondary"
        icon = <Clock className="mr-1 h-3 w-3" />
        break
      case "CANCELLED":
        variant = "destructive"
        icon = <X className="mr-1 h-3 w-3" />
        break
      case "COMPLETED":
        variant = "outline"
        icon = <Check className="mr-1 h-3 w-3" />
        break
      default:
        variant = "outline"
        icon = <AlertCircle className="mr-1 h-3 w-3" />
    }

    return (
      <Badge variant={variant} className="flex items-center py-2 px-4">
        {icon}
        {status}
      </Badge>
    )
  }

  // Render payment status badge
  function renderPaymentBadge(status: string) {
    let variant: "default" | "secondary" | "destructive" | "outline" = "outline"

    switch (status) {
      case "PAID":
        variant = "default"
        break
      case "PENDING":
        variant = "secondary"
        break
      case "FAILED":
        variant = "destructive"
        break
      case "REFUNDED":
        variant = "outline"
        break
      default:
        variant = "outline"
    }

    return <Badge variant={variant} className="py-2 px-4">
        {status}
      </Badge>
  }

  // Handle status change
  function handleStatusChange(newStatus: string) {
    setBookingStatus(newStatus)
    // In a real app, you would call an API to update the booking status
    console.log(`Updating booking ${booking.id} status to ${newStatus}`)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] w-[95vw] overflow-y-auto sm:max-w-[600px] [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
        <DialogHeader className="sticky top-2 z-50 bg-white/20 backdrop-blur-md pl-6 pr-4 border border-solid border-gray-200 rounded-full py-3">
          <div className="flex items-center  justify-between">
            <DialogTitle>Booking Details</DialogTitle>
            <div className="flex items-center gap-2">
              {renderStatusBadge(booking.status)}
              {/* <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="icon" className="h-8 w-8 bg-transparent border border-solid border-gray-200 hover:bg-gray-100 rounded-full">
                    <MoreHorizontal className="h-4 w-4 text-gray-500" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    <FileText className="mr-2 h-4 w-4" />
                    Generate invoice
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Receipt className="mr-2 h-4 w-4" />
                    Send receipt
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu> */}
            </div>
          </div>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          {/* Booking ID and timestamps */}
          <div className="rounded-lg border bg-gray-50 p-4">
            <div className="text-xs font-medium uppercase text-gray-500">Booking ID</div>
            <div className="mt-1 font-mono text-sm break-all">{booking.id}</div>
            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-gray-500">
              <div>
                <div className="font-medium">Created</div>
                <div>{formatTimestamp(booking.created_at)}</div>
              </div>
              <div>
                <div className="font-medium">Last Updated</div>
                <div>{formatTimestamp(booking.updated_at)}</div>
              </div>
            </div>
          </div>

          {/* Booking details */}
          <div className="grid gap-6 sm:gap-4 grid-cols-1 sm:grid-cols-2">
            <div className="space-y-4">
              <div>
                <div className="mb-1 text-sm font-medium text-gray-500">Service</div>
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                  <span className="font-medium break-words text-xs">{getServiceName(booking.service_id)}</span>
                </div>
              </div>

              <div>
                <div className="mb-1 text-sm font-medium text-gray-500">Date & Time</div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                  <span className="break-words text-sm">{formatDate(booking.date)}</span>
                </div>
                <div className="mt-1 flex items-center gap-2">
                  <Clock className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                  <span className="text-xs text-gray-500">{booking.time_slot}</span>
                </div>
              </div>

              <div>
                <div className="mb-1 text-sm font-medium text-gray-500">Customer</div>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                  <span className="font-mono text-sm break-all">{booking.user_id}</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <div className="mb-1 text-sm font-medium text-gray-500">Payment Details</div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                    <span className="text-sm">₹{Number.parseInt(booking.total_amount)}</span>
                  </div>
                  {renderPaymentBadge(booking.payment_status)}
                </div>
                {booking.payment_intent_id && (
                  <div className="mt-1 pl-6 text-xs text-gray-500 break-all">{booking.payment_intent_id}</div>
                )}
              </div>

              {/* <div>
                <div className="mb-1 text-sm font-medium text-gray-500">Status Management</div>
                <Select value={bookingStatus} onValueChange={handleStatusChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                    <SelectItem value="CANCELLED">Cancelled</SelectItem>
                    <SelectItem value="COMPLETED">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div> */}

              {booking.invoice_id && (
                <div>
                  <div className="mb-1 text-sm font-medium text-gray-500">Invoice</div>
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                    <span className="font-mono text-sm break-all">{booking.invoice_id}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Timeline/Activity */}
          <div>
            <h3 className="mb-3 text-sm font-medium text-gray-500">Activity Timeline</h3>
            <div className="space-y-3">
              <div className="flex gap-3">
                <div className="relative flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 flex-shrink-0">
                  <Check className="h-3 w-3" />
                  <div className="absolute bottom-0 left-1/2 top-6 w-px -translate-x-1/2 bg-gray-200" />
                </div>
                <div>
                  <div className="text-sm font-medium">Booking confirmed</div>
                  <div className="text-xs text-gray-500">{formatTimestamp(booking.created_at)}</div>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="relative flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 flex-shrink-0">
                  <CreditCard className="h-3 w-3" />
                  <div className="absolute bottom-0 left-1/2 top-6 w-px -translate-x-1/2 bg-gray-200" />
                </div>
                <div>
                  <div className="text-sm font-medium">Payment received</div>
                  <div className="text-xs text-gray-500">{formatTimestamp(booking.created_at)}</div>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-100 text-gray-400 flex-shrink-0">
                  <Calendar className="h-3 w-3" />
                </div>
                <div>
                  <div className="text-sm font-medium">Appointment scheduled</div>
                  <div className="text-xs text-gray-500">
                    {formatDate(booking.date)} at {booking.time_slot}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* <DialogFooter className="sticky bottom-0 bg-white/20 backdrop-blur-md py-4 px-6 border border-solid border-gray-200 rounded-full mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-between">
          <SecondaryButton  onClick={onClose}>Close</SecondaryButton>
          
        </DialogFooter> */}
      </DialogContent>
    </Dialog>
  )
}
