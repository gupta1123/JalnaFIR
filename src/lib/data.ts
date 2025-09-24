import { FIRRecord, DashboardStats } from '@/types/fir';

export async function loadFIRData(): Promise<FIRRecord[]> {
  try {
    const response = await fetch('/data/fir_database_en_with_coordinates.json');
    if (!response.ok) {
      throw new Error('Failed to load FIR data');
    }
    const data: FIRRecord[] = await response.json();
    return data;
  } catch (error) {
    console.error('Error loading FIR data:', error);
    return [];
  }
}

export function calculateDashboardStats(data: FIRRecord[]): DashboardStats {
  const totalIncidents = data.length;
  const policeStations = new Set(data.map(record => record.firDetails.policeStation));
  const totalPoliceStations = policeStations.size;

  // Calculate incidents in the most recent month of 2024 data
  const incidentsByMonth: { [key: string]: number } = {};
  data.forEach(record => {
    const firDate = new Date(record.firDetails.firTimestamp);
    const monthKey = `${firDate.getFullYear()}-${firDate.getMonth() + 1}`;
    incidentsByMonth[monthKey] = (incidentsByMonth[monthKey] || 0) + 1;
  });
  
  // Find the month with highest incidents
  const mostActiveMonth = Object.entries(incidentsByMonth)
    .sort(([,a], [,b]) => b - a)[0];
  const incidentsInPeakMonth = mostActiveMonth ? mostActiveMonth[1] : 0;

  // Find most common incident type based on keywords
  const keywordCounts: { [key: string]: number } = {};
  data.forEach(record => {
    record.narrativeSummary.keywords.forEach(keyword => {
      keywordCounts[keyword] = (keywordCounts[keyword] || 0) + 1;
    });
  });
  
  const mostCommonIncidentType = Object.entries(keywordCounts)
    .sort(([,a], [,b]) => b - a)[0]?.[0] || 'Unknown';

  // Calculate average distance from police station
  const distances = data.map(record => record.incidentDetails.placeOfOccurrence.distanceFromPS_km);
  const averageDistanceFromPS = distances.reduce((sum, dist) => sum + dist, 0) / distances.length;

  return {
    totalIncidents,
    totalPoliceStations,
    incidentsThisMonth: incidentsInPeakMonth,
    mostCommonIncidentType,
    averageDistanceFromPS: Math.round(averageDistanceFromPS * 10) / 10
  };
}

export function getUniquePoliceStations(data: FIRRecord[]): string[] {
  const stations = new Set(data.map(record => record.firDetails.policeStation));
  return Array.from(stations).sort();
}

export function getUniqueKeywords(data: FIRRecord[]): string[] {
  const keywords = new Set<string>();
  data.forEach(record => {
    record.narrativeSummary.keywords.forEach(keyword => keywords.add(keyword));
  });
  return Array.from(keywords).sort();
}

export function filterFIRData(
  data: FIRRecord[],
  filters: {
    policeStation?: string;
    keyword?: string;
    dateRange?: { start: Date; end: Date };
  }
): FIRRecord[] {
  return data.filter(record => {
    // Filter by police station
    if (filters.policeStation && record.firDetails.policeStation !== filters.policeStation) {
      return false;
    }

    // Filter by keyword
    if (filters.keyword && !record.narrativeSummary.keywords.includes(filters.keyword)) {
      return false;
    }

    // Filter by date range
    if (filters.dateRange) {
      const firDate = new Date(record.firDetails.firTimestamp);
      if (firDate < filters.dateRange.start || firDate > filters.dateRange.end) {
        return false;
      }
    }

    return true;
  });
}
