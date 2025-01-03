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
            const { unit_ID } = req.body;

            // Check if the unit_ID exists, then update; otherwise, create a new one
            const updatedSetting = await Settings.findOneAndUpdate(
                { unit_ID }, // Query to find document by unit_ID
                req.body, // Update the document with new data
                { new: true, upsert: true } // Options: return the updated doc, and insert if not found
            );

            return res.status(200).json({
                message: 'Setting added or updated successfully',
                updatedSetting,
            });
        } catch (error) {
            console.error('Error adding or updating setting:', error);
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

            return res.status(200).json({
                message: 'Setting updated successfully',
                updatedSetting,
            });
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
