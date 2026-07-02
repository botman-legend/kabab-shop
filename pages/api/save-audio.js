import fs from "fs";
import path from "path";

export default async function handler(req, res) {
  if (req.method === "POST") {
    const audioFilePath = path.join(process.cwd(), "public", "recordings");
    const locationData = JSON.parse(req.body.get("location")); // Parse location data

    if (!fs.existsSync(audioFilePath)) {
      fs.mkdirSync(audioFilePath, { recursive: true });
    }

    const fileStream = fs.createWriteStream(
      path.join(audioFilePath, "recording.mp3")
    );
    req.pipe(fileStream);

    req.on("end", () => {
      console.log("Location data:", locationData);
      res.status(200).json({ message: "Audio and location saved successfully" });
    });
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
}
