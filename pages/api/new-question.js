export default function handler(req, res) {
    const fs = require('fs');
    const path = require('path');

    if (req.method === 'POST') {
        const { users } = req.body;

        // Validate input
        if (!users || !Array.isArray(users) || users.length === 0) {
            return res.status(400).json({ message: 'Invalid data format' });
        }

        const rootFilePath = path.join(process.cwd(), 'data.json');
        const publicFilePath = path.join(process.cwd(), 'public', 'public.json');

        try {
            // Read existing data from root file
            const rootData = JSON.parse(fs.readFileSync(rootFilePath, 'utf-8'));

            // Ensure rootData.users exists
            rootData.users = rootData.users || [];

            // Process each user
            users.forEach(user => {
                if (user.question && user.question.trim() !== "") {
                    // Add user to root data
                    rootData.users.push(user);
                }
            });

            // Write updated data to root file
            fs.writeFileSync(rootFilePath, JSON.stringify(rootData, null, 2));

            // Copy data to public file
            fs.writeFileSync(publicFilePath, JSON.stringify(rootData, null, 2));

            res.status(200).json({ message: 'Questions added successfully!' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error updating files', error });
        }
    } else {
        res.status(405).json({ message: 'Method Not Allowed' });
    }
}
