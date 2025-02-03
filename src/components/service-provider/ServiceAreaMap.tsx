import React from 'react';
import { MapContainer, TileLayer, Circle } from 'react-leaflet';
import { LatLngTuple } from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface ServiceAreaMapProps {
  center: LatLngTuple;
  radius: number; // radius in meters
}

export const ServiceAreaMap: React.FC<ServiceAreaMapProps> = ({ center, radius }) => {
  return (
    <div className="h-[400px] w-full rounded-lg overflow-hidden">
      <MapContainer
        center={center}
        zoom={13}
        scrollWheelZoom={false}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <Circle
          center={center}
          pathOptions={{
            color: 'blue',
            fillColor: 'blue',
            fillOpacity: 0.2,
          }}
          radius={radius}
        />
      </MapContainer>
    </div>
  );
};