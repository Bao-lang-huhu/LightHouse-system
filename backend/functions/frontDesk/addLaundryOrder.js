const { supabase } = require('../../supabaseClient'); // Import Supabase client
const { v4: uuidv4 } = require('uuid'); // Import UUID library

const addLaundryOrder = async (req, res) => {
  const {
    check_in_id,
    staff_id,
    laun_notes,
    laun_kilo,
    laun_total_price,
    laun_ironing,
    laun_is_outsourced,
    start_date,
    end_date,
    outsourcedDetails, // { laun_outsource_name, laun_posted_by, laun_date_posted, laun_delivered_by, laun_date_delivered }
    selectedLaundryItems // Array of selected laundry items, each item has `laundry_id`, `quantity`, and `subtotal`
  } = req.body;

  const av_laundry_id = uuidv4(); // Generate a unique UUID for av_laundry_id

  let outsourcedData = null; // Initialize outsourcedData to null

  try {
    // Insert into the LAUNDRY table
    const { data: laundryData, error: laundryError } = await supabase
      .from('LAUNDRY')
      .insert([
        {
          av_laundry_id,
          check_in_id,
          staff_id,
          laun_notes,
          laun_kilo,
          laun_total_price,
          laun_ironing,
          laun_is_outsourced,
          laun_status: 'ONGOING',
          laun_start_date: start_date,
          laun_end_date: end_date,
        }
      ]);

    if (laundryError) {
      console.error('Error inserting into LAUNDRY:', laundryError.message);
      return res.status(400).json({ error: laundryError.message });
    }

    // Insert into OUTSOURCED_LAUNDRY if laundry is outsourced
    if (laun_is_outsourced) {
      const { laun_outsource_name, laun_posted_by, laun_date_posted, laun_delivered_by, laun_date_delivered } = outsourcedDetails;

      const out_laundry_id = uuidv4(); // Generate a unique UUID for out_laundry_id
      const { data, error: outsourcedError } = await supabase
        .from('OUTSOURCED_LAUNDRY')
        .insert([
          {
            out_laundry_id,
            av_laundry_id, // Reference av_laundry_id from LAUNDRY
            laun_outsource_name,
            laun_posted_by,
            laun_date_posted,
            laun_delivered_by,
            laun_date_delivered,
          }
        ]);

      if (outsourcedError) {
        console.error('Error inserting into OUTSOURCED_LAUNDRY:', outsourcedError.message);
        return res.status(400).json({ error: outsourcedError.message });
      }

      outsourcedData = data; // Assign data to outsourcedData if insertion is successful
    }

    // Insert items into LAUNDRY_LIST
    const laundryListData = [];
    for (const item of selectedLaundryItems) {
      const laundry_list_id = uuidv4(); // Generate a unique UUID for laundry_list_id
      const { laundry_id, quantity, subtotal } = item;

      const { data: laundryListItemData, error: laundryListError } = await supabase
        .from('LAUNDRY_LIST')
        .insert([
          {
            laundry_list_id,
            av_laundry_id, // Reference av_laundry_id from LAUNDRY
            laundry_id,
            laun_quantity: quantity,
            laun_subtotal: subtotal,
          }
        ]);

      if (laundryListError) {
        console.error('Error inserting into LAUNDRY_LIST:', laundryListError.message);
        return res.status(400).json({ error: laundryListError.message });
      }

      laundryListData.push(laundryListItemData);
    }

    res.status(201).json({
      message: "Laundry order and items added successfully!",
      laundryData,
      outsourcedData,
      laundryListData
    });
  } catch (err) {
    console.error('Error adding laundry order:', err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = { addLaundryOrder };
