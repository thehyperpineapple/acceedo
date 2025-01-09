const cors = require('cors');

const corsOptions = {
    origin: '*', // Replace with your frontend's domain
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
};

module.exports = cors(corsOptions);
