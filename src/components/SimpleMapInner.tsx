'use client';

import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { FIRRecord } from '@/types/fir';

// Fix for default markers in React Leaflet
delete (L.Icon.Default.prototype as unknown as { _getIconUrl: unknown })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface SimpleMapInnerProps {
  data: FIRRecord[];
  showHeatmap: boolean;
}

// Component to handle map resize
function MapResizeHandler() {
  const map = useMap();
  
  useEffect(() => {
    // Force map to resize after it's ready
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 100);
    
    return () => clearTimeout(timer);
  }, [map]);

  return null;
}

// Heatmap layer component
function HeatmapLayer({ data }: { data: FIRRecord[] }) {
  const map = useMap();
  const heatmapRef = useRef<L.Layer | null>(null);

  useEffect(() => {
    if (!data.length) return;

    // Create heat data with intensity based on incident severity
    const heatData = data.map(record => {
      const lat = record.incidentDetails.placeOfOccurrence.latitude;
      const lng = record.incidentDetails.placeOfOccurrence.longitude;
      
      // Calculate intensity based on severity
      let intensity = 1; // base intensity
      
      // Increase intensity for fatal incidents
      if (record.personsInvolved.some(p => p.status === 'Dead')) {
        intensity = 3;
      } else if (record.personsInvolved.some(p => p.injuryStatus === 'Injured')) {
        intensity = 2;
      }
      
      // Increase intensity for multiple people involved
      intensity += Math.min(record.personsInvolved.length * 0.2, 1);
      
      return [lat, lng, intensity];
    });

    // Remove existing heatmap layer
    if (heatmapRef.current) {
      map.removeLayer(heatmapRef.current);
    }

    // Try to load heatmap using different methods
    const loadHeatmap = async () => {
      try {
        // Method 1: Try importing the module
        const heatModule = await import('leaflet.heat');
        const heatFunction = heatModule.default || heatModule;
        
        if (typeof heatFunction === 'function') {
          heatmapRef.current = heatFunction(heatData, {
            radius: 30,
            blur: 20,
            maxZoom: 17,
            gradient: {
              0.2: 'blue',
              0.4: 'cyan',
              0.6: 'lime',
              0.8: 'yellow',
              1.0: 'red'
            }
          });
          heatmapRef.current.addTo(map);
          return;
        }
      } catch {
        console.log('Method 1 failed, trying method 2...');
      }

      try {
        // Method 2: Try using L.heatLayer directly
        if ((window as unknown as { L?: { heatLayer?: (...args: unknown[]) => unknown } }).L?.heatLayer) {
          heatmapRef.current = (window as unknown as { L: { heatLayer: (...args: unknown[]) => unknown } }).L.heatLayer(heatData, {
            radius: 30,
            blur: 20,
            maxZoom: 17,
            gradient: {
              0.2: 'blue',
              0.4: 'cyan',
              0.6: 'lime',
              0.8: 'yellow',
              1.0: 'red'
            }
          }) as L.Layer;
          heatmapRef.current.addTo(map);
          return;
        }
      } catch {
        console.log('Method 2 failed, trying method 3...');
      }

      // Method 3: Create a simple circle-based heatmap
      console.log('Creating fallback heatmap visualization...');
      data.forEach(record => {
        const lat = record.incidentDetails.placeOfOccurrence.latitude;
        const lng = record.incidentDetails.placeOfOccurrence.longitude;
        
        let intensity = 1;
        if (record.personsInvolved.some(p => p.status === 'Dead')) {
          intensity = 3;
        } else if (record.personsInvolved.some(p => p.injuryStatus === 'Injured')) {
          intensity = 2;
        }
        
        const radius = intensity * 15; // Scale radius based on intensity
        const color = intensity === 3 ? 'red' : intensity === 2 ? 'orange' : 'blue';
        
        const circle = L.circle([lat, lng], {
          radius: radius,
          fillColor: color,
          fillOpacity: 0.3,
          color: color,
          weight: 1,
          opacity: 0.5
        });
        
        circle.addTo(map);
        if (!heatmapRef.current) {
          heatmapRef.current = L.layerGroup();
        }
        (heatmapRef.current as L.LayerGroup).addLayer(circle);
      });
      
      if (heatmapRef.current) {
        heatmapRef.current.addTo(map);
      }
    };

    loadHeatmap();

    return () => {
      if (heatmapRef.current) {
        map.removeLayer(heatmapRef.current);
      }
    };
  }, [data, map]);

  return null;
}

// Custom marker icons based on incident type
function getMarkerIcon(keywords: string[]) {
  const hasAccident = keywords.some(k => k.includes('accident') || k.includes('collision'));
  const hasTheft = keywords.some(k => k.includes('theft') || k.includes('robbery'));
  const hasViolence = keywords.some(k => k.includes('assault') || k.includes('violence'));
  
  let color = 'red'; // default
  
  if (hasAccident) color = 'orange';
  else if (hasTheft) color = 'blue';
  else if (hasViolence) color = 'red';
  
  return L.divIcon({
    className: 'custom-div-icon',
    html: `<div style="background-color: ${color}; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8]
  });
}

export default function SimpleMapInner({ data, showHeatmap }: SimpleMapInnerProps) {
  // Calculate center point from data
  const centerLat = data.reduce((sum, record) => sum + record.incidentDetails.placeOfOccurrence.latitude, 0) / data.length;
  const centerLng = data.reduce((sum, record) => sum + record.incidentDetails.placeOfOccurrence.longitude, 0) / data.length;

  // Fallback to Jalna district center if calculation fails
  const mapCenter: [number, number] = isNaN(centerLat) || isNaN(centerLng) 
    ? [19.8333, 75.8833] // Jalna district center coordinates
    : [centerLat, centerLng];

  return (
    <div className="relative h-full w-full">
      <MapContainer
        center={mapCenter}
        zoom={10}
        style={{ height: '100%', width: '100%' }}
        className="z-0"
      >
        <MapResizeHandler />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* Heatmap Layer */}
        {showHeatmap && <HeatmapLayer data={data} />}
        
        {/* Individual Markers */}
        {!showHeatmap && data.map((record, index) => (
        <Marker
          key={`${record.firDetails.firNumber}-${index}`}
          position={[
            record.incidentDetails.placeOfOccurrence.latitude,
            record.incidentDetails.placeOfOccurrence.longitude
          ]}
          icon={getMarkerIcon(record.narrativeSummary.keywords)}
        >
          <Popup maxWidth={400} maxHeight={500}>
            <div className="p-3 min-w-[350px] max-w-[400px]">
              {/* Header with severity indicator */}
              <div className="flex items-center justify-between mb-3">
                <div className="font-bold text-lg text-gray-900">
                  FIR #{record.firDetails.firNumber}
                </div>
                <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                  record.personsInvolved.some(p => p.status === 'Dead') 
                    ? 'bg-red-100 text-red-800' 
                    : record.personsInvolved.some(p => p.injuryStatus === 'Injured')
                    ? 'bg-orange-100 text-orange-800'
                    : 'bg-green-100 text-green-800'
                }`}>
                  {record.personsInvolved.some(p => p.status === 'Dead') 
                    ? 'FATAL' 
                    : record.personsInvolved.some(p => p.injuryStatus === 'Injured')
                    ? 'INJURY'
                    : 'MINOR'}
                </div>
              </div>

              {/* Key Metrics */}
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div className="bg-gray-50 p-2 rounded">
                  <div className="text-xs text-gray-500">Response Distance</div>
                  <div className="font-semibold text-sm">{record.incidentDetails.placeOfOccurrence.distanceFromPS_km} km</div>
                </div>
                <div className="bg-gray-50 p-2 rounded">
                  <div className="text-xs text-gray-500">People Involved</div>
                  <div className="font-semibold text-sm">{record.personsInvolved.length}</div>
                </div>
              </div>

              {/* Incident Details */}
              <div className="space-y-2 mb-3">
                <div className="flex items-start space-x-2">
                  <div className="text-gray-500 text-xs w-16">Time:</div>
                  <div className="text-xs">
                    <div className="font-medium">{record.incidentDetails.dayOfWeek}</div>
                    <div className="text-gray-600">{record.incidentDetails.startTime}</div>
                  </div>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="text-gray-500 text-xs w-16">Location:</div>
                  <div className="text-xs">
                    <div className="font-medium">{record.incidentDetails.placeOfOccurrence.address}</div>
                    <div className="text-gray-600">{record.incidentDetails.placeOfOccurrence.directionFromPS} of PS</div>
                  </div>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="text-gray-500 text-xs w-16">Station:</div>
                  <div className="text-xs font-medium">{record.firDetails.policeStation}</div>
                </div>
              </div>

              {/* Legal Sections */}
              <div className="mb-3">
                <div className="text-xs text-gray-500 mb-1">Legal Sections Applied:</div>
                <div className="flex flex-wrap gap-1">
                  {record.sectionsApplied.slice(0, 3).map((section, i) => (
                    <span
                      key={i}
                      className="px-2 py-1 bg-red-50 text-red-700 text-xs rounded border border-red-200"
                    >
                      {section.section}
                    </span>
                  ))}
                  {record.sectionsApplied.length > 3 && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                      +{record.sectionsApplied.length - 3} more
                    </span>
                  )}
                </div>
              </div>

              {/* Vehicles Involved */}
              {record.vehiclesInvolved.length > 0 && (
                <div className="mb-3">
                  <div className="text-xs text-gray-500 mb-1">Vehicles Involved:</div>
                  <div className="space-y-1">
                    {record.vehiclesInvolved.slice(0, 2).map((vehicle, i) => (
                      <div key={i} className="flex items-center space-x-2 text-xs">
                        <div className={`w-2 h-2 rounded-full ${
                          vehicle.role === 'Accused Vehicle' ? 'bg-red-500' : 
                          vehicle.role === 'Witness Vehicle' ? 'bg-blue-500' : 'bg-gray-500'
                        }`}></div>
                        <div>
                          <span className="font-medium">{vehicle.vehicleType}</span>
                          {vehicle.registrationNumber && (
                            <span className="text-gray-600 ml-1">({vehicle.registrationNumber})</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Keywords */}
              <div className="mb-3">
                <div className="text-xs text-gray-500 mb-1">Incident Type:</div>
                <div className="flex flex-wrap gap-1">
                  {record.narrativeSummary.keywords.slice(0, 4).map((keyword, i) => (
                    <span
                      key={i}
                      className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>

              {/* Summary */}
              <div className="border-t pt-2">
                <div className="text-xs text-gray-500 mb-1">Summary:</div>
                <div className="text-xs text-gray-700 leading-relaxed">
                  {record.narrativeSummary.summary_en.substring(0, 150)}
                  {record.narrativeSummary.summary_en.length > 150 && '...'}
                </div>
              </div>

              {/* Footer */}
              <div className="border-t pt-2 mt-2 text-xs text-gray-500">
                <div>Officer: {record.adminDetails.investigatingOfficer}</div>
                <div>Reported: {new Date(record.firDetails.firTimestamp).toLocaleDateString('en-IN')}</div>
              </div>
            </div>
          </Popup>
        </Marker>
      ))}
      </MapContainer>
      
      {/* Heatmap Legend */}
      {showHeatmap && (
        <div className="absolute bottom-4 right-4 bg-white rounded-lg shadow-lg p-3 z-10">
          <div className="text-sm font-semibold text-gray-800 mb-2">Incident Density</div>
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 rounded" style={{ background: 'linear-gradient(to right, blue, cyan, lime, yellow, red)' }}></div>
              <span className="text-xs text-gray-600">Low to High</span>
            </div>
            <div className="text-xs text-gray-500 mt-2">
              <div>🔴 Red: Fatal incidents</div>
              <div>🟡 Yellow: Multiple people</div>
              <div>🔵 Blue: Minor incidents</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
