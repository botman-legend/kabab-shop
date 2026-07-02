import React, { useState } from "react";

export default function ChatPage() {
  const [message, setMessage] = useState("");
  const [response, setResponse] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch("http://localhost:8000/chat-bot/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message }),
      });

      const data = await res.json();
      setResponse(data.reply || "No response received.");
    } catch (err) {
      console.error("Error contacting backend:", err);
      setResponse("Error connecting to backend.");
    }
  };

  return (
    <main className="p-6 max-w-xl mx-auto">
      <h1 className="text-xl font-bold mb-4">🛒 Samsung ProductBot</h1>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Ask about Samsung Galaxy..."
          className="border px-4 py-2 flex-grow"
        />
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
          Send
        </button>
      </form>
      <div className="mt-6 whitespace-pre-wrap bg-gray-50 p-4 rounded border">
        {response}
      </div>
    </main>
  );
}
