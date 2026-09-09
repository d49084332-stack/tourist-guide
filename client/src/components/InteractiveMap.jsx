import { useEffect, useRef, useState } from 'react';
import { MapPin, Navigation, Layers, Maximize2, ZoomIn, ZoomOut } from 'lucide-react';

// Leaflet is already installed (leaflet@1.9.4 + react-leaflet@4.2.1)
// We load it dynamically so it doesn't conflict with SSR
let L = null;
const loadLeaflet = async () => {
  if (L) return L;
  L = (await import('leaflet')).default;
  return L;
};

// Tile layer options
const TILE_LAYERS = {
  street: {
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    label: 'Street'
  },
  satellite: {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: '© <a href="https://www.esri.com">Esri</a> World Imagery',
    label: 'Satellite'
  },
  topo: {
    url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
    attribution: '© <a href="https://opentopomap.org">OpenTopoMap</a>',
    label: 'Topographic'
  }
};

// Category icon colors
const CATEGORY_COLORS = {
  'Hotel': '#6366f1',
  'Temple': '#f59e0b',
  'Church': '#2d9b4e',
  'Beach': '#ed6a20',
  'Tourist Attraction': '#ec4899',
  'Historical Place': '#8b5cf6',
  'Restaurant': '#ef4444',
  'Cafe': '#a855f7',
  'Waterfall': '#55b86a',
  'Fort': '#92400e',
  'Nature & Wildlife': '#22c55e',
  'Park': '#16a34a',
  'Popular Landmark': '#f97316',
  'Fuel': '#ea580c',
  'Hospital': '#dc2626',
  'Shopping': '#d946ef',
  'Parking': '#64748b',
  'Viewpoint': '#10b981'
};

const CATEGORY_ICONS = {
  'Hotel': '🏨', 'Temple': '🛕', 'Church': '⛪', 'Beach': '🏖️',
  'Tourist Attraction': '📍', 'Historical Place': '🏛️', 'Restaurant': '🍴',
  'Cafe': '☕', 'Waterfall': '🌊', 'Fort': '🏰', 'Nature & Wildlife': '🌳',
  'Park': '🌿', 'Popular Landmark': '⭐',
  'Fuel': '⛽', 'Hospital': '🏥', 'Shopping': '🛍️', 'Parking': '🅿️', 'Viewpoint': '🌄'
};


function createCategoryIcon(leaflet, category, isHotel = false) {
  const color = CATEGORY_COLORS[category] || '#64748b';
  const emoji = CATEGORY_ICONS[category] || '📍';
  const border = isHotel ? '3px solid #fff' : '2px solid rgba(255,255,255,0.8)';
  const shadow = isHotel ? '0 2px 12px rgba(0,0,0,0.4)' : '0 1px 6px rgba(0,0,0,0.3)';
  const size = isHotel ? 42 : 36;

  return leaflet.divIcon({
    html: `<div style="
      width:${size}px;height:${size}px;
      background:${color};
      border-radius:50%;
      display:flex;align-items:center;justify-content:center;
      font-size:${isHotel ? 18 : 15}px;
      border:${border};
      box-shadow:${shadow};
      cursor:pointer;
    ">${emoji}</div>`,
    className: '',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -(size / 2) - 4]
  });
}

function createStartIcon(leaflet) {
  return leaflet.divIcon({
    html: `<div style="
      width:44px;height:44px;
      background:linear-gradient(135deg,#10b981,#059669);
      border-radius:50%;
      display:flex;align-items:center;justify-content:center;
      font-size:20px;border:3px solid #fff;
      box-shadow:0 2px 14px rgba(16,185,129,0.5);
    ">🟢</div>`,
    className: '',
    iconSize: [44, 44],
    iconAnchor: [22, 22],
    popupAnchor: [0, -26]
  });
}

function createDestIcon(leaflet) {
  return leaflet.divIcon({
    html: `<div style="
      width:44px;height:44px;
      background:linear-gradient(135deg,#ef4444,#dc2626);
      border-radius:50%;
      display:flex;align-items:center;justify-content:center;
      font-size:20px;border:3px solid #fff;
      box-shadow:0 2px 14px rgba(239,68,68,0.5);
    ">🔴</div>`,
    className: '',
    iconSize: [44, 44],
    iconAnchor: [22, 22],
    popupAnchor: [0, -26]
  });
}

export default function InteractiveMap({
  route,
  places = [],
  onBookHotel,
  onSelectPlace,
  selectedPlace
}) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const tileLayerRef = useRef(null);
  const routeLayerRef = useRef(null);
  const markersGroupRef = useRef(null);
  const [mapMode, setMapMode] = useState('street');
  const [leafletReady, setLeafletReady] = useState(false);

  // Initialize map once on mount
  useEffect(() => {
    let isMounted = true;

    const initMap = async () => {
      const leaflet = await loadLeaflet();
      if (!isMounted || !mapRef.current || mapInstanceRef.current) return;

      // Create the map centered on India by default
      const map = leaflet.map(mapRef.current, {
        center: [20.5937, 78.9629],
        zoom: 5,
        zoomControl: false,
        attributionControl: true
      });

      // Custom zoom control position
      leaflet.control.zoom({ position: 'bottomright' }).addTo(map);

      // Initial tile layer (street view)
      const tile = leaflet.tileLayer(TILE_LAYERS.street.url, {
        attribution: TILE_LAYERS.street.attribution,
        maxZoom: 19
      });
      tile.addTo(map);

      tileLayerRef.current = tile;
      markersGroupRef.current = leaflet.layerGroup().addTo(map);
      mapInstanceRef.current = map;
      setLeafletReady(true);
    };

    initMap();

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        tileLayerRef.current = null;
        routeLayerRef.current = null;
        markersGroupRef.current = null;
      }
    };
  }, []);

  // Switch tile layers
  useEffect(() => {
    if (!leafletReady || !mapInstanceRef.current) return;

    const loadAndSwitch = async () => {
      const leaflet = await loadLeaflet();
      const map = mapInstanceRef.current;
      if (!map) return;

      if (tileLayerRef.current) {
        map.removeLayer(tileLayerRef.current);
      }

      const layer = TILE_LAYERS[mapMode];
      const tile = leaflet.tileLayer(layer.url, {
        attribution: layer.attribution,
        maxZoom: 19
      });
      tile.addTo(map);
      tileLayerRef.current = tile;
    };

    loadAndSwitch();
  }, [mapMode, leafletReady]);

  // Render route polyline and all place markers whenever route/places change
  useEffect(() => {
    if (!leafletReady || !mapInstanceRef.current) return;

    const renderRoute = async () => {
      const leaflet = await loadLeaflet();
      const map = mapInstanceRef.current;
      if (!map) return;

      // Clear previous route + markers
      if (routeLayerRef.current) {
        map.removeLayer(routeLayerRef.current);
        routeLayerRef.current = null;
      }
      if (markersGroupRef.current) {
        markersGroupRef.current.clearLayers();
      }

      if (!route) return;

      const { waypoints, startCoords, destCoords, startCity, destCity } = route;
      const allBounds = [];

      // Draw the real road polyline from OSRM/Google Directions
      if (waypoints && waypoints.length > 1) {
        const polyline = leaflet.polyline(waypoints, {
          color: '#6366f1',
          weight: 5,
          opacity: 0.85,
          smoothFactor: 1.5,
          lineCap: 'round',
          lineJoin: 'round',
          dashArray: null
        });
        polyline.addTo(map);
        routeLayerRef.current = polyline;
        allBounds.push(...waypoints);
      }

      // Start marker with real geocoded coordinates
      if (startCoords) {
        const startM = leaflet.marker(startCoords, { icon: createStartIcon(leaflet) });
        startM.bindPopup(`
          <div style="font-family:sans-serif;padding:4px 0">
            <strong style="color:#10b981;font-size:13px">🟢 Starting Point</strong><br/>
            <span style="font-size:12px;color:#374151">${startCity || 'Starting Location'}</span><br/>
            <span style="font-size:10px;color:#9ca3af">${startCoords[0].toFixed(5)}, ${startCoords[1].toFixed(5)}</span>
          </div>
        `);
        markersGroupRef.current.addLayer(startM);
        allBounds.push(startCoords);
      }

      // Destination marker with real geocoded coordinates
      if (destCoords) {
        const destM = leaflet.marker(destCoords, { icon: createDestIcon(leaflet) });
        destM.bindPopup(`
          <div style="font-family:sans-serif;padding:4px 0">
            <strong style="color:#ef4444;font-size:13px">🔴 Destination</strong><br/>
            <span style="font-size:12px;color:#374151">${destCity || 'Destination'}</span><br/>
            <span style="font-size:10px;color:#9ca3af">${destCoords[0].toFixed(5)}, ${destCoords[1].toFixed(5)}</span>
          </div>
        `);
        markersGroupRef.current.addLayer(destM);
        allBounds.push(destCoords);
      }

      // Real-world POI markers from Google Places / OSM Overpass
      for (const place of (places || [])) {
        const [pLat, pLon] = place.coordinates || [];
        if (pLat == null || pLon == null) continue;

        const icon = createCategoryIcon(leaflet, place.category, place.isHotel);
        const marker = leaflet.marker([pLat, pLon], { icon });

        const bookButton = place.isHotel
          ? `<button id="book-${place.id}" style="
              margin-top:8px;width:100%;padding:6px 12px;
              background:linear-gradient(135deg,#6366f1,#4f46e5);
              color:#fff;border:none;border-radius:8px;
              font-size:11px;font-weight:700;cursor:pointer;letter-spacing:0.5px;
            ">🏨 Book Now — ₹${place.pricePerNight?.toLocaleString()}/night</button>`
          : '';

        const popupHtml = `
          <div style="font-family:sans-serif;min-width:200px;max-width:240px">
            <img src="${place.images?.[0] || ''}" alt="${place.name}"
              style="width:100%;height:90px;object-fit:cover;border-radius:8px 8px 0 0;display:${place.images?.[0] ? 'block' : 'none'}" />
            <div style="padding:8px">
              <span style="font-size:10px;background:${CATEGORY_COLORS[place.category] || '#64748b'};
                color:#fff;padding:2px 6px;border-radius:8px;font-weight:700">
                ${place.icon || ''} ${place.category}
              </span>
              <p style="margin:5px 0 2px;font-size:13px;font-weight:700;color:#111">${place.name}</p>
              <p style="margin:0;font-size:11px;color:#6b7280;line-clamp:2">${place.description || ''}</p>
              <div style="margin-top:4px;font-size:10px;color:#9ca3af">
                📍 ${place.locationAddress || `${pLat.toFixed(4)}, ${pLon.toFixed(4)}`}<br/>
                ⭐ ${(place.rating || 4.0).toFixed(1)} (${place.reviewCount || '—'} reviews)
                ${place.distanceFromRouteKm ? ` • 🛣️ ${place.distanceFromRouteKm} off route` : ''}
              </div>
              ${bookButton}
            </div>
          </div>
        `;

        const popup = leaflet.popup({ maxWidth: 260, minWidth: 200 }).setContent(popupHtml);
        marker.bindPopup(popup);

        marker.on('popupopen', () => {
          if (place.isHotel) {
            setTimeout(() => {
              const btn = document.getElementById(`book-${place.id}`);
              if (btn) {
                btn.addEventListener('click', () => {
                  marker.closePopup();
                  onBookHotel && onBookHotel(place);
                });
              }
            }, 100);
          }
          onSelectPlace && onSelectPlace(place);
        });

        markersGroupRef.current.addLayer(marker);
        allBounds.push([pLat, pLon]);
      }

      // Fit map to show full route + all markers
      if (allBounds.length > 0) {
        try {
          map.fitBounds(leaflet.latLngBounds(allBounds), {
            padding: [40, 40],
            maxZoom: 14,
            animate: true
          });
        } catch (e) {
          // Ignore bound-fitting errors
        }
      }
    };

    renderRoute();
  }, [leafletReady, route, places]);

  // Highlight selected place by opening its popup
  useEffect(() => {
    if (!leafletReady || !mapInstanceRef.current || !selectedPlace) return;

    const [lat, lon] = selectedPlace.coordinates || [];
    if (lat != null && lon != null) {
      mapInstanceRef.current.setView([lat, lon], 14, { animate: true });
    }
  }, [selectedPlace, leafletReady]);

  const handleZoomIn = () => mapInstanceRef.current?.zoomIn();
  const handleZoomOut = () => mapInstanceRef.current?.zoomOut();

  return (
    <div className="relative w-full h-[480px] sm:h-[560px] rounded-3xl overflow-hidden shadow-xl border border-gray-200 dark:border-gray-700">
      {/* Map Container */}
      <div ref={mapRef} className="w-full h-full z-0" />

      {/* Loading overlay */}
      {!leafletReady && (
        <div className="absolute inset-0 bg-gray-100 dark:bg-gray-800 flex items-center justify-center z-10">
          <div className="text-center space-y-2">
            <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-gray-500">Loading interactive map…</p>
          </div>
        </div>
      )}

      {/* Map Mode Toggle */}
      <div className="absolute top-3 right-3 z-[1000] flex flex-col gap-1.5">
        {Object.entries(TILE_LAYERS).map(([key, layer]) => (
          <button
            key={key}
            onClick={() => setMapMode(key)}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold shadow transition-all ${
              mapMode === key
                ? 'bg-primary-600 text-white'
                : 'bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700 hover:bg-gray-50'
            }`}
          >
            {layer.label}
          </button>
        ))}
      </div>

      {/* Route Summary Badge */}
      {route && (
        <div className="absolute bottom-3 left-3 z-[1000] bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm rounded-xl px-3 py-2 shadow-lg border border-gray-200 dark:border-gray-700 text-xs space-y-0.5 max-w-xs">
          <div className="font-bold text-gray-900 dark:text-white flex items-center gap-1">
            <Navigation size={12} className="text-primary-500" />
            <span className="truncate">{route.startCity} → {route.destCity}</span>
          </div>
          <div className="text-gray-500 flex items-center gap-2">
            <span>📏 {route.distanceKm} km</span>
            <span>⏱️ {route.estimatedDuration}</span>
            {places.length > 0 && <span>📍 {places.length} places</span>}
          </div>
          {route.provider && (
            <div className="text-[10px] text-gray-400">
              Route via {route.provider === 'google' ? 'Google Maps' : route.provider === 'osrm' ? 'OSRM Real Roads' : 'Live Routing'}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
