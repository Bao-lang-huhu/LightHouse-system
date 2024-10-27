const { supabase } = require('../../supabaseClient'); // Import Supabase client
const { v4: uuidv4 } = require('uuid'); // Import UUID library

const addConciergeOrder = async (req, res) => {
    const {
        check_in_id,
        av_no_of_guest,
        av_concierge_notes,
        av_concierge_total_price,
        selected_concierges // Array of selected concierge items, each item will have `concierge_id`, `quantity`, and `subtotal`
    } = req.body;

    const av_concierge_id = uuidv4(); // Generate a new unique UUID for av_concierge_id

    try {
        // Insert into the CONCIERGE table
        const { data: conciergeData, error: conciergeError } = await supabase
            .from('CONCIERGE')
            .insert([
                {
                    av_concierge_id,
                    check_in_id,
                    av_no_of_guest,
                    av_concierge_status: 'ONGOING',
                    av_concierge_notes,
                    av_concierge_total_price
                }
            ]);

        if (conciergeError) {
            console.error('Error inserting into CONCIERGE:', conciergeError.message);
            return res.status(400).json({ error: conciergeError.message });
        }

        // If the concierge was inserted successfully, proceed to insert items into CONCIERGE_LIST
        const conciergeListData = [];
        for (const item of selected_concierges) {
            const concierge_list_id = uuidv4(); // Generate a new unique UUID for concierge_list_id

            const { concierge_id, quantity, subtotal } = item;

            const { data: conciergeListItemData, error: conciergeListError } = await supabase
                .from('CONCIERGE_LIST')
                .insert([
                    {
                        concierge_list_id,
                        av_concierge_id, // Use the av_concierge_id generated from the CONCIERGE insert
                        concierge_id,
                        concierge_quantity: quantity,
                        concierge_subtotal: subtotal,
                        con_list_status: 'ACTIVE'
                    }
                ]);

            if (conciergeListError) {
                console.error('Error inserting into CONCIERGE_LIST:', conciergeListError.message);
                return res.status(400).json({ error: conciergeListError.message });
            }

            conciergeListData.push(conciergeListItemData);
        }

        res.status(201).json({
            message: "Concierge order and items added successfully!",
            conciergeData,
            conciergeListData
        });
    } catch (err) {
        console.error('Error adding concierge order:', err); // Log any other errors
        res.status(500).json({ error: "Internal Server Error" });
    }
};

module.exports = { addConciergeOrder };
