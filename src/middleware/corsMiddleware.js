// middleware/corsMiddleware.js
const cors = require('cors');

const corsOptions = {
    origin: 'http://localhost:3000', // Replace with your frontend's domain
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
};

module.exports = cors(corsOptions);
