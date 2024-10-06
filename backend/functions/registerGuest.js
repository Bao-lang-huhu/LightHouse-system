const { v4: uuidv4 } = require('uuid');
const { supabase } = require('../supabaseClient');
var bcrypt = require('bcryptjs');
var admin = require("firebase-admin");

const serviceAccount = require('../config/lighthousehotel-firebase-adminsdk-vywmp-b70229e42b.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

// Register Guest Route with Firebase Authentication check
const registerGuest = async (req, res) => {
    const {
        guest_fname,
        guest_lname,
        guest_birthdate,
        guest_address,
        guest_email,
        guest_country,
        guest_phone_no,
        guest_gender,
        guest_photo,
        guest_password,
        firebase_uid // Expecting the Firebase UID from the frontend
    } = req.body;

    console.log("Received firebase_uid:", firebase_uid);
    console.log("Received guest_email:", guest_email);

    const guest_id = uuidv4(); // Generate unique guest ID

    if (!guest_fname || !guest_email || !guest_phone_no || !guest_password) {
        return res.status(400).json({ error: "Required fields are missing." });
    }

    try {
        // Verify the Firebase UID
        if (!firebase_uid || firebase_uid.length > 128) {
            return res.status(400).json({ error: "Invalid Firebase UID." });
        }

        // Log the user record fetched from Firebase
        const userRecord = await admin.auth().getUser(firebase_uid);
        console.log("Firebase user record:", userRecord);

        if (!userRecord || userRecord.email !== guest_email) {
            return res.status(400).json({ error: "Invalid Firebase UID or email mismatch." });
        }

        // Hash the password before storing it
        const hashedPassword = await bcrypt.hash(guest_password, 10); // 10 is the salt rounds

        // Insert guest data into the GUEST table
        const { data, error } = await supabase
            .from('GUEST')
            .insert([{
                guest_id,
                guest_fname,
                guest_lname,
                guest_birthdate,
                guest_address,
                guest_email,
                guest_country,
                guest_phone_no,
                guest_gender,
                guest_photo,
                guest_password: hashedPassword
            }]);

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        // Only return the guest's email in the response
        res.status(201).json({ message: "Guest registered successfully!", guest_email });
    } catch (err) {
        console.error('Registration error:', err);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

module.exports = { registerGuest };
