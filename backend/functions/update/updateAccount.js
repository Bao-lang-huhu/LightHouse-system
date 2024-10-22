const { auth } = require('../../firebaseadmin'); // Firebase Admin SDK
const { supabase } = require('../../supabaseClient');
var bcrypt = require('bcryptjs');

const updateAccount = async (req, res) => {
    const { guest_id } = req.params; // Assuming the guest_id is passed as a URL parameter
    const { guest_email, guest_old_password, guest_new_password } = req.body;

    if (!guest_id) {
        return res.status(400).json({ error: "Guest ID is required for updating." });
    }

    try {
        // Step 1: Fetch the current guest data from Supabase using guest_id
        const { data: guestData, error: guestError } = await supabase
            .from('GUEST')
            .select('firebase_uid, guest_password, guest_email')
            .eq('guest_id', guest_id)
            .single(); // Ensure you fetch only one record

        if (guestError || !guestData) {
            return res.status(400).json({ error: 'User not found in Supabase.' });
        }

        const { firebase_uid, guest_password, guest_email: currentEmail } = guestData;

        // Step 2: Get the Firebase user using firebase_uid stored in Supabase
        const user = await auth.getUser(firebase_uid);

        // Step 3: Compare the old password with the hashed password in Supabase
        const isPasswordMatch = await bcrypt.compare(guest_old_password, guest_password);
        if (!isPasswordMatch) {
            return res.status(400).json({ error: 'Old password is incorrect.' });
        }

        // Check for Email Edit
        if (guest_email && guest_email !== currentEmail) {
            // Step 4: Update email in Firebase if it's different and matches the password
            if (guest_email !== user.email) {
                // Check if the new email already exists in Firebase
                const existingUser = await auth.getUserByEmail(guest_email).catch(() => null);
                if (existingUser && existingUser.uid !== firebase_uid) {
                    return res.status(400).json({ error: 'Email already in use.' });
                }

                // Update the email in Firebase
                await auth.updateUser(firebase_uid, { email: guest_email });

                // Also, update email in Supabase
                const { error: emailUpdateError } = await supabase
                    .from('GUEST')
                    .update({ guest_email })
                    .eq('guest_id', guest_id);

                if (emailUpdateError) {
                    return res.status(500).json({ error: 'Failed to update email in Supabase.' });
                }
            }
        }

        // Check for Password Edit
        if (guest_new_password) {
            if (guest_new_password.length < 8) {
                return res.status(400).json({ error: 'New password must be at least 8 characters long.' });
            }

            // Check if the new password is the same as the old password
            const isSameAsOld = await bcrypt.compare(guest_new_password, guest_password);
            if (isSameAsOld) {
                return res.status(400).json({ error: 'New password cannot be the same as the old password.' });
            }

            // Hash the new password
            const hashedNewPassword = await bcrypt.hash(guest_new_password, 10);

            // Update the new password in Supabase
            const { error: passwordUpdateError } = await supabase
                .from('GUEST')
                .update({ guest_password: hashedNewPassword })
                .eq('guest_id', guest_id); // Use guest_id as the identifier

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

module.exports = { updateAccount };
