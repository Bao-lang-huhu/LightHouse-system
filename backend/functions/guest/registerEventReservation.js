const { supabase } = require('../../supabaseClient');

// API to register an event reservation
const registerEventReservation = async (req, res) => {
    try {
        const { 
            guest_id,
            event_name,
            event_type,
            event_date,
            event_start_time,  
            event_end_time,    
            event_no_guest,
            event_is_dpay,
            event_downpayment,
            event_total_price,
            event_venue_id,
            event_fd_pckg_id,
            selectedFoodItems 
        } = req.body;

        // Check if event_date is a valid date
        const dateObj = new Date(event_date);
        if (isNaN(dateObj.getTime())) {
            return res.status(400).json({ error: 'Invalid event date format. Please use YYYY-MM-DD.' });
        }

        const formattedEventDate = dateObj.toISOString().split('T')[0]; // Ensure correct date format

        // Step 1: Validate and check if the venue is active
        const { data: venueData, error: venueError } = await supabase
            .from('EVENT_VENUE')
            .select('venue_status, venue_max_pax')
            .eq('event_venue_id', event_venue_id)
            .eq('venue_status', 'ACTIVE');

        if (venueError || !venueData.length) {
            console.error('Venue check failed:', venueError || 'Venue not active');
            return res.status(400).json({ error: 'Invalid or inactive venue selected.' });
        }

        const venueMaxPax = venueData[0].venue_max_pax;
        if (event_no_guest > venueMaxPax) {
            return res.status(400).json({ error: `The number of guests exceeds the venue capacity. Maximum capacity is ${venueMaxPax}.` });
        }

        // Step 2: Validate and check if the food package is active
        const { data: foodPackageData, error: foodPackageError } = await supabase
            .from('EVENT_FOOD_PACKAGE')
            .select('event_fd_status')
            .eq('event_fd_pckg_id', event_fd_pckg_id)
            .eq('event_fd_status', 'ACTIVE');

        if (foodPackageError || !foodPackageData.length) {
            console.error('Food package check failed:', foodPackageError || 'Food package not active');
            return res.status(400).json({ error: 'Invalid or inactive food package selected.' });
        }

        // Step 3: Insert data into EVENT_RESERVATION table
        const { data: eventReservationData, error: eventReservationError } = await supabase
            .from('EVENT_RESERVATION')
            .insert({
                guest_id,
                event_name,
                event_type,
                event_date: formattedEventDate, // Use formatted date
                event_start_time,  // Directly use the string without converting to Date object
                event_end_time,    // Same here, use the string
                event_no_guest,
                event_is_dpay,
                event_downpayment: event_downpayment || null,
                event_total_price: event_total_price || null,
                event_status: 'CONFIRMED', // Initial status
            })
            .select();

        if (eventReservationError || !eventReservationData) {
            console.error('Event reservation insertion failed:', eventReservationError);
            return res.status(500).json({ error: 'Failed to create event reservation.' });
        }

        const event_reservation_id = eventReservationData[0]?.event_reservation_id;
        if (!event_reservation_id) {
            console.error('Event reservation ID is null:', eventReservationData);
            return res.status(500).json({ error: 'Event reservation ID is missing.' });
        }

        // Step 4: Insert each food item selected into EVENT_RESERVATION_LIST
        for (const [category, foodId] of Object.entries(selectedFoodItems)) {
            if (!foodId) {
                console.error(`Missing food item for category: ${category}`);
                return res.status(400).json({ error: `Food item is missing for ${category}.` });
            }

            // Insert into EVENT_RESERVATION_LIST for each valid food item
            const { error: reservationListError } = await supabase
                .from('EVENT_RESERVATION_LIST')
                .insert({
                    event_reservation_id,
                    event_venue_id,
                    event_fd_pckg_id,
                    food_id: foodId // Ensure the correct food_id is used
                });

            if (reservationListError) {
                console.error(`Failed to insert into event reservation list for food item: ${foodId}`, reservationListError);
                return res.status(500).json({ error: 'Failed to link event reservation to venue and food items.' });
            }
        }

        // Success
        return res.status(201).json({ message: 'Event reservation successfully created.' });

    } catch (error) {
        console.error('Error registering event reservation:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};

module.exports = { registerEventReservation };
