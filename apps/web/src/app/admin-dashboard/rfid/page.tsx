'use client';

import { useState, useEffect } from 'react';
import { Card } from "@/app/components/ui/card/Card";
import { Search, Plus, Key, UserCheck, AlertTriangle, Users, User } from "lucide-react";
import { PrimaryButton as Button } from "@/app/components/ui/buttons/PrimaryButton";
import { Input } from "@/app/components/ui/input/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/components/ui/select/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/app/components/ui/dialog/Dialog";
import { Label } from "@/app/components/ui/label";
import { fetchMembershipGroups, assignRfidToGroup, removeRfidFromGroup, type MembershipGroup } from "@/app/api/admin";
import { SecondaryButton } from '@/app/components/ui/buttons';

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

  useEffect(() => {
    loadMembershipGroups();
  }, []);

  const loadMembershipGroups = async () => {
    try {
      setLoading(true);
      const data = await fetchMembershipGroups();
      setMembershipGroups(data);
    } catch (error) {
      console.error('Error fetching membership groups:', error);
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
      
      setIsModalOpen(false);
      setRfidInput('');
      setSelectedGroup(null);
    } catch (error) {
      console.error('Error assigning RFID:', error);
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
      
      setIsConfirmModalOpen(false);
      setGroupToRemove(null);
    } catch (error) {
      console.error('Error removing RFID:', error);
    } finally {
      setRemovingRfid(false);
    }
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

  const getStatusColor = (hasRfid: boolean) => {
    return hasRfid ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800';
  };

  const getStatusText = (hasRfid: boolean) => {
    return hasRfid ? 'Assigned' : 'Unassigned';
  };

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
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">RFID Management</h1>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-blue-100 rounded-full">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Groups</p>
              <h3 className="text-2xl font-bold">{totalGroups}</h3>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-green-100 rounded-full">
              <Key className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Assigned RFID</p>
              <h3 className="text-2xl font-bold">{assignedGroups}</h3>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-yellow-100 rounded-full">
              <AlertTriangle className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Pending Assignment</p>
              <h3 className="text-2xl font-bold">{unassignedGroups}</h3>
            </div>
          </div>
        </Card>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <Input
            type="text"
            className="pl-9"
            placeholder="Search by name, email, or RFID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select
          value={selectedFilter}
          onValueChange={(value) => setSelectedFilter(value)}
        >
          <SelectTrigger className="max-w-[200px] py-5">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Groups</SelectItem>
            <SelectItem value="assigned">Assigned RFID</SelectItem>
            <SelectItem value="unassigned">Unassigned RFID</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Membership Groups Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Primary User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">RFID Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">RFID Card ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Group Members</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredGroups.map((group) => (
                <tr key={group.primaryUser.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <User className="h-5 w-5 text-gray-400 mr-2" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">{group.primaryUser.name}</div>
                        <div className="text-sm text-gray-500">Primary</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{group.primaryUser.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(!!group.rfidCardId)}`}>
                      {getStatusText(!!group.rfidCardId)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {group.rfidCardId || (
                      <span className="text-yellow-600 italic">Not assigned</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {group.totalGroupMembers} members
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {!group.rfidCardId ? (
                      <Button
                        size="sm"
                        onClick={() => openAssignModal(group)}
                        className="text-xs"
                      >
                        Assign RFID
                      </Button>
                    ) : (
                      <div className="space-x-2">
                        <button 
                          className="text-blue-600 hover:text-blue-800 text-xs"
                          onClick={() => openAssignModal(group)}
                        >
                          Change
                        </button>
                        <button 
                          className="text-red-600 hover:text-red-800 text-xs"
                          onClick={() => openRemoveConfirmation(group)}
                        >
                          Remove
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Assign RFID Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign or Change RFID Card</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {selectedGroup && (
              <div className="space-y-2">
                <p className="text-sm text-gray-600">
                  Assigning or Change RFID to: <strong>{selectedGroup.primaryUser.name}</strong>
                </p>
                <p className="text-sm text-gray-500">
                  Email: {selectedGroup.primaryUser.email}
                </p>
                <p className="text-sm text-gray-500">
                  Group Members: {selectedGroup.totalGroupMembers}
                </p>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="rfid-input">RFID Card ID</Label>
              <Input
                id="rfid-input"
                type="text"
                placeholder="Enter RFID card ID..."
                value={rfidInput}
                onChange={(e) => setRfidInput(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <SecondaryButton
              className='border-red-400 text-red-500 hover:bg-red-400/10 hover:text-red-600'
              onClick={() => setIsModalOpen(false)}
              disabled={assigningRfid}
            >
              Cancel
            </SecondaryButton>
            <Button
              onClick={handleAssignRfid}
              disabled={!rfidInput.trim() || assigningRfid}
              isLoading={assigningRfid}
              loadingText="Assigning..."
            >
              Submit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog for Remove RFID */}
      <Dialog open={isConfirmModalOpen} onOpenChange={setIsConfirmModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm RFID Removal</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {groupToRemove && (
              <div className="space-y-2">
                <p className="text-sm text-gray-600">
                  Are you sure you want to remove the RFID card from <strong>{groupToRemove.primaryUser.name}</strong>?
                </p>
                <p className="text-sm text-gray-500">
                  Current RFID: <span className="font-mono bg-gray-100 px-2 py-1 rounded">{groupToRemove.rfidCardId}</span>
                </p>
                <p className="text-sm text-red-600">
                  This action cannot be undone. The user will lose access until a new RFID is assigned.
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <SecondaryButton
              onClick={() => setIsConfirmModalOpen(false)}
              disabled={removingRfid}
            >
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
