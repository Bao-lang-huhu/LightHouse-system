import React, { forwardRef } from 'react';

const OrderPrintContent = forwardRef(({ currentStaff, paymentMethod, selectedCheckInId, checkedInGuests, foodOrders, total }, ref) => (
  <div ref={ref} className="print-container">
    <div className="box">
      <h1 className="subtitle"><strong>Order Preview</strong></h1>
      <p><strong>Staff:</strong> {currentStaff.staff_name}</p>
      <p><strong>Payment Method:</strong> {paymentMethod}</p>
      {selectedCheckInId && (
        <p><strong>Room:</strong> {checkedInGuests.find(guest => guest.check_in_id === selectedCheckInId)?.room_number || 'Not Available'}</p>
      )}
      <div className="table-container">
        <table className="table is-fullwidth is-striped is-hoverable">
          <thead>
            <tr>
              <th className="has-text-centered">Food Item</th>
              <th className="has-text-centered">Quantity</th>
              <th className="has-text-centered">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {foodOrders.map((item, index) => (
              <tr key={index}>
                <td>{item.food_name}</td>
                <td>{item.quantity}</td>
                <td>₱{(item.food_price * item.quantity).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p><strong>Total:</strong> ₱{total.toFixed(2)}</p>
    </div>
  </div>
));

export default OrderPrintContent;
