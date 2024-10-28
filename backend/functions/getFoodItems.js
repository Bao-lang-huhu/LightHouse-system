const { supabase } = require('../supabaseClient'); // Import Supabase client

const getFoodItems = async (req, res) => {
    try {
        const { data: foodItems, error } = await supabase
            .from('FOOD_ITEM')
            .select('*'); 

        if (error) {
            console.error('Error retrieving food items:', error.message);
            return res.status(400).json({ error: error.message });
        }

        // Send the retrieved data as a JSON response
        res.status(200).json(foodItems);
    } catch (err) {
        console.error('Error fetching food items:', err);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

module.exports = { getFoodItems };
