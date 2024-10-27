const { supabase } = require('../../supabaseClient');

const EditAdditionalItem = async (req, res) => {
    const { add_item_id } = req.params;
    const { check_in_id, add_item_name, add_item_status } = req.body;

    console.log(`Received ID for edit: ${add_item_id}`); // Debug log for received ID

    try {
        
        console.log("Attempting to update item with ID:", add_item_id);

        const { data, error } = await supabase
            .from('ADDITIONAL_ITEM')
            .update({ check_in_id, add_item_name, add_item_status })
            .eq('add_item_id', add_item_id);

        if (error) {
            console.error("Supabase error details:", error);
            return res.status(500).json({ error: 'Database update error occurred' });
        }

        return res.status(200).json({ message: 'Additional item updated successfully!' });
    } catch (err) {
        console.error('Server error:', err);
        return res.status(500).json({ error: 'Server error occurred' });
    }
};
module.exports = { EditAdditionalItem  };

