'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { FIRRecord } from '@/types/fir';

interface MapComponentProps {
  data: FIRRecord[];
  showHeatmap: boolean;
}

// Create a simple map component that loads Leaflet properly
const SimpleMap = dynamic(() => import('./SimpleMapInner'), { 
  ssr: false,
  loading: () => (
    <div className="h-full w-full flex items-center justify-center bg-gray-100 rounded-lg">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-2 text-gray-500">Loading map...</p>
      </div>
    </div>
  )
});

export default function MapComponent({ data, showHeatmap }: MapComponentProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-gray-100 rounded-lg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-500">Loading map...</p>
        </div>
      </div>
    );
  }

  // Filter out records with invalid coordinates
  const validData = data.filter(record => {
    const lat = record.incidentDetails.placeOfOccurrence.latitude;
    const lng = record.incidentDetails.placeOfOccurrence.longitude;
    return !isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0;
  });

  if (!validData.length) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-gray-100 rounded-lg">
        <p className="text-gray-500">No valid incident data available</p>
      </div>
    );
  }

  return (
    <div className="h-full w-full rounded-lg overflow-hidden">
      <SimpleMap data={validData} showHeatmap={showHeatmap} />
    </div>
  );
}