'use client';
import { useState } from "react";
import axios from "axios";
import { useSession } from "next-auth/react";

// Axios instance with baseURL from env
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL, // e.g. https://botman-production.up.railway.app
});

export default function CheckoutPage() {
  const { data: session } = useSession();
  const [location, setLocation] = useState("");
  const [phone, setPhone] = useState("");
  const [sessionStart] = useState(new Date().toISOString());
  const [status, setStatus] = useState("");

  // Ask client for location using browser geolocation
  const getLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = `${pos.coords.latitude}, ${pos.coords.longitude}`;
        setLocation(coords);
      },
      (err) => {
        console.error("Geolocation error:", err);
        alert("Unable to retrieve location.");
      }
    );
  };

  const phoneRegex = /^01\d{9}$/;

  const handleCheckout = async () => {
    if (!session?.user?.email) {
      alert("You must be logged in to checkout.");
      return;
    }
    if (!location) {
      alert("Please provide your location.");
      return;
    }
    if (!phoneRegex.test(phone)) {
      alert("Please enter a valid Egyptian phone number (e.g., 01234567890).");
      return;
    }

    try {
      const res = await api.post("/cart/checkout", {
        client_email: session.user.email,
        location,
        phone,
        session_start: sessionStart,
      });
      setStatus(res.data.message);
    } catch (err) {
      console.error("Checkout error:", err);
      setStatus(err.response?.data?.detail || "Checkout failed");
    }
  };

  const isReady = location && phoneRegex.test(phone);

  return (
    <div className="p-6 max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-4">Complete Purchase</h2>

      <div className="space-y-3">
        <button
          onClick={getLocation}
          className="bg-blue-500 text-white px-3 py-2 rounded"
        >
          Get My Location
        </button>
        {location && <div className="text-sm text-gray-700">Location: {location}</div>}

        <input
          type="tel"
          placeholder="Phone (01234567890)"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="border p-2 w-full"
        />
      </div>

      <button
        className={`mt-4 px-4 py-2 rounded ${
          isReady ? "bg-green-600 text-white" : "bg-gray-400 text-gray-700 cursor-not-allowed"
        }`}
        onClick={handleCheckout}
        disabled={!isReady}
      >
        Confirm Purchase
      </button>

      {status && <div className="mt-4 text-blue-600">{status}</div>}
    </div>
  );
}
