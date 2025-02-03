import React from 'react';

interface ServiceAreaMapProps {
  center: [number, number];
  radius: number; // radius in meters
}

export const ServiceAreaMap: React.FC<ServiceAreaMapProps> = ({ center, radius }) => {
  return (
    <div className="h-[400px] w-full rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
      <p className="text-gray-500 text-center">
        Service area centered at coordinates: {center[0]}, {center[1]}<br />
        with a radius of {(radius / 1000).toFixed(1)} km
      </p>
    </div>
  );
};