'use client';

import { useState, useEffect } from 'react';
import { FIRRecord } from '@/types/fir';
import { loadFIRData } from '@/lib/data';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Sidebar from '@/components/Sidebar';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, PieChart, Pie, Cell
} from 'recharts';

export default function AnalyticsPage() {
  const [firData, setFirData] = useState<FIRRecord[]>([]);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading Strategic Analytics...</p>
        </div>
      </div>
    );
  }

  // Calculate analytics
  const analytics = calculateStrategicAnalytics(firData);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      
      <div className="flex-1 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Strategic Analytics</h1>
            <p className="text-gray-600 mt-2">AI-Powered Insights for Strategic Decision Making</p>
          </div>



          {/* Temporal Patterns Section */}
          <section id="temporal-patterns" className="mb-12">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <span>⏰</span>
                  <span>Temporal Intelligence</span>
                </CardTitle>
                <CardDescription>
                  Time-based patterns for strategic deployment planning
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Peak Hours */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4 text-green-700">24-Hour Crime Pattern</h3>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={analytics.peakHours} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                          <XAxis 
                            dataKey="hour" 
                            stroke="#666"
                            fontSize={12}
                          />
                          <YAxis stroke="#666" />
                          <Tooltip 
                            contentStyle={{
                              backgroundColor: '#fff',
                              border: '1px solid #e5e7eb',
                              borderRadius: '8px',
                              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                            }}
                            formatter={(value: number) => [`${value}`, 'Incidents']}
                          />
                          <Area 
                            type="monotone" 
                            dataKey="incidents" 
                            stroke="#10b981" 
                            fill="#10b981" 
                            fillOpacity={0.3}
                            strokeWidth={2}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Day of Week Analysis */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4 text-blue-700">Weekly Pattern Analysis</h3>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={analytics.dayOfWeekPatterns} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                          <XAxis 
                            dataKey="day" 
                            stroke="#666"
                            fontSize={12}
                          />
                          <YAxis stroke="#666" />
                          <Tooltip 
                            contentStyle={{
                              backgroundColor: '#fff',
                              border: '1px solid #e5e7eb',
                              borderRadius: '8px',
                              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                            }}
                            formatter={(value: number) => [`${value}`, 'Incidents']}
                          />
                          <Bar dataKey="incidents" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Case Intelligence Section */}
          <section id="case-intelligence" className="mb-12">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <span>📊</span>
                  <span>Case Intelligence & Demographics</span>
                </CardTitle>
                <CardDescription>
                  Case complexity analysis and demographic insights
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Case Complexity Metrics */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-indigo-700">Case Complexity Metrics</h3>
                    
                    {/* Average People per Case */}
                    <div className="bg-gradient-to-r from-indigo-50 to-indigo-100 p-4 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-indigo-700">Avg People per Case</span>
                        <Badge variant="secondary" className="bg-indigo-200 text-indigo-800">
                          {analytics.avgPeoplePerCase}
                        </Badge>
                      </div>
                      <div className="w-full bg-indigo-200 rounded-full h-2">
                        <div 
                          className="bg-indigo-600 h-2 rounded-full transition-all duration-500" 
                          style={{ width: `${Math.min(analytics.avgPeoplePerCase * 20, 100)}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Unknown Suspect Rate */}
                    <div className="bg-gradient-to-r from-orange-50 to-orange-100 p-4 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-orange-700">Unknown Suspect Rate</span>
                        <Badge variant="secondary" className="bg-orange-200 text-orange-800">
                          {analytics.unknownSuspectRate}%
                        </Badge>
                      </div>
                      <div className="w-full bg-orange-200 rounded-full h-2">
                        <div 
                          className="bg-orange-600 h-2 rounded-full transition-all duration-500" 
                          style={{ width: `${analytics.unknownSuspectRate}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Multi-Vehicle Cases */}
                    <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-purple-700">Multi-Vehicle Cases</span>
                        <Badge variant="secondary" className="bg-purple-200 text-purple-800">
                          {analytics.multiVehicleRate}%
                        </Badge>
                      </div>
                      <div className="w-full bg-purple-200 rounded-full h-2">
                        <div 
                          className="bg-purple-600 h-2 rounded-full transition-all duration-500" 
                          style={{ width: `${analytics.multiVehicleRate}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  {/* Age Demographics Pie Chart */}
                  <div className="lg:col-span-2">
                    <h3 className="text-lg font-semibold mb-4 text-teal-700">Victim Age Demographics</h3>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={analytics.ageGroups}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="count"
                          >
                            {analytics.ageGroups.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={[
                                '#14b8a6', '#0d9488', '#0f766e', '#115e59', '#134e4a'
                              ][index % 5]} />
                            ))}
                          </Pie>
                          <Tooltip 
                            contentStyle={{
                              backgroundColor: '#fff',
                              border: '1px solid #e5e7eb',
                              borderRadius: '8px',
                              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                            }}
                            formatter={(value: number) => [`${value}`, 'Victims']}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>
        </div>
      </div>
    </div>
  );
}

// Analytics calculation functions
function calculateStrategicAnalytics(data: FIRRecord[]) {
  // Fatality Rate by Station
  const stationStats: { [key: string]: {
    totalIncidents: number;
    fatalities: number;
    injuries: number;
    distances: number[];
    hitAndRunCases: number;
    totalCases: number;
  } } = {};
  data.forEach(record => {
    const station = record.firDetails.policeStation;
    if (!stationStats[station]) {
      stationStats[station] = {
        totalIncidents: 0,
        fatalities: 0,
        injuries: 0,
        distances: [],
        hitAndRunCases: 0,
        totalCases: 0
      };
    }
    
    stationStats[station].totalIncidents++;
    stationStats[station].distances.push(record.incidentDetails.placeOfOccurrence.distanceFromPS_km);
    
    // Count fatalities and injuries
    record.personsInvolved.forEach(person => {
      if (person.status === 'Dead') stationStats[station].fatalities++;
      if (person.injuryStatus === 'Injured') stationStats[station].injuries++;
    });
    
    // Count hit-and-run cases
    const hasFleeingVehicle = record.vehiclesInvolved.some(vehicle => 
      vehicle.role === 'Accused Vehicle' && !vehicle.registrationNumber
    );
    if (hasFleeingVehicle) stationStats[station].hitAndRunCases++;
    stationStats[station].totalCases++;
  });

  const fatalityRates = Object.entries(stationStats).map(([name, stats]) => ({
    name,
    totalIncidents: stats.totalIncidents,
    fatalities: stats.fatalities,
    fatalityRate: Math.round((stats.fatalities / stats.totalIncidents) * 100)
  })).sort((a, b) => b.fatalityRate - a.fatalityRate);

  const responseDistances = Object.entries(stationStats).map(([name, stats]) => ({
    name,
    incidents: stats.totalIncidents,
    avgDistance: Math.round((stats.distances.reduce((sum: number, dist: number) => sum + dist, 0) / stats.distances.length) * 10) / 10
  })).sort((a, b) => b.avgDistance - a.avgDistance);

  const hitAndRunStations = Object.entries(stationStats).map(([name, stats]) => ({
    name,
    hitAndRunRate: Math.round((stats.hitAndRunCases / stats.totalCases) * 100),
    totalCases: stats.totalCases
  })).sort((a, b) => b.hitAndRunRate - a.hitAndRunRate).slice(0, 5);

  // High-risk stations (high fatality + high distance)
  const highRiskStations = Object.entries(stationStats)
    .map(([name, stats]) => ({
      name,
      fatalityRate: Math.round((stats.fatalities / stats.totalIncidents) * 100),
      avgDistance: Math.round((stats.distances.reduce((sum: number, dist: number) => sum + dist, 0) / stats.distances.length) * 10) / 10
    }))
    .filter(station => station.fatalityRate > 0 || station.avgDistance > 20)
    .sort((a, b) => (b.fatalityRate + b.avgDistance) - (a.fatalityRate + a.avgDistance))
    .slice(0, 5);

  // Resource priority scoring
  const resourcePriority = Object.entries(stationStats).map(([name, stats]) => {
    const fatalityScore = (stats.fatalities / stats.totalIncidents) * 50;
    const distanceScore = Math.min(stats.distances.reduce((sum: number, dist: number) => sum + dist, 0) / stats.distances.length / 2, 30);
    const workloadScore = Math.min(stats.totalIncidents / 5, 20);
    const priorityScore = Math.round(fatalityScore + distanceScore + workloadScore);
    
    return { name, priorityScore };
  }).sort((a, b) => b.priorityScore - a.priorityScore).slice(0, 5);

  // Temporal analysis
  const hourStats: { [key: string]: number } = {};
  const dayStats: { [key: string]: number } = {};
  
  data.forEach(record => {
    const hour = record.incidentDetails.startTime.split(':')[0];
    const day = record.incidentDetails.dayOfWeek;
    
    hourStats[hour] = (hourStats[hour] || 0) + 1;
    dayStats[day] = (dayStats[day] || 0) + 1;
  });

  const peakHours = Array.from({ length: 24 }, (_, i) => {
    const hour = i.toString().padStart(2, '0');
    return { hour: `${hour}:00`, incidents: hourStats[hour] || 0 };
  });

  const dayOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const dayOfWeekPatterns = dayOrder.map(day => ({
    day,
    incidents: dayStats[day] || 0
  }));

  // Case complexity analysis
  const totalPeople = data.reduce((sum, record) => sum + record.personsInvolved.length, 0);
  const avgPeoplePerCase = Math.round((totalPeople / data.length) * 10) / 10;

  const unknownSuspects = data.filter(record => 
    record.personsInvolved.some(person => person.role === 'Accused' && person.name && person.name.includes('Unknown'))
  ).length;
  const unknownSuspectRate = Math.round((unknownSuspects / data.length) * 100);

  const multiVehicleCases = data.filter(record => record.vehiclesInvolved.length > 1).length;
  const multiVehicleRate = Math.round((multiVehicleCases / data.length) * 100);

  // Age group analysis
  const ageGroups: { [key: string]: number } = {};
  data.forEach(record => {
    record.personsInvolved.forEach(person => {
      if (person.yob > 0) {
        const age = 2024 - person.yob;
        let group = '';
        if (age < 18) group = 'Under 18';
        else if (age < 30) group = '18-29';
        else if (age < 45) group = '30-44';
        else if (age < 60) group = '45-59';
        else group = '60+';
        
        ageGroups[group] = (ageGroups[group] || 0) + 1;
      }
    });
  });

  const ageGroupArray = Object.entries(ageGroups)
    .map(([range, count]) => ({ range, count }))
    .sort((a, b) => b.count - a.count);

  return {
    fatalityRates,
    responseDistances,
    highRiskStations,
    hitAndRunStations,
    resourcePriority,
    peakHours,
    dayOfWeekPatterns,
    avgPeoplePerCase,
    unknownSuspectRate,
    multiVehicleRate,
    ageGroups: ageGroupArray
  };
}
