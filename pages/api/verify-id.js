export default async function handler(req, res) {
  if (req.method === "POST") {
    try {
      const backendUrl = process.env.BACKEND_URL || "http://127.0.0.1:8000";

      const response = await fetch(`${backendUrl}/scan-id/verify_id`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(req.body),
      });

      const data = await response.json();
      res.status(response.status).json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}
