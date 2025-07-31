"use client"
import { useAuth } from "@/app/hooks/useAuth";
import { useEffect, useState } from "react";
import { Input } from "@/app/components/ui/input/input";
import { PrimaryButton as Button, PrimaryButton } from "@/app/components/ui/buttons/PrimaryButton";
import { Avatar, AvatarFallback, AvatarImage } from "@/app/components/ui/avatar/Avatar";
import { format } from "date-fns";
import { Loader2, Trash2, Search, SlidersHorizontal } from "lucide-react";
import { useToast } from "@/app/components/ui/toast/use-toast";
import { ToastProvider } from "@/app/components/ui/toast/toast";    
import { deleteUser, fetchUsers } from "@/app/api/user";
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
}

export default function UserPage() {
  const { user, loading } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
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

  // Filter users based on search query
  const filteredUsers = users.filter((user) => {
    return (
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.phone_or_email.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

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
          {/* <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="rounded-lg bg-white flex items-center justify-center border border-solid border-gray-300  p-2">
                <SlidersHorizontal className="h-4 w-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setSearchQuery("")}>
                Clear all filters
              </DropdownMenuItem>
              <DropdownMenuItem>Export to CSV</DropdownMenuItem>
              <DropdownMenuItem>Bulk actions</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu> */}
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
                  <TableHead>Username</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Joined Date</TableHead>
                  {/* <TableHead className="text-right">Actions</TableHead> */}
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
                      <TableCell className="text-sm text-gray-600">{user.username}</TableCell>
                      <TableCell>{renderRoleBadge(user.role)}</TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {format(new Date(user.created_at), 'MMM d, yyyy')}
                      </TableCell>
                      {/* <TableCell className="text-right"> */}
                        {/* <Button
                          onClick={() => {
                            setIsModalOpen(true);
                            setDeletingUserId(user.id);
                          }}
                          className="text-red-600 bg-white hover:text-red-700 hover:bg-red-50"
                        >
                         <Trash2 className="h-4 w-4" />
                        </Button> */}
                      {/* </TableCell> */}
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
    </div>
  );
}
            
