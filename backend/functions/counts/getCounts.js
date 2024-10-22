const { supabase } = require('../../supabaseClient');

const getYearlyFoodOrders = async (req, res) => {
    const { year } = req.query; // Get the year from the query parameters

    try {
        // Define the start and end date for the year
        const startDate = `${year}-01-01T00:00:00.000Z`;
        const endDate = `${parseInt(year) + 1}-01-01T00:00:00.000Z`;

        const { data, error } = await supabase
            .from('FOOD_ORDER_LIST')
            .select(`
                food_id,
                FOOD_ITEM(food_name),
                FOOD_ORDER(f_order_status, f_order_date)
            `)
            .eq('FOOD_ORDER.f_order_status', 'COMPLETE')
            .gte('FOOD_ORDER.f_order_date', startDate)
            .lt('FOOD_ORDER.f_order_date', endDate);

        if (error) {
            throw error;
        }

        // Filter out any records where FOOD_ORDER or f_order_date is null
        const validData = data.filter(record => record.FOOD_ORDER && record.FOOD_ORDER.f_order_date);

        if (validData.length === 0) {
            // Return an empty array if there is no data for the given year
            return res.status(200).json([]);
        }

        const yearlyOrders = validData.reduce((acc, curr) => {
            const foodName = curr.FOOD_ITEM.food_name;
            const orderDate = new Date(curr.FOOD_ORDER.f_order_date);

            // Ensure the orderDate is within the start and end range for the year
            if (orderDate >= new Date(startDate) && orderDate < new Date(endDate)) {
                if (acc[foodName]) {
                    acc[foodName]++;
                } else {
                    acc[foodName] = 1;
                }
            }

            return acc;
        }, {});

        const result = Object.keys(yearlyOrders).map(name => ({
            food_name: name,
            order_count: yearlyOrders[name]
        }));

        res.status(200).json(result);
    } catch (err) {
        console.error('Error fetching yearly food orders:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};


const getMonthlyFoodOrders = async (req, res) => {
    const { startDate, endDate } = req.query;

    try {
        const { data, error } = await supabase
            .from('FOOD_ORDER_LIST')
            .select(`
                food_id,
                FOOD_ITEM(food_name),
                FOOD_ORDER(f_order_status, f_order_date)
            `)
            .eq('FOOD_ORDER.f_order_status', 'COMPLETE')
            .gte('FOOD_ORDER.f_order_date', `${startDate}T00:00:00.000Z`)
            .lt('FOOD_ORDER.f_order_date', `${endDate}T23:59:59.999Z`);

        if (error) {
            throw error;
        }

        // Filter out any records where FOOD_ORDER or f_order_date is null
        const validData = data.filter(record => record.FOOD_ORDER && record.FOOD_ORDER.f_order_date);

        const monthlyOrders = validData.reduce((acc, curr) => {
            const foodName = curr.FOOD_ITEM.food_name;
            const orderDate = new Date(curr.FOOD_ORDER.f_order_date);
            
            // Ensure the orderDate is within the start and end range
            if (orderDate >= new Date(`${startDate}T00:00:00.000Z`) && orderDate < new Date(`${endDate}T23:59:59.999Z`)) {
                if (acc[foodName]) {
                    acc[foodName]++;
                } else {
                    acc[foodName] = 1;
                }
            }

            return acc;
        }, {});

        const result = Object.keys(monthlyOrders).map(name => ({
            food_name: name,
            order_count: monthlyOrders[name]
        }));

        res.status(200).json(result);
    } catch (err) {
        console.error('Error fetching monthly food orders:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Function to get monthly drink orders
const getMonthlyDrinkOrders = async (req, res) => {
    const { startDate, endDate } = req.query;

    try {
        const { data, error } = await supabase
            .from('BAR_ORDER_LIST')
            .select(`
                drink_id,
                BAR_DRINK(drink_name),
                BAR_ORDER(b_order_status, b_order_date)
            `)
            .eq('BAR_ORDER.b_order_status', 'COMPLETE')
            .gte('BAR_ORDER.b_order_date', `${startDate}T00:00:00.000Z`)
            .lt('BAR_ORDER.b_order_date', `${endDate}T23:59:59.999Z`);

        if (error) {
            throw error;
        }

        // Filter out any records where BAR_ORDER or b_order_date is null
        const validData = data.filter(record => record.BAR_ORDER && record.BAR_ORDER.b_order_date);

        const monthlyOrders = validData.reduce((acc, curr) => {
            const drinkName = curr.BAR_DRINK.drink_name;
            const orderDate = new Date(curr.BAR_ORDER.b_order_date);
            
            // Ensure the orderDate is within the start and end range
            if (orderDate >= new Date(`${startDate}T00:00:00.000Z`) && orderDate < new Date(`${endDate}T23:59:59.999Z`)) {
                if (acc[drinkName]) {
                    acc[drinkName]++;
                } else {
                    acc[drinkName] = 1;
                }
            }

            return acc;
        }, {});

        const result = Object.keys(monthlyOrders).map(name => ({
            drink_name: name,
            order_count: monthlyOrders[name]
        }));

        res.status(200).json(result);
    } catch (err) {
        console.error('Error fetching monthly drink orders:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Function to get yearly drink orders
const getYearlyDrinkOrders = async (req, res) => {
    const { year } = req.query; // Get the year from the query parameters

    // Define the start and end date for the selected year
    const startDate = `${year}-01-01T00:00:00.000Z`;
    const endDate = `${parseInt(year) + 1}-01-01T00:00:00.000Z`;

    try {
        const { data, error } = await supabase
            .from('BAR_ORDER_LIST')
            .select(`
                drink_id,
                BAR_DRINK(drink_name),
                BAR_ORDER(b_order_status, b_order_date)
            `)
            .eq('BAR_ORDER.b_order_status', 'COMPLETE')
            .gte('BAR_ORDER.b_order_date', startDate)
            .lt('BAR_ORDER.b_order_date', endDate);

        if (error) {
            throw error;
        }

        // Filter out any records where BAR_ORDER or b_order_date is null
        const validData = data.filter(record => record.BAR_ORDER && record.BAR_ORDER.b_order_date);

        // If no valid data is found, return an empty array
        if (validData.length === 0) {
            return res.status(200).json([]);
        }

        const yearlyOrders = validData.reduce((acc, curr) => {
            const drinkName = curr.BAR_DRINK.drink_name;
            const orderDate = new Date(curr.BAR_ORDER.b_order_date);

            // Ensure the orderDate is within the start and end range for the year
            if (orderDate >= new Date(startDate) && orderDate < new Date(endDate)) {
                if (acc[drinkName]) {
                    acc[drinkName]++;
                } else {
                    acc[drinkName] = 1;
                }
            }

            return acc;
        }, {});

        const result = Object.keys(yearlyOrders).map(name => ({
            drink_name: name,
            order_count: yearlyOrders[name]
        }));

        res.status(200).json(result);
    } catch (err) {
        console.error('Error fetching yearly drink orders:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};



module.exports = {
    getYearlyFoodOrders,
    getMonthlyFoodOrders,
    getYearlyDrinkOrders,
    getMonthlyDrinkOrders
};
