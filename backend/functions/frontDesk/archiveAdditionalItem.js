const { supabase } = require('../../supabaseClient'); 

const archiveAdditionalItem = async (req, res) => {
    const { addItemId } = req.params;

    try {
        const { data, error } = await supabase
            .from('ADDITIONAL_ITEM')
            .update({ add_item_status: 'DELETE' })
            .eq('add_item_id', addItemId);

        if (error) {
            console.error('Error archiving additional item:', error);
            return res.status(500).json({ error: 'Failed to archive the item.' });
        }

        res.status(200).json({ message: 'Item archived successfully.' });
    } catch (err) {
        console.error('Server error:', err);
        res.status(500).json({ error: 'Server error occurred.' });
    }
};

module.exports = { archiveAdditionalItem };
