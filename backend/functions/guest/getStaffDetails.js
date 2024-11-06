// controllers/guestController.js
const { supabase } = require('../../supabaseClient');
const jwt = require('jsonwebtoken');

// Function to get guest details by guest_id
const getStaffDetails = async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: "Access denied. No token provided." });
    }

    try {
        const decoded = jwt.verify(token, 'your_jwt_secret'); 
        const { staff_id } = decoded;

        const { data: staff, error } = await supabase
            .from('STAFF')
            .select('*')
            .eq('staff_id', staff_id)
            .single();

        if (error || !staff) {
            return res.status(404).json({ error: "Staff not found." });
        }

        res.status(200).json(staff);
    } catch (err) {
        console.error('Error fetching guest details:', err);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

module.exports = { getStaffDetails };
