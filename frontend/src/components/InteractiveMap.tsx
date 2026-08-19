import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { MissingPerson, UnidentifiedPerson } from '../types';
import { MapPin, Clock, Phone } from 'lucide-react';

interface InteractiveMapProps {
  missingCases: MissingPerson[];
  unidentifiedRecords?: UnidentifiedPerson[];
  center?: [number, number];
  zoom?: number;
  onSelectCase?: (caseItem: MissingPerson) => void;
  areaRiskStats?: Array<{ location: string; count: number; risk_level: 'RED' | 'ORANGE' | 'GREEN' }>;
}

const MapController: React.FC<{ center: [number, number]; zoom: number }> = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, zoom, { duration: 1.0 });
  }, [center, zoom, map]);
  return null;
};

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  missingCases,
  unidentifiedRecords = [],
  center = [16.5062, 80.6480],
  zoom = 9,
  onSelectCase,
  areaRiskStats = []
}) => {
  
  // Clean Pin Icon Generator (Red, Amber, Green, Blue)
  const createCleanMarkerIcon = (colorType: 'red' | 'amber' | 'green' | 'blue') => {
    const colorHexMap = {
      red: '#B54747',
      amber: '#B7791F',
      green: '#2F6B57',
      blue: '#17324D'
    };
    const bg = colorHexMap[colorType];

    const html = `
      <div style="
        width: 28px;
        height: 28px;
        background-color: ${bg};
        border: 2px solid #ffffff;
        border-radius: 50%;
        box-shadow: 0 2px 5px rgba(0, 0, 0, 0.25);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="width: 8px; height: 8px; background-color: #ffffff; border-radius: 50%;"></div>
      </div>
    `;

    return L.divIcon({
      className: 'clean-leaflet-marker',
      html: html,
      iconSize: [28, 28],
      iconAnchor: [14, 14],
      popupAnchor: [0, -14]
    });
  };

  const getRiskColorType = (location: string): 'red' | 'amber' | 'green' => {
    const found = areaRiskStats.find(a => location.toLowerCase().includes(a.location.toLowerCase()));
    if (found) {
      if (found.risk_level === 'RED') return 'red';
      if (found.risk_level === 'ORANGE') return 'amber';
    }
    return 'green';
  };

  return (
    <div className="relative w-full h-full rounded-xl overflow-hidden border border-border shadow-sm">
      
      {/* Map Legend Overlay */}
      <div className="absolute top-3 right-3 z-[1000] bg-surface/95 backdrop-blur-sm px-3 py-2 rounded-lg border border-border text-xs shadow-card space-y-1">
        <span className="font-bold text-text-main block border-b border-border pb-1 text-[11px] uppercase tracking-wider">
          Density Classification
        </span>
        <div className="flex items-center gap-2 text-text-muted text-[11px]">
          <span className="w-2.5 h-2.5 rounded-full bg-danger"></span>
          <span>High Priority (Red: 8+ cases)</span>
        </div>
        <div className="flex items-center gap-2 text-text-muted text-[11px]">
          <span className="w-2.5 h-2.5 rounded-full bg-warning"></span>
          <span>Medium Density (Amber: 4-7)</span>
        </div>
        <div className="flex items-center gap-2 text-text-muted text-[11px]">
          <span className="w-2.5 h-2.5 rounded-full bg-accent"></span>
          <span>Low Density (Green: 1-3)</span>
        </div>
        <div className="flex items-center gap-2 text-text-muted text-[11px] pt-1 border-t border-border">
          <span className="w-2.5 h-2.5 rounded-full bg-primary"></span>
          <span>NGO Intake Record</span>
        </div>
      </div>

      <MapContainer
        center={center}
        zoom={zoom}
        scrollWheelZoom={true}
        className="w-full h-full bg-slate-50"
      >
        {/* Clean CartoDB Positron Light Map Layer */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; CartoDB'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />

        <MapController center={center} zoom={zoom} />

        {/* Missing Person Markers */}
        {missingCases.map((caseItem) => {
          const colorType = getRiskColorType(caseItem.missing_location);
          return (
            <Marker
              key={`missing-${caseItem.id}`}
              position={[caseItem.latitude, caseItem.longitude]}
              icon={createCleanMarkerIcon(colorType)}
            >
              <Popup>
                <div className="p-1 max-w-xs space-y-2 text-xs">
                  <div className="flex items-center gap-2">
                    <img
                      src={caseItem.photo_url}
                      alt={caseItem.name}
                      className="w-11 h-11 rounded-lg object-cover border border-border bg-surface-subtle"
                    />
                    <div>
                      <h4 className="font-bold text-text-main">{caseItem.name}</h4>
                      <p className="text-[11px] text-primary font-semibold">Age: {caseItem.age} yrs</p>
                    </div>
                  </div>

                  <div className="space-y-1 text-text-muted border-t border-border pt-2 text-[11px]">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-danger shrink-0" />
                      <span>{caseItem.missing_location}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-warning shrink-0" />
                      <span>Missing: {caseItem.missing_date}</span>
                    </div>
                  </div>

                  {onSelectCase && (
                    <button
                      onClick={() => onSelectCase(caseItem)}
                      className="mt-2 w-full py-1.5 rounded-lg bg-primary text-white text-[11px] font-semibold hover:bg-primary-hover transition-colors"
                    >
                      View Case Record
                    </button>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* NGO Unidentified Person Markers */}
        {unidentifiedRecords.map((unidentified) => (
          <Marker
            key={`unidentified-${unidentified.id}`}
            position={[unidentified.latitude, unidentified.longitude]}
            icon={createCleanMarkerIcon('blue')}
          >
            <Popup>
              <div className="p-1 max-w-xs space-y-2 text-xs">
                <div className="flex items-center gap-2">
                  <img
                    src={unidentified.photo_url}
                    alt="Unidentified Person"
                    className="w-11 h-11 rounded-lg object-cover border border-border bg-surface-subtle"
                  />
                  <div>
                    <span className="px-1.5 py-0.5 text-[9px] font-bold bg-primary/10 text-primary rounded">
                      NGO RECORD
                    </span>
                    <h4 className="font-bold text-text-main mt-0.5">
                      {unidentified.name || 'Unidentified Person'}
                    </h4>
                  </div>
                </div>
                <div className="space-y-1 text-text-muted border-t border-border pt-2 text-[11px]">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-accent shrink-0" />
                    <span>Location: {unidentified.location}</span>
                  </div>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}

      </MapContainer>
    </div>
  );
};
