const { supabase } = require('../../supabaseClient');

// Function to register a new drink order
const registerDrinkOrder = async (req, res) => {
  const {
    staff_id,
    check_in_id,
    b_payment_method,
    b_order_total,
    drinkItems,
    
  } = req.body;

  if (!staff_id || !b_payment_method || !b_order_total || !drinkItems.length) {
    return res.status(400).json({ error: "Missing required fields or empty order." });
  }

  try {
    const checkInIdToSave = ['CASH', 'CARD', 'E_WALLET'].includes(b_payment_method) ? null : check_in_id;

    // Insert into BAR_ORDER table
    const { data: barOrder, error: barOrderError } = await supabase
      .from('BAR_ORDER')
      .insert([{
        staff_id,
        check_in_id: checkInIdToSave, // Use the adjusted check_in_id value
        b_payment_method,
        b_order_status: 'ONGOING', // Assuming this status is used for ongoing orders
        b_order_total,
        b_order_date: new Date(),
      }])
      .select('bar_order_id')
      .single();

    if (barOrderError) {
      console.error('Error creating bar order:', barOrderError);
      return res.status(500).json({ error: 'Error creating bar order.' });
    }

    const { bar_order_id } = barOrder;

    // Prepare data for BAR_ORDER_LIST table
    const barOrderList = drinkItems.map(item => ({
      drink_id: item.drink_id,
      bar_order_id,
      b_order_qty: item.quantity,
      b_order_subtotal: item.quantity * item.drink_price
    }));

    // Insert into BAR_ORDER_LIST table
    const { data: barOrderListData, error: barOrderListError } = await supabase
      .from('BAR_ORDER_LIST')
      .insert(barOrderList);

    if (barOrderListError) {
      console.error('Error creating bar order list:', barOrderListError);
      return res.status(500).json({ error: 'Error creating bar order list.' });
    }

    // Return success response
    res.status(201).json({ message: "Drink order created successfully!", barOrder, barOrderListData });
  } catch (err) {
    console.error('Error registering drink order:', err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = { registerDrinkOrder };
