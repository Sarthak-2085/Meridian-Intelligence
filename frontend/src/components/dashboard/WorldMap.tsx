'use client';
import { MapContainer, TileLayer, CircleMarker, Tooltip, useMap } from 'react-leaflet';
import type { CountryRisk } from '@/lib/api';
import { useEffect, useMemo } from 'react';

function ResizeHandler() {
  const map = useMap();
  useEffect(() => {
    const invalidate = () => map.invalidateSize();
    // fires once after mount (layout settles) and on any future window resize
    const t = setTimeout(invalidate, 150);
    window.addEventListener('resize', invalidate);
    return () => {
      clearTimeout(t);
      window.removeEventListener('resize', invalidate);
    };
  }, [map]);
  return null;
}

const MAP_CENTER: [number, number] = [20, 15];
const MAP_STYLE = { height: '100%', width: '100%', borderRadius: 12 } as const;
const LEGEND = [
  { label: 'Low',      color: '#10B981', range: '0 – 39' },
  { label: 'Moderate', color: '#F59E0B', range: '40 – 69' },
  { label: 'High',     color: '#EF4444', range: '70 – 100' },
];

const riskColor  = (r: number) => (r >= 70 ? '#EF4444' : r >= 40 ? '#F59E0B' : '#10B981');
const riskRadius = (r: number) => 6 + (r / 100) * 12;

export default function WorldMap({ countries }: { countries: CountryRisk[] }) {
  const markers = useMemo(
    () =>
      countries.map((c) => {
        const color = riskColor(c.overall_risk);
        return {
          country: c,
          center: [c.lat, c.lng] as [number, number],
          radius: riskRadius(c.overall_risk),
          pathOptions: {
            color,
            fillColor: color,
            fillOpacity: 0.35,
            weight: 1.5,
            opacity: 0.9,
          },
        };
      }),
    [countries]
  );

  return (
    <div className="relative h-full w-full">
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
        <ResizeHandler />
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png"
          attribution='&copy; OpenStreetMap &copy; CARTO'
        />
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_only_labels/{z}/{x}/{y}{r}.png"
          attribution=""
          opacity={0.55}
        />
        {markers.map((m) => (
          <CircleMarker
            key={m.country.code}
            center={m.center}
            radius={m.radius}
            pathOptions={m.pathOptions}
          >
            <Tooltip direction="top" offset={[0, -6]} opacity={1} className="!bg-transparent !border-0 !shadow-none">
              <div className="glass rounded-lg px-3 py-2 text-white text-xs font-sans">
                <div className="font-serif text-sm">{m.country.name}</div>
                <div className="font-mono uppercase tracking-widest text-[10px] text-white/60 mt-0.5">
                  Risk {m.country.overall_risk} · Pol {m.country.political_risk} · Econ {m.country.economic_risk}
                </div>
              </div>
            </Tooltip>
          </CircleMarker>
        ))}
      </MapContainer>

      <div className="absolute bottom-4 left-4 z-[400] glass rounded-xl px-4 py-3">
        <div className="font-mono text-[10px] uppercase tracking-widest text-white/50 mb-2">Risk Index</div>
        <div className="flex flex-col gap-1.5">
          {LEGEND.map((l) => (
            <div key={l.label} className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: l.color, boxShadow: `0 0 10px ${l.color}` }} />
              <span className="text-xs text-white/80">{l.label}</span>
              <span className="ml-2 font-mono text-[10px] text-white/40">{l.range}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}