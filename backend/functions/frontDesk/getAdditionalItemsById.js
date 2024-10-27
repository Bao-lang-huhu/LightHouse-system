const { supabase } = require('../../supabaseClient');

const getAdditionalItemsById = async (req, res) => {
    const { add_item_id } = req.params;
    console.log(`Fetching additional item with ID: ${add_item_id}`);
    if (!add_item_id) {
        return res.status(400).json({ error: 'add_item_id is required' });
    }

    try {
        const { data, error } = await supabase
            .from('ADDITIONAL_ITEM')
            .select('*')
            .eq('add_item_id', add_item_id)
            .single();

        if (error) {
            console.error('Error fetching additional item:', error);
            return res.status(500).json({ error: error.message });
        }

        res.status(200).json(data);
    } catch (error) {
        console.error('Error fetching additional item:', error);
        res.status(500).json({ error: error.message });
    }
};



module.exports = { getAdditionalItemsById  };
