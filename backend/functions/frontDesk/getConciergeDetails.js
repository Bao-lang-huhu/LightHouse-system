const { supabase } = require('../../supabaseClient');

const getConciergeDetails = async (req, res) => {
    console.log("Received check_in_id:", req.query.check_in_id);
    const { check_in_id } = req.query;

    try {
        // Fetch ongoing concierge service data from the CONCIERGE table
        const { data: conciergeData, error: conciergeError } = await supabase
            .from('CONCIERGE')
            .select(
                'av_concierge_id, check_in_id, av_no_of_guest, av_concierge_notes, av_concierge_total_price, av_concierge_status'
            )
            .eq('check_in_id', check_in_id)
            .eq('av_concierge_status', 'ONGOING')
            .single();

        if (conciergeError) {
            console.error('Error fetching concierge data:', conciergeError);
            return res.status(500).json({ error: conciergeError.message });
        }

        // Fetch associated concierge items from the CONCIERGE_LIST table with additional details from CONCIERGE_DETAIL
        const { data: conciergeItems, error: itemsError } = await supabase
            .from('CONCIERGE_LIST')
            .select(
                'concierge_list_id, av_concierge_id, concierge_id, concierge_quantity, concierge_subtotal, CONCIERGE_DETAIL (concierge_type, concierge_type_price)'
            )
            .eq('av_concierge_id', conciergeData.av_concierge_id)
            .eq('con_list_status', 'ACTIVE');

        if (itemsError) {
            console.error('Error fetching concierge items:', itemsError);
            return res.status(500).json({ error: itemsError.message });
        }

        // Combine data with detailed information from CONCIERGE_DETAIL
        const response = {
            av_concierge_id: conciergeData.av_concierge_id,
            check_in_id: conciergeData.check_in_id,
            av_no_of_guest: conciergeData.av_no_of_guest,
            av_concierge_notes: conciergeData.av_concierge_notes,
            av_total_price: conciergeData.av_concierge_total_price,
            av_concierge_status: conciergeData.av_concierge_status,
            concierge_items: conciergeItems.map(item => ({
                concierge_list_id: item.concierge_list_id,
                concierge_id: item.concierge_id,
                concierge_type: item.CONCIERGE_DETAIL.concierge_type,
                price: item.CONCIERGE_DETAIL.concierge_type_price,
                quantity: item.concierge_quantity,
                subtotal: item.concierge_subtotal
            }))
        };

        res.status(200).json(response);
    } catch (err) {
        console.error('Error retrieving concierge details:', err);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

module.exports = { getConciergeDetails };
