"use client";

import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css';
import 'leaflet-defaulticon-compatibility';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect, useState, useRef, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet-routing-machine';

const svgIcon = L.divIcon({
  html: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="size-6">
    <path fill-rule="evenodd" d="m11.54 22.351.07.04.028.016a.76.76 0 0 0 .723 0l.028-.015.071-.041a16.975 16.975 0 0 0 1.144-.742 19.58 19.58 0 0 0 2.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 0 0-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 0 0 2.682 2.282 16.975 16.975 0 0 0 1.145.742ZM12 13.5a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" clip-rule="evenodd" />
  </svg>`,
  className: "",
  iconSize: [50, 100],
  iconAnchor: [20, 30]
});

const MapComponent = ({ session }) => {
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bestLocation, setBestLocation] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [route, setRoute] = useState([]);
  const mapRef = useRef();

  // Stable callback for adding routes
  const handleAddRoute = useCallback((center) => {
    if (route.length === 1) {
      L.Routing.control({
        waypoints: [
          L.latLng(route[0].lat, route[0].lng),
          L.latLng(center.lat, center.lng)
        ],
        routeWhileDragging: true
      }).addTo(mapRef.current);
      setRoute([]);
    } else {
      setRoute([...route, center]);
    }
  }, [route]);

  // Geolocation watcher
  useEffect(() => {
    if ('geolocation' in navigator) {
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          const newLocation = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: position.timestamp
          };

          setLocation(newLocation);

          if (!bestLocation || newLocation.accuracy < bestLocation.accuracy) {
            setBestLocation(newLocation);
          }

          if (newLocation.accuracy <= 6) {
            navigator.geolocation.clearWatch(watchId);
          }

          setLoading(false);

          if (session?.user) {
            fetch('/api/save-user', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                email: session.user.email,
                location: {
                  latitude: newLocation.latitude,
                  longitude: newLocation.longitude
                },
                timestamp: new Date(newLocation.timestamp).toISOString()
              })
            }).catch(error => console.error('Error saving user data:', error));
          }
        },
        (error) => {
          console.error("Error getting location: ", error);
          setLoading(false);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );

      return () => navigator.geolocation.clearWatch(watchId);
    } else {
      console.error("Geolocation not available");
      setLoading(false);
    }
  }, [bestLocation, session]);

  // Geocoding search
  useEffect(() => {
    if (searchQuery && mapRef.current) {
      const geocoder = L.Control.Geocoder.nominatim();
      geocoder.geocode(searchQuery, (results) => {
        if (results.length > 0) {
          const { center } = results[0];
          mapRef.current.setView(center, 17);
          L.marker(center, { icon: svgIcon }).addTo(mapRef.current);
          handleAddRoute(center);
        }
      });
    }
  }, [searchQuery, handleAddRoute]);

  return (
    <MapContainer
      center={[51.505, -0.09]}
      zoom={13}
      ref={mapRef}
      style={{ height: "100vh", width: "100%" }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      {bestLocation && (
        <Marker
          position={[bestLocation.latitude, bestLocation.longitude]}
          icon={svgIcon}
        >
          <Popup>You are here</Popup>
        </Marker>
      )}
    </MapContainer>
  );
};

export default MapComponent;
