"use client"

import React, { useState, useEffect } from 'react';
import { Crown, Mail, Phone, User, Calendar, MessageSquare, Filter, RefreshCw } from 'lucide-react';
import { getMembershipInterests, updateMembershipInterestStatus } from '../../api/memberships';
import { useToast } from '../../components/ui/toast/use-toast';
import { Toaster } from '../../components/ui/toast/toaster';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/badge/badge';

interface MembershipInterest {
  id: string;
  name: string;
  email: string;
  phone: string;
  planName: string;
  planCost: number;
  message?: string;
  status: 'PENDING' | 'CONTACTED' | 'CONVERTED' | 'REJECTED';
  createdAt: string;
  updatedAt: string;
}

const STATUS_COLORS = {
  PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  CONTACTED: 'bg-blue-100 text-blue-800 border-blue-300',
  CONVERTED: 'bg-green-100 text-green-800 border-green-300',
  REJECTED: 'bg-red-100 text-red-800 border-red-300',
};

const STATUS_OPTIONS = [
  { value: 'PENDING', label: 'Pending' },
  { value: 'CONTACTED', label: 'Contacted' },
  { value: 'CONVERTED', label: 'Converted' },
  { value: 'REJECTED', label: 'Rejected' },
];

const PLAN_COLORS: { [key: string]: string } = {
  Silver: 'bg-gray-400',
  Gold: 'bg-yellow-500',
  Platinum: 'bg-purple-600',
};

export default function MembershipRequestsPage() {
  const [requests, setRequests] = useState<MembershipInterest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const data = await getMembershipInterests(filterStatus);
      // Ensure data is an array
      setRequests(Array.isArray(data) ? data : []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to fetch membership requests",
        variant: "destructive"
      });
      setRequests([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [filterStatus]);

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      setUpdatingId(id);
      await updateMembershipInterestStatus(id, newStatus);
      
      // Update the local state
      setRequests(prev =>
        prev.map(req =>
          req.id === id ? { ...req, status: newStatus as any } : req
        )
      );

      toast({
        title: "Success",
        description: "Status updated successfully",
        variant: "default"
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update status",
        variant: "destructive"
      });
    } finally {
      setUpdatingId(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusCount = (status: string) => {
    if (!Array.isArray(requests)) return 0;
    return requests.filter(r => r.status === status).length;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <Toaster />
      
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Crown className="w-8 h-8 text-[#012b2b]" />
          <h1 className="text-3xl font-bold text-[#012b2b]">Membership Requests</h1>
        </div>
        <p className="text-gray-600">
          Manage and track membership interest submissions from potential customers
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-yellow-600">{getStatusCount('PENDING')}</div>
            <div className="text-sm text-gray-600">Pending</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">{getStatusCount('CONTACTED')}</div>
            <div className="text-sm text-gray-600">Contacted</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">{getStatusCount('CONVERTED')}</div>
            <div className="text-sm text-gray-600">Converted</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-red-600">{getStatusCount('REJECTED')}</div>
            <div className="text-sm text-gray-600">Rejected</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <Filter className="w-5 h-5 text-gray-500" />
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">Filter by Status:</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#012b2b] focus:border-transparent"
              >
                <option value="">All Requests</option>
                {STATUS_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchRequests}
              className="ml-auto"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Requests List */}
      {loading ? (
        <div className="text-center py-12">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto text-[#012b2b] mb-4" />
          <p className="text-gray-600">Loading requests...</p>
        </div>
      ) : requests.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Crown className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No requests found</h3>
            <p className="text-gray-600">
              {filterStatus ? `No requests with status "${filterStatus}"` : "No membership requests yet"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {requests.map((request) => (
            <Card key={request.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Left Section - Contact Info */}
                  <div className="lg:col-span-4 space-y-3">
                    <div className="flex items-start gap-2">
                      <User className="w-5 h-5 text-gray-400 mt-0.5" />
                      <div>
                        <div className="text-sm text-gray-500">Name</div>
                        <div className="font-semibold text-gray-900">{request.name}</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Mail className="w-5 h-5 text-gray-400 mt-0.5" />
                      <div>
                        <div className="text-sm text-gray-500">Email</div>
                        <a
                          href={`mailto:${request.email}`}
                          className="font-medium text-blue-600 hover:underline"
                        >
                          {request.email}
                        </a>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Phone className="w-5 h-5 text-gray-400 mt-0.5" />
                      <div>
                        <div className="text-sm text-gray-500">Phone</div>
                        <a
                          href={`tel:${request.phone}`}
                          className="font-medium text-blue-600 hover:underline"
                        >
                          {request.phone}
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* Middle Section - Plan & Message */}
                  <div className="lg:col-span-5 space-y-3">
                    <div>
                      <div className="text-sm text-gray-500 mb-2">Interested Plan</div>
                      <div className="flex items-center gap-2">
                        <Badge className={`${PLAN_COLORS[request.planName] || 'bg-gray-500'} text-white border-0`}>
                          {request.planName}
                        </Badge>
                        <span className="text-lg font-bold text-gray-900">
                          ₹{request.planCost.toLocaleString()}
                        </span>
                      </div>
                    </div>
                    {request.message && (
                      <div>
                        <div className="text-sm text-gray-500 mb-1">Message</div>
                        <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-700">
                          <MessageSquare className="w-4 h-4 inline mr-2 text-gray-400" />
                          {request.message}
                        </div>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Calendar className="w-4 h-4" />
                      <span>Submitted: {formatDate(request.createdAt)}</span>
                    </div>
                  </div>

                  {/* Right Section - Status */}
                  <div className="lg:col-span-3 flex flex-col items-end justify-between">
                    <Badge className={`${STATUS_COLORS[request.status]} border`}>
                      {request.status}
                    </Badge>
                    
                    <div className="w-full lg:w-auto space-y-2 mt-4 lg:mt-0">
                      <div className="text-xs text-gray-500 text-right mb-2">Update Status</div>
                      <select
                        value={request.status}
                        onChange={(e) => handleStatusChange(request.id, e.target.value)}
                        disabled={updatingId === request.id}
                        className="w-full lg:w-auto border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#012b2b] focus:border-transparent disabled:opacity-50"
                      >
                        {STATUS_OPTIONS.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                      {updatingId === request.id && (
                        <div className="text-xs text-blue-600 text-right">Updating...</div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
