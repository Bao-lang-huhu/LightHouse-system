const { supabase } = require('../../supabaseClient');

const getEventReservationsByGuestId = async (req, res) => {
    const { guest_id } = req.query;

    if (!guest_id) {
        console.log('Guest ID not provided');
        return res.status(400).json({ message: 'Guest ID is required.' });
    }

    try {
        console.log(`Fetching event reservations for guest_id: ${guest_id}`);

        // Step 1: Fetch event reservations by guest_id
        const { data: reservations, error: reservationsError } = await supabase
            .from('EVENT_RESERVATION')
            .select('event_reservation_id, event_name, event_type, event_date, event_start_time, event_end_time, event_no_guest, event_status, cancel_reservation_request, event_downpayment, event_total_price')
            .eq('guest_id', guest_id);

        if (reservationsError) {
            console.error('Error fetching event reservations:', reservationsError);
            return res.status(500).json({ error: 'Failed to fetch event reservations' });
        }

        if (!reservations.length) {
            console.log('No event reservations found for this guest.');
            return res.status(404).json({ message: 'No event reservations found for this guest.' });
        }

        const reservationIds = reservations.map(reservation => reservation.event_reservation_id);

        // Step 2: Fetch reservation list with venue and food package IDs
        const { data: venueList, error: venueListError } = await supabase
            .from('EVENT_RESERVATION_LIST')
            .select('event_reservation_id, event_venue_id, event_fd_pckg_id, food_id')
            .in('event_reservation_id', reservationIds);

        if (venueListError) {
            console.error('Error fetching venue and food package IDs:', venueListError);
            return res.status(500).json({ error: 'Failed to fetch venue and food package IDs' });
        }

        const venueIds = venueList.map(item => item.event_venue_id);
        const foodItemIds = venueList.map(item => item.food_id);
        const foodPackageIds = venueList.map(item => item.event_fd_pckg_id);

        // Step 3: Fetch venue details
        const { data: venues, error: venuesError } = await supabase
            .from('EVENT_VENUE')
            .select('event_venue_id, venue_name, venue_max_pax')
            .in('event_venue_id', venueIds);

        if (venuesError) {
            console.error('Error fetching venue details:', venuesError);
            return res.status(500).json({ error: 'Failed to fetch venue details' });
        }

        // Step 4: Fetch food package details
        const { data: foodPackages, error: foodPackagesError } = await supabase
            .from('EVENT_FOOD_PACKAGE')
            .select('event_fd_pckg_id, event_fd_pckg_name')
            .in('event_fd_pckg_id', foodPackageIds);

        if (foodPackagesError) {
            console.error('Error fetching food package details:', foodPackagesError);
            return res.status(500).json({ error: 'Failed to fetch food package details' });
        }

        // Step 5: Fetch food items
        const { data: foodItems, error: foodItemsError } = await supabase
            .from('FOOD_ITEM')
            .select('food_id, food_name, food_final_price, food_category_name')
            .in('food_id', foodItemIds);

        if (foodItemsError) {
            console.error('Error fetching food items:', foodItemsError);
            return res.status(500).json({ error: foodItemsError.message });
        }

        console.log(`Fetched ${foodItems.length} food items`);

        // Step 6: Fetch guest details (initialize empty guest array)
        const guestIds = reservations.map(reservation => reservation.guest_id).filter(Boolean);  // Filter undefined guest_ids
        let guests = []; // Initialize as empty array by default

        if (guestIds.length > 0) {
            const { data: fetchedGuests, error: guestsError } = await supabase
                .from('GUEST')
                .select('guest_id, guest_fname, guest_lname, guest_email, guest_phone_no, guest_address, guest_country')
                .in('guest_id', guestIds);

            if (guestsError) {
                console.error('Error fetching guest details:', guestsError);
                return res.status(500).json({ error: guestsError.message });
            }

            guests = fetchedGuests; // Assign fetched guests to the variable
            console.log(`Fetched ${guests.length} guests`);
        }

        // Step 7: Combine all the fetched data into a single object for each reservation
        const combinedReservations = reservations.map(reservation => {
            const reservationListItem = venueList.find(item => item.event_reservation_id === reservation.event_reservation_id);
            const venueDetails = venues.find(venue => venue.event_venue_id === reservationListItem?.event_venue_id);
            const foodPackageDetails = foodPackages.find(pkg => pkg.event_fd_pckg_id === reservationListItem?.event_fd_pckg_id);
            const guestDetails = guests.find(guest => guest.guest_id === reservation.guest_id);
            const reservationFoodItems = venueList
                .filter(item => item.event_reservation_id === reservation.event_reservation_id)
                .map(item => foodItems.find(food => food.food_id === item.food_id));

            return {
                ...reservation,
                guest: guestDetails ? {
                    guest_fname: guestDetails.guest_fname,
                    guest_lname: guestDetails.guest_lname,
                    guest_email: guestDetails.guest_email,
                    guest_phone_no: guestDetails.guest_phone_no,
                    guest_address: guestDetails.guest_address,
                    guest_country: guestDetails.guest_country
                } : null,
                venue: venueDetails ? {
                    venue_name: venueDetails.venue_name,
                    venue_max_pax: venueDetails.venue_max_pax
                } : null,
                foodPackage: foodPackageDetails ? {
                    package_name: foodPackageDetails.event_fd_pckg_name
                } : null,
                foodItems: reservationFoodItems.map(foodItem => ({
                    food_name: foodItem?.food_name,
                    food_category_name: foodItem?.food_category_name
                }))
            };
        });

        console.log('Combined reservations:', combinedReservations);

        // Return the combined reservations with all the details
        return res.status(200).json(combinedReservations);
    } catch (error) {
        console.error('Error fetching event reservations:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
};

module.exports = { getEventReservationsByGuestId };
