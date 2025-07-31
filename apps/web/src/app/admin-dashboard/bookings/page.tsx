"use client";
import { useEffect, useState } from "react";
import { getBookings } from "@/app/api/booking";
import { fetchAllSubscribedMemberships, SubscribedMembership } from "@/app/api/admin";
import { Loader2, Search, Calendar, Clock, CreditCardIcon, User2, Eye } from "lucide-react";
import { Badge } from "@/app/components/badge/badge";
import { Input } from "@/app/components/ui/input/input";
import { Table, TableRow, TableHeader, TableHead, TableBody, TableCell } from "@/app/components/ui/table/table";
import { useToast } from "@/app/components/ui/toast/use-toast";
import { ToastProvider } from "@/app/components/ui/toast/toast";
import { format } from "date-fns";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/app/components/ui/tabs/tabs";
import { BookingDetailModal } from "@/app/components/admin-dashboard/booking-modal/booking";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/app/components/ui/select/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/app/components/ui/dialog/Dialog";
import { SecondaryButton } from "@/app/components/ui/buttons";
import { MoreHorizontal, FileText, Check, X as XIcon, AlertCircle } from "lucide-react";
import { Button } from "@/app/components/ui/Button";

// --- Membership Modal ---
function MembershipDetailModal({ isOpen, membership, onClose }: { isOpen: boolean, membership: SubscribedMembership | null, onClose: () => void }) {
  if (!membership) return null;

  function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  function formatTimestamp(dateString: string): string {
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function renderStatusBadge(isActive: boolean) {
    let variant: "default" | "destructive" = isActive ? "default" : "destructive";
    let icon = isActive ? <Check className="mr-1 h-3 w-3" /> : <XIcon className="mr-1 h-3 w-3" />;
    return (
      <Badge variant={variant} className="flex items-center py-2 px-4">
        {icon}
        {isActive ? "Active" : "Inactive"}
      </Badge>
    );
  }

  function renderPrimaryBadge(isPrimary: boolean) {
    let variant: "default" | "secondary" = isPrimary ? "default" : "secondary";
    return (
      <Badge variant={variant} className="flex items-center py-2 px-4">
        {isPrimary ? "Primary" : "Secondary"}
      </Badge>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] w-[95vw] overflow-y-auto sm:max-w-[600px] [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
        <DialogHeader className="sticky top-2 z-50 bg-white/20 backdrop-blur-md pl-6 pr-4 border border-solid border-gray-200 rounded-full py-3">
          <div className="flex items-center  justify-between">
            <DialogTitle>Membership Details</DialogTitle>
            <div className="flex items-center gap-2">
              {renderStatusBadge(membership.isActive)}
              {renderPrimaryBadge(membership.isPrimary)}
            </div>
          </div>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          <div className="rounded-lg border bg-gray-50 p-4">
            <div className="text-xs font-medium uppercase text-gray-500">Membership ID</div>
            <div className="mt-1 font-mono text-sm break-all">{membership.id}</div>
            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-gray-500">
              <div>
                <div className="font-medium">Created</div>
                <div>{formatTimestamp(membership.createdAt)}</div>
              </div>
              <div>
                <div className="font-medium">Last Scan</div>
                <div>{membership.lastScanTime ? formatTimestamp(membership.lastScanTime) : "—"}</div>
              </div>
            </div>
          </div>
          <div className="grid gap-6 sm:gap-4 grid-cols-1 sm:grid-cols-2">
            <div className="space-y-4">
              <div>
                <div className="mb-1 text-sm font-medium text-gray-500">User</div>
                <div className="flex flex-col">
                  <span className="font-medium">{membership.user?.name}</span>
                  <span className="text-xs text-gray-500">{membership.user?.phone_or_email}</span>
                </div>
              </div>
              <div>
                <div className="mb-1 text-sm font-medium text-gray-500">Plan ID</div>
                <div className="font-mono text-xs">{membership.planId}</div>
              </div>
              <div>
                <div className="mb-1 text-sm font-medium text-gray-500">Parent Membership</div>
                <div className="font-mono text-xs">{membership.parentMembershipId || "—"}</div>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <div className="mb-1 text-sm font-medium text-gray-500">Start Date</div>
                <div>{formatDate(membership.startDate)}</div>
              </div>
              <div>
                <div className="mb-1 text-sm font-medium text-gray-500">End Date</div>
                <div>{formatDate(membership.endDate)}</div>
              </div>
              <div>
                <div className="mb-1 text-sm font-medium text-gray-500">Counter</div>
                <div>{membership.counter}</div>
              </div>
            </div>
          </div>
        </div>
        {/* <DialogFooter className="sticky bottom-0 bg-white/20 backdrop-blur-md py-4 px-6 border border-solid border-gray-200 rounded-full mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-between">
          <SecondaryButton onClick={onClose}>Close</SecondaryButton>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button className=" bg-destructive hover:bg-red-600 rounded-full  ">Cancel Membership</Button>
          </div>
        </DialogFooter> */}
       
      </DialogContent>
    </Dialog>
  );
}

export default function Page() {
  const { toast } = useToast();
  const [tab, setTab] = useState("bookings");

  // Bookings state
  const [bookings, setBookings] = useState<any[]>([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [bookingStatusFilter, setBookingStatusFilter] = useState("all");
  const [bookingPaymentFilter, setBookingPaymentFilter] = useState("all");
  const [bookingSearch, setBookingSearch] = useState("");
  const [selectedBooking, setSelectedBooking] = useState<any | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  // Memberships state
  const [memberships, setMemberships] = useState<SubscribedMembership[]>([]);
  const [membershipsLoading, setMembershipsLoading] = useState(false);
  const [membershipStatusFilter, setMembershipStatusFilter] = useState("all");
  const [membershipPrimaryFilter, setMembershipPrimaryFilter] = useState("all");
  const [membershipSearch, setMembershipSearch] = useState("");
  const [selectedMembership, setSelectedMembership] = useState<SubscribedMembership | null>(null);
  const [isMembershipModalOpen, setIsMembershipModalOpen] = useState(false);

  // Fetch bookings
  useEffect(() => {
    setBookingsLoading(true);
    getBookings()
      .then((data) => setBookings(data))
      .finally(() => setBookingsLoading(false));
  }, []);

  // Fetch memberships
  useEffect(() => {
    setMembershipsLoading(true);
    fetchAllSubscribedMemberships()
      .then((data) => setMemberships(data))
      .finally(() => setMembershipsLoading(false));
  }, []);

  // Bookings filter logic
  const filteredBookings = bookings.filter((b) => {
    const matchesStatus = bookingStatusFilter === "all" || b.status === bookingStatusFilter;
    const matchesPayment = bookingPaymentFilter === "all" || b.payment_status === bookingPaymentFilter;
    const matchesSearch =
      b.user?.name?.toLowerCase().includes(bookingSearch.toLowerCase()) ||
      b.user?.email?.toLowerCase().includes(bookingSearch.toLowerCase());
    return matchesStatus && matchesPayment && matchesSearch;
  });

  // Memberships filter logic
  const filteredMemberships = memberships.filter((m) => {
    const matchesStatus = membershipStatusFilter === "all" || (membershipStatusFilter === "active" ? m.isActive : !m.isActive);
    const matchesPrimary = membershipPrimaryFilter === "all" || (membershipPrimaryFilter === "primary" ? m.isPrimary : !m.isPrimary);
    const matchesSearch =
      m.user?.name?.toLowerCase().includes(membershipSearch.toLowerCase()) ||
      m.user?.phone_or_email?.toLowerCase().includes(membershipSearch.toLowerCase());
    return matchesStatus && matchesPrimary && matchesSearch;
  });

  // Service name fallback
  const getServiceName = (serviceId: string) => {
    const service = bookings.find((booking) => booking.service_id === serviceId);
    return service?.name || "N/A";
  };

  return (
    <div className="container mx-auto py-10">
      <ToastProvider />
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Admin: Bookings & Memberships</h1>
        <p className="text-muted-foreground mt-2">
          Manage and monitor all bookings and memberships in the system.
        </p>
      </div>
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="bookings">Bookings</TabsTrigger>
          <TabsTrigger value="memberships">Memberships</TabsTrigger>
        </TabsList>
        {/* Bookings Tab */}
        <TabsContent value="bookings">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between mb-4">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search by user name or email..."
                className="pl-9"
                value={bookingSearch}
                onChange={(e) => setBookingSearch(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Select value={bookingStatusFilter} onValueChange={setBookingStatusFilter}>
                <SelectTrigger className="w-[140px] bg-white">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="CANCELLED">Cancelled</SelectItem>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                </SelectContent>
              </Select>
              <Select value={bookingPaymentFilter} onValueChange={setBookingPaymentFilter}>
                <SelectTrigger className="w-[140px] bg-white">
                  <SelectValue placeholder="Payment" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Payments</SelectItem>
                  <SelectItem value="PAID">Paid</SelectItem>
                  <SelectItem value="FAILED">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="rounded-xl border bg-white shadow-sm">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Booking ID</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Service</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bookingsLoading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center">
                      <Loader2 className="h-4 w-4 animate-spin" />
                    </TableCell>
                  </TableRow>
                ) : filteredBookings.length > 0 ? (
                  filteredBookings.map((booking) => (
                    <TableRow key={booking.id}>
                      <TableCell>{booking.id.slice(0, 8)}...</TableCell>
                      <TableCell className="text-gray-500">{booking.user?.name || "N/A"}</TableCell>
                      <TableCell className="text-gray-500">{booking.service?.name || "N/A"}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5 text-gray-400" />
                          {format(new Date(booking.date), "dd MMM yyyy")}
                        </div>
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Clock className="h-3 w-3 text-gray-400" />
                          {booking.time_slot}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className="px-3"
                          variant={
                            booking.status === "CONFIRMED"
                              ? "default"
                              : booking.status === "PENDING"
                              ? "secondary"
                              : booking.status === "CANCELLED"
                              ? "destructive"
                              : "outline"
                          }
                        >
                          {booking.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className="px-3"
                          variant={
                            booking.payment_status === "PAID"
                              ? "default"
                              : booking.payment_status === "FAILED"
                              ? "destructive"
                              : "outline"
                          }
                        >
                          {booking.payment_status}
                        </Badge>
                      </TableCell>
                      <TableCell>₹{booking.total_amount}</TableCell>
                      <TableCell>
                        <button
                          className="bg-transparent rounded-xl hover:bg-gray-100 border border-solid border-gray-300 text-gray-500 p-2"
                          onClick={() => {
                            setSelectedBooking(booking);
                            setIsBookingModalOpen(true);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center">
                      No bookings found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          <BookingDetailModal
            isOpen={isBookingModalOpen}
            booking={selectedBooking}
            onClose={() => setIsBookingModalOpen(false)}
            getServiceName={getServiceName}
          />
        </TabsContent>
        {/* Memberships Tab */}
        <TabsContent value="memberships">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between mb-4">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search by user name or phone/email..."
                className="pl-9"
                value={membershipSearch}
                onChange={(e) => setMembershipSearch(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Select value={membershipStatusFilter} onValueChange={setMembershipStatusFilter}>
                <SelectTrigger className="w-[140px] bg-white">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
              <Select value={membershipPrimaryFilter} onValueChange={setMembershipPrimaryFilter}>
                <SelectTrigger className="w-[140px] bg-white">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="primary">Primary</SelectItem>
                  <SelectItem value="secondary">Secondary</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="rounded-xl border bg-white shadow-sm">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Membership ID</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Start</TableHead>
                  <TableHead>End</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Primary</TableHead>
                  <TableHead>Last Scan</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {membershipsLoading ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center">
                      <Loader2 className="h-4 w-4 animate-spin" />
                    </TableCell>
                  </TableRow>
                ) : filteredMemberships.length > 0 ? (
                  filteredMemberships.map((m) => (
                    <TableRow key={m.id}>
                      <TableCell>{m.id.slice(0, 8)}...</TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">{m.user?.name}</span>
                          <span className="text-xs text-gray-500">{m.user?.phone_or_email}</span>
                        </div>
                      </TableCell>
                      <TableCell>{m.planId.slice(0, 8)}...</TableCell>
                      <TableCell>{format(new Date(m.startDate), "dd MMM yyyy")}</TableCell>
                      <TableCell>{format(new Date(m.endDate), "dd MMM yyyy")}</TableCell>
                      <TableCell>
                        <Badge variant={m.isActive ? "default" : "destructive"}>
                          {m.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={m.isPrimary ? "default" : "secondary"}>
                          {m.isPrimary ? "Yes" : "No"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-xs text-gray-500">{m.lastScanTime ? format(new Date(m.lastScanTime), "dd MMM yyyy") : "—"}</span>
                      </TableCell>
                      <TableCell>
                        <button
                          className="bg-transparent rounded-xl hover:bg-gray-100 border border-solid border-gray-300 text-gray-500 p-2"
                          onClick={() => {
                            setSelectedMembership(m);
                            setIsMembershipModalOpen(true);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center">
                      No memberships found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          <MembershipDetailModal
            isOpen={isMembershipModalOpen}
            membership={selectedMembership}
            onClose={() => setIsMembershipModalOpen(false)}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}