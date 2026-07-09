'use client';
import { MapContainer, TileLayer, CircleMarker, Tooltip } from 'react-leaflet';
import type { CountryRisk } from '@/lib/api';
import { useMemo } from 'react';

const MAP_CENTER: [number, number] = [20, 15];
const MAP_STYLE = { height: '100%', width: '100%', borderRadius: 12 } as const;
const riskColor  = (r: number) => (r >= 70 ? '#EF4444' : r >= 40 ? '#F59E0B' : '#10B981');
const riskRadius = (r: number, selected: boolean) => (selected ? 18 : 8 + (r / 100) * 10);

export default function InteractiveMap({
  countries,
  selectedCode,
  onSelect,
}: {
  countries: CountryRisk[];
  selectedCode: string | null;
  onSelect: (c: CountryRisk) => void;
}) {
  const markers = useMemo(
    () =>
      countries.map((c) => {
        const color = riskColor(c.overall_risk);
        const selected = c.code === selectedCode;
        return {
          country: c,
          center: [c.lat, c.lng] as [number, number],
          radius: riskRadius(c.overall_risk, selected),
          pathOptions: {
            color: selected ? '#D4AF37' : color,
            fillColor: color,
            fillOpacity: selected ? 0.75 : 0.4,
            weight: selected ? 3 : 1.5,
            opacity: 1,
          },
        };
      }),
    [countries, selectedCode]
  );

  return (
    <MapContainer
      center={MAP_CENTER}
      zoom={2}
      minZoom={2}
      maxZoom={5}
      worldCopyJump
      scrollWheelZoom={false}
      style={MAP_STYLE}
      attributionControl={true}
    >
      <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png" attribution='&copy; OpenStreetMap &copy; CARTO' />
      <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_only_labels/{z}/{x}/{y}{r}.png" attribution="" opacity={0.55} />
      {markers.map((m) => (
        <CircleMarker
          key={m.country.code}
          center={m.center}
          radius={m.radius}
          pathOptions={m.pathOptions}
          eventHandlers={{ click: () => onSelect(m.country) }}
        >
          <Tooltip direction="top" offset={[0, -6]} opacity={1} className="!bg-transparent !border-0 !shadow-none">
            <div className="glass rounded-lg px-3 py-2 text-white text-xs">
              <div className="font-serif text-sm">{m.country.name}</div>
              <div className="font-mono uppercase tracking-widest text-[10px] text-white/60 mt-0.5">Click to inspect · Risk {m.country.overall_risk}</div>
            </div>
          </Tooltip>
        </CircleMarker>
      ))}
    </MapContainer>
  );
}
