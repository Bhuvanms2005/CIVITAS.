import React, { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';

// Fix for default icon issue (keep this part as is)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

// Helper component to change the map view when position prop changes
function ChangeView({ center, zoom }) {
  const map = useMap();
  map.setView(center, zoom);
  return null;
}

// Component to handle map clicks and marker placement
function LocationMarker({ onLocationChange }) {
  useMapEvents({
    click(e) {
      if (onLocationChange) {
        onLocationChange(e.latlng); // Pass the {lat, lng} object up
      }
    },
  });
  return null; // This component does not render anything itself
}

// UPDATE THE MAIN COMPONENT HERE
function InteractiveMap({ onLocationChange, position }) { // Accept 'position' as a prop
  const defaultCenter = [12.9716, 77.5946]; // Bengaluru
  const [markerPosition, setMarkerPosition] = useState(null);
  
  // NEW: This effect syncs the external position prop with the internal marker state
  useEffect(() => {
    if (position && position.lat && position.lon) {
      // Convert {lat, lon} from the form to {lat, lng} for Leaflet
      setMarkerPosition({ lat: position.lat, lng: position.lon });
    }
  }, [position]); // Re-run when the position prop from the form changes

  const handleInternalLocationChange = (latlng) => {
    setMarkerPosition(latlng);
    // Propagate the change up to the parent form component
    if (onLocationChange) {
      onLocationChange(latlng);
    }
  };

  return (
    <div className="map-container">
      <MapContainer center={defaultCenter} zoom={13} style={{ height: '400px', width: '100%' }}>
        {/* This helper component will fly the map to the new position */}
        {markerPosition && <ChangeView center={markerPosition} zoom={16} />}

        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        
        <LocationMarker onLocationChange={handleInternalLocationChange} />

        {markerPosition && (
          <Marker position={markerPosition}>
            <Popup>Selected Location</Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
}

export default InteractiveMap;