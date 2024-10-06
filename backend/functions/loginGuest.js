const { supabase } = require('../supabaseClient');
var bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken'); 

const loginGuest = async (req, res) => {
    const { guest_email, guest_password } = req.body;

    if (!guest_email || !guest_password) {
        return res.status(400).json({ error: "Email and password are required." });
    }

    try {
        const { data: guest, error } = await supabase
            .from('GUEST')
            .select('*')
            .eq('guest_email', guest_email)
            .single(); 

        if (error || !guest) {
            return res.status(400).json({ error: "Invalid email or password." });
        }

        const isPasswordValid = await bcrypt.compare(guest_password, guest.guest_password);

        if (!isPasswordValid) {
            return res.status(400).json({ error: "Invalid email or password." });
        }

        const token = jwt.sign({ guest_id: guest.guest_id, guest_email: guest.guest_email }, 'your_jwt_secret', {
            expiresIn: '5h', 
        });
        res.status(200).json({ message: "Login successful!", token });
    } catch (err) {
        console.error('Error logging in guest:', err);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

module.exports = { loginGuest };