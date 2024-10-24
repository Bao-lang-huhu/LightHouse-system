const { supabase } = require('../supabaseClient');

// Function to register a new guest
const registerGuestRoom = async (req, res) => {
    const {
        guest_fname,
        guest_lname,
        guest_birthdate,
        guest_address,
        guest_email,
        guest_country,
        guest_phone_no,
        guest_gender
    } = req.body;

    // Validate required fields
    if (!guest_fname || !guest_lname || !guest_birthdate || !guest_address || !guest_email || !guest_country || !guest_phone_no || !guest_gender) {
        console.log('Registration failed: Missing required fields.');
        return res.status(400).json({ error: "All fields are required." });
    }

    try {
        // Insert new guest data into the GUEST table
        const { data, error } = await supabase
            .from('GUEST')
            .insert([{
                guest_fname,
                guest_lname,
                guest_birthdate,
                guest_address,
                guest_email,
                guest_country,
                guest_phone_no,
                guest_gender
            }])
            .select('guest_id') // Return the new guest_id
            .single();

        if (error) {
            console.error('Registration failed: Error inserting data into GUEST table:', error.message);
            return res.status(400).json({ error: error.message });
        }

        console.log('Registration successful for guest:', guest_fname);
        res.status(201).json({ message: "Guest registered successfully!", guest_id: data.guest_id });
    } catch (err) {
        console.error('Registration error:', err);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

module.exports = { registerGuestRoom };
