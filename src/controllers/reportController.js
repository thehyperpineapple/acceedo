const mongoose = require('mongoose');

const ReportController = {
    generateReport: async (req, res) => {
        try {
            const { unit_ID } = req.params;
            const { start_date, end_date } = req.query;

            if (!unit_ID || !start_date || !end_date) {
                return res.status(400).json({ error: 'Missing required parameters' });
            }

            const collectionName = `Board_${unit_ID}`;
            const collection = mongoose.connection.collection(collectionName);

            const data = await collection.find({
                created_at: { $gte: new Date(start_date), $lte: new Date(end_date) }
            }).toArray();

            if (!data.length) {
                return res.status(404).json({ error: 'No data found for the given parameters' });
            }

            // Generate report logic (e.g., Excel, PDF)
            return res.status(200).json({ message: 'Report generated successfully', data });
        } catch (error) {
            console.error('Error generating report:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    },
};

module.exports = ReportController;
