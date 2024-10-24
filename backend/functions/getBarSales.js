const { supabase } = require('../supabaseClient');

const getBarSales = async (req, res) => {
    const type = req.query.type || 'monthly'; // Default to 'monthly' if not specified
    try {
        const { data: barOrders, error: barOrderError } = await supabase
            .from('BAR_ORDER')
            .select('b_order_date, b_order_total')
            .eq('b_order_status', 'COMPLETE');

        if (barOrderError) {
            console.error(`Error fetching BAR_ORDER data: ${barOrderError.message}`);
            return res.status(500).json({ error: 'Error fetching BAR_ORDER data' });
        }

        const salesData = {};
        barOrders.forEach(order => {
            const orderDate = new Date(order.b_order_date);
            let key;
            if (type === 'yearly') {
                key = `${orderDate.getFullYear()}`;
            } else {
                key = `${orderDate.getFullYear()}-${String(orderDate.getMonth() + 1).padStart(2, '0')}`;
            }

            if (!salesData[key]) {
                salesData[key] = 0;
            }

            salesData[key] += order.b_order_total || 0;
        });

        const result = Object.entries(salesData).map(([key, totalSales]) => ({
            period: key,
            totalSales
        }));

        res.status(200).json(result);
    } catch (error) {
        console.error('Error processing bar sales data:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = { getBarSales };
