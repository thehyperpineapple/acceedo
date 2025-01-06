const mongoose = require('mongoose');
const QuickChart = require('quickchart-js');

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

    generateGraph: async (req, res) => {
        try {
            const { unit_ID } = req.params;
            if (!unit_ID) {
                return res.status(400).json({ error: 'unit_ID is required' });
            }

            const collectionName = `Board_${unit_ID}`;
            const collection = mongoose.connection.collection(collectionName);

            const data = await collection.find().sort({ timestamp: 1 }).toArray();
            if (!data.length) {
                return res.status(404).json({ error: `No data found for unit_ID: ${unit_ID}` });
            }

            // Extract data points for graph
            const timestamps = data.map(entry => new Date(entry.timestamp).toLocaleString());
            const temperatures = data.map(entry => entry.t);
            const humidity = data.map(entry => entry.h);

            // Create a chart using QuickChart
            const chart = new QuickChart();
            chart.setConfig({
                type: 'line',
                data: {
                    labels: timestamps,
                    datasets: [
                        {
                            label: 'Temperature',
                            data: temperatures,
                            borderColor: 'red',
                            fill: false,
                        },
                        {
                            label: 'Humidity',
                            data: humidity,
                            borderColor: 'blue',
                            fill: false,
                        },
                    ],
                },
                options: {
                    title: {
                        display: true,
                        text: `Graph for Unit ID: ${unit_ID}`,
                    },
                    scales: {
                        x: { title: { display: true, text: 'Timestamp' } },
                        y: { title: { display: true, text: 'Values' } },
                    },
                },
            });

            chart.setWidth(800).setHeight(400).setBackgroundColor('white');

            // Send the chart as an image
            const imageUrl = chart.getUrl();
            return res.status(200).json({ message: 'Graph generated successfully', imageUrl });
        } catch (error) {
            console.error('Error generating graph:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    },
};

module.exports = graphController;
