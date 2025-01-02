const Settings = require('../models/Settings'); // Assuming Mongoose model for Settings

const settingsController = {
    getSettings: async (req, res) => {
        try {
            const settings = await Settings.find();

            return res.status(200).json({ settings });
        } catch (error) {
            console.error('Error fetching settings:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    },

    addSetting: async (req, res) => {
        try {
            const newSetting = new Settings(req.body);

            await newSetting.save();

            return res.status(201).json({ message: 'Setting added successfully' });
        } catch (error) {
            console.error('Error adding setting:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    },

    updateSetting: async (req, res) => {
        try {
            const { id } = req.params;

            const updatedSetting = await Settings.findByIdAndUpdate(id, req.body, {
                new: true,
            });

            if (!updatedSetting) {
                return res.status(404).json({ error: 'Setting not found' });
            }

            return res.status(200).json({ message: 'Setting updated successfully', updatedSetting });
        } catch (error) {
            console.error('Error updating setting:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    },

    deleteSetting: async (req, res) => {
        try {
            const { id } = req.params;

            const result = await Settings.findByIdAndDelete(id);

            if (!result) {
                return res.status(404).json({ error: 'Setting not found' });
            }

            return res.status(200).json({ message: 'Setting deleted successfully' });
        } catch (error) {
            console.error('Error deleting setting:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    },
};

module.exports = settingsController;
