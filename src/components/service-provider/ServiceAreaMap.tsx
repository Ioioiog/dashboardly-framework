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

export default function ServiceAreaMap({ areas }: ServiceAreaMapProps) {
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
              if (data && data.length > 0) {
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

        const validCoordinates = results.filter((res): res is AreaCoordinate => res !== null);
        setCoordinates(validCoordinates);
      } catch (error) {
        console.error('Error fetching coordinates:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (areas.length > 0) {
      fetchCoordinates();
    }
  }, [areas]);

  if (isLoading) return <p>Loading map...</p>;
  if (coordinates.length === 0) return <p>No service areas found.</p>;

  // Calculate the center point from the first coordinate
  const defaultCenter: L.LatLngExpression = coordinates.length > 0 
    ? [coordinates[0].lat, coordinates[0].lng]
    : [0, 0];

  return (
    <MapContainer 
      center={defaultCenter}
      zoom={12}
      style={{ height: '400px', width: '100%' }}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      {coordinates.map((area, index) => (
        <Marker 
          key={index} 
          position={[area.lat, area.lng] as L.LatLngExpression}
        >
          <Popup>{area.name}</Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}