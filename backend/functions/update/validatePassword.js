const { supabase } = require('../../supabaseClient');
const bcrypt = require('bcryptjs');

const validatePassword = async (req, res) => {
    const { staff_id, staff_old_password } = req.body;

    if (!staff_id || !staff_old_password) {
        console.log('Validation failed: Missing staff_id or staff_old_password');
        return res.status(400).json({ error: 'Staff ID and current password are required.' });
    }

    try {
        // Step 1: Fetch the current staff data from Supabase using staff_id
        const { data: staffData, error: fetchError } = await supabase
            .from('STAFF')
            .select('staff_password')
            .eq('staff_id', staff_id)
            .single();

        if (fetchError || !staffData) {
            console.log('Error fetching staff data or staff not found:', fetchError);
            return res.status(404).json({ error: 'Staff not found or could not retrieve data.' });
        }

        const { staff_password: storedPassword } = staffData;

        console.log('Stored password (hashed):', storedPassword);
        console.log('Provided password:', staff_old_password);

        // Step 2: Compare provided old password with the stored hashed password
        const isMatch = await bcrypt.compare(staff_old_password, storedPassword);

        if (!isMatch) {
            console.log('Password mismatch: Provided password does not match the stored password.');
            return res.status(400).json({ error: 'Old password is incorrect.' });
        }

        console.log('Password validation successful.');
        return res.status(200).json({ message: 'Password validation successful.' });

    } catch (error) {
        console.error('Error validating password:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};

module.exports = { validatePassword };
