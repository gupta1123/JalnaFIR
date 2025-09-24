'use client';

import { useState, useEffect } from 'react';
import { FIRRecord, DashboardStats } from '@/types/fir';
import { loadFIRData, calculateDashboardStats, getUniquePoliceStations, getUniqueKeywords, filterFIRData } from '@/lib/data';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import MapComponent from '@/components/MapComponent';
import StatsCards from '@/components/StatsCards';
import Sidebar from '@/components/Sidebar';

export default function Dashboard() {
  const [firData, setFirData] = useState<FIRRecord[]>([]);
  const [filteredData, setFilteredData] = useState<FIRRecord[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showHeatmap, setShowHeatmap] = useState(false);
  
  // Filters (hidden but kept for future use)
  const [selectedPoliceStation] = useState<string>('all');
  const [selectedKeyword] = useState<string>('all');
  const [dateRange] = useState<{ start: Date; end: Date } | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const data = await loadFIRData();
        setFirData(data);
        setFilteredData(data);
        setStats(calculateDashboardStats(data));
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const filtered = filterFIRData(firData, {
      policeStation: selectedPoliceStation === 'all' ? undefined : selectedPoliceStation,
      keyword: selectedKeyword === 'all' ? undefined : selectedKeyword,
      dateRange: dateRange || undefined,
    });
    setFilteredData(filtered);
  }, [firData, selectedPoliceStation, selectedKeyword, dateRange]);

  // const policeStations = getUniquePoliceStations(firData);
  // const keywords = getUniqueKeywords(firData);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading FIR Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      
      <div className="flex-1">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="px-6 py-4">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">FIR Intelligence Dashboard</h1>
                <p className="text-gray-600">AI-Powered Crime Analytics - Jalna District 2024</p>
              </div>
              <div className="flex items-center space-x-4">
                <Badge variant="outline" className="text-sm">
                  {filteredData.length} incidents
                </Badge>
                <Button
                  variant={showHeatmap ? "default" : "outline"}
                  onClick={() => setShowHeatmap(!showHeatmap)}
                  size="sm"
                >
                  {showHeatmap ? "Hide Heatmap" : "Show Heatmap"}
                </Button>
              </div>
            </div>
          </div>
        </header>

        <div className="p-6">
        {/* Statistics Cards */}
        {stats && <StatsCards stats={stats} />}

        {/* Filters - Hidden for SP Demo */}
        {/* 
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Filters</CardTitle>
            <CardDescription>Filter incidents by police station, type, and date range</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="police-station">Police Station</Label>
                <Select value={selectedPoliceStation} onValueChange={setSelectedPoliceStation}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Police Stations" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Police Stations</SelectItem>
                    {policeStations.map(station => (
                      <SelectItem key={station} value={station}>
                        {station}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="incident-type">Incident Type</Label>
                <Select value={selectedKeyword} onValueChange={setSelectedKeyword}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Incident Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Incident Types</SelectItem>
                    {keywords.map(keyword => (
                      <SelectItem key={keyword} value={keyword}>
                        {keyword}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedPoliceStation('all');
                    setSelectedKeyword('all');
                    setDateRange(null);
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        */}

        {/* Map Component */}
        <Card>
          <CardHeader>
            <CardTitle>2024 Incident Analysis Map</CardTitle>
            <CardDescription>
              Historical incident visualization {showHeatmap ? 'with density heatmap' : 'with detailed incident markers'} from Jalna District 2024 data
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[600px] w-full relative">
              <MapComponent 
                data={filteredData} 
                showHeatmap={showHeatmap}
              />
            </div>
          </CardContent>
        </Card>
        </div>
      </div>
    </div>
  );
}