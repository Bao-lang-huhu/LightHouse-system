const { supabase } = require('../../supabaseClient');

const updateConciergeStatus = async (req, res) => {
    const { av_concierge_id, av_concierge_status } = req.body;

    try {
        const { data, error } = await supabase
            .from('CONCIERGE')
            .update({ av_concierge_status })
            .eq('av_concierge_id', av_concierge_id);

        if (error) {
            console.error('Error updating concierge status:', error);
            return res.status(500).json({ error: error.message });
        }

        res.status(200).json({ message: 'Concierge status updated successfully', data });
    } catch (err) {
        console.error('Server error:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

module.exports = { updateConciergeStatus };
