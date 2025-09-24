'use client';

import { useState, useEffect, useMemo } from 'react';
import { FIRRecord } from '@/types/fir';
import { loadFIRData } from '@/lib/data';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import Sidebar from '@/components/Sidebar';
import { 
  MagnifyingGlassIcon,
  MapPinIcon,
  CalendarIcon,
  ClockIcon,
  UserGroupIcon,
  ExclamationTriangleIcon,
  TruckIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';

interface SearchFilters {
  query: string;
}

export default function SearchPage() {
  const [firData, setFirData] = useState<FIRRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<SearchFilters>({
    query: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const data = await loadFIRData();
        setFirData(data);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);


  // Filter and search data
  const filteredData = useMemo(() => {
    let filtered = firData;
    
    // Text search
    if (filters.query) {
      const query = filters.query.toLowerCase();
      filtered = filtered.filter(record => {
        const searchFields = [
          record.firDetails.firNumber,
          record.incidentDetails.placeOfOccurrence.address,
          record.personsInvolved.map(p => p.name).join(' '),
          record.vehiclesInvolved.map(v => v.registrationNumber).join(' ')
        ].join(' ').toLowerCase();
        
        return searchFields.includes(query);
      });
    }

    // Sort by FIR number (low to high) by default
    return filtered.sort((a, b) => {
      const firA = parseInt(a.firDetails.firNumber) || 0;
      const firB = parseInt(b.firDetails.firNumber) || 0;
      return firA - firB;
    });
  }, [firData, filters]);

  const getSeverityColor = (record: FIRRecord) => {
    const fatalities = record.personsInvolved.filter(p => p.status === 'Dead').length;
    if (fatalities > 0) return 'destructive';
    const injuries = record.personsInvolved.filter(p => p.injuryStatus === 'Injured').length;
    if (injuries > 0) return 'secondary';
    return 'default';
  };

  const getSeverityLabel = (record: FIRRecord) => {
    const fatalities = record.personsInvolved.filter(p => p.status === 'Dead').length;
    if (fatalities > 0) return 'High';
    const injuries = record.personsInvolved.filter(p => p.injuryStatus === 'Injured').length;
    if (injuries > 0) return 'Medium';
    return 'Low';
  };

  const formatDate = (dateString: string) => {
    if (!dateString || dateString === 'Invalid Date') return 'Date not available';
    
    // Handle DD/MM/YYYY format
    if (dateString.includes('/')) {
      const [day, month, year] = dateString.split('/');
      const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      if (isNaN(date.getTime())) return 'Date not available';
      
      return date.toLocaleDateString('en-US', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    }
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Date not available';
    
    return date.toLocaleDateString('en-US', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading Case Database...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar />
      
      <div className="flex-1 p-6">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">Case Search & Discovery</h1>
            <p className="text-muted-foreground">
              Search and explore FIR cases with advanced filtering and detailed insights
            </p>
          </div>

          {/* Search and Filters */}
          <Card>
            <CardHeader className="pb-4">
              <div className="space-y-1">
                <CardTitle className="flex items-center gap-2">
                  <MagnifyingGlassIcon className="h-5 w-5" />
                  Search Cases
                </CardTitle>
                <CardDescription>
                  Find specific cases using keywords and search terms
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Search Bar */}
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by FIR number, location, names, or vehicle registration..."
                  value={filters.query}
                  onChange={(e) => setFilters(prev => ({ ...prev, query: e.target.value }))}
                  className="pl-10 h-11"
                />
              </div>


              {/* Results Summary */}
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">Found</span>
                <Badge variant="secondary">{filteredData.length}</Badge>
                <span className="text-muted-foreground">cases</span>
                {filters.query && (
                  <span className="text-muted-foreground">• Sorted by FIR number (low to high)</span>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Case List */}
          <div className="space-y-4">
            {filteredData.length === 0 ? (
              <Card>
                <CardContent className="py-16 text-center">
                  <MagnifyingGlassIcon className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No cases found</h3>
                  <p className="text-muted-foreground">Try adjusting your search criteria or filters</p>
                </CardContent>
              </Card>
            ) : (
              filteredData.map((record, index) => (
                <Link key={`${record.firDetails.firNumber}-${index}`} href={`/search/${record.firDetails.firNumber}`}>
                  <Card className="hover:shadow-md transition-all duration-200 cursor-pointer group hover:border-primary/20">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 space-y-4">
                          <div className="flex items-center gap-3 flex-wrap">
                            <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                              {record.firDetails.firNumber}
                            </h3>
                            <Badge variant={getSeverityColor(record)}>
                              {getSeverityLabel(record)}
                            </Badge>
                            <Badge variant="outline" className="border-muted-foreground/20">
                              {record.firDetails.policeStation}
                            </Badge>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="flex items-center gap-2 text-sm">
                              <CalendarIcon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                              <span className="text-muted-foreground">
                                {formatDate(record.incidentDetails.startDate)}
                              </span>
                            </div>

                            <div className="flex items-center gap-2 text-sm">
                              <ClockIcon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                              <span className="text-muted-foreground">
                                {record.incidentDetails.startTime}
                              </span>
                            </div>

                            <div className="flex items-center gap-2 text-sm">
                              <MapPinIcon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                              <span className="text-muted-foreground truncate">
                                {record.incidentDetails.placeOfOccurrence.address}
                              </span>
                            </div>

                            <div className="flex items-center gap-2 text-sm">
                              <UserGroupIcon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                              <span className="text-muted-foreground">
                                {record.personsInvolved.length} people
                              </span>
                            </div>
                          </div>

                          {record.personsInvolved.filter(p => p.status === 'Dead').length > 0 && (
                            <div className="flex items-center gap-2 text-destructive">
                              <ExclamationTriangleIcon className="h-4 w-4" />
                              <span className="text-sm font-medium">
                                {record.personsInvolved.filter(p => p.status === 'Dead').length} fatality(ies)
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="text-right space-y-1 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <TruckIcon className="h-4 w-4" />
                            <span>{record.vehiclesInvolved.length} vehicle(s)</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPinIcon className="h-4 w-4" />
                            <span>{record.incidentDetails.placeOfOccurrence.distanceFromPS_km}km from PS</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
