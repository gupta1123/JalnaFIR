'use client';

import { useState, useEffect, use } from 'react';
import { FIRRecord } from '@/types/fir';
import { loadFIRData } from '@/lib/data';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import Sidebar from '@/components/Sidebar';
import { 
  ArrowLeftIcon,
  MapPinIcon,
  CalendarIcon,
  ClockIcon,
  UserIcon,
  TruckIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  ShieldCheckIcon,
  PhoneIcon,
  IdentificationIcon,
  MapIcon,
  BookOpenIcon,
  TagIcon
} from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface CaseDetailPageProps {
  params: Promise<{
    firNumber: string;
  }>;
}

export default function CaseDetailPage({ params }: CaseDetailPageProps) {
  const resolvedParams = use(params);
  const [firData, setFirData] = useState<FIRRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [caseRecord, setCaseRecord] = useState<FIRRecord | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const data = await loadFIRData();
        setFirData(data);
        
        // Find the specific case
        const decodedFirNumber = decodeURIComponent(resolvedParams.firNumber);
        const foundCase = data.find(record => record.firDetails.firNumber === decodedFirNumber);
        setCaseRecord(foundCase || null);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [resolvedParams.firNumber]);

  const getSeverityColor = (record: FIRRecord) => {
    const fatalities = record.personsInvolved.filter(p => p.status === 'Dead').length;
    if (fatalities > 0) return 'destructive';
    const injuries = record.personsInvolved.filter(p => p.injuryStatus === 'Injured').length;
    if (injuries > 0) return 'secondary';
    return 'default';
  };

  const getSeverityLabel = (record: FIRRecord) => {
    const fatalities = record.personsInvolved.filter(p => p.status === 'Dead').length;
    if (fatalities > 0) return 'High Severity';
    const injuries = record.personsInvolved.filter(p => p.injuryStatus === 'Injured').length;
    if (injuries > 0) return 'Medium Severity';
    return 'Low Severity';
  };

  const formatDate = (dateString: string) => {
    if (!dateString || dateString === 'Invalid Date') return 'Date not available';
    
    // Handle DD/MM/YYYY format
    if (dateString.includes('/')) {
      const [day, month, year] = dateString.split('/');
      const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      if (isNaN(date.getTime())) return 'Date not available';
      
      return date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Date not available';
    
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString: string, timeString: string) => {
    if (!dateString || dateString === 'Invalid Date') return 'Date not available';
    
    let date: Date;
    if (dateString.includes('/')) {
      const [day, month, year] = dateString.split('/');
      date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    } else {
      date = new Date(dateString);
    }
    
    if (isNaN(date.getTime())) return 'Date not available';
    
    // Set the time if provided
    if (timeString && timeString !== 'Invalid Date') {
      const [hours, minutes] = timeString.split(':');
      date.setHours(parseInt(hours), parseInt(minutes));
    }
    
    return date.toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const calculateAge = (yob: number) => {
    if (!yob || yob <= 0 || yob > new Date().getFullYear()) return 'Age not available';
    return new Date().getFullYear() - yob;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading Case Details...</p>
        </div>
      </div>
    );
  }

  if (!caseRecord) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <Sidebar />
        <div className="flex-1 p-6 flex items-center justify-center">
          <div className="text-center">
            <DocumentTextIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Case Not Found</h1>
            <p className="text-gray-600 mb-4">The requested FIR case could not be found.</p>
            <Link href="/search">
              <Button variant="outline">
                <ArrowLeftIcon className="h-4 w-4 mr-2" />
                Back to Search
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Remove duplicates based on name
  const uniquePersons = caseRecord.personsInvolved.reduce((acc: typeof caseRecord.personsInvolved, person) => {
    const existingIndex = acc.findIndex(p => p.name === person.name);
    if (existingIndex === -1) {
      acc.push(person);
    } else {
      // Merge information if person appears multiple times
      const existing = acc[existingIndex];
      acc[existingIndex] = {
        ...existing,
        role: existing.role || person.role,
        injuryStatus: existing.injuryStatus || person.injuryStatus,
        status: existing.status || person.status,
        mobileNumber: existing.mobileNumber || person.mobileNumber,
        address: existing.address || person.address
      };
    }
    return acc;
  }, []);

  // Categorize by role and status
  const complainants = uniquePersons.filter(p => p.role === 'Complainant');
  const accused = uniquePersons.filter(p => p.role === 'Accused');
  const victims = uniquePersons.filter(p => p.role === 'Victim');
  const witnesses = uniquePersons.filter(p => p.role === 'Witness' || (!p.role || p.role === 'Unknown'));
  
  // Get status counts for summary
  const deceasedCount = uniquePersons.filter(p => p.status === 'Dead').length;
  const injuredCount = uniquePersons.filter(p => p.injuryStatus === 'Injured').length;

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar />
      
      <div className="flex-1 p-6">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Header */}
          <div className="space-y-6">
            <Link href="/search">
              <Button variant="ghost" className="gap-2">
                <ArrowLeftIcon className="h-4 w-4" />
                Back to Search
              </Button>
            </Link>
            
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">{caseRecord.firDetails.firNumber}</h1>
                <p className="text-muted-foreground">
                  {formatDateTime(caseRecord.incidentDetails.startDate, caseRecord.incidentDetails.startTime)}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant={getSeverityColor(caseRecord)} className="text-sm">
                  {getSeverityLabel(caseRecord)}
                </Badge>
                <Badge variant="outline">
                  {caseRecord.firDetails.policeStation}
                </Badge>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Incident Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ExclamationTriangleIcon className="h-5 w-5" />
                    Incident Details
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="space-y-1">
                        <Label className="text-sm font-medium">Date of Occurrence</Label>
                        <p className="text-foreground">{formatDate(caseRecord.incidentDetails.startDate)}</p>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-sm font-medium">Time of Occurrence</Label>
                        <p className="text-foreground">{caseRecord.incidentDetails.startTime}</p>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-sm font-medium">Day of Week</Label>
                        <p className="text-foreground">{caseRecord.incidentDetails.dayOfWeek}</p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="space-y-1">
                        <Label className="text-sm font-medium">Location</Label>
                        <p className="text-foreground">{caseRecord.incidentDetails.placeOfOccurrence.address}</p>
                        <p className="text-sm text-muted-foreground">
                          {caseRecord.incidentDetails.placeOfOccurrence.distanceFromPS_km} km from police station
                        </p>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-sm font-medium">Coordinates</Label>
                        <p className="text-foreground font-mono text-sm">
                          {caseRecord.incidentDetails.placeOfOccurrence.latitude}, {caseRecord.incidentDetails.placeOfOccurrence.longitude}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* People Involved */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <UserIcon className="h-5 w-5" />
                    People Involved ({uniquePersons.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Accused */}
                    {accused.length > 0 && (
                      <div className="space-y-3">
                        <h4 className="font-semibold text-destructive flex items-center gap-2">
                          <ExclamationTriangleIcon className="h-4 w-4" />
                          Accused ({accused.length})
                        </h4>
                        <div className="grid gap-3">
                          {accused.map((person, index) => (
                            <div key={index} className={`p-4 rounded-lg border ${
                              person.status === 'Dead' 
                                ? 'bg-destructive/5 border-destructive/20' 
                                : person.injuryStatus === 'Injured'
                                ? 'bg-orange-50 border-orange-200'
                                : 'bg-red-50 border-red-200'
                            }`}>
                              <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                  <p className="font-medium text-foreground">{person.name}</p>
                                  <p className="text-sm text-muted-foreground">Age: {calculateAge(person.yob)}</p>
                                  <div className="flex gap-2">
                                    {person.status === 'Dead' && (
                                      <Badge variant="destructive" className="text-xs">Deceased</Badge>
                                    )}
                                    {person.injuryStatus === 'Injured' && (
                                      <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-700">Injured</Badge>
                                    )}
                                  </div>
                                </div>
                                <Badge variant="destructive">Accused</Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Victims */}
                    {victims.length > 0 && (
                      <div className="space-y-3">
                        <h4 className="font-semibold text-blue-600">Victims ({victims.length})</h4>
                        <div className="grid gap-3">
                          {victims.map((person, index) => (
                            <div key={index} className={`p-4 rounded-lg border ${
                              person.status === 'Dead' 
                                ? 'bg-destructive/5 border-destructive/20' 
                                : person.injuryStatus === 'Injured'
                                ? 'bg-orange-50 border-orange-200'
                                : 'bg-blue-50 border-blue-200'
                            }`}>
                              <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                  <p className="font-medium text-foreground">{person.name}</p>
                                  <p className="text-sm text-muted-foreground">Age: {calculateAge(person.yob)}</p>
                                  <div className="flex gap-2">
                                    {person.status === 'Dead' && (
                                      <Badge variant="destructive" className="text-xs">Deceased</Badge>
                                    )}
                                    {person.injuryStatus === 'Injured' && (
                                      <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-700">Injured</Badge>
                                    )}
                                  </div>
                                </div>
                                <Badge variant="outline" className="border-blue-300 text-blue-700">Victim</Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Complainants */}
                    {complainants.length > 0 && (
                      <div className="space-y-3">
                        <h4 className="font-semibold text-green-600">Complainants ({complainants.length})</h4>
                        <div className="grid gap-3">
                          {complainants.map((person, index) => (
                            <div key={index} className={`p-4 rounded-lg border ${
                              person.status === 'Dead' 
                                ? 'bg-destructive/5 border-destructive/20' 
                                : person.injuryStatus === 'Injured'
                                ? 'bg-orange-50 border-orange-200'
                                : 'bg-green-50 border-green-200'
                            }`}>
                              <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                  <p className="font-medium text-foreground">{person.name}</p>
                                  <p className="text-sm text-muted-foreground">Age: {calculateAge(person.yob)}</p>
                                  <div className="flex gap-2">
                                    {person.status === 'Dead' && (
                                      <Badge variant="destructive" className="text-xs">Deceased</Badge>
                                    )}
                                    {person.injuryStatus === 'Injured' && (
                                      <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-700">Injured</Badge>
                                    )}
                                  </div>
                                </div>
                                <Badge variant="outline" className="border-green-300 text-green-700">Complainant</Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Witnesses/Others */}
                    {witnesses.length > 0 && (
                      <div className="space-y-3">
                        <h4 className="font-semibold text-gray-600">Others ({witnesses.length})</h4>
                        <div className="grid gap-3">
                          {witnesses.map((person, index) => (
                            <div key={index} className={`p-4 rounded-lg border ${
                              person.status === 'Dead' 
                                ? 'bg-destructive/5 border-destructive/20' 
                                : person.injuryStatus === 'Injured'
                                ? 'bg-orange-50 border-orange-200'
                                : 'bg-gray-50 border-gray-200'
                            }`}>
                              <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                  <p className="font-medium text-foreground">{person.name}</p>
                                  <p className="text-sm text-muted-foreground">Age: {calculateAge(person.yob)}</p>
                                  <div className="flex gap-2">
                                    {person.status === 'Dead' && (
                                      <Badge variant="destructive" className="text-xs">Deceased</Badge>
                                    )}
                                    {person.injuryStatus === 'Injured' && (
                                      <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-700">Injured</Badge>
                                    )}
                                  </div>
                                </div>
                                <Badge variant="outline" className="border-gray-300 text-gray-700">Witness</Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Vehicles Involved */}
              {caseRecord.vehiclesInvolved.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TruckIcon className="h-5 w-5" />
                      Vehicles Involved ({caseRecord.vehiclesInvolved.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-3">
                      {caseRecord.vehiclesInvolved.map((vehicle, index) => (
                        <div key={index} className="p-4 bg-muted/50 rounded-lg border">
                          <div className="flex items-center justify-between">
                            <div className="space-y-1">
                              <p className="font-medium text-foreground">
                                {vehicle.registrationNumber || 'Unknown Registration'}
                              </p>
                              <p className="text-sm text-muted-foreground">Type: {vehicle.vehicleType}</p>
                            </div>
                            <Badge variant="outline">{vehicle.role}</Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Case Narrative Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpenIcon className="h-5 w-5" />
                    Case Summary
                  </CardTitle>
                  <CardDescription>
                    Written narrative and key details of the incident
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Written Summary */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Incident Description</Label>
                    <div className="p-4 bg-muted/30 rounded-lg border">
                      <p className="text-foreground leading-relaxed">
                        {caseRecord.narrativeSummary.summary_en || 'No summary available'}
                      </p>
                    </div>
                  </div>

                  {/* Keywords */}
                  {caseRecord.narrativeSummary.keywords && caseRecord.narrativeSummary.keywords.length > 0 && (
                    <div className="space-y-2">
                      <Label className="text-sm font-medium flex items-center gap-2">
                        <TagIcon className="h-4 w-4" />
                        Key Details
                      </Label>
                      <div className="flex flex-wrap gap-2">
                        {caseRecord.narrativeSummary.keywords.map((keyword, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {keyword}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Legal Sections Applied */}
              {caseRecord.sectionsApplied && caseRecord.sectionsApplied.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <DocumentTextIcon className="h-5 w-5" />
                      Legal Sections Applied
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-3">
                      {caseRecord.sectionsApplied.map((section, index) => (
                        <div key={index} className="p-3 bg-muted/30 rounded-lg border">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-foreground">{section.act}</p>
                              <p className="text-sm text-muted-foreground">Section: {section.section}</p>
                            </div>
                            <Badge variant="outline" className="border-blue-300 text-blue-700">
                              {section.section}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* FIR Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DocumentTextIcon className="h-5 w-5" />
                    FIR Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <Label className="text-sm font-medium">FIR Number</Label>
                      <p className="text-foreground font-mono text-sm">{caseRecord.firDetails.firNumber}</p>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-sm font-medium">Police Station</Label>
                      <p className="text-foreground">{caseRecord.firDetails.policeStation}</p>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-sm font-medium">FIR Date</Label>
                      <p className="text-foreground">{formatDate(caseRecord.firDetails.firTimestamp.split(' ')[0])}</p>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-sm font-medium">FIR Time</Label>
                      <p className="text-foreground">{caseRecord.firDetails.firTimestamp.split(' ')[1] || 'Time not available'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Stats */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ShieldCheckIcon className="h-5 w-5" />
                    Case Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Total People</span>
                      <Badge variant="secondary">{uniquePersons.length}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Accused</span>
                      <Badge variant="destructive">{accused.length}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Victims</span>
                      <Badge variant="outline" className="border-blue-300 text-blue-700">{victims.length}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Complainants</span>
                      <Badge variant="outline" className="border-green-300 text-green-700">{complainants.length}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Deceased</span>
                      <Badge variant="destructive">{deceasedCount}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Injured</span>
                      <Badge variant="secondary" className="bg-orange-100 text-orange-800">{injuredCount}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Vehicles</span>
                      <Badge variant="outline">{caseRecord.vehiclesInvolved.length}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Distance from PS</span>
                      <span className="font-medium text-foreground">{caseRecord.incidentDetails.placeOfOccurrence.distanceFromPS_km} km</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Location Map */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapIcon className="h-5 w-5" />
                    Location
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <Label className="text-sm font-medium">Address</Label>
                      <p className="text-foreground text-sm">{caseRecord.incidentDetails.placeOfOccurrence.address}</p>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-sm font-medium">Coordinates</Label>
                      <p className="text-foreground font-mono text-xs">
                        {caseRecord.incidentDetails.placeOfOccurrence.latitude}, {caseRecord.incidentDetails.placeOfOccurrence.longitude}
                      </p>
                    </div>
                    <Button 
                      variant="outline" 
                      className="w-full gap-2"
                      onClick={() => window.open(`https://www.google.com/maps?q=${caseRecord.incidentDetails.placeOfOccurrence.latitude},${caseRecord.incidentDetails.placeOfOccurrence.longitude}`, '_blank')}
                    >
                      <MapIcon className="h-4 w-4" />
                      View on Map
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
