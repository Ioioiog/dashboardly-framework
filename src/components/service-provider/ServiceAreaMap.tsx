import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect, useState } from 'react';
import L from 'leaflet';

// Fix for default marker icons in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface ServiceAreaMapProps {
  areas: string[];
}

interface AreaCoordinate {
  name: string;
  lat: number;
  lng: number;
}

// Component to handle map center updates
function ChangeCenter({ center }: { center: L.LatLngExpression }) {
  const map = useMap();
  
  useEffect(() => {
    map.setView(center);
  }, [center, map]);
  
  return null;
}

function ServiceAreaMapComponent({ areas }: ServiceAreaMapProps) {
  const [coordinates, setCoordinates] = useState<AreaCoordinate[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCoordinates = async () => {
      try {
        const results = await Promise.all(
          areas.map(async (area) => {
            try {
              const response = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(area)}`
              );
              const data = await response.json();
              if (data && data[0]) {
                return {
                  name: area,
                  lat: parseFloat(data[0].lat),
                  lng: parseFloat(data[0].lon),
                };
              }
              return null;
            } catch (error) {
              console.error(`Error fetching coordinates for ${area}:`, error);
              return null;
            }
          })
        );

        setCoordinates(results.filter((result): result is AreaCoordinate => result !== null));
      } catch (error) {
        console.error('Error fetching coordinates:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (areas.length > 0) {
      fetchCoordinates();
    } else {
      setIsLoading(false);
    }
  }, [areas]);

  if (isLoading) {
    return <div className="h-[400px] w-full flex items-center justify-center bg-gray-50">Loading map...</div>;
  }

  if (coordinates.length === 0) {
    return (
      <div className="h-[400px] w-full flex items-center justify-center bg-gray-50">
        No service areas defined or could not load coordinates.
      </div>
    );
  }

  const defaultPosition: L.LatLngExpression = [coordinates[0].lat, coordinates[0].lng];

  return (
    <div className="h-[400px] w-full rounded-lg overflow-hidden mt-4">
      <MapContainer
        style={{ height: '100%', width: '100%' }}
        center={defaultPosition}
        zoom={7}
      >
        <ChangeCenter center={defaultPosition} />
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {coordinates.map((coord) => {
          const position: L.LatLngExpression = [coord.lat, coord.lng];
          return (
            <Marker 
              key={coord.name} 
              position={position}
            >
              <Popup>{coord.name}</Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}

// Create a wrapper component that handles the dynamic import
const MapWrapper = ({ areas }: ServiceAreaMapProps) => {
  if (typeof window === 'undefined') return null;
  return <ServiceAreaMapComponent areas={areas} />;
};

export const ServiceAreaMap = MapWrapper;