const mongoose = require('mongoose');

const graphController = {
    updateGraphCollection: async (req, res) => {
        try {
            const { unit_ID, t, h, w, eb, ups, x, y } = req.body;
            if (!unit_ID) {
                return res.status(400).json({ error: 'unit_ID is required' });
            }
            const collectionName = `Board_${unit_ID}`;
            const collection = mongoose.connection.collection(collectionName);

            const updateValues = { t, h, w, eb, ups, x, y };

            const result = await collection.updateOne(
                { unit_ID: parseInt(unit_ID) },
                { $set: updateValues },
                { upsert: true }
            );

            if (result.matchedCount === 0) {
                return res.status(404).json({ error: 'Unit ID not found' });
            }

            return res.status(200).json({ message: 'Data updated successfully', data: updateValues });
        } catch (error) {
            console.error('Error updating graph collection:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    },

    getGraphData: async (req, res) => {
        try {
            const { unit_ID } = req.params;
            if (!unit_ID) {
                return res.status(400).json({ error: 'unit_ID is required' });
            }
            const collectionName = `Board_${unit_ID}`;
            const collection = mongoose.connection.collection(collectionName);

            const data = await collection.find().toArray();

            return res.status(200).json({ data });
        } catch (error) {
            console.error('Error fetching graph data:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    },
};

module.exports = graphController;