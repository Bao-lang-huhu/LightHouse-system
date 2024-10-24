const { supabase } = require('../supabaseClient');

const getRestaurantSales = async (req, res) => {
    const type = req.query.type || 'monthly'; // Default to 'monthly' if not specified
    try {
        const { data: foodOrders, error: foodOrderError } = await supabase
            .from('FOOD_ORDER')
            .select('f_order_date, f_order_total')
            .eq('f_order_status', 'COMPLETE');

        if (foodOrderError) {
            console.error(`Error fetching FOOD_ORDER data: ${foodOrderError.message}`);
            return res.status(500).json({ error: 'Error fetching FOOD_ORDER data' });
        }

        const salesData = {};
        foodOrders.forEach(order => {
            const orderDate = new Date(order.f_order_date);
            let key;
            if (type === 'yearly') {
                key = `${orderDate.getFullYear()}`;
            } else {
                key = `${orderDate.getFullYear()}-${String(orderDate.getMonth() + 1).padStart(2, '0')}`;
            }

            if (!salesData[key]) {
                salesData[key] = 0;
            }

            salesData[key] += order.f_order_total || 0;
        });

        const result = Object.entries(salesData).map(([key, totalSales]) => ({
            period: key,
            totalSales
        }));

        res.status(200).json(result);
    } catch (error) {
        console.error('Error processing restaurant sales data:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = { getRestaurantSales };
