const Settings = require('../models/Settings'); // Import the Settings model

const settingsController = {
    getSettings: async (req, res) => {
        try {
            const { unit_ID } = req.query; // Get unit_ID from query parameters

            let settings;
            if (unit_ID) {
                // Fetch settings for a specific unit_ID
                settings = await Settings.findOne({ unit_ID: parseInt(unit_ID) });
                if (!settings) {
                    return res.status(404).json({ error: `No settings found for unit_ID: ${unit_ID}` });
                }
            } else {
                // Fetch all settings
                settings = await Settings.find();
            }

            return res.status(200).json({ settings });
        } catch (error) {
            console.error('Error fetching settings:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    },

    addSetting: async (req, res) => {
        try {
            const {
                unit_ID,
                humidity_high,
                humidity_low,
                temp_high,
                temp_low,
                water_level_high,
                water_level_low,
            } = req.body;

            // Ensure all required parameters are provided
            if (
                !unit_ID ||
                humidity_high === undefined ||
                humidity_low === undefined ||
                temp_high === undefined ||
                temp_low === undefined ||
                water_level_high === undefined ||
                water_level_low === undefined
            ) {
                return res.status(400).json({
                    error: 'All parameters (unit_ID, humidity_high, humidity_low, temp_high, temp_low, water_level_high, water_level_low) are required',
                });
            }

            // Add or update settings for the given unit_ID
            const updatedSetting = await Settings.findOneAndUpdate(
                { unit_ID: parseInt(unit_ID) },
                {
                    unit_ID: parseInt(unit_ID),
                    humidity_high,
                    humidity_low,
                    temp_high,
                    temp_low,
                    water_level_high,
                    water_level_low,
                },
                { new: true, upsert: true } // Create if not found, and return the updated document
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

    // updateSetting: async (req, res) => {
    //     try {
    //         const { id } = req.params;

    //         const updatedSetting = await Settings.findByIdAndUpdate(id, req.body, {
    //             new: true,
    //         });

    //         if (!updatedSetting) {
    //             return res.status(404).json({ error: 'Setting not found' });
    //         }

    //         return res.status(200).json({
    //             message: 'Setting updated successfully',
    //             updatedSetting,
    //         });
    //     } catch (error) {
    //         console.error('Error updating setting:', error);
    //         return res.status(500).json({ error: 'Internal server error' });
    //     }
    // },

    deleteSetting: async (req, res) => {
        try {
            const { unit_ID } = req.query; // Extract unit_ID from the query parameters
    
            if (!unit_ID) {
                return res.status(400).json({ error: 'unit_ID is required' });
            }
    
            const result = await Settings.findOneAndDelete({ unit_ID: parseInt(unit_ID) });
    
            if (!result) {
                return res.status(404).json({ error: `No settings found for unit_ID: ${unit_ID}` });
            }
    
            return res.status(200).json({ message: 'Setting deleted successfully' });
        } catch (error) {
            console.error('Error deleting setting:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }
};

module.exports = settingsController;
