import { MapPin } from 'lucide-react';

interface ServiceAreaMapProps {
  areas: string[];
}

export default function ServiceAreaMap({ areas }: ServiceAreaMapProps) {
  if (areas.length === 0) return <p>No service areas found.</p>;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
      {areas.map((area, index) => (
        <div 
          key={index}
          className="flex items-center gap-2 p-3 bg-muted rounded-lg"
        >
          <MapPin className="h-4 w-4 text-muted-foreground" />
          <span>{area}</span>
        </div>
      ))}
    </div>
  );
}