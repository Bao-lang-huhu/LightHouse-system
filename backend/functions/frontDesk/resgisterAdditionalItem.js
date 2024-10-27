const { supabase } = require('../../supabaseClient');

const registerAdditionalItem = async (req, res) => {
    try {
        const { check_in_id, add_item_name, add_item_borrowed_date, add_item_status } = req.body;

        // Validate required fields
        if (!check_in_id || !add_item_name || !add_item_borrowed_date || !add_item_status) {
            return res.status(400).json({ error: "All fields are required." });
        }

        // Insert new additional item into the ADDITIONAL_ITEM table
        const { data, error } = await supabase
            .from('ADDITIONAL_ITEM')
            .insert([
                {
                    check_in_id: check_in_id,
                    add_item_name: add_item_name,
                    add_item_borrowed_date: add_item_borrowed_date,
                    add_item_status: add_item_status
                }
            ]);

        if (error) {
            console.error('Error inserting additional item:', error);
            return res.status(500).json({ error: "Failed to register additional item." });
        }

        // Respond with success message
        res.status(201).json({ message: "Additional item registered successfully.", data });
    } catch (err) {
        console.error('Error registering additional item:', err);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

module.exports = { registerAdditionalItem };
