const mongoose = require('mongoose');
const Settings = require('../models/Settings');
const BASE_PORT = 8000; // Define a base port for WebSocket servers
const websocketServers = {};
const WebSocket = require('ws');

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
    
            // Start WebSocket for the new board
            const port = BASE_PORT + parseInt(unit_ID);
            const wss = new WebSocket.Server({ port });
            console.log(`WebSocket server started for Board ${unit_ID} on port ${port}`);
            websocketServers[port] = wss; // Store the WebSocket server instance
    
            wss.on('connection', (ws) => {
                console.log(`New connection on Board ${unit_ID}`);
    
                ws.on('message', async (message) => {
                    const data = JSON.parse(message);
                    const updatedEntry = await externalServiceController.updateServer(unit_ID, data);
    
                    ws.send(JSON.stringify({ message: 'Entry updated', data: updatedEntry }));
                });
            });
    
            return res.status(201).json({ message: 'Server created successfully', data: newEntry });
        } catch (error) {
            console.error('Error creating server:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    },    

    updateServer: async (unit_ID, logEntry) => {
        try {
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
    
            await collection.insertOne(sanitizedEntry);
    
            // Notify WebSocket connections about the update
            const port = BASE_PORT + parseInt(unit_ID);
            if (websocketServers[port]) {
                websocketServers[port].clients.forEach((client) => {
                    if (client.readyState === WebSocket.OPEN) {
                        client.send(JSON.stringify({ message: 'Server updated', data: sanitizedEntry }));
                    }
                });
            }
    
            return sanitizedEntry;
        } catch (error) {
            console.error('Error in updateServer:', error.message);
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
    
            // Shut down WebSocket server
            const port = BASE_PORT + parseInt(unit_ID);
            if (WebSocket.Server.instances[port]) {
                WebSocket.Server.instances[port].close();
                console.log(`WebSocket server for Board ${unit_ID} on port ${port} has been closed`);
            }
    
            return res.status(200).json({ message: `Collection ${collectionName} deleted successfully` });
        } catch (error) {
            console.error('Error deleting server:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    },
    
    getUnitCount: async (req, res) => {
        try {
            const collections = await mongoose.connection.db.listCollections().toArray();
            
            // Filter collections that match the naming pattern for units
            const unitCollections = collections.filter(collection =>
                collection.name.startsWith('Board_')
            );
    
            // Extract unit IDs from collection names
            const unitIDs = unitCollections.map(collection => {
                const match = collection.name.match(/^Board_(\d+)$/);
                return match ? parseInt(match[1], 10) : null; // Extract numeric unit_ID
            }).filter(unitID => unitID !== null); // Filter out null values
    
            const unitCount = unitIDs.length;
    
            return res.status(200).json({
                unitIDs,
            });
        } catch (error) {
            console.error('Error fetching unit count and IDs:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    },
};

const websocketHandler = async () => {
    try {
        // Step 1: Retrieve all board IDs
        const collections = await mongoose.connection.db.listCollections().toArray();
        const boardIDs = collections
            .filter(col => col.name.startsWith('Board_'))
            .map(col => parseInt(col.name.split('_')[1]));

        console.log(`Found boards: ${boardIDs}`);

        // Step 2: Create a WebSocket server for each board
        boardIDs.forEach((boardID) => {
            const port = BASE_PORT + boardID; // Assign port based on board ID
            const wss = new WebSocket.Server({ port });
            websocketServers[port] = wss; // Store the WebSocket server instance

            console.log(`WebSocket server started for Board ${boardID} on port ${port}`);

            wss.on('connection', (ws) => {
                console.log(`New connection on Board ${boardID}`);

                ws.on('message', async (message) => {
                    try {
                        const data = JSON.parse(message);
                        const { t, h, w, eb, ups, x, y } = data;

                        // Check if the unit_ID has a setting already
                        let settings = await Settings.findOne({ unit_ID: boardID });
                        if (!settings) {
                            // Create default settings if none exist
                            settings = new Settings({
                                unit_ID: boardID,
                                defaultSetting1: 'default_value_1', // Replace with actual default values
                                defaultSetting2: 'default_value_2', // Replace with actual default values
                                // Add additional default settings as needed
                            });

                            await settings.save();
                            console.log(`Default settings created for unit_ID: ${boardID}`);
                        }

                        // Update the server for this board
                        const updatedEntry = await externalServiceController.updateServer(boardID, {
                            t, h, w, eb, ups, x, y,
                        });

                        // Send response back to the WebSocket client
                        ws.send(JSON.stringify({
                            message: 'Entry updated successfully',
                            data: updatedEntry,
                        }));
                    } catch (error) {
                        console.error('Error handling WebSocket message:', error);
                        ws.send(JSON.stringify({ error: 'Internal server error' }));
                    }
                });

                ws.on('close', () => {
                    console.log(`Connection closed on Board ${boardID}`);
                });
            });
        });
    } catch (error) {
        console.error('Error setting up WebSocket servers:', error);
    }
};


module.exports = {
    ...externalServiceController,
    websocketHandler,
};
