const { supabase } = require('../../supabaseClient');

const updateCheckOut = async (req, res) => {
    const { check_in_id } = req.body;

    if (!check_in_id) {
        return res.status(400).json({ error: 'Check-in ID is required.' });
    }

    try {
        const checkOutTime = new Date().toISOString();
        const { data, error } = await supabase
            .from('CHECK_IN')
            .update({
                check_in_status: 'CHECKED_OUT',
                payment_status: 'PAID',
                check_out_date_time: checkOutTime
            })
            .eq('check_in_id', check_in_id);

        if (error) {
            console.error('Error updating check-out:', error.message);
            return res.status(500).json({ error: 'Failed to check out.' });
        }

        return res.status(200).json({ message: 'Check-Out successful.' });
    } catch (err) {
        console.error('Server error:', err);
        return res.status(500).json({ error: 'Internal server error.' });
    }
};

module.exports = { updateCheckOut };
