"use client"
import { useAuth } from "@/app/hooks/useAuth";
import { useEffect, useState } from "react";
import { Input } from "@/app/components/ui/input/input";
import { PrimaryButton as Button, PrimaryButton } from "@/app/components/ui/buttons/PrimaryButton";
import { Avatar, AvatarFallback, AvatarImage } from "@/app/components/ui/avatar/Avatar";
import { format } from "date-fns";
import { Loader2, Trash2, Search, SlidersHorizontal, Plus, X, Edit, User } from "lucide-react";
import { useToast } from "@/app/components/ui/toast/use-toast";
import { ToastProvider } from "@/app/components/ui/toast/toast";    
import { deleteUser, fetchUsers, updateUser } from "@/app/api/user";
import { Badge } from "@/app/components/badge/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/app/components/ui/dropdown/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/app/components/ui/dialog/Dialog";
import { SecondaryButton } from "@/app/components/ui/buttons/SecondaryButton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/app/components/ui/table/table";
import { adminCreateUser, verifyAdminCreateUserOtp, removeMembershipFromUser, deactivateUserMemberships, cancelUserBooking, updateMembershipPaymentStatus, assignMembershipToUser, sendBeneficiaryOtp, verifyBeneficiaryOtp } from "@/app/api/admin";
import { fetchMembershipPlans } from "@/app/api/memberships";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/components/ui/select/select";
import { Label } from "@/app/components/ui/label";

interface User {
  id: string;
  phone_or_email: string;
  avatar: string | null;
  name: string;
  username: string;
  date_of_birth: string;
  role: string;
  created_at: string;
  updated_at: string;
  is_verified?: boolean;
  is_agreed_to_terms?: boolean;
  memberships?: {
    id: string;
    planId: string;
    isActive: boolean;
    isPrimary?: boolean;
    parentMembershipId?: string | null;
    plan?: {
      name: string;
    };
    memberMemberships?: {
      id: string;
      userId: string;
      user: {
        id: string;
        name: string;
        phone_or_email: string;
      };
    }[];
    payments?: {
      id: string;
      status: string;
      amount: number;
    }[];
  }[];
  bookings?: {
    id: string;
    service: {
      name: string;
    };
  }[];
}

interface MembershipPlan {
  id: string;
  name: string;
  durationYears: number;
  maxMembers: number;
  renewalPeriodYears: number;
  cost: number;
  createdAt: string;
}

export default function UserPage() {
  const { user, loading } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Create user states
  const [isCreateUserModalOpen, setIsCreateUserModalOpen] = useState(false);
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const [membershipPlans, setMembershipPlans] = useState<MembershipPlan[]>([]);
  const [isBeneficiaryOtpModalOpen, setIsBeneficiaryOtpModalOpen] = useState(false);
  const [currentBeneficiaryIndex, setCurrentBeneficiaryIndex] = useState<number | null>(null);
  const [beneficiaryOtpInput, setBeneficiaryOtpInput] = useState("");
  const [primaryMembershipId, setPrimaryMembershipId] = useState<string>("");
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingBeneficiary, setIsVerifyingBeneficiary] = useState(false);
  
  // Edit user states
  const [isEditUserModalOpen, setIsEditUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isEditingUser, setIsEditingUser] = useState(false);
  const [editUserName, setEditUserName] = useState("");
  const [editUserEmail, setEditUserEmail] = useState("");
  const [editUserRole, setEditUserRole] = useState("");
  const [editIsVerified, setEditIsVerified] = useState(false);
  const [editIsAgreedToTerms, setEditIsAgreedToTerms] = useState(false);
  const [editSelectedPlanId, setEditSelectedPlanId] = useState<string>("keep-current");
  
  // Form states
  const [newUserName, setNewUserName] = useState("");
  const [newUserEmail, setNewUserEmail] = useState("");
  const [selectedPlanId, setSelectedPlanId] = useState<string>("");
  const [beneficiaries, setBeneficiaries] = useState<Array<{ name: string; email: string; otp?: string; verified?: boolean }>>([]);
  const [paymentStatus, setPaymentStatus] = useState<'PENDING' | 'PAID' | 'REFUNDED' | 'FAILED'>('PENDING');
  const [primaryUserOtp, setPrimaryUserOtp] = useState("");
  const [showBeneficiaryOtp, setShowBeneficiaryOtp] = useState(false);
  const [currentVerifyingBeneficiaryIndex, setCurrentVerifyingBeneficiaryIndex] = useState<number | null>(null);
  const getUsers = async () => {
    try {
        const response = await fetchUsers();
        setUsers(response);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch users. Please try again later.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteUser = async (id: string) => {
    try {
      setIsLoading(true);
      setDeletingUserId(id);    
      const response = await deleteUser(id);
      setUsers(users.filter(user => user.id !== id));
      toast({
        title: "Success",
        description: "User deleted successfully",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete user. Please try again later.",
      });
    } finally {
      setIsLoading(false);
      setDeletingUserId(null);
    }
  };

  const loadMembershipPlans = async () => {
    try {
      const response = await fetchMembershipPlans();
      if (response.membershipPlans) {
        setMembershipPlans(response.membershipPlans);
      }
    } catch (error) {
      console.error('Error fetching membership plans:', error);
    }
  };

  const handleOpenCreateUserModal = () => {
    setIsCreateUserModalOpen(true);
    loadMembershipPlans();
  };

  const handleCloseCreateUserModal = () => {
    setIsCreateUserModalOpen(false);
    // Only clear if OTP modal is not about to open
    if (!isOtpModalOpen) {
      setNewUserName("");
      setNewUserEmail("");
      setSelectedPlanId("");
      setBeneficiaries([]);
      setPaymentStatus('PENDING');
    }
  };

  const handleCloseOtpModal = () => {
    setIsOtpModalOpen(false);
    setPrimaryUserOtp("");
    setPrimaryMembershipId("");
    setBeneficiaryOtpInput("");
    setCurrentBeneficiaryIndex(null);
    // Clear all form data when OTP modal is closed
    setNewUserName("");
    setNewUserEmail("");
    setSelectedPlanId("");
    setBeneficiaries([]);
    setPaymentStatus('PENDING');
  };

  const handleCreateUser = async () => {
    if (!newUserName || !newUserEmail) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Name and email are required",
      });
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newUserEmail)) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter a valid email address",
      });
      return;
    }

    // Validate beneficiaries
    const validBeneficiaries = beneficiaries.filter(b => b.name.trim() && b.email.trim());
    if (beneficiaries.some(b => (b.name.trim() && !b.email.trim()) || (!b.name.trim() && b.email.trim()))) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please provide both name and email for all beneficiaries",
      });
      return;
    }

    // Validate beneficiary email formats
    for (const beneficiary of validBeneficiaries) {
      if (!emailRegex.test(beneficiary.email)) {
        toast({
          variant: "destructive",
          title: "Error",
          description: `Invalid email format for beneficiary: ${beneficiary.name}`,
        });
        return;
      }
    }

    try {
      setIsCreatingUser(true);
      const response = await adminCreateUser({
        name: newUserName,
        phoneOrEmail: newUserEmail,
        planId: selectedPlanId || undefined,
        beneficiaries: validBeneficiaries,
        paymentStatus,
      });

      toast({
        title: "Success",
        description: "OTP sent to user's email",
      });

      // Close create user modal and open OTP modal with a slight delay
      setIsCreateUserModalOpen(false);
      setTimeout(() => {
        setIsOtpModalOpen(true);
      }, 100);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error?.response?.data?.message || "Failed to create user",
      });
    } finally {
      setIsCreatingUser(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!primaryUserOtp) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "OTP is required",
      });
      return;
    }

    try {
      setIsCreatingUser(true);
      const response = await verifyAdminCreateUserOtp({
        phoneOrEmail: newUserEmail,
        otp: primaryUserOtp,
      });

      toast({
        title: "Success",
        description: "Primary user created successfully",
      });

      // Store primary membership ID for beneficiary verification
      if (response.membership && response.membership.primaryMembershipId) {
        setPrimaryMembershipId(response.membership.primaryMembershipId);
      }

      // If there are beneficiaries, keep the modal open to verify them
      if (beneficiaries.length > 0 && response.beneficiariesPendingVerification) {
        toast({
          title: "Next Step",
          description: "Please send OTP to each beneficiary to complete their verification",
        });
        // Don't close the OTP modal yet - we'll show beneficiary verification
      } else {
        handleCloseOtpModal();
        getUsers(); // Refresh user list
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error?.response?.data?.message || "Failed to verify OTP",
      });
    } finally {
      setIsCreatingUser(false);
    }
  };

  const handleSendBeneficiaryOtp = async (index: number) => {
    const beneficiary = beneficiaries[index];
    
    if (!beneficiary.name || !beneficiary.email) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Beneficiary name and email are required",
      });
      return;
    }

    try {
      setIsSendingOtp(true);
      await sendBeneficiaryOtp({
        beneficiaryEmail: beneficiary.email,
        beneficiaryName: beneficiary.name,
        primaryUserEmail: newUserEmail,
      });

      toast({
        title: "Success",
        description: `OTP sent to ${beneficiary.name}`,
      });

      // Open the OTP modal for this beneficiary
      setCurrentBeneficiaryIndex(index);
      setIsBeneficiaryOtpModalOpen(true);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error?.response?.data?.message || "Failed to send OTP",
      });
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleVerifyBeneficiaryOtp = async () => {
    if (currentBeneficiaryIndex === null) return;

    const beneficiary = beneficiaries[currentBeneficiaryIndex];

    if (!beneficiaryOtpInput) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "OTP is required",
      });
      return;
    }

    if (!primaryMembershipId) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Primary membership not found. Please create the primary user first.",
      });
      return;
    }

    try {
      setIsVerifyingBeneficiary(true);
      await verifyBeneficiaryOtp({
        beneficiaryEmail: beneficiary.email,
        otp: beneficiaryOtpInput,
        primaryMembershipId: primaryMembershipId,
      });

      toast({
        title: "Success",
        description: `${beneficiary.name} verified successfully`,
      });

      // Mark beneficiary as verified
      const updatedBeneficiaries = [...beneficiaries];
      updatedBeneficiaries[currentBeneficiaryIndex].verified = true;
      setBeneficiaries(updatedBeneficiaries);

      // Close beneficiary OTP modal
      setIsBeneficiaryOtpModalOpen(false);
      setBeneficiaryOtpInput("");
      setCurrentBeneficiaryIndex(null);

      // Check if all beneficiaries are verified
      const allVerified = updatedBeneficiaries.every(b => b.verified === true);
      if (allVerified) {
        toast({
          title: "Complete",
          description: "All beneficiaries have been verified!",
        });
        handleCloseOtpModal();
        getUsers(); // Refresh user list
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error?.response?.data?.message || "Failed to verify beneficiary OTP",
      });
    } finally {
      setIsVerifyingBeneficiary(false);
    }
  };

  const addBeneficiaryField = () => {
    setBeneficiaries([...beneficiaries, { name: '', email: '' }]);
  };

  const removeBeneficiaryField = (index: number) => {
    setBeneficiaries(beneficiaries.filter((_, i) => i !== index));
  };

  const updateBeneficiaryName = (index: number, value: string) => {
    const updated = [...beneficiaries];
    updated[index].name = value;
    setBeneficiaries(updated);
  };

  const updateBeneficiaryEmail = (index: number, value: string) => {
    const updated = [...beneficiaries];
    updated[index].email = value;
    setBeneficiaries(updated);
  };

  const handleOpenEditUserModal = (user: User) => {
    setEditingUser(user);
    setEditUserName(user.name);
    setEditUserEmail(user.phone_or_email);
    setEditUserRole(user.role);
    setEditIsVerified(user.is_verified || false);
    setEditIsAgreedToTerms(user.is_agreed_to_terms || false);
    setEditSelectedPlanId("keep-current");
    setIsEditUserModalOpen(true);
    loadMembershipPlans();
  };

  const handleCloseEditUserModal = () => {
    setIsEditUserModalOpen(false);
    setEditingUser(null);
  };

  const handleUpdateUser = async () => {
    if (!editingUser) return;

    try {
      setIsEditingUser(true);

      // Call API to update user basic info
      await updateUser(editingUser.id, {
        name: editUserName,
        email: editUserEmail,
        role: editUserRole,
        isVerified: editIsVerified,
        isAgreedToTerms: editIsAgreedToTerms
      });

      // If a new plan was selected, assign it
      if (editSelectedPlanId && editSelectedPlanId !== "keep-current") {
        try {
          await assignMembershipToUser(editingUser.id, editSelectedPlanId, 'PENDING');
          toast({
            title: "Success",
            description: "User and membership updated successfully",
          });
        } catch (membershipError: any) {
          // User was updated but membership assignment failed
          toast({
            title: "Partial Success",
            description: `User updated, but membership assignment failed: ${membershipError?.response?.data?.message || 'Unknown error'}`,
            variant: "destructive",
          });
        }
      } else {
        toast({
          title: "Success",
          description: "User updated successfully",
        });
      }
      
      handleCloseEditUserModal();
      getUsers(); // Refresh user list
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error?.response?.data?.message || "Failed to update user",
      });
    } finally {
      setIsEditingUser(false);
    }
  };

  // Filter users based on search query
  const filteredUsers = users.filter((user) => {
    return (
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (user.username && user.username.toLowerCase().includes(searchQuery.toLowerCase())) ||
      user.phone_or_email.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  // Function to render user's memberships and services
  const [isManagePurchasesModalOpen, setIsManagePurchasesModalOpen] = useState(false);
  const [selectedUserForManagement, setSelectedUserForManagement] = useState<User | null>(null);
  const [isRemovingItem, setIsRemovingItem] = useState(false);

  const handleOpenManagePurchasesModal = (user: User) => {
    setSelectedUserForManagement(user);
    setIsManagePurchasesModalOpen(true);
  };

  const handleRemoveMembership = async (userId: string, membershipId: string) => {
    try {
      setIsRemovingItem(true);
      await removeMembershipFromUser(userId, membershipId);
      
      toast({
        title: "Success",
        description: "Membership removed successfully",
      });
      
      // Reload users
      await getUsers();
      setIsManagePurchasesModalOpen(false);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error?.response?.data?.message || "Failed to remove membership",
      });
    } finally {
      setIsRemovingItem(false);
    }
  };

  const handleDeactivateAllMemberships = async (userId: string) => {
    try {
      setIsRemovingItem(true);
      await deactivateUserMemberships(userId);
      
      toast({
        title: "Success",
        description: "All memberships deactivated successfully",
      });
      
      // Reload users
      await getUsers();
      setIsManagePurchasesModalOpen(false);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error?.response?.data?.message || "Failed to deactivate memberships",
      });
    } finally {
      setIsRemovingItem(false);
    }
  };

  const handleCancelBooking = async (userId: string, bookingId: string) => {
    try {
      setIsRemovingItem(true);
      await cancelUserBooking(userId, bookingId);
      
      toast({
        title: "Success",
        description: "Booking cancelled successfully",
      });
      
      // Reload users
      await getUsers();
      setIsManagePurchasesModalOpen(false);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error?.response?.data?.message || "Failed to cancel booking",
      });
    } finally {
      setIsRemovingItem(false);
    }
  };

  const renderUserPurchases = (user: User) => {
    const activeMemberships = user.memberships?.filter(m => m.isActive) || [];
    const bookingsCount = user.bookings?.length || 0;
    
    // Count total beneficiaries
    const totalBeneficiaries = activeMemberships.reduce((sum, m) => {
      return sum + (m.memberMemberships?.length || 0);
    }, 0);

    if (activeMemberships.length === 0 && bookingsCount === 0) {
      return <span className="text-gray-400 text-sm">No purchases</span>;
    }

    return (
      <div className="flex items-center gap-2">
        <div className="flex flex-col gap-1">
          {activeMemberships.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="default" className="text-xs">
                {activeMemberships[0].plan?.name || 'Unknown Plan'} Membership
              </Badge>
              {activeMemberships[0].isPrimary && totalBeneficiaries > 0 && (
                <Badge variant="secondary" className="text-xs">
                  +{totalBeneficiaries} beneficiar{totalBeneficiaries > 1 ? 'ies' : 'y'}
                </Badge>
              )}
              {activeMemberships.length > 1 && (
                <span className="text-xs text-gray-500">+{activeMemberships.length - 1} more</span>
              )}
            </div>
          )}
          {bookingsCount > 0 && (
            <span className="text-xs text-gray-600">{bookingsCount} service booking{bookingsCount > 1 ? 's' : ''}</span>
          )}
        </div>
        <Button
          onClick={() => handleOpenManagePurchasesModal(user)}
          className="text-gray-600 bg-white hover:text-gray-700 hover:bg-gray-50"
          size="sm"
        >
          <SlidersHorizontal className="h-3 w-3" />
        </Button>
      </div>
    );
  };

  useEffect(() => {
    getUsers();
  }, []);

  if (loading || isLoading) {
    return (
      <div className="flex h-[200px] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Render role badge with appropriate color
  function renderRoleBadge(role: string) {
    return (
      <Badge variant={role === 'ADMIN' ? 'default' : 'secondary'} className="flex items-center">
        {role}
      </Badge>
    );
  }

  return (
    <div className="container mx-auto py-10 space-y-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
        <p className="text-muted-foreground mt-2">
          Manage and monitor all users in the system.
        </p>
      </div>
      <ToastProvider />

      {/* Filters and search */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search users..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <Button onClick={handleOpenCreateUserModal} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Create User
          </Button>
        </div>
      </div>

      {/* Users table */}
      <div className="rounded-xl border bg-white shadow-sm">
        <div className="overflow-x-auto">
          <div className="w-full">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Memberships / Services</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Joined Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={user.avatar || `https://ui-avatars.com/api/?name=${user.name}`} />
                            <AvatarFallback>
                              {user.name.slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-gray-900">{user.name}</p>
                            <p className="text-sm text-gray-500">
                              {user.phone_or_email}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{renderUserPurchases(user)}</TableCell>
                      <TableCell>{renderRoleBadge(user.role)}</TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {format(new Date(user.created_at), 'MMM d, yyyy')}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            onClick={() => handleOpenEditUserModal(user)}
                            className="text-blue-600 bg-white hover:text-blue-700 hover:bg-blue-50"
                            size="sm"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          {user.role !== 'ADMIN' && (
                            <Button
                              onClick={() => {
                                setIsModalOpen(true);
                                setDeletingUserId(user.id);
                              }}
                              className="text-red-600 bg-white hover:text-red-700 hover:bg-red-50"
                              size="sm"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-sm text-gray-500 h-24">
                      No users found matching your criteria
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
      <Dialog
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
          </DialogHeader>
          <DialogDescription>
            Are you sure you want to delete this user?
          </DialogDescription>
          <DialogFooter>
            <SecondaryButton onClick={() => setIsModalOpen(false)}>Cancel</SecondaryButton>
            <Button onClick={() => handleDeleteUser(deletingUserId as string)} className="bg-red-600 hover:bg-red-700">Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create User Modal */}
      <Dialog open={isCreateUserModalOpen} onOpenChange={setIsCreateUserModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New User</DialogTitle>
            <DialogDescription>
              Create a new user account with optional membership assignment
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Basic Information */}
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                placeholder="Enter user's full name"
                value={newUserName}
                onChange={(e) => setNewUserName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter user's email"
                value={newUserEmail}
                onChange={(e) => setNewUserEmail(e.target.value)}
              />
            </div>

            {/* Membership Plan */}
            <div className="space-y-2">
              <Label htmlFor="plan">Membership Plan (Optional)</Label>
              <Select value={selectedPlanId} onValueChange={setSelectedPlanId}>
                <SelectTrigger>
                  <SelectValue placeholder="No Membership - Select to assign" />
                </SelectTrigger>
                <SelectContent>
                  {membershipPlans.map((plan) => (
                    <SelectItem key={plan.id} value={plan.id}>
                      {plan.name} - ₹{plan.cost} ({plan.durationYears} years)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedPlanId && (
                <button
                  type="button"
                  onClick={() => setSelectedPlanId("")}
                  className="text-sm text-gray-500 hover:text-gray-700 underline"
                >
                  Clear selection
                </button>
              )}
            </div>

            {/* Payment Status */}
            {selectedPlanId && (
              <div className="space-y-2">
                <Label htmlFor="paymentStatus">Payment Status</Label>
                <Select value={paymentStatus} onValueChange={(value: any) => setPaymentStatus(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select payment status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="PAID">Paid</SelectItem>
                    <SelectItem value="FAILED">Failed</SelectItem>
                    <SelectItem value="REFUNDED">Refunded</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Beneficiaries */}
            {selectedPlanId && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Beneficiaries (Optional)</Label>
                    <p className="text-xs text-gray-500 mt-1">
                      Add family members or friends who can use this membership
                    </p>
                  </div>
                  <Button
                    type="button"
                    onClick={addBeneficiaryField}
                    className="text-sm flex items-center gap-1"
                    variant="outline"
                    size="sm"
                  >
                    <Plus className="h-3 w-3" />
                    Add Beneficiary
                  </Button>
                </div>
                {beneficiaries.map((beneficiary, index) => (
                  <div key={index} className="p-3 border rounded-lg bg-gray-50">
                    <div className="flex items-center justify-between mb-2">
                      <Label className="text-sm">Beneficiary {index + 1}</Label>
                      <Button
                        type="button"
                        onClick={() => removeBeneficiaryField(index)}
                        variant="outline"
                        size="sm"
                        className="h-7 w-7 p-0"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 gap-2">
                      <Input
                        placeholder="Full Name"
                        value={beneficiary.name}
                        onChange={(e) => updateBeneficiaryName(index, e.target.value)}
                      />
                      <Input
                        type="email"
                        placeholder="Email Address"
                        value={beneficiary.email}
                        onChange={(e) => updateBeneficiaryEmail(index, e.target.value)}
                      />
                    </div>
                  </div>
                ))}
                {beneficiaries.length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-2">
                    No beneficiaries added yet. Click "Add Beneficiary" to include family members.
                  </p>
                )}
              </div>
            )}
          </div>

          <DialogFooter>
            <SecondaryButton onClick={handleCloseCreateUserModal}>Cancel</SecondaryButton>
            <Button onClick={handleCreateUser} disabled={isCreatingUser}>
              {isCreatingUser ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending OTP...
                </>
              ) : (
                'Send OTP'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* OTP Verification Modal */}
      <Dialog open={isOtpModalOpen} onOpenChange={(open) => !open && handleCloseOtpModal()}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Verify OTP</DialogTitle>
            <DialogDescription>
              An OTP has been sent to {newUserEmail}. Enter the OTP to verify the primary user.
              {beneficiaries.length > 0 && ` After verification, you'll need to verify ${beneficiaries.length} beneficiary account(s).`}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Primary User OTP */}
            {!primaryMembershipId && (
              <div className="space-y-2">
                <Label htmlFor="otp">Primary User OTP</Label>
                <Input
                  id="otp"
                  placeholder="Enter 4-digit OTP"
                  value={primaryUserOtp}
                  onChange={(e) => setPrimaryUserOtp(e.target.value)}
                  maxLength={4}
                />
              </div>
            )}

            {/* Show beneficiaries list after primary user is verified */}
            {primaryMembershipId && beneficiaries.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Verify Beneficiaries</Label>
                  <Badge variant="secondary">
                    {beneficiaries.filter(b => b.verified).length} / {beneficiaries.length} Verified
                  </Badge>
                </div>
                {beneficiaries.map((beneficiary, index) => (
                  <div key={index} className="p-3 border rounded-lg bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{beneficiary.name}</p>
                        <p className="text-sm text-gray-500">{beneficiary.email}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {beneficiary.verified ? (
                          <Badge variant="default" className="bg-green-600">
                            Verified
                          </Badge>
                        ) : (
                          <Button
                            onClick={() => handleSendBeneficiaryOtp(index)}
                            disabled={isSendingOtp}
                            size="sm"
                          >
                            {isSendingOtp ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Sending...
                              </>
                            ) : (
                              'Send OTP'
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <DialogFooter>
            <SecondaryButton onClick={handleCloseOtpModal}>
              {primaryMembershipId && beneficiaries.every(b => b.verified) ? 'Close' : 'Cancel'}
            </SecondaryButton>
            {!primaryMembershipId && (
              <Button onClick={handleVerifyOtp} disabled={isCreatingUser}>
                {isCreatingUser ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  'Verify & Create User'
                )}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Beneficiary OTP Verification Modal */}
      <Dialog open={isBeneficiaryOtpModalOpen} onOpenChange={setIsBeneficiaryOtpModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Verify Beneficiary OTP</DialogTitle>
            <DialogDescription>
              {currentBeneficiaryIndex !== null && beneficiaries[currentBeneficiaryIndex] && (
                <>
                  An OTP has been sent to {beneficiaries[currentBeneficiaryIndex].email}.
                  Please ask {beneficiaries[currentBeneficiaryIndex].name} to provide their OTP.
                </>
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="beneficiary-otp">OTP</Label>
              <Input
                id="beneficiary-otp"
                placeholder="Enter 4-digit OTP"
                value={beneficiaryOtpInput}
                onChange={(e) => setBeneficiaryOtpInput(e.target.value)}
                maxLength={4}
              />
            </div>
          </div>

          <DialogFooter>
            <SecondaryButton onClick={() => {
              setIsBeneficiaryOtpModalOpen(false);
              setBeneficiaryOtpInput("");
              setCurrentBeneficiaryIndex(null);
            }}>
              Cancel
            </SecondaryButton>
            <Button onClick={handleVerifyBeneficiaryOtp} disabled={isVerifyingBeneficiary}>
              {isVerifyingBeneficiary ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                'Verify Beneficiary'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit User Modal */}
      <Dialog open={isEditUserModalOpen} onOpenChange={setIsEditUserModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update user information and membership details
            </DialogDescription>
          </DialogHeader>

          {editingUser && (
            <div className="space-y-4 py-4">
              {/* Basic Information */}
              <div className="space-y-2">
                <Label htmlFor="edit-name">Name</Label>
                <Input
                  id="edit-name"
                  placeholder="Enter user's full name"
                  value={editUserName}
                  onChange={(e) => setEditUserName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-email">Email</Label>
                <Input
                  id="edit-email"
                  type="email"
                  placeholder="Enter user's email"
                  value={editUserEmail}
                  onChange={(e) => setEditUserEmail(e.target.value)}
                />
              </div>

              {/* Current Membership Info */}
              <div className="space-y-2">
                <Label>Current Membership</Label>
                <div className="p-3 bg-gray-50 rounded-lg">
                  {editingUser.memberships && editingUser.memberships.length > 0 ? (
                    <div className="space-y-2">
                      {editingUser.memberships.map((membership, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <div>
                            <span className="font-medium">{membership.plan?.name || 'Unknown Plan'}</span>
                            <span className="text-sm text-gray-500 ml-2">
                              ({membership.isActive ? 'Active' : 'Inactive'})
                            </span>
                          </div>
                          <Badge variant={membership.isActive ? 'default' : 'secondary'}>
                            {membership.isPrimary ? 'Primary' : 'Beneficiary'}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm">No membership assigned</p>
                  )}
                </div>
              </div>

              {/* Membership Plan Update */}
              <div className="space-y-2">
                <Label htmlFor="edit-plan">Update Membership Plan</Label>
                <Select value={editSelectedPlanId} onValueChange={setEditSelectedPlanId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Keep current or select new plan" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="keep-current">Keep Current</SelectItem>
                    {membershipPlans.map((plan) => (
                      <SelectItem key={plan.id} value={plan.id}>
                        {plan.name} - ₹{plan.cost} ({plan.durationYears} years)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {editSelectedPlanId !== "keep-current" && (
                  <p className="text-xs text-amber-600">
                    Note: This will add a new membership to the user. Remove existing memberships first if needed.
                  </p>
                )}
              </div>

              {/* User Role */}
              <div className="space-y-2">
                <Label htmlFor="edit-role">Role</Label>
                <Select value={editUserRole} onValueChange={setEditUserRole}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USER">User</SelectItem>
                    <SelectItem value="ADMIN">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Verification Status */}
              <div className="space-y-2">
                <Label>Account Status</Label>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <input 
                      type="checkbox" 
                      id="is-verified" 
                      checked={editIsVerified}
                      onChange={(e) => setEditIsVerified(e.target.checked)}
                      className="rounded"
                    />
                    <Label htmlFor="is-verified" className="text-sm">Verified</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input 
                      type="checkbox" 
                      id="agreed-terms" 
                      checked={editIsAgreedToTerms}
                      onChange={(e) => setEditIsAgreedToTerms(e.target.checked)}
                      className="rounded"
                    />
                    <Label htmlFor="agreed-terms" className="text-sm">Agreed to Terms</Label>
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <SecondaryButton onClick={handleCloseEditUserModal}>Cancel</SecondaryButton>
            <Button onClick={handleUpdateUser} disabled={isEditingUser}>
              {isEditingUser ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                'Update User'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Manage Purchases Modal */}
      <Dialog open={isManagePurchasesModalOpen} onOpenChange={setIsManagePurchasesModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Manage Memberships & Services</DialogTitle>
            <DialogDescription>
              Remove or cancel memberships and service bookings for {selectedUserForManagement?.name}
            </DialogDescription>
          </DialogHeader>

          {selectedUserForManagement && (
            <div className="space-y-6 py-4">
              {/* Memberships Section */}
              <div>
                <h3 className="text-lg font-medium mb-3">Memberships</h3>
                {selectedUserForManagement.memberships && selectedUserForManagement.memberships.length > 0 ? (
                  <div className="space-y-3">
                    {selectedUserForManagement.memberships.filter(m => m.isActive).map((membership, index) => (
                      <div key={index}>
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <p className="font-medium">{membership.plan?.name || 'Unknown Plan'}</p>
                              {membership.isPrimary && (
                                <Badge variant="default" className="text-xs">Primary</Badge>
                              )}
                              {!membership.isPrimary && membership.parentMembershipId && (
                                <Badge variant="secondary" className="text-xs">Beneficiary</Badge>
                              )}
                            </div>
                            <p className="text-sm text-gray-500 mt-1">ID: {membership.id}</p>
                          </div>
                          <Button
                            onClick={() => handleRemoveMembership(selectedUserForManagement.id, membership.id)}
                            disabled={isRemovingItem}
                            className="text-red-600 bg-white hover:text-red-700 hover:bg-red-50"
                            size="sm"
                          >
                            {isRemovingItem ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                        
                        {/* Show beneficiaries if this is a primary membership */}
                        {membership.isPrimary && membership.memberMemberships && membership.memberMemberships.length > 0 && (
                          <div className="ml-6 mt-2 space-y-2">
                            <p className="text-sm font-medium text-gray-700">Beneficiaries:</p>
                            {membership.memberMemberships.map((beneficiary, bIndex) => (
                              <div key={bIndex} className="flex items-center justify-between p-2 bg-blue-50 rounded-lg border border-blue-200">
                                <div className="flex items-center gap-2">
                                  <User className="h-4 w-4 text-blue-600" />
                                  <div>
                                    <p className="text-sm font-medium text-blue-900">{beneficiary.user.name}</p>
                                    <p className="text-xs text-blue-700">{beneficiary.user.phone_or_email}</p>
                                  </div>
                                </div>
                                <Button
                                  onClick={() => handleRemoveMembership(beneficiary.userId, beneficiary.id)}
                                  disabled={isRemovingItem}
                                  className="text-red-600 bg-white hover:text-red-700 hover:bg-red-50"
                                  size="sm"
                                >
                                  {isRemovingItem ? (
                                    <Loader2 className="h-3 w-3 animate-spin" />
                                  ) : (
                                    <Trash2 className="h-3 w-3" />
                                  )}
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                    
                    {selectedUserForManagement.memberships.filter(m => m.isActive).length > 1 && (
                      <Button
                        onClick={() => handleDeactivateAllMemberships(selectedUserForManagement.id)}
                        disabled={isRemovingItem}
                        className="w-full mt-2 bg-red-600 hover:bg-red-700"
                        size="sm"
                      >
                        {isRemovingItem ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Deactivating...
                          </>
                        ) : (
                          'Deactivate All Memberships'
                        )}
                      </Button>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">No active memberships</p>
                )}
              </div>

              {/* Payment Status Section */}
              <div>
                <h3 className="text-lg font-medium mb-3">Payment Status</h3>
                {selectedUserForManagement.memberships && selectedUserForManagement.memberships.filter(m => m.isActive && m.isPrimary).length > 0 ? (
                  <div className="space-y-2">
                    {selectedUserForManagement.memberships.filter(m => m.isActive && m.isPrimary).map((membership, index) => {
                      const payment = membership.payments?.[0];
                      return (
                        <div key={index} className="p-3 bg-gray-50 rounded-lg border">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <p className="font-medium">{membership.plan?.name || 'Unknown Plan'}</p>
                              <p className="text-sm text-gray-500 mt-1">Membership ID: {membership.id}</p>
                              {payment && (
                                <div className="flex items-center gap-2 mt-2">
                                  <Badge 
                                    variant={
                                      payment.status === 'PAID' ? 'default' :
                                      payment.status === 'FAILED' ? 'destructive' :
                                      'secondary'
                                    }
                                    className="text-xs"
                                  >
                                    {payment.status}
                                  </Badge>
                                  <span className="text-sm text-gray-600">₹{payment.amount}</span>
                                </div>
                              )}
                            </div>
                            {payment && (
                              <div className="ml-4">
                                <Select 
                                  value={payment.status}
                                  onValueChange={(value: any) => {
                                    updateMembershipPaymentStatus(membership.id, value)
                                      .then(() => {
                                        toast({
                                          title: "Success",
                                          description: "Payment status updated successfully",
                                        });
                                        getUsers();
                                      })
                                      .catch((error: any) => {
                                        toast({
                                          variant: "destructive",
                                          title: "Error",
                                          description: error?.response?.data?.message || "Failed to update payment status",
                                        });
                                      });
                                  }}
                                >
                                  <SelectTrigger className="w-32">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="PENDING">Pending</SelectItem>
                                    <SelectItem value="PAID">Paid</SelectItem>
                                    <SelectItem value="FAILED">Failed</SelectItem>
                                    <SelectItem value="REFUNDED">Refunded</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">No payment records found</p>
                )}
              </div>

              {/* Bookings Section */}
              <div>
                <h3 className="text-lg font-medium mb-3">Service Bookings</h3>
                {selectedUserForManagement.bookings && selectedUserForManagement.bookings.length > 0 ? (
                  <div className="space-y-2">
                    {selectedUserForManagement.bookings.map((booking, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                        <div>
                          <p className="font-medium">{booking.service?.name || 'Unknown Service'}</p>
                          <p className="text-sm text-gray-500 mt-1">Booking ID: {booking.id}</p>
                        </div>
                        <Button
                          onClick={() => handleCancelBooking(selectedUserForManagement.id, booking.id)}
                          disabled={isRemovingItem}
                          className="text-red-600 bg-white hover:text-red-700 hover:bg-red-50"
                          size="sm"
                        >
                          {isRemovingItem ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <X className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">No service bookings</p>
                )}
              </div>
            </div>
          )}

          <DialogFooter>
            <SecondaryButton onClick={() => setIsManagePurchasesModalOpen(false)}>
              Close
            </SecondaryButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
            
