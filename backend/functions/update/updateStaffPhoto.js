const { supabase } = require('../../supabaseClient');

const updateStaffPhoto = async (req, res) => {
    const { staff_id, staff_photo } = req.body; // Expecting staff_id and staff_photo in the request body

    // Log incoming request data for debugging
    console.log("Incoming request data:", { 
        staff_id, 
        staff_photo: staff_photo ? '[photo data present]' : 'No photo data' 
    });

    // Check if staff_id is present
    if (!staff_id) {
        console.error("Error: Missing staff_id.");
        return res.status(400).json({ error: "Staff ID is required for updating photo." });
    }

    // Check if staff_photo is present
    if (!staff_photo) {
        console.error("Error: Missing staff_photo.");
        return res.status(400).json({ error: "New photo is required for updating." });
    }

    // Check file size (3 MB limit)
    const fileSizeInBytes = Buffer.byteLength(staff_photo, 'base64');
    const fileSizeInMB = fileSizeInBytes / (1024 * 1024);
    console.log("Photo size in MB:", fileSizeInMB);

    if (fileSizeInMB > 3) {
        console.error("Error: Photo size exceeds 3 MB.");
        return res.status(400).json({ error: "Photo size exceeds the 3 MB limit." });
    }

    try {
        // Update only the staff_photo field in Supabase
        const { data, error } = await supabase
            .from('STAFF')
            .update({ staff_photo })
            .eq('staff_id', staff_id);

        if (error) {
            console.error('Error updating staff photo in the database:', error.message);
            return res.status(500).json({ error: 'Failed to update staff photo.', details: error.message });
        }

        console.log("Photo updated successfully:", data);
        return res.status(200).json({ message: 'Staff photo updated successfully!', data });
    } catch (err) {
        console.error('Unexpected error updating staff photo:', err);
        return res.status(500).json({ error: 'Internal Server Error.', details: err.message });
    }
};

module.exports = { updateStaffPhoto };
