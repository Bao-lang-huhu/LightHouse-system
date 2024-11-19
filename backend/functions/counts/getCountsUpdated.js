const { supabase } = require('../../supabaseClient');

const getFoodOrdersComparison = async (req, res) => {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
        return res.status(400).json({ error: "Start date and end date are required" });
    }

    try {
        const start = new Date(startDate);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);

        console.log("Start Date:", start);
        console.log("End Date:", end);

        // Query Supabase for the necessary data
        const { data, error } = await supabase
            .from("FOOD_ORDER_LIST")
            .select(`
                FOOD_ITEM(food_name),
                FOOD_ORDER(f_order_date, f_order_status)
            `)
            .eq("FOOD_ORDER.f_order_status", "COMPLETE")
            .gte("FOOD_ORDER.f_order_date", start.toISOString())
            .lte("FOOD_ORDER.f_order_date", end.toISOString());

        if (error) {
            throw error;
        }

        // Filter out invalid records (entries where FOOD_ORDER or f_order_date is null)
        const validData = data.filter(
            (record) => record.FOOD_ORDER && record.FOOD_ORDER.f_order_date && record.FOOD_ITEM && record.FOOD_ITEM.food_name
        );

        // Group and count food orders by food_name and year
        const groupedData = validData.reduce((acc, curr) => {
            const foodName = curr.FOOD_ITEM.food_name;
            const orderDate = new Date(curr.FOOD_ORDER.f_order_date);
            const year = orderDate.getFullYear();

            // Create an entry for the food item if it doesn't exist
            if (!acc[foodName]) {
                acc[foodName] = {};
            }

            // Increment the count for the specific year
            acc[foodName][year] = (acc[foodName][year] || 0) + 1;
            return acc;
        }, {});

        // Transform into a flat array format for the frontend
        const result = Object.entries(groupedData).flatMap(([foodName, years]) =>
            Object.entries(years).map(([year, orderCount]) => ({
                food_name: foodName,
                year: parseInt(year, 10),
                order_count: orderCount,
            }))
        );

        res.status(200).json(result);
    } catch (err) {
        console.error("Error fetching food orders comparison:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
};


const getDrinkOrdersComparison = async (req, res) => {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
        return res.status(400).json({ error: "Start date and end date are required" });
    }

    try {
        const start = new Date(startDate);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);

        console.log("Start Date:", start);
        console.log("End Date:", end);

        // Query Supabase for the necessary data
        const { data, error } = await supabase
            .from("BAR_ORDER_LIST")
            .select(`
                BAR_DRINK(drink_name),
                BAR_ORDER(b_order_date, b_order_status)
            `)
            .eq("BAR_ORDER.b_order_status", "COMPLETE")
            .gte("BAR_ORDER.b_order_date", start.toISOString())
            .lte("BAR_ORDER.b_order_date", end.toISOString());

        if (error) {
            throw error;
        }

        // Filter out invalid records (entries where BAR_ORDER or b_order_date is null)
        const validData = data.filter(
            (record) => record.BAR_ORDER && record.BAR_ORDER.b_order_date && record.BAR_DRINK && record.BAR_DRINK.drink_name
        );

        // Group and count drink orders by drink_name and year
        const groupedData = validData.reduce((acc, curr) => {
            const drinkName = curr.BAR_DRINK.drink_name;
            const orderDate = new Date(curr.BAR_ORDER.b_order_date);
            const year = orderDate.getFullYear();

            // Create an entry for the drink item if it doesn't exist
            if (!acc[drinkName]) {
                acc[drinkName] = {};
            }

            // Increment the count for the specific year
            acc[drinkName][year] = (acc[drinkName][year] || 0) + 1;
            return acc;
        }, {});

        // Transform into a flat array format for the frontend
        const result = Object.entries(groupedData).flatMap(([drinkName, years]) =>
            Object.entries(years).map(([year, orderCount]) => ({
                drink_name: drinkName,
                year: parseInt(year, 10),
                order_count: orderCount,
            }))
        );

        res.status(200).json(result);
    } catch (err) {
        console.error("Error fetching drink orders comparison:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
};


module.exports = { getFoodOrdersComparison, getDrinkOrdersComparison };
