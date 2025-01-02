const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User'); // Assuming Mongoose model for User

const userAuthController = {
    login: async (req, res) => {
        try {
            const { username, password } = req.body;
            const user = await User.findOne({ username });

            if (!user) {
                return res.status(400).json({ error: 'Invalid username or password' });
            }

            const isPasswordValid = await bcrypt.compare(password, user.password);

            if (!isPasswordValid) {
                return res.status(400).json({ error: 'Invalid username or password' });
            }

            const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
                expiresIn: '1h',
            });

            return res.status(200).json({ token });
        } catch (error) {
            console.error('Error during login:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    },

    createUser: async (req, res) => {
        try {
            const { username, password, email, role } = req.body;

            const existingUser = await User.findOne({ username });

            if (existingUser) {
                return res.status(400).json({ error: 'User already exists' });
            }

            const hashedPassword = await bcrypt.hash(password, 10);

            const newUser = new User({
                username,
                password: hashedPassword,
                email,
                role,
            });

            await newUser.save();

            return res.status(201).json({ message: 'User created successfully' });
        } catch (error) {
            console.error('Error creating user:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    },

    getAllUsers: async (req, res) => {
        try {
            const users = await User.find({}, '-password'); // Exclude passwords

            return res.status(200).json({ users });
        } catch (error) {
            console.error('Error fetching users:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    },

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