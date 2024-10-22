const { supabase } = require('../../supabaseClient');

const getRoomVirtualTourByTypeName = async (req, res) => {
    const { vt_name } = req.query; // Get vt_name from query parameters

    try {
        console.log(`Fetching virtual tour for vt_name: ${vt_name}`); // Log the vt_name being searched

        const { data, error } = await supabase
            .from('VIRTUAL_TOUR')
            .select('*')
            .ilike('vt_name', `%${vt_name}%`) // Use ilike to make the search case-insensitive and partial match
            .neq('vt_status', 'DELETE'); // Ensure it's not archived

        if (error) {
            console.error('Supabase error:', error);
            return res.status(500).json({ error: 'Failed to fetch virtual tour.' });
        }

        console.log('Supabase response data:', data); // Log the fetched data

        // Check if the data array is empty
        if (!data || data.length === 0) {
            console.log('No virtual tour found for the provided vt_name.');
            return res.status(404).json({ error: 'No virtual tour found.' });
        }

        return res.status(200).json(data);
    } catch (error) {
        console.error('Unexpected error:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};

const updateRoomVT = async (req, res) => {
    const { vt_name, vt_description, vt_photo_base64, vt_status } = req.body;

    console.log("Received update request for Virtual Tour:");
    console.log("vt_name:", vt_name);
    console.log("vt_description:", vt_description);
    console.log("vt_photo_base64:", vt_photo_base64 ? "Image provided" : "No image provided");
    console.log("vt_status:", vt_status);

    try {
        if (!vt_name) {
            console.error('Virtual Tour Name is required.');
            return res.status(400).json({ error: 'Virtual Tour Name is required.' });
        }

        let updatedFields = {};
        if (vt_description) updatedFields.vt_description = vt_description;
        if (vt_status) updatedFields.vt_status = vt_status;
        if (vt_photo_base64) updatedFields.vt_photo_url = vt_photo_base64;

        console.log("Fields to be updated:", updatedFields);

        const { data, error } = await supabase
            .from('VIRTUAL_TOUR')
            .update(updatedFields)
            .ilike('vt_name', vt_name); // Use ilike for case-insensitive match

        console.log("Supabase update response data:", data);
        console.log("Supabase update response error:", error);

        if (error) {
            console.error('Error updating virtual tour:', error);
            return res.status(500).json({ error: 'Failed to update virtual tour.' });
        }

        // Change response handling to treat as successful if there is no error
        if (!data || data.length === 0) {
            console.log('Update operation completed successfully, even if no rows were explicitly returned.');
            return res.status(200).json({ message: 'Virtual tour updated successfully.' });
        }

        return res.status(200).json({ message: 'Virtual tour updated successfully.', data });
    } catch (error) {
        console.error('Error updating virtual tour:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};

module.exports = { getRoomVirtualTourByTypeName, updateRoomVT };
