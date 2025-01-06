const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User'); // Import the User model

// Store active tokens for logout functionality
const activeTokens = new Set();

const userAuthController = {
    // Login user
    login: async (req, res) => {
        try {
            const { username, password } = req.body;

            if (!username || !password) {
                return res.status(400).json({ error: 'Username and password are required' });
            }

            const user = await User.findOne({ username });
            if (!user) {
                return res.status(400).json({ error: 'Invalid username or password' });
            }

            const isPasswordValid = await bcrypt.compare(password, user.password);
            if (!isPasswordValid) {
                return res.status(400).json({ error: 'Invalid username or password' });
            }

            const token = jwt.sign({ userId: user.user_ID, role: user.role }, process.env.JWT_SECRET, {
                expiresIn: '1h',
            });

            activeTokens.add(token); // Add token to active tokens set

            return res.status(200).json({ token, role: user.role });
        } catch (error) {
            console.error('Error during login:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    },

    // Logout user
    logoutUser: async (req, res) => {
        try {
            const token = req.headers.authorization?.split(' ')[1]; // Extract token from Authorization header

            if (!token || !activeTokens.has(token)) {
                return res.status(401).json({ error: 'Invalid or expired token' });
            }

            activeTokens.delete(token); // Invalidate the token

            return res.status(200).json({ status: 'success', message: 'Logged out successfully' });
        } catch (error) {
            console.error('Error during logout:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    },

    // Create a new user
    createUser: async (req, res) => {
        try {
            const { user_ID, username, password, emailId, phoneNo, role } = req.body;

            if (!user_ID || !username || !password || !emailId || !phoneNo || !role) {
                return res.status(400).json({ error: 'All fields are required' });
            }

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

            const hashedPassword = await bcrypt.hash(password, 10);

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

    // Update user information
    updateUser: async (req, res) => {
        try {
            const { user_ID } = req.params; // Extract user_ID from route parameters
            const { username, role, emailId, phoneNo, password } = req.body;
    
            if (!user_ID) {
                return res.status(400).json({ error: 'user_ID is required' });
            }
    
            const existingUser = await User.findOne({ user_ID });
            if (!existingUser) {
                return res.status(404).json({ error: `User with user_ID: ${user_ID} not found` });
            }
    
            const updatedData = { username, role, emailId, phoneNo };
    
            // Hash the new password if provided
            if (password) {
                updatedData.password = await bcrypt.hash(password, 10);
            }
    
            const updatedUser = await User.findOneAndUpdate(
                { user_ID },
                { $set: updatedData },
                { new: true }
            );
    
            return res.status(200).json({ message: 'User updated successfully', user: updatedUser });
        } catch (error) {
            console.error('Error updating user:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    },

    // Get all users
    getAllUsers: async (req, res) => {
        try {
            const users = await User.find({}, '-password');
            return res.status(200).json({ users });
        } catch (error) {
            console.error('Error fetching users:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    },

    // Delete a user by user_ID
    deleteUser: async (req, res) => {
        try {
            const { user_ID } = req.query; // Extract user_ID from query parameters
    
            if (!user_ID) {
                return res.status(400).json({ error: 'user_ID is required' });
            }
    
            const result = await User.findOneAndDelete({ user_ID }); // Match by user_ID field
    
            if (!result) {
                return res.status(404).json({ error: `User with user_ID: ${user_ID} not found` });
            }
    
            return res.status(200).json({ message: 'User deleted successfully' });
        } catch (error) {
            console.error('Error deleting user:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    },
};

module.exports = userAuthController;
