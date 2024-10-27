const { supabase } = require('../../supabaseClient');

const updateLaundryStatus = async (req, res) => {
    const { av_laundry_id, laun_status } = req.body;

    // Get current date and time in Philippine Time (UTC+8)
    const now = new Date();
    const phTime = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Manila" }));

    try {
        // Update the status and set the end date if status is changed to 'COMPLETE' or 'CANCELED'
        const { data, error } = await supabase
            .from('LAUNDRY')
            .update({
                laun_status,
                laun_end_date: (laun_status === 'COMPLETE' || laun_status === 'CANCELED') ? phTime.toISOString() : null
            })
            .eq('av_laundry_id', av_laundry_id);

        if (error) {
            console.error('Error updating laundry status:', error);
            return res.status(500).json({ error: error.message });
        }

        res.status(200).json({ message: 'Laundry status and end date updated successfully', data });
    } catch (err) {
        console.error('Server error:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

module.exports = { updateLaundryStatus };
