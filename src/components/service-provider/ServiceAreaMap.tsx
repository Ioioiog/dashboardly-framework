import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
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

export function ServiceAreaMap({ areas }: ServiceAreaMapProps) {
  const [coordinates, setCoordinates] = useState<AreaCoordinate[]>([]);

  useEffect(() => {
    const fetchCoordinates = async () => {
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
    };

    if (areas.length > 0) {
      fetchCoordinates();
    }
  }, [areas]);

  if (coordinates.length === 0) {
    return null;
  }

  // Calculate center point from all coordinates
  const center = coordinates.reduce(
    (acc, curr) => ({
      lat: acc.lat + curr.lat / coordinates.length,
      lng: acc.lng + curr.lng / coordinates.length,
    }),
    { lat: 0, lng: 0 }
  );

  return (
    <div className="h-[400px] w-full rounded-lg overflow-hidden mt-4">
      <MapContainer
        center={[center.lat, center.lng]}
        zoom={5}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {coordinates.map((coord) => (
          <Marker key={coord.name} position={[coord.lat, coord.lng]}>
            <Popup>{coord.name}</Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}