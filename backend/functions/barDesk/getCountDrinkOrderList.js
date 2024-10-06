const { supabase } = require('../../supabaseClient');

// Function to get the list of drink items with the number of orders
const getCountDrinkOrderList = async (req, res) => {
  try {
    console.log('Fetching drink items with order count...');

    const { data: drinkItems, error: drinkItemError } = await supabase
      .from('BAR_DRINK')
      .select('drink_id, drink_name, drink_photo');

    if (drinkItemError) {
      console.error('Error retrieving drink items:', drinkItemError.message);
      return res.status(400).json({ error: drinkItemError.message });
    }

    const drinkOrderList = await Promise.all(
      drinkItems.map(async (drinkItem) => {
        const { count, error } = await supabase
          .from('BAR_ORDER_LIST')
          .select('drink_id', { count: 'exact', head: true })
          .eq('drink_id', drinkItem.drink_id);

        if (error) {
          console.error(`Error retrieving order count for drink_id ${drinkItem.drink_id}:`, error.message);
          return null;
        }

        return {
          drink_id: drinkItem.drink_id,
          drink_name: drinkItem.drink_name,
          drink_photo: drinkItem.drink_photo, // Add the photo here
          order_count: count,
        };
      })
    );

    // Filter out any null results
    const resultList = drinkOrderList
      .filter(item => item !== null) // Remove null items
      .sort((a, b) => b.order_count - a.order_count) // Sort by order count (largest to smallest)
      .slice(0, 10); // Get top 10 items

    // Log the result to see the data structure
    console.log('Top 10 Drink Order List:', resultList);

    // Send the response with the drink order list and counts
    res.status(200).json(resultList);
  } catch (err) {
    console.error('Error fetching drink order list:', err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = { getCountDrinkOrderList };
