const { supabase } = require('../../supabaseClient');
const bcrypt = require('bcryptjs');

const updateStaff = async (req, res) => {
    const { staff_id } = req.params; 

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
        staff_status,
        staff_password // Optional: Only update if provided
    } = req.body;

    if (!staff_id) {
        console.error('Update failed: Staff ID is required.');
        return res.status(400).json({ error: "Staff ID is required for update." });
    }

    try {
        // Log the provided update data
        console.log('Updating staff with ID:', staff_id);
        console.log('Provided update data:', {
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
            staff_password: staff_password ? 'Provided' : 'Not provided' // Indicate if password is being updated
        });

        // Prepare the fields to be updated
        let updatedFields = {};

        // Include only defined fields in the update object
        if (staff_fname !== undefined) updatedFields.staff_fname = staff_fname;
        if (staff_lname !== undefined) updatedFields.staff_lname = staff_lname;
        if (staff_username !== undefined) updatedFields.staff_username = staff_username;
        if (staff_email !== undefined) updatedFields.staff_email = staff_email;
        if (staff_phone_no !== undefined) updatedFields.staff_phone_no = staff_phone_no;
        if (staff_gender !== undefined) updatedFields.staff_gender = staff_gender;
        if (shift_start_time !== undefined) updatedFields.shift_start_time = shift_start_time;
        if (shift_end_time !== undefined) updatedFields.shift_end_time = shift_end_time;
        if (staff_hire_date !== undefined) updatedFields.staff_hire_date = staff_hire_date;
        if (staff_photo !== undefined) updatedFields.staff_photo = staff_photo;
        if (staff_acc_role !== undefined) updatedFields.staff_acc_role = staff_acc_role;
        if (staff_status !== undefined) updatedFields.staff_status = staff_status;

        // If only password is provided in the request, update only the password
        if (staff_password) {
            console.log('Hashing new password...');
            const hashedPassword = await bcrypt.hash(staff_password, 10);
            updatedFields.staff_password = hashedPassword;
            console.log('Hashed Password:', hashedPassword);
        }

        // Check if there are fields to update
        if (Object.keys(updatedFields).length === 0) {
            return res.status(400).json({ error: "No valid fields provided for update." });
        }

        // Perform the update operation
        const { data, error } = await supabase
            .from('STAFF')
            .update(updatedFields)
            .eq('staff_id', staff_id);

        // Check for errors during update
        if (error) {
            console.error('Error updating STAFF in the database:', error.message);
            return res.status(400).json({ error: error.message });
        }

        console.log('Staff updated successfully:', data);
        res.status(200).json({ message: "Staff updated successfully!", data });
    } catch (err) {
        console.error('Update error:', err);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

module.exports = { updateStaff };
