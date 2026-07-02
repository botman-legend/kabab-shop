import fs from 'fs';
import path from 'path';

const dataFilePath = path.join(process.cwd(), 'data.json');
const publicFilePath = path.join(process.cwd(), 'public', 'public.json');

export default function handler(req, res) {
  if (req.method === 'POST') {
    const { name, location, question } = req.body;

    let existingData = { users: [] };
    let publicData = { users: [] };

    // Check if data.json exists and load its content
    if (fs.existsSync(dataFilePath)) {
      const fileContents = fs.readFileSync(dataFilePath, 'utf8');
      existingData = JSON.parse(fileContents);
    }

    // Append new user data to data.json
    existingData.users.push({
      name,
      location: location || "Location Not Provided",
      timestamp: new Date().toISOString(),
      question
    });

    // Save updated data back to data.json
    fs.writeFileSync(dataFilePath, JSON.stringify(existingData, null, 2));

    // Check if public.json exists and load its content
    if (fs.existsSync(publicFilePath)) {
      const publicFileContents = fs.readFileSync(publicFilePath, 'utf8');
      publicData = JSON.parse(publicFileContents);
    }

    // If the question is not empty, add it to public.json
    if (question && question.trim() !== "") {
      publicData.users.push({
        name,
        location: location || "Location Not Provided",
        timestamp: new Date().toISOString(),
        question
      });

      // Save updated data to public.json
      fs.writeFileSync(publicFilePath, JSON.stringify(publicData, null, 2));
    }

    res.status(200).json({ message: 'Data saved successfully to both files' });
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
