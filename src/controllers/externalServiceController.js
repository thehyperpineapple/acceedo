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

            const newServer = {
                unit_ID: parseInt(unit_ID),
                t: 0,
                h: 0,
                w: 0,
                eb: 0,
                ups: 0,
                x: 0,
                y: 0,
            };

            await collection.insertOne(newServer);

            return res.status(201).json({ message: 'Server created successfully', data: newServer });
        } catch (error) {
            console.error('Error creating server:', error);
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
                    const { unit_ID } = data;

                    if (!unit_ID) {
                        ws.send(JSON.stringify({ error: 'unit_ID is required' }));
                        return;
                    }

                    const collectionName = `Board_${unit_ID}`;
                    const collection = mongoose.connection.collection(collectionName);

                    const boardData = await collection.findOne({ unit_ID: parseInt(unit_ID) });

                    if (!boardData) {
                        ws.send(JSON.stringify({ error: 'Data not found for the given unit_ID' }));
                        return;
                    }

                    ws.send(JSON.stringify(boardData));
                } catch (error) {
                    console.error('Error handling WebSocket message:', error);
                }
            });

            ws.on('close', () => {
                console.log('WebSocket connection closed');
            });
        });
    },
};

module.exports = externalServiceController;
