const { supabase } = require('../../supabaseClient');

const getTours = async (req, res) => {
  try {
    console.log("Fetching tours...");

    let { data, error } = await supabase
      .from('VIRTUAL_TOUR')
      .select('vt_id, vt_name, vt_description, vt_photo_url, room_id, ROOM(room_type_name)')
      .eq('vt_status', 'ACTIVE');

    // Log the raw response from Supabase
    console.log("Supabase Response:", data, error);

    if (error) {
      console.error("Error fetching tours:", error);
      return res.status(400).json({ error });
    }

    // Check if data is properly fetched
    if (!data || data.length === 0) {
      console.log("No tours found.");
      return res.status(404).json({ message: "No tours found." });
    }

    // Group by room_type_name
    const groupedTours = data.reduce((acc, tour) => {
      console.log("Processing tour:", tour);
      
      const roomTypeName = tour.ROOM ? tour.ROOM.room_type_name : "Unknown";
      console.log("Room Type Name:", roomTypeName);

      if (!acc[roomTypeName]) acc[roomTypeName] = [];
      acc[roomTypeName].push(tour);
      return acc;
    }, {});

    console.log("Grouped Tours:", groupedTours);

    res.status(200).json(groupedTours);
  } catch (error) {
    console.error("Internal Server Error:", error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

module.exports = { getTours };
