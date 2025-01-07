const mongoose = require('mongoose');

const externalServiceController = {
    // Create a new server
    createServer: async (req, res) => {
        try {
            const { unit_ID, t, h, w, eb, ups, x, y } = req.body;

            if (!unit_ID) {
                return res.status(400).json({ error: 'unit_ID is required' });
            }

            const collectionName = `Board_${unit_ID}`;
            const collection = mongoose.connection.collection(collectionName);

            // Check if the collection already exists
            const collections = await mongoose.connection.db.listCollections().toArray();
            const collectionExists = collections.some(col => col.name === collectionName);

            if (collectionExists) {
                return res.status(400).json({ message: `Collection ${collectionName} already exists` });
            }

            // Create the collection and insert the initial document
            const newEntry = {
                unit_ID,
                t,
                h,
                w,
                eb,
                ups,
                x,
                y,
                timestamp: new Date(),
            };

            await collection.insertOne(newEntry);

            return res.status(201).json({ message: 'Server created successfully', data: newEntry });
        } catch (error) {
            console.error('Error creating server:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    },

    // Add a new document to the collection
    updateServer: async (unit_ID, logEntry) => {
        try {
            console.log('Updating server for unit_ID:', unit_ID);
            const collectionName = `Board_${unit_ID}`;
            const collection = mongoose.connection.collection(collectionName);

            const now = new Date();
            const sanitizedEntry = {
                unit_ID: parseInt(unit_ID),
                t: logEntry.t || null,
                h: logEntry.h || null,
                w: logEntry.w || null,
                eb: logEntry.eb || null,
                ups: logEntry.ups || null,
                x: logEntry.x || null,
                y: logEntry.y || null,
                timestamp: now,
            };

            console.log('Sanitized Entry:', sanitizedEntry);

            // Insert a new standalone entry
            const result = await collection.insertOne(sanitizedEntry);
            console.log('Inserted new standalone entry:', result);

            return sanitizedEntry;
        } catch (error) {
            console.error('Error in updateServer:', error.message, error.stack);
            throw new Error('Internal server error during updateServer');
        }
    },

    // Delete a collection based on unit_ID
    deleteServer: async (req, res) => {
        try {
            const { unit_ID } = req.query;

            if (!unit_ID) {
                return res.status(400).json({ error: 'unit_ID is required' });
            }

            const collectionName = `Board_${unit_ID}`;
            const collections = await mongoose.connection.db.listCollections().toArray();
            const collectionExists = collections.some(col => col.name === collectionName);

            if (!collectionExists) {
                return res.status(404).json({ error: `Collection ${collectionName} does not exist` });
            }

            await mongoose.connection.db.dropCollection(collectionName);
            return res.status(200).json({ message: `Collection ${collectionName} deleted successfully` });
        } catch (error) {
            console.error('Error deleting server:', error);
            return res.status(500).json({ error: 'Internal server error' });
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
                    const { unit_ID, t, h, w, eb, ups, x, y } = data;

                    if (!unit_ID) {
                        ws.send(JSON.stringify({ error: 'unit_ID is required' }));
                        return;
                    }

                    const updatedEntry = await externalServiceController.updateServer(unit_ID, {
                        t, h, w, eb, ups, x, y,
                    });

                    ws.send(JSON.stringify({
                        message: 'Entry updated successfully',
                        data: updatedEntry,
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
