const { supabase } = require('../../supabaseClient'); 
const jwt = require('jsonwebtoken');

const updateGuest = async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1]; 

    if (!token) {
        return res.status(401).json({ error: "Access denied. No token provided." });
    }

    try {
        const decoded = jwt.verify(token, 'your_jwt_secret');
        const { guest_id } = decoded;
        const {
            guest_fname,
            guest_lname,
            guest_email,
            guest_phone_no,
            guest_gender,
            guest_birthdate,
            guest_address,
            guest_country,
            guest_username, 
            guest_photo 
        } = req.body;

        console.log('Updating guest photo:', guest_photo); // Add this log to verify

        const { data, error } = await supabase
            .from('GUEST')
            .update({
                guest_fname,
                guest_lname,
                guest_email,
                guest_phone_no,
                guest_gender,
                guest_birthdate,
                guest_address,
                guest_country,
                guest_username,
                guest_photo
            })
            .eq('guest_id', guest_id);

        if (error) {
            console.error('Error updating guest:', error.message);
            return res.status(400).json({ error: error.message });
        }

        res.status(200).json({ message: "Guest details updated successfully!", data });
    } catch (err) {
        console.error('Error updating guest details:', err);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

module.exports = { updateGuest };
