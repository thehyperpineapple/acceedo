const mongoose = require('mongoose');
const Settings = require('../models/Settings');
const WebSocket = require('ws');
const http = require('http');

const BASE_PORT = 8000; // This port will be used by the HTTP server handling WebSocket upgrades

// Shared server variables – these replace the per‑board servers
let sharedHttpServer;
let sharedWss;

// External service controller functions for creating/updating/deleting boards
const externalServiceController = {
  // Create a new board (collection) and store its initial entry.
  // Notice that we no longer create a dedicated WebSocket server here.
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

      // We rely on the shared WebSocket server to handle connections for this board,
      // so there is no per‑board WebSocket creation here.
      return res.status(201).json({ message: 'Server created successfully', data: newEntry });
    } catch (error) {
      console.error('Error creating server:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Update the board collection with a new log entry.
  // Then notify only those WebSocket clients that are connected for this board (using boardID).
  updateServer: async (unit_ID, logEntry) => {
    try {
      const collectionName = `Board_${unit_ID}`;
      const collection = mongoose.connection.collection(collectionName);

      const now = new Date();
      const sanitizedEntry = {
        unit_ID: parseInt(unit_ID, 10),
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

      // Notify only WebSocket connections for the given board
      if (sharedWss) {
        sharedWss.clients.forEach(client => {
          if (
            client.readyState === WebSocket.OPEN &&
            client.boardID === parseInt(unit_ID, 10)
          ) {
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

  // Delete a board (collection) based on unit_ID.
  // This function currently drops the collection and leaves it to your client logic to handle any connected websockets.
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
      // Optionally, you could also notify connected WebSocket clients for this board.
      return res.status(200).json({ message: `Collection ${collectionName} deleted successfully` });
    } catch (error) {
      console.error('Error deleting server:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Return a count of the board collections along with the extracted unit IDs.
  getUnitCount: async (req, res) => {
    try {
      const collections = await mongoose.connection.db.listCollections().toArray();
      // Filter collections that match the board naming pattern
      const unitCollections = collections.filter(collection =>
        collection.name.startsWith('Board_')
      );

      // Extract board IDs from collection names
      const unitIDs = unitCollections
        .map(collection => {
          const match = collection.name.match(/^Board_(\d+)$/);
          return match ? parseInt(match[1], 10) : null;
        })
        .filter(unitID => unitID !== null);

      return res.status(200).json({ unitIDs });
    } catch (error) {
      console.error('Error fetching unit count and IDs:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  },
};

// -----------------------------------------------------------------------------
// New Implementation: A Single HTTP Server and Shared WebSocket Server
// that handles upgrade requests on endpoints like `/websocket/:boardID`.
// -----------------------------------------------------------------------------
const initializeWebSocketEndpoints = () => {
  // Create an HTTP server that will handle upgrade requests for WebSocket connections.
  sharedHttpServer = http.createServer((req, res) => {
    // This server can serve a basic response if needed.
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('WebSocket server endpoint. Connect via /websocket/:boardID');
  });

  sharedHttpServer.listen(BASE_PORT, () => {
    console.log(`HTTP server for WebSocket listening on port ${BASE_PORT}`);
  });

  // Create a shared WebSocket server without binding it to a port.
  sharedWss = new WebSocket.Server({ noServer: true });

  // Listen for upgrade requests on the HTTP server.
  sharedHttpServer.on('upgrade', (request, socket, head) => {
    try {
      // Use the URL to determine if the request is for a WebSocket endpoint.
      // Expected URL format: /websocket/:boardID
      const urlObj = new URL(request.url, `http://${request.headers.host}`);
      const pathParts = urlObj.pathname.split('/').filter(Boolean);
      if (pathParts[0] === 'websocket' && pathParts[1]) {
        const boardID = parseInt(pathParts[1], 10);
        if (isNaN(boardID)) {
          socket.destroy();
          return;
        }
        // Proceed with upgrading the connection.
        sharedWss.handleUpgrade(request, socket, head, (ws) => {
          // Attach the boardID to this connection.
          ws.boardID = boardID;
          sharedWss.emit('connection', ws, request);
        });
      } else {
        socket.destroy();
      }
    } catch (err) {
      console.error('Error during WebSocket upgrade:', err);
      socket.destroy();
    }
  });

  // Handle WebSocket connections on the shared server.
  sharedWss.on('connection', (ws, request) => {
    const boardID = ws.boardID;
    console.log(`New connection on Board ${boardID}`);

    ws.on('message', async (message) => {
      try {
        const data = JSON.parse(message);
        const updatedEntry = await externalServiceController.updateServer(boardID, data);
        ws.send(JSON.stringify({ message: 'Entry updated', data: updatedEntry }));
      } catch (error) {
        console.error('Error handling WebSocket message:', error);
        ws.send(JSON.stringify({ error: 'Internal server error' }));
      }
    });

    ws.on('close', () => {
      console.log(`Connection closed on Board ${boardID}`);
    });
  });
};

// -----------------------------------------------------------------------------
// Export the external service controller functions along with the initialization
// function for the WebSocket endpoints. In your main application file, you would
// call initializeWebSocketEndpoints() once to start the shared server.
// -----------------------------------------------------------------------------
module.exports = {
  ...externalServiceController,
  initializeWebSocketEndpoints,
};
