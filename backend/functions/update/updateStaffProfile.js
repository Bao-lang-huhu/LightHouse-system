const { supabase } = require('../../supabaseClient');
var bcrypt = require('bcryptjs');

const updateStaffProfile = async (req, res) => {
    const { staff_id } = req.params;
    const { staff_username, staff_old_password, staff_new_password } = req.body;

    if (!staff_id) {
        return res.status(400).json({ error: "Staff ID is required for updating." });
    }

    try {
        // Step 1: Fetch the current staff data from Supabase using staff_id
        const { data: staffData, error: staffError } = await supabase
            .from('STAFF')
            .select('staff_password, staff_username')
            .eq('staff_id', staff_id)
            .single();

        if (staffError || !staffData) {
            return res.status(400).json({ error: 'User not found in Supabase.' });
        }

        const { staff_password: currentPassword, staff_username: currentUsername } = staffData;

        // Step 2: Validate old password before allowing any updates
        const isPasswordMatch = await bcrypt.compare(staff_old_password, currentPassword);
        if (!isPasswordMatch) {
            return res.status(400).json({ error: 'Old password is incorrect.' });
        }

        // Step 3: Check for Username Edit
        if (staff_username && staff_username !== currentUsername) {
            // Ensure that the username does not already exist
            const { data: existingUser, error: usernameError } = await supabase
                .from('STAFF')
                .select('staff_id')
                .eq('staff_username', staff_username)
                .single();

            if (existingUser && existingUser.staff_id !== staff_id) {
                return res.status(400).json({ error: 'Username already in use.' });
            }

            // Update the username in Supabase
            const { error: usernameUpdateError } = await supabase
                .from('STAFF')
                .update({ staff_username })
                .eq('staff_id', staff_id);

            if (usernameUpdateError) {
                return res.status(500).json({ error: 'Failed to update username in Supabase.' });
            }
        }

        // Step 4: Check for Password Edit if staff_new_password is provided
        if (staff_new_password) {
            if (staff_new_password.length < 8) {
                return res.status(400).json({ error: 'New password must be at least 8 characters long.' });
            }

            // Ensure the new password is different from the old password
            const isSameAsOld = await bcrypt.compare(staff_new_password, currentPassword);
            if (isSameAsOld) {
                return res.status(400).json({ error: 'New password cannot be the same as the old password.' });
            }

            // Hash the new password
            const hashedNewPassword = await bcrypt.hash(staff_new_password, 10);

            // Update the new password in Supabase
            const { error: passwordUpdateError } = await supabase
                .from('STAFF')
                .update({ staff_password: hashedNewPassword })
                .eq('staff_id', staff_id);

            if (passwordUpdateError) {
                return res.status(500).json({ error: 'Failed to update password in Supabase.' });
            }
        }

        return res.status(200).json({ message: 'Account updated successfully!' });

    } catch (error) {
        console.error('Error updating account:', error);
        return res.status(500).json({ error: 'Internal Server Error.' });
    }
};

module.exports = { updateStaffProfile };
