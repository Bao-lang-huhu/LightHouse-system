const { supabase } = require('../supabaseClient');
const bcrypt = require('bcryptjs');


// Max size in bytes (3 MB)
const MAX_FILE_SIZE = 3 * 1024 * 1024;

const registerStaff = async (req, res) => {
    const {
        staff_fname,
        staff_lname,
        staff_username,
        staff_email,
        staff_phone_no,
        staff_gender,
        shift_start_time,
        shift_end_time,
        staff_hire_date,
        staff_photo,
        staff_acc_role,
        staff_status = 'ACTIVE', 
        staff_password
    } = req.body;

    // Check if username and password are provided
    if (!staff_username || !staff_password) {
        console.log('Registration failed: Username or password missing.');
        return res.status(400).json({ error: "Username and password are required." });
    }

    // Validate image format and size
    if (staff_photo) {
        const matches = staff_photo.match(/^data:(image\/(png|jpeg|jpg));base64,/);
        if (!matches) {
            console.log('Registration failed: Invalid image format.');
            return res.status(400).json({ error: 'Invalid file format. Please upload PNG, JPEG, or JPG images.' });
        }

        const base64Str = staff_photo.split(',')[1];
        const buffer = Buffer.from(base64Str, 'base64');
        if (buffer.length > MAX_FILE_SIZE) {
            console.log('Registration failed: File size exceeds 3 MB.');
            return res.status(400).json({ error: 'File size should not exceed 3 MB.' });
        }
    }

    try {
        // Hash the password
        console.log('Plain Password:', staff_password);
        const hashedPassword = await bcrypt.hash(staff_password, 10);
        console.log('Hashed Password:', hashedPassword);

        // Insert new staff data into the STAFF table
        const { data, error } = await supabase
            .from('STAFF')
            .insert([{
                staff_fname,
                staff_lname,
                staff_username,
                staff_email,
                staff_phone_no,
                staff_gender,
                shift_start_time,
                shift_end_time,
                staff_hire_date,
                staff_photo,
                staff_acc_role,
                staff_status,
                staff_password: hashedPassword 
            }]);

        if (error) {
            console.error('Registration failed: Error inserting data into STAFF table:', error.message);
            return res.status(400).json({ error: error.message });
        }

        console.log('Registration successful for user:', staff_username);
        res.status(201).json({ message: "Staff registered successfully!", data });
    } catch (err) {
        console.error('Registration error:', err);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

module.exports = { registerStaff };
