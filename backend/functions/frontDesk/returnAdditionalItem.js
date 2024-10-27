const { supabase } = require('../../supabaseClient');

const returnAdditionalItem = async (req, res) => {
    const { add_item_id } = req.params;
    const { add_item_status, add_item_returned_date } = req.body;

    console.log(`Updating item ID: ${add_item_id} to ${add_item_status}`);

    try {
        const { data, error } = await supabase
            .from('ADDITIONAL_ITEM')
            .update({
                add_item_status,
                add_item_returned_date
            })
            .eq('add_item_id', add_item_id);

        if (error) {
            console.error("Database error:", error);
            return res.status(500).json({ error: 'Failed to update additional item' });
        }

        return res.status(200).json({ message: 'Item marked as returned successfully!' });
    } catch (err) {
        console.error('Server error:', err);
        return res.status(500).json({ error: 'Server error occurred' });
    }
};

module.exports = { returnAdditionalItem };
