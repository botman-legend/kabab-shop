import { useEffect, useState } from "react";

export default function Home() {
  const [location, setLocation] = useState(null);
  const [name, setName] = useState("Mohamed El Nashar"); // Replace with actual user data

  useEffect(() => {
    // Fetch user's location using Geolocation API
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLocation({ lat: latitude, lng: longitude });
        },
        (error) => console.error("Error fetching location:", error.message)
      );
    } else {
      console.error("Geolocation is not supported by this browser.");
    }
  }, []);

  useEffect(() => {
    if (location && name) {
      // Send name and location to the API
      fetch('/api/save-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, location }),
      })
        .then((response) => response.json())
        .then((data) => console.log(data))
        .catch((error) => console.error('Error saving data:', error));
    }
  }, [location, name]);

  return (
    <div>
      <h1>Mohamed El Nashar Application</h1>
      <p>Fetching location...</p>
    </div>
  );
}
