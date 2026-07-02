import fs from 'fs';
import path from 'path';

const dataFilePath = path.join(process.cwd(), 'data.json');

// Read data from data.json
export function getData() {
  const fileContents = fs.readFileSync(dataFilePath, 'utf8');
  return JSON.parse(fileContents);
}

// Write data to data.json
export function saveData(newUser) {
  let existingData = { users: [] };

  if (fs.existsSync(dataFilePath)) {
    const fileContents = fs.readFileSync(dataFilePath, 'utf8');
    existingData = JSON.parse(fileContents);
  }

  existingData.users.push(newUser);
  fs.writeFileSync(dataFilePath, JSON.stringify(existingData, null, 2));
}
