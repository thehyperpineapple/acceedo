const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User'); // Import the User model

const userAuthController = {
    // Login user
    login: async (req, res) => {
        try {
            const { username, password } = req.body;

            // Check for required fields
            if (!username || !password) {
                return res.status(400).json({ error: 'Username and password are required' });
            }

            // Find user by username
            const user = await User.findOne({ username });
            if (!user) {
                return res.status(400).json({ error: 'Invalid username or password' });
            }

            // Compare passwords
            const isPasswordValid = await bcrypt.compare(password, user.password);
            if (!isPasswordValid) {
                return res.status(400).json({ error: 'Invalid username or password' });
            }

            // Generate JWT token
            const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, {
                expiresIn: '1h',
            });

            return res.status(200).json({ token, role: user.role });
        } catch (error) {
            console.error('Error during login:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    },

    // Create a new user
    createUser: async (req, res) => {
        try {
            const { user_ID, username, password, emailId, phoneNo, role } = req.body;

            // Validate required fields
            if (!user_ID || !username || !password || !emailId || !phoneNo || !role) {
                return res.status(400).json({ error: 'All fields are required' });
            }

            // Check for existing username, user_ID, or emailId
            const existingUser = await User.findOne({ username });
            if (existingUser) {
                return res.status(400).json({ error: 'Username already exists' });
            }

            const existingUserId = await User.findOne({ user_ID });
            if (existingUserId) {
                return res.status(400).json({ error: 'User ID already exists' });
            }

            const existingEmail = await User.findOne({ emailId });
            if (existingEmail) {
                return res.status(400).json({ error: 'Email already in use' });
            }

            // Hash the password
            const hashedPassword = await bcrypt.hash(password, 10);

            // Create new user
            const newUser = new User({
                user_ID,
                username,
                password: hashedPassword,
                emailId,
                phoneNo,
                role,
            });

            await newUser.save();

            return res.status(201).json({ message: 'User created successfully', user: newUser });
        } catch (error) {
            console.error('Error creating user:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    },

    // Get all users
    getAllUsers: async (req, res) => {
        try {
            const users = await User.find({}, '-password'); // Exclude passwords
            return res.status(200).json({ users });
        } catch (error) {
            console.error('Error fetching users:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    },

    // Delete a user by ID
    deleteUser: async (req, res) => {
        try {
            const { userId } = req.params;

            const result = await User.findByIdAndDelete(userId);
            if (!result) {
                return res.status(404).json({ error: 'User not found' });
            }

            return res.status(200).json({ message: 'User deleted successfully' });
        } catch (error) {
            console.error('Error deleting user:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    },
};

module.exports = userAuthController;
