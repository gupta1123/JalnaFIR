export interface PlaceOfOccurrence {
  address: string;
  directionFromPS: string;
  distanceFromPS_km: number;
  latitude: number;
  longitude: number;
}

export interface IncidentDetails {
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  dayOfWeek: string;
  placeOfOccurrence: PlaceOfOccurrence;
}

export interface FIRDetails {
  firNumber: string;
  policeStation: string;
  district: string;
  year: number;
  firTimestamp: string;
  informationType: string;
}

export interface SectionApplied {
  act: string;
  section: string;
}

export interface PersonInvolved {
  role: string;
  name: string;
  yob: number;
  address: string | null;
  mobileNumber: string | null;
  injuryStatus: string | null;
  status: string | null;
}

export interface VehicleInvolved {
  registrationNumber: string | null;
  vehicleType: string;
  make: string;
  role: string;
}

export interface NarrativeSummary {
  summary_en: string;
  keywords: string[];
}

export interface AdminDetails {
  gdEntryNumber: string;
  gdTimestamp: string;
  officerInCharge: string;
  investigatingOfficer: string;
}

export interface FIRRecord {
  firDetails: FIRDetails;
  incidentDetails: IncidentDetails;
  sectionsApplied: SectionApplied[];
  personsInvolved: PersonInvolved[];
  vehiclesInvolved: VehicleInvolved[];
  narrativeSummary: NarrativeSummary;
  adminDetails: AdminDetails;
  source_pdf: string;
}

export interface DashboardStats {
  totalIncidents: number;
  totalPoliceStations: number;
  incidentsThisMonth: number;
  mostCommonIncidentType: string;
  averageDistanceFromPS: number;
}
