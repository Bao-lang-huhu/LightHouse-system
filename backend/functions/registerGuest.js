
const { admin } = require('../firebaseadmin'); // Import the initialized Firebase Admin SDK
const { v4: uuidv4 } = require('uuid');
const { supabase } = require('../supabaseClient');
var bcrypt = require('bcryptjs');

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
        firebase_uid 
    } = req.body;

    console.log("Received request body:", req.body); 
    console.log("Received firebase_uid:", firebase_uid);
    console.log("Received guest_email:", guest_email);

    const guest_id = uuidv4(); // Generate a unique guest ID
    console.log("Generated guest_id:", guest_id);

    // Validate required fields
    if (!guest_fname || !guest_email || !guest_phone_no || !guest_password || !firebase_uid) {
        console.error("Missing required fields");
        return res.status(400).json({ error: "Required fields are missing." });
    }

    try {
        // Validate the Firebase UID and email with Firebase Admin SDK
        console.log("Validating Firebase UID and email...");
        const userRecord = await admin.auth().getUser(firebase_uid);
        console.log("Firebase user record:", userRecord);

        if (!userRecord || userRecord.email !== guest_email) {
            console.error("Firebase UID or email mismatch.");
            return res.status(400).json({ error: "Firebase UID or email mismatch." });
        }

        // Hash the password before storing it
        console.log("Hashing guest password...");
        const hashedPassword = await bcrypt.hash(guest_password, 10); // 10 is the salt rounds
        console.log("Hashed password:", hashedPassword);

        // Insert the guest data into the Supabase 'GUEST' table
        console.log("Inserting guest data into Supabase...");
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
                guest_password: hashedPassword,
                firebase_uid 
            }]);

        // Handle Supabase insertion errors
        if (error) {
            console.error("Supabase insertion error:", error);
            return res.status(400).json({ error: error.message });
        }

        console.log("Guest successfully registered:", guest_email);
        // Return success response
        res.status(201).json({ message: "Guest registered successfully!", guest_email });
    } catch (err) {
        console.error('Registration error:', err);

        // Log detailed error message
        if (err.response) {
            console.error("Error response data:", err.response.data);
        }

        // Handle Firebase authentication errors
        if (err.code === 'auth/user-not-found') {
            return res.status(404).json({ error: "Invalid Firebase UID." });
        } else if (err.code === 'auth/invalid-uid') {
            return res.status(400).json({ error: "Invalid Firebase UID format." });
        } else {
            return res.status(500).json({ error: "Internal Server Error" });
        }
    }
};

module.exports = { registerGuest };
