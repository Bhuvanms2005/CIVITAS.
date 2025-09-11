import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, GeoJSON, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css'; // <-- Don't forget to import the CSS
import Legend from './Legend'; // <-- 1. IMPORT THE LEGEND COMPONENT
import './Legend.css'; 
const ZoneMap = () => {
    const [zones, setZones] = useState(null);

    // Fetch the zone data from our new backend endpoint when the component mounts
    useEffect(() => {
        fetch('https://civitas-37g6.onrender.com/api/zones')
            .then((res) => res.json())
            .then((data) => setZones(data))
            .catch((err) => console.error("Error fetching zones:", err));
    }, []);

    // This function determines the style of each polygon based on its properties
    const getZoneStyle = (feature) => {
        return {
            fillColor: feature.properties.zoneColor, // Use the color from our API
            weight: 10,
            opacity: 1,
            color: 'white', // Border color
            fillOpacity: 0.6,
        };
    };

    // This function adds a popup to each zone when it's clicked
    const onEachFeature = (feature, layer) => {
        if (feature.properties && feature.properties.name) {
            layer.bindPopup(
                `<h3>${feature.properties.name}</h3>
                 <p>Complaints: ${feature.properties.complaintCount}</p>`
            );
        }
    };

    if (!zones) {
        return <div>Loading Map...</div>;
    }

    return (
        <MapContainer 
            center={[12.9716, 77.5946]} // Centered on Bengaluru
            zoom={12} 
            style={{ height: '600px', width: '100%' }}
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <GeoJSON 
                data={zones} 
                style={getZoneStyle} 
                onEachFeature={onEachFeature} 
            />
        </MapContainer>
    );
};

export default ZoneMap;