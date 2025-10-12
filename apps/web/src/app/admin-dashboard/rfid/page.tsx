'use client';

import { useState, useEffect } from 'react';
import { Card } from "@/app/components/ui/card/Card";
import { Search, Plus, Key, UserCheck, AlertTriangle, Users, User, Edit, Trash2, Eye, Clock, CheckCircle, XCircle, ArrowLeft } from "lucide-react";
import { PrimaryButton as Button } from "@/app/components/ui/buttons/PrimaryButton";
import { Input } from "@/app/components/ui/input/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/components/ui/select/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/app/components/ui/dialog/Dialog";
import { Label } from "@/app/components/ui/label";
import { Badge } from "@/app/components/badge/badge";
import { fetchMembershipGroups, assignRfidToGroup, removeRfidFromGroup, type MembershipGroup } from "@/app/api/admin";
import { SecondaryButton } from '@/app/components/ui/buttons';
import { useToast } from "@/app/components/ui/toast/use-toast";
import { ToastProvider } from "@/app/components/ui/toast/toast";

export default function RFIDManagement() {
  const [membershipGroups, setMembershipGroups] = useState<MembershipGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<MembershipGroup | null>(null);
  const [rfidInput, setRfidInput] = useState('');
  const [assigningRfid, setAssigningRfid] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [groupToRemove, setGroupToRemove] = useState<MembershipGroup | null>(null);
  const [removingRfid, setRemovingRfid] = useState(false);
  const [selectedUser, setSelectedUser] = useState<MembershipGroup | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'detail'>('list');
  const { toast } = useToast();

  useEffect(() => {
    loadMembershipGroups();
  }, []);

  const loadMembershipGroups = async () => {
    try {
      setLoading(true);
      console.log('🔄 Fetching membership groups...');
      const data = await fetchMembershipGroups();
      console.log('✅ Membership groups fetched:', data);
      console.log('📊 Total users with memberships:', data.length);
      setMembershipGroups(data);
      
      if (data.length === 0) {
        toast({
          title: "No users found",
          description: "No users with active memberships found in the system.",
          variant: "default",
        });
      }
    } catch (error: any) {
      console.error('❌ Error fetching membership groups:', error);
      toast({
        variant: "destructive",
        title: "Error loading data",
        description: error?.response?.data?.message || "Failed to fetch membership groups",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAssignRfid = async () => {
    if (!selectedGroup || !rfidInput.trim()) return;

    try {
      setAssigningRfid(true);
      await assignRfidToGroup(selectedGroup.primaryUser.id, selectedGroup.primaryUser.email, rfidInput);
      
      // Update the local state
      setMembershipGroups(prev => 
        prev.map(group => 
          group.primaryUser.id === selectedGroup.primaryUser.id 
            ? { ...group, rfidCardId: rfidInput }
            : group
        )
      );
      
      toast({
        title: "Success",
        description: "RFID card assigned successfully",
      });
      
      setIsModalOpen(false);
      setRfidInput('');
      setSelectedGroup(null);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error?.response?.data?.message || "Failed to assign RFID card",
      });
    } finally {
      setAssigningRfid(false);
    }
  };

  const openAssignModal = (group: MembershipGroup) => {
    setSelectedGroup(group);
    setRfidInput('');
    setIsModalOpen(true);
  };

  const openRemoveConfirmation = (group: MembershipGroup) => {
    setGroupToRemove(group);
    setIsConfirmModalOpen(true);
  };

  const handleRemoveRfid = async () => {
    if (!groupToRemove || !groupToRemove.rfidCardId) return;

    try {
      setRemovingRfid(true);
      await removeRfidFromGroup(groupToRemove.primaryUser.id, groupToRemove.primaryUser.email);
      
      // Update the local state
      setMembershipGroups(prev => 
        prev.map(g => 
          g.primaryUser.id === groupToRemove.primaryUser.id 
            ? { ...g, rfidCardId: null }
            : g
        )
      );
      
      toast({
        title: "Success",
        description: "RFID card removed successfully",
      });
      
      setIsConfirmModalOpen(false);
      setGroupToRemove(null);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error?.response?.data?.message || "Failed to remove RFID card",
      });
    } finally {
      setRemovingRfid(false);
    }
  };

  const handleSelectUser = (user: MembershipGroup) => {
    setSelectedUser(user);
    setViewMode('detail');
  };

  const handleBackToList = () => {
    setViewMode('list');
    setSelectedUser(null);
  };

  const getStatusIcon = (hasRfid: boolean) => {
    return hasRfid ? (
      <CheckCircle className="h-4 w-4 text-green-600" />
    ) : (
      <XCircle className="h-4 w-4 text-gray-400" />
    );
  };

  const getStatusColor = (hasRfid: boolean) => {
    return hasRfid ? 'text-green-600 bg-green-50' : 'text-gray-600 bg-gray-50';
  };

  const filteredGroups = membershipGroups.filter(group => {
    const matchesSearch = 
      group.primaryUser.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      group.primaryUser.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (group.rfidCardId && group.rfidCardId.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesFilter = selectedFilter === 'all' || 
      (selectedFilter === 'assigned' && group.rfidCardId) ||
      (selectedFilter === 'unassigned' && !group.rfidCardId);
    
    return matchesSearch && matchesFilter;
  });


  const totalGroups = membershipGroups.length;
  const assignedGroups = membershipGroups.filter(group => group.rfidCardId).length;
  const unassignedGroups = totalGroups - assignedGroups;

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#012b2b] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading membership groups...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      <ToastProvider />
      
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
            <div>
            <h1 className="text-2xl font-bold text-gray-900">RFID Management</h1>
            <p className="text-sm text-gray-600">Manage RFID card assignments for users</p>
          </div>
          
          {/* Quick Stats */}
          <div className="flex items-center space-x-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{totalGroups}</div>
              <div className="text-xs text-gray-500">Total Users</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{assignedGroups}</div>
              <div className="text-xs text-gray-500">Assigned</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{unassignedGroups}</div>
              <div className="text-xs text-gray-500">Pending</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Users List */}
        <div className="w-1/3 bg-white border-r border-gray-200 flex flex-col">
      {/* Search and Filter */}
          <div className="p-4 border-b border-gray-200">
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            type="text"
            className="pl-9"
                placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select
          value={selectedFilter}
          onValueChange={(value) => setSelectedFilter(value)}
        >
              <SelectTrigger>
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
                <SelectItem value="all">All Users</SelectItem>
            <SelectItem value="assigned">Assigned RFID</SelectItem>
            <SelectItem value="unassigned">Unassigned RFID</SelectItem>
          </SelectContent>
        </Select>
      </div>

          {/* Users List */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-2">
              {filteredGroups.map((group) => (
                <div
                  key={group.primaryUser.id}
                  onClick={() => handleSelectUser(group)}
                  className={`p-3 rounded-lg cursor-pointer transition-colors mb-2 ${
                    selectedUser?.primaryUser.id === group.primaryUser.id
                      ? 'bg-blue-50 border border-blue-200'
                      : 'hover:bg-gray-50 border border-transparent'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                          <User className="h-5 w-5 text-gray-600" />
                        </div>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {group.primaryUser.name}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {group.primaryUser.email}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(!!group.rfidCardId)}
                      {group.rfidCardId && (
                        <Badge variant="default" className="text-xs">
                          {group.rfidCardId}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              
              {filteredGroups.length === 0 && (
                <div className="text-center py-8">
                  <User className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No users found</p>
                  <p className="text-sm text-gray-400">Try adjusting your search or filter</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Panel - User Details */}
        <div className="flex-1 bg-gray-50 flex flex-col">
          {selectedUser ? (
            <div className="flex-1 p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={handleBackToList}
                    className="p-2 hover:bg-white rounded-lg transition-colors"
                  >
                    <ArrowLeft className="h-5 w-5 text-gray-600" />
                  </button>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">{selectedUser.primaryUser.name}</h2>
                    <p className="text-sm text-gray-600">{selectedUser.primaryUser.email}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {getStatusIcon(!!selectedUser.rfidCardId)}
                  <Badge variant={selectedUser.rfidCardId ? 'default' : 'secondary'}>
                    {selectedUser.rfidCardId ? 'RFID Assigned' : 'No RFID'}
                  </Badge>
                </div>
              </div>

              {/* User Details Cards */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* RFID Status Card */}
                <Card className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900">RFID Status</h3>
                    <Key className="h-5 w-5 text-gray-400" />
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Status:</span>
                      <Badge variant={selectedUser.rfidCardId ? 'default' : 'secondary'}>
                        {selectedUser.rfidCardId ? 'Active' : 'Not Assigned'}
                      </Badge>
                    </div>
                    
                    {selectedUser.rfidCardId ? (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">RFID Card ID:</span>
                          <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                            {selectedUser.rfidCardId}
                    </span>
                        </div>
                        
                        <div className="flex space-x-2 pt-2">
                          <Button
                            size="sm"
                            onClick={() => openAssignModal(selectedUser)}
                            className="flex items-center space-x-1"
                          >
                            <Edit className="h-4 w-4" />
                            <span>Change RFID</span>
                          </Button>
                      <Button
                        size="sm"
                            variant="destructive"
                            onClick={() => openRemoveConfirmation(selectedUser)}
                            className="flex items-center space-x-1"
                      >
                            <Trash2 className="h-4 w-4" />
                            <span>Remove</span>
                      </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="pt-2">
                        <Button
                          onClick={() => openAssignModal(selectedUser)}
                          className="w-full flex items-center justify-center space-x-2"
                        >
                          <Plus className="h-4 w-4" />
                          <span>Assign RFID Card</span>
                        </Button>
                      </div>
                    )}
                  </div>
                </Card>

                {/* Membership Info Card */}
                <Card className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900">Membership Details</h3>
                    <Users className="h-5 w-5 text-gray-400" />
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Group Members:</span>
                      <span className="text-sm font-medium">{selectedUser.totalGroupMembers}</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Status:</span>
                      <Badge variant={selectedUser.primaryUser.isActive ? 'default' : 'secondary'}>
                        {selectedUser.primaryUser.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>

                    {selectedUser.beneficiaries && selectedUser.beneficiaries.length > 0 && (
                      <div className="pt-2">
                        <p className="text-sm text-gray-600 mb-2">Additional Members:</p>
                        <div className="space-y-1">
                          {selectedUser.beneficiaries.map((beneficiary) => (
                            <div key={beneficiary.id} className="flex items-center justify-between text-xs">
                              <span className="text-gray-700">{beneficiary.name}</span>
                              <Badge variant="secondary" className="text-xs">
                                {beneficiary.email}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </Card>

                {/* Activity Card */}
                <Card className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
                    <Clock className="h-5 w-5 text-gray-400" />
                  </div>
                  
                  <div className="space-y-3">
                    <div className="text-center py-4">
                      <Clock className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">No recent activity</p>
                      <p className="text-xs text-gray-400">Activity will appear here once RFID is used</p>
                    </div>
        </div>
      </Card>

                {/* Quick Actions Card */}
                <Card className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900">Quick Actions</h3>
                    <Eye className="h-5 w-5 text-gray-400" />
                  </div>
                  
                  <div className="space-y-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full justify-start"
                      onClick={() => openAssignModal(selectedUser)}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Manage RFID Assignment
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full justify-start"
                      onClick={() => {
                        toast({
                          title: "User Details",
                          description: `${selectedUser?.primaryUser.name} - ${selectedUser?.primaryUser.email}`,
                        });
                      }}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View User Profile
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full justify-start"
                      onClick={() => {
                        const memberCount = selectedUser?.totalGroupMembers || 0;
                        const beneficiaryCount = selectedUser?.beneficiaries?.length || 0;
                        toast({
                          title: "Membership Details",
                          description: `Total members: ${memberCount} (${beneficiaryCount} beneficiaries)`,
                        });
                      }}
                    >
                      <Users className="h-4 w-4 mr-2" />
                      View Membership
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full justify-start"
                      onClick={() => {
                        loadMembershipGroups();
                        toast({
                          title: "Refreshing data",
                          description: "Reloading membership groups...",
                        });
                      }}
                    >
                      <Key className="h-4 w-4 mr-2" />
                      Refresh Data
                    </Button>
                  </div>
                </Card>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <User className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Select a User</h3>
                <p className="text-gray-500">Choose a user from the list to view and manage their RFID details</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Assign RFID Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Key className="h-5 w-5" />
              <span>{selectedGroup?.rfidCardId ? 'Update RFID Card' : 'Assign RFID Card'}</span>
            </DialogTitle>
          </DialogHeader>
          
          {selectedGroup && (
          <div className="space-y-4">
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <User className="h-8 w-8 text-blue-600" />
                  <div>
                    <p className="font-medium text-blue-900">{selectedGroup.primaryUser.name}</p>
                    <p className="text-sm text-blue-700">{selectedGroup.primaryUser.email}</p>
                  </div>
                </div>
              </div>
              
            <div className="space-y-2">
              <Label htmlFor="rfid-input">RFID Card ID</Label>
              <Input
                id="rfid-input"
                  placeholder="Enter RFID card ID"
                value={rfidInput}
                onChange={(e) => setRfidInput(e.target.value)}
                  className="font-mono"
              />
                <p className="text-xs text-gray-500">
                  Enter the unique RFID card identifier
                </p>
              </div>
            </div>
          )}
          
          <DialogFooter className="flex space-x-2">
            <SecondaryButton onClick={() => setIsModalOpen(false)}>
              Cancel
            </SecondaryButton>
            <Button
              onClick={handleAssignRfid}
              disabled={assigningRfid || !rfidInput.trim()}
              isLoading={assigningRfid}
              loadingText="Processing..."
            >
              {selectedGroup?.rfidCardId ? 'Update RFID' : 'Assign RFID'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog for Remove RFID */}
      <Dialog open={isConfirmModalOpen} onOpenChange={setIsConfirmModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              <span>Remove RFID Card</span>
            </DialogTitle>
          </DialogHeader>
          
          {groupToRemove && (
          <div className="space-y-4">
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-red-800">
                      Are you sure you want to remove this RFID card?
                    </p>
                    <p className="text-sm text-red-700 mt-1">
                      This will revoke RFID access for <strong>{groupToRemove.primaryUser.name}</strong>
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">RFID Card ID:</span>
                  <span className="font-mono text-sm font-medium">{groupToRemove.rfidCardId}</span>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-sm text-gray-600">User:</span>
                  <span className="text-sm font-medium">{groupToRemove.primaryUser.email}</span>
                </div>
              </div>
              </div>
            )}
          
          <DialogFooter className="flex space-x-2">
            <SecondaryButton onClick={() => setIsConfirmModalOpen(false)}>
              Cancel
            </SecondaryButton>
            <Button
              onClick={handleRemoveRfid}
              disabled={removingRfid}
              isLoading={removingRfid}
              loadingText="Removing..."
              className="bg-red-600 hover:bg-red-700"
            >
              Remove RFID
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
