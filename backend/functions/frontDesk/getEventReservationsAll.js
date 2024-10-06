const { supabase } = require('../../supabaseClient');

// API to fetch all event reservations with guest, venue, food package, and food item details
const getEventReservationsAll = async (req, res) => {
    try {
        console.log('Fetching all event reservations');

        // Step 1: Fetch all event reservations from EVENT_RESERVATION
        const { data: eventReservations, error: eventReservationsError } = await supabase
            .from('EVENT_RESERVATION')
            .select('event_reservation_id, event_name, event_type, event_date, guest_id, event_start_time, event_end_time, event_no_guest, event_total_price ');

        if (eventReservationsError) {
            console.error('Error fetching event reservations:', eventReservationsError);
            return res.status(400).json({ error: eventReservationsError.message });
        }

        console.log(`Fetched ${eventReservations.length} event reservations`);

        if (eventReservations.length === 0) {
            console.log('No event reservations found.');
            return res.status(200).json([]);
        }

        // Step 2: Fetch event reservation list with food items, venue, and food package IDs
        const reservationIds = eventReservations.map(reservation => reservation.event_reservation_id);
        console.log(`Reservation IDs: ${reservationIds}`);

        const { data: reservationList, error: reservationListError } = await supabase
            .from('EVENT_RESERVATION_LIST')
            .select('event_reservation_id, event_venue_id, event_fd_pckg_id, food_id')
            .in('event_reservation_id', reservationIds);

        if (reservationListError) {
            console.error('Error fetching reservation list:', reservationListError);
            return res.status(400).json({ error: reservationListError.message });
        }

        console.log(`Fetched reservation list: ${reservationList.length} items`);

        // Step 3: Extract venue, food package, and food item IDs from the reservation list
        const venueIds = reservationList.map(item => item.event_venue_id);
        const foodPackageIds = reservationList.map(item => item.event_fd_pckg_id);
        const foodItemIds = reservationList.map(item => item.food_id);
        console.log(`Venue IDs: ${venueIds}`);
        console.log(`Food Package IDs: ${foodPackageIds}`);
        console.log(`Food Item IDs: ${foodItemIds}`);

        // Step 4: Fetch venue details
        const { data: venues, error: venuesError } = await supabase
            .from('EVENT_VENUE')
            .select('event_venue_id, venue_name, venue_final_price')
            .in('event_venue_id', venueIds);

        if (venuesError) {
            console.error('Error fetching venue details:', venuesError);
            return res.status(400).json({ error: venuesError.message });
        }

        console.log(`Fetched ${venues.length} venues`);

        // Step 5: Fetch food package details
        const { data: foodPackages, error: foodPackagesError } = await supabase
            .from('EVENT_FOOD_PACKAGE')
            .select('event_fd_pckg_id, event_fd_pckg_name, event_fd_pckg_final_price')
            .in('event_fd_pckg_id', foodPackageIds);

        if (foodPackagesError) {
            console.error('Error fetching food package details:', foodPackagesError);
            return res.status(400).json({ error: foodPackagesError.message });
        }

        console.log(`Fetched ${foodPackages.length} food packages`);

        // Step 6: Fetch food item details
        const { data: foodItems, error: foodItemsError } = await supabase
            .from('FOOD_ITEM')
            .select('food_id, food_name, food_final_price, food_category_name')
            .in('food_id', foodItemIds);

        if (foodItemsError) {
            console.error('Error fetching food items:', foodItemsError);
            return res.status(400).json({ error: foodItemsError.message });
        }

        console.log(`Fetched ${foodItems.length} food items`);

        const guestIds = eventReservations.map(reservation => reservation.guest_id);
        const { data: guests, error: guestsError } = await supabase
            .from('GUEST')
            .select('guest_id, guest_fname, guest_lname, guest_email, guest_phone_no, guest_address, guest_country')
            .in('guest_id', guestIds);

        if (guestsError) {
            console.error('Error fetching guest details:', guestsError);
            return res.status(400).json({ error: guestsError.message });
        }

        console.log(`Fetched ${guests.length} guests`);

        // Step 8: Combine the fetched data into a single object for each reservation
        const combinedReservations = eventReservations.map(reservation => {
            // Find the corresponding entry in reservationList for this reservation
            const reservationListItem = reservationList.find(item => item.event_reservation_id === reservation.event_reservation_id);

            // Find the corresponding venue, food package, guest, and food items
            const venueDetails = venues.find(venue => venue.event_venue_id === reservationListItem?.event_venue_id);
            const foodPackageDetails = foodPackages.find(pkg => pkg.event_fd_pckg_id === reservationListItem?.event_fd_pckg_id);
            const guestDetails = guests.find(guest => guest.guest_id === reservation.guest_id);
            const reservationFoodItems = reservationList
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
                    venue_price: venueDetails.venue_final_price
                } : null,
                foodPackage: foodPackageDetails ? {
                    package_name: foodPackageDetails.event_fd_pckg_name,
                    package_price: foodPackageDetails.event_fd_pckg_final_price
                } : null,
                foodItems: reservationFoodItems.map(foodItem => ({
                    food_name: foodItem?.food_name,
                    food_category_name: foodItem?.food_category_name
                }))
            };
        });

        console.log('Combined reservations:', combinedReservations);

        // Return the combined reservations
        res.status(200).json(combinedReservations);

    } 
 catch (error) {
        console.error('Error fetching event reservations:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

module.exports = { getEventReservationsAll };
