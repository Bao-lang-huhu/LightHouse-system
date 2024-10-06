const { supabase } = require('../supabaseClient');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const loginStaff = async (req, res) => {
    const { staff_username, staff_password } = req.body;

    if (!staff_username || !staff_password) {
        console.log("Login failed: Username or password missing.");
        return res.status(400).json({ error: "Username and password are required." });
    }

    try {
        // Fetch the staff member based on username
        const { data: staff, error } = await supabase
            .from('STAFF')
            .select('*')
            .eq('staff_username', staff_username)
            .single();

        if (error || !staff) {
            console.log(`Login failed for username: ${staff_username} - User not found.`);
            return res.status(400).json({ error: "Invalid username or password." });
        }

        console.log(`User found: ${staff.staff_username}`);
        console.log(`Stored hashed password: ${staff.staff_password}`);

        // Log the plain password entered
        console.log(`Plain password entered: "${staff_password}"`);

        // Trim the password to remove accidental spaces
        const trimmedPassword = staff_password.trim();
        console.log(`Trimmed password entered: "${trimmedPassword}"`);

        // Compare the provided password with the stored hashed password
        const isPasswordValid = await bcrypt.compare(trimmedPassword, staff.staff_password);

        console.log(`Password comparison result: ${isPasswordValid}`); // Log the comparison result

        if (!isPasswordValid) {
            console.log(`Login failed for username: ${staff_username} - Password does not match.`);
            return res.status(400).json({ error: "Invalid username or password." });
        }

        // Include staff_acc_role in the JWT token
        const token = jwt.sign(
            {
                staff_id: staff.staff_id,
                staff_username: staff.staff_username,
                staff_lname: staff.staff_lname,
                staff_fname: staff.staff_fname,
                staff_acc_role: staff.staff_acc_role 
            },
            process.env.JWT_SECRET || 'your_jwt_secret', // Use environment variable for JWT secret
            {
                expiresIn: '5h',
            }
        );

        console.log(`Login successful for username: ${staff_username}.`);
        res.status(200).json({ message: "Login successful!", token });
    } catch (err) {
        console.error('Error logging in staff:', err);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

module.exports = { loginStaff };
