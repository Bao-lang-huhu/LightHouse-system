const { supabase } = require('../../supabaseClient');

const getFoodItemOrderCounts = async () => {
    try {
        const { data, error } = await supabase
            .from('FOOD_ORDER')
            .select(`
                f_order_date,
                FOOD_ORDER_LIST (food_order_id)
            `);

        if (error) throw error;

        const orderCounts = data.reduce((acc, order) => {
            const month = new Date(order.f_order_date).toLocaleString('default', { month: 'long' });
            acc[month] = (acc[month] || 0) + order.FOOD_ORDER_LIST.length;
            return acc;
        }, {});

        return orderCounts;
    } catch (error) {
        console.error('Error fetching food order counts:', error);
        throw error;
    }
};

const getDrinkOrderCounts = async () => {
    try {
        const { data, error } = await supabase
            .from('BAR_ORDER')
            .select(`
                b_order_date,
                BAR_ORDER_LIST (bar_order_id)
            `);

        if (error) throw error;

        const orderCounts = data.reduce((acc, order) => {
            const month = new Date(order.b_order_date).toLocaleString('default', { month: 'long' });
            acc[month] = (acc[month] || 0) + order.BAR_ORDER_LIST.length;
            return acc;
        }, {});

        return orderCounts;
    } catch (error) {
        console.error('Error fetching drink order counts:', error);
        throw error;
    }
};

module.exports = {
    getFoodItemOrderCounts,
    getDrinkOrderCounts
};
