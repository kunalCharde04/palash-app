'use client';

import React, { useEffect, useState } from 'react';
import { Card } from '@/app/components/ui/card/Card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select/select';
import { Input } from '@/app/components/ui/input/input';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import { format, parseISO, startOfDay, startOfWeek, startOfMonth, startOfYear, startOfMinute } from 'date-fns';
import { fetchRfidUsageAnalytics, RfidUsageMembership } from '@/app/api/admin';

const PERIODS = [
  { value: 'minute', label: 'Minute' },
  { value: 'hour', label: 'Hour' },
  { value: 'day', label: 'Day' },
  { value: 'week', label: 'Week' },
  { value: 'month', label: 'Month' },
  { value: 'year', label: 'Year' },
  { value: '7year', label: '7 Years' },
  { value: '25year', label: '25 Years' },
];

function aggregateHistory(history: RfidUsageMembership['rfidScanHistory'], period: string) {
  const buckets: Record<string, number> = {};

  for (const scan of history) {
    const date = parseISO(scan.scanTimestamp || scan.lastScanTime);
    let key = '';
    let displayKey = '';
    
    switch (period) {
      case 'minute':
        key = format(startOfMinute(date), 'yyyy-MM-dd HH:mm');
        displayKey = format(startOfMinute(date), 'HH:mm');
        break;
      case 'hour':
        key = format(date, 'yyyy-MM-dd HH:00');
        displayKey = format(date, 'HH:00');
        break;
      case 'day':
        key = format(startOfDay(date), 'yyyy-MM-dd');
        displayKey = format(startOfDay(date), 'MMM dd');
        break;
      case 'week':
        key = format(startOfWeek(date, { weekStartsOn: 1 }), 'yyyy-ww');
        displayKey = format(startOfWeek(date, { weekStartsOn: 1 }), 'MMM dd');
        break;
      case 'month':
        key = format(startOfMonth(date), 'yyyy-MM');
        displayKey = format(startOfMonth(date), 'MMM yyyy');
        break;
      case 'year':
        key = format(startOfYear(date), 'yyyy');
        displayKey = format(startOfYear(date), 'yyyy');
        break;
      case '7year':
        const year7 = Math.floor(date.getFullYear() / 7) * 7;
        key = `${year7}-${year7 + 6}`;
        displayKey = `${year7}-${year7 + 6}`;
        break;
      case '25year':
        const year25 = Math.floor(date.getFullYear() / 25) * 25;
        key = `${year25}-${year25 + 24}`;
        displayKey = `${year25}-${year25 + 24}`;
        break;
      default:
        key = format(startOfDay(date), 'yyyy-MM-dd');
        displayKey = format(startOfDay(date), 'MMM dd');
    }
    
    if (!buckets[key]) {
      buckets[key] = 0;
    }
    buckets[key] += 1;
  }

  // Convert to array for recharts and sort by the original key
  const sortedEntries = Object.entries(buckets)
    .sort(([a], [b]) => a.localeCompare(b));

  return sortedEntries.map(([key, count]) => {
    let displayKey = '';
    const date = key.includes('-') && key.split('-').length === 3 
      ? parseISO(key) 
      : key.includes(':') 
        ? parseISO(`2025-07-31T${key.split(' ')[1]}`)
        : null;
    
    switch (period) {
      case 'minute':
        displayKey = key.includes(' ') ? key.split(' ')[1] : key;
        break;
      case 'hour':
        displayKey = key.includes(' ') ? key.split(' ')[1] : key;
        break;
      case 'day':
        displayKey = date ? format(date, 'MMM dd') : key;
        break;
      case 'week':
        displayKey = date ? format(date, 'MMM dd') : key;
        break;
      case 'month':
        displayKey = date ? format(date, 'MMM yyyy') : key;
        break;
      case 'year':
        displayKey = key;
        break;
      default:
        displayKey = key;
    }
    
    return { 
      period: displayKey, 
      scans: count,
      fullPeriod: key // Keep original for sorting
    };
  });
}

// Custom tooltip to show full timestamp information
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border rounded shadow-lg">
        <p className="font-medium">{`Period: ${label}`}</p>
        <p className="text-blue-600">{`Scans: ${payload[0].value}`}</p>
      </div>
    );
  }
  return null;
};

export default function Page() {
  const [data, setData] = useState<RfidUsageMembership[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<string>('minute'); // Changed default to minute for better granularity
  const [selectedMembership, setSelectedMembership] = useState<RfidUsageMembership | null>(null);
  const [search, setSearch] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('🔄 Loading RFID usage analytics...');
    setLoading(true);
    setError(null);
    
    fetchRfidUsageAnalytics()
      .then((data) => {
        console.log('✅ RFID usage data loaded:', data);
        console.log(`📊 Total memberships with RFID: ${data.length}`);
        setData(data);
        
        if (data.length === 0) {
          setError('No RFID cards have been assigned yet. Please assign RFID cards to users first.');
        }
      })
      .catch((error) => {
        console.error('❌ Error fetching RFID usage:', error);
        setError(error?.response?.data?.message || 'Failed to load RFID usage data. Please try again.');
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // Filter memberships by search
  const filteredMemberships = data.filter(m =>
    m.user.name.toLowerCase().includes(search.toLowerCase()) ||
    m.user.email.toLowerCase().includes(search.toLowerCase()) ||
    (m.rfidCardId?.toLowerCase().includes(search.toLowerCase()))
  );

  // Default to first membership if none selected, prioritize ones with scan history
  useEffect(() => {
    if (filteredMemberships.length && !selectedMembership) {
      // Find membership with scan history first
      const membershipWithHistory = filteredMemberships.find(m => m.rfidScanHistory.length > 0);
      setSelectedMembership(membershipWithHistory || filteredMemberships[0]);
    }
  }, [filteredMemberships, selectedMembership]);

  const chartData = selectedMembership
    ? aggregateHistory(selectedMembership.rfidScanHistory, selectedPeriod)
    : [];

  // Auto-suggest best period based on data
  const suggestBestPeriod = () => {
    if (!selectedMembership || selectedMembership.rfidScanHistory.length === 0) return null;
    
    const scans = selectedMembership.rfidScanHistory;
    const firstScan = parseISO(scans[0].scanTimestamp || scans[0].lastScanTime);
    const lastScan = parseISO(scans[scans.length - 1].scanTimestamp || scans[scans.length - 1].lastScanTime);
    const diffInMinutes = (lastScan.getTime() - firstScan.getTime()) / (1000 * 60);
    
    if (diffInMinutes < 60) return 'minute';
    if (diffInMinutes < 24 * 60) return 'hour';
    if (diffInMinutes < 7 * 24 * 60) return 'day';
    return 'week';
  };

  const bestPeriod = suggestBestPeriod();

  if (loading) {
    return (
      <div className="p-8 space-y-8">
        <h1 className="text-3xl font-bold text-primary mb-2">RFID Usage Analytics</h1>
        <Card className="p-6">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-gray-600">Loading RFID usage data...</p>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 space-y-8">
        <h1 className="text-3xl font-bold text-primary mb-2">RFID Usage Analytics</h1>
        <Card className="p-6">
          <div className="flex items-center justify-center py-12">
            <div className="text-center max-w-md">
              <div className="text-red-600 text-5xl mb-4">⚠️</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Data Available</h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition"
              >
                Refresh Page
              </button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary mb-2">RFID Usage Analytics</h1>
          <p className="text-sm text-gray-600">
            Viewing {data.length} membership{data.length !== 1 ? 's' : ''} with RFID cards assigned
          </p>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition text-sm"
        >
          🔄 Refresh Data
        </button>
      </div>
      <Card className="p-6 space-y-6">
        <div className="flex flex-col md:flex-row md:items-end gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Search User</label>
            <Input
              placeholder="Search by user, email, or RFID"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Aggregation Period
              {bestPeriod && bestPeriod !== selectedPeriod && (
                <span className="text-xs text-blue-600 ml-2">
                  (Suggested: {PERIODS.find(p => p.value === bestPeriod)?.label})
                </span>
              )}
            </label>
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Period" />
              </SelectTrigger>
              <SelectContent>
                {PERIODS.map(p => (
                  <SelectItem key={p.value} value={p.value}>
                    {p.label}
                    {p.value === bestPeriod && <span className="text-blue-600 ml-1">✓</span>}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="md:w-1/3">
            <label className="block text-sm font-medium text-gray-700 mb-1">Select User</label>
            <div className="bg-gray-50 rounded-lg border border-solid border-gray-200 max-h-64 overflow-y-auto">
              {filteredMemberships.map(m => (
                <div
                  key={m.membershipId}
                  className={`p-3 cursor-pointer transition hover:bg-gray-100 ${selectedMembership?.membershipId === m.membershipId ? 'bg-green-500/10 border-l-4 border-primary' : ''}`}
                  onClick={() => setSelectedMembership(m)}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="font-semibold text-primary">{m.user.name}</div>
                    {m.isPrimary && (
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">Primary</span>
                    )}
                  </div>
                  <div className="text-xs text-gray-500">{m.user.email}</div>
                  {m.plan && (
                    <div className="text-xs text-gray-600 font-medium mt-1">{m.plan.name}</div>
                  )}
                  <div className="text-xs text-gray-400 mt-1">
                    <span className="font-mono bg-gray-100 px-1.5 py-0.5 rounded">{m.membershipId}</span>
                  </div>
                  <div className="text-xs text-gray-400 mt-0.5">RFID: {m.rfidCardId}</div>
                  <div className="text-xs text-gray-400">
                    Scans: {m.counter}
                    {m.rfidScanHistory.length === 0 && (
                      <span className="text-red-400 ml-2">(No history)</span>
                    )}
                  </div>
                </div>
              ))}
              {!filteredMemberships.length && (
                <div className="p-3 text-gray-400 text-sm">No memberships found.</div>
              )}
            </div>
          </div>
          <div className="flex-1 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="flex items-center gap-2">
                  <div className="text-lg font-semibold text-primary">
                    {selectedMembership?.user.name || 'Select a membership'}
                  </div>
                  {selectedMembership?.isPrimary && (
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Primary Member</span>
                  )}
                </div>
                <div className="text-sm text-gray-500 mt-1">{selectedMembership?.user.email}</div>
                {selectedMembership?.plan && (
                  <div className="text-sm text-gray-700 font-medium mt-1">
                    Plan: {selectedMembership.plan.name} (₹{selectedMembership.plan.cost})
                  </div>
                )}
                <div className="flex items-center gap-2 mt-2">
                  <div className="text-xs">
                    <span className="text-gray-500">Membership ID:</span>{' '}
                    <span className="font-mono bg-gray-100 px-2 py-1 rounded font-semibold text-primary">
                      {selectedMembership?.membershipId}
                    </span>
                  </div>
                  <div className="text-xs">
                    <span className="text-gray-500">RFID Card:</span>{' '}
                    <span className="font-mono bg-blue-50 px-2 py-1 rounded font-semibold text-blue-700">
                      {selectedMembership?.rfidCardId}
                    </span>
                  </div>
                </div>
                {selectedMembership && (
                  <div className="flex items-center gap-4 mt-2">
                    <div className="text-xs bg-gray-100 px-2 py-1 rounded">
                      <span className="text-gray-600">Total Scans:</span>{' '}
                      <span className="font-semibold text-primary">{selectedMembership.counter}</span>
                    </div>
                    <div className="text-xs bg-gray-100 px-2 py-1 rounded">
                      <span className="text-gray-600">History Records:</span>{' '}
                      <span className="font-semibold text-primary">{selectedMembership.rfidScanHistory.length}</span>
                    </div>
                  </div>
                )}
              </div>
              <div className="text-right">
                <div className="text-xs text-gray-500 mb-1">Last Scan</div>
                <div className="text-sm font-medium text-gray-900">
                  {selectedMembership?.lastScanTime
                    ? format(new Date(selectedMembership.lastScanTime), 'MMM dd, yyyy')
                    : 'Never'}
                </div>
                <div className="text-xs text-gray-500">
                  {selectedMembership?.lastScanTime
                    ? format(new Date(selectedMembership.lastScanTime), 'HH:mm:ss')
                    : ''}
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-4 h-[500px] flex items-center justify-center">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="period" 
                      angle={-45}
                      textAnchor="end"
                      interval={0}
                      height={50}
                      fontSize={12}
                    />
                    <YAxis allowDecimals={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Bar 
                      dataKey="scans" 
                      fill="#012b2b" 
                      name="RFID Scans"
                      radius={[2, 2, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-gray-400 text-center w-full">
                  {selectedMembership?.rfidScanHistory.length === 0 
                    ? "No scan history available for this membership."
                    : "No scan data for this period."
                  }
                </div>
              )}
            </div>
            {chartData.length > 0 && (
              <div className="mt-2 text-xs text-gray-500 text-center">
                Showing {chartData.length} time periods with {chartData.reduce((sum, item) => sum + item.scans, 0)} total scans
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}