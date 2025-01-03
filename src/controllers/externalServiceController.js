const mongoose = require('mongoose');

const externalServiceController = {
    createServer: async (req, res) => {
        try {
            const { unit_ID } = req.query;

            if (!unit_ID) {
                return res.status(400).json({ error: 'unit_ID is required' });
            }

            const collectionName = `Board_${unit_ID}`;
            const collection = mongoose.connection.collection(collectionName);

            const existingServer = await collection.findOne({ unit_ID: parseInt(unit_ID) });

            if (existingServer) {
                return res.status(400).json({ error: 'Server already exists' });
            }

            const now = new Date();
            const newServer = {
                unit_ID: parseInt(unit_ID),
                data_log: [], // Start with an empty data_log
                created_at: now,
                updated_at: now,
            };

            await collection.insertOne(newServer);

            return res.status(201).json({ message: 'Server created successfully', data: newServer });
        } catch (error) {
            console.error('Error creating server:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    },

    deleteServer: async (req, res) => {
        try {
            const { unit_ID } = req.query;

            if (!unit_ID) {
                return res.status(400).json({ error: 'unit_ID is required' });
            }

            const collectionName = `Board_${unit_ID}`;
            const collection = mongoose.connection.collection(collectionName);

            const result = await collection.deleteOne({ unit_ID: parseInt(unit_ID) });

            if (result.deletedCount === 0) {
                return res.status(404).json({ error: 'Server not found' });
            }

            return res.status(200).json({ message: 'Server deleted successfully' });
        } catch (error) {
            console.error('Error deleting server:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    },

    updateServer: async (unit_ID, logEntry) => {
        try {
            console.log('Updating server for unit_ID:', unit_ID);
            console.log('Log Entry:', logEntry);
    
            const collectionName = `Board_${unit_ID}`;
            const collection = mongoose.connection.collection(collectionName);
    
            const now = new Date();
            const newLogEntry = {
                ...logEntry,
                timestamp: now,
            };
    
            // Check if the document exists
            const existingServer = await collection.findOne({ unit_ID: parseInt(unit_ID) });
    
            if (!existingServer) {
                // Insert a new document if it doesn't exist
                const newServer = {
                    unit_ID: parseInt(unit_ID),
                    data_log: [newLogEntry], // Initialize with the new log entry
                    created_at: now,
                    updated_at: now,
                };
    
                const result = await collection.insertOne(newServer);
                console.log('Inserted new server:', result);
                return newServer;
            }
    
            // Update the existing document
            const result = await collection.findOneAndUpdate(
                { unit_ID: parseInt(unit_ID) },
                {
                    $push: { data_log: newLogEntry }, // Add the new log entry to the array
                    $currentDate: { updated_at: true }, // Update the updated_at field
                },
                { returnDocument: 'after' } // Return the updated document
            );
    
            console.log('Updated existing server:', result.value);
            return result.value;
        } catch (error) {
            console.error('Error in updateServer:', error.message, error.stack);
            throw new Error('Internal server error during updateServer');
        }
    },

    websocketHandler: (wsServer) => {
        const WebSocket = require('ws');
        const wss = new WebSocket.Server({ server: wsServer });

        wss.on('connection', (ws) => {
            console.log('New WebSocket connection');

            ws.on('message', async (message) => {
                try {
                    const data = JSON.parse(message);
                    const { unit_ID, ...logEntry } = data;
            
                    if (!unit_ID) {
                        ws.send(JSON.stringify({ error: 'unit_ID is required' }));
                        return;
                    }
            
                    console.log('unit_ID:', unit_ID); // Log the unit_ID
                    
            
                    // Trigger updateServer when new WebSocket data is received
                    const updatedData = await externalServiceController.updateServer(unit_ID, logEntry);
                    console.log('Updated Data:', updatedData); // Log the updated data
            
                    ws.send(JSON.stringify({
                        message: 'Data logged successfully',
                        data: updatedData,
                    }));
                } catch (error) {
                    console.error('Error handling WebSocket message:', error);
                    ws.send(JSON.stringify({ error: 'Internal server error while processing the message' }));
                }
            });
            
            ws.on('close', () => {
                console.log('WebSocket connection closed');
            });
        });
    },
};

module.exports = externalServiceController;
