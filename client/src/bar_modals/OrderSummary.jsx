import React from 'react';
import 'bulma/css/bulma.min.css';
import '../manager_modals/modals_m.css';
import { IoArrowUndo, IoPrintOutline } from 'react-icons/io5';

const DrinkOrderSummary = ({ isOpen, toggleModal, order }) => {
  if (!order) return null; // Return null if no order is selected

  const { drinkItems = [], guest_fname, guest_lname, room_number, b_order_date, STAFF } = order;
  const numberOfItems = drinkItems.length;
  const total = drinkItems.reduce((sum, item) => sum + item.b_order_subtotal, 0);

  const printOrderDirectly = () => {
    const iframe = document.createElement('iframe');
    document.body.appendChild(iframe);
    iframe.style.display = 'none';

    const printDocument = iframe.contentDocument || iframe.contentWindow.document;
    printDocument.open();
    printDocument.write(`
      <html>
        <head>
          <style>
            @media print {
              body {
                -webkit-print-color-adjust: exact;
                font-family: Arial, sans-serif;
                margin: 0;
                padding: 0;
              }
              .print-container {
                width: 100%;
                padding: 20px;
                background-color: white;
              }
              .table {
                width: 90%;
                border-collapse: collapse;
              }
              .table th, .table td {
                padding: 8px;
                border: 1px solid #ddd;
                text-align: left;
              }
              .table th {
                background-color: #f2f2f2;
              }
              .table, .print-container, tr, td {
                page-break-inside: avoid;
              }
              .no-print-btn, .cancel-btn {
                display: none;
              }
              @page {
                size: A4;
                margin: 10mm;
              }
            }
          </style>
        </head>
        <body onload="setTimeout(() => { window.print(); window.close(); }, 500);">
          <div class="print-container">
            <h1 class="subtitle"><strong>Drink Order Summary</strong></h1>
            <p><strong>Staff:</strong> ${order.STAFF ? `${order.STAFF.staff_fname} ${order.STAFF.staff_lname}` : 'No Staff'}</p>
            <p><strong>Order Date:</strong> ${new Date(order.b_order_date).toLocaleDateString()}</p>
            ${order.b_payment_method === 'ROOM' ? 
                `<p><strong>Room:</strong> ${room_number || 'Not Available'}</p>` : ''}
            ${order.b_payment_method === 'ROOM' ? 
                `<p><strong>Guest:</strong> ${order.guest_fname} ${order.guest_lname}</p>` : ''}
                 
            <table class="table">
              <thead>
                <tr>
                  <th>Drink Item</th>
                  <th>Quantity</th>
                  <th>Subtotal</th>
                </tr>
              </thead>
              <tbody>
                ${order.drinkItems.map(item => `
                  <tr>
                    <td>${item.drink_name}</td>
                    <td>${item.b_order_qty}</td>
                    <td>₱${item.b_order_subtotal.toFixed(2)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
            <p><strong>Total:</strong> ₱${total.toFixed(2)}</p>
          </div>
        </body>
      </html>
    `);
    printDocument.close();

    // Set a delay to remove the iframe after print is called
    iframe.onload = () => {
        setTimeout(() => {
            document.body.removeChild(iframe);
        }, 1000);
    };
};


  return (
    <section className="section-p1">
      {/* Modal for Drink Order Summary */}
      <div className={`modal ${isOpen ? 'is-active' : ''}`}>
        <div className="modal-background" onClick={toggleModal}></div>
        <div className="modal-card">
          <header className="modal-card-head">
            <p className="modal-card-title">Drink Order Summary</p>
            <button className="delete" aria-label="close" onClick={toggleModal}></button>
          </header>
          <section className="modal-card-body">
            <div className="columns is-multiline">
              {/* First Column for Order Details */}
              <div className="column is-6">
              {order.b_payment_method === 'ROOM' && (
                <div className="field">
                  <label className="label has-text-grey">Charged To: <strong>{`${guest_fname} ${guest_lname}`}</strong></label>
                </div>
                 )}

                <div className="field">
                  <label className="label has-text-grey">Order Date: <strong>{new Date(b_order_date).toLocaleDateString()}</strong></label>
                </div>

                <div className="field">
                    <label className="label has-text-grey">
                          Payment Method: <strong>{order.b_payment_method}</strong>
                      </label>
                </div>
              </div>
              
              {/* Second Column for Additional Details */}
              <div className="column is-6">
                <div className="field">
                  <label className="label has-text-grey">Order Status: <strong>{order.b_order_status}</strong></label>
                </div>
                {order.b_payment_method === 'ROOM' && (
                <div className="field">
                  <label className="label has-text-grey">Room Number: <strong>{room_number || 'Outside Guest'}</strong></label>
                </div>
                )}
                <div className="field">
                  <label className="label has-text-grey">
                  Staff Name: <strong>{STAFF ? `${STAFF.staff_fname} ${STAFF.staff_lname}` : 'No Staff'}</strong>
                  </label>
                </div>
              </div>

              {/* Table Container for Drink Items */}
              <div className="column m-0">
                <hr style={{ border: '1px solid grey' }} className='m-0 p-0' />
                <div className="container-blue-space">
                  <h1 className="subtitle">
                    <strong>Total Order: <span className='is-size-4'>₱{total.toFixed(2)}</span></strong>
                  </h1>
                  <div className="columns is-multiline">
                    <div className="column is-12 m-0">
                      <div className="table-container m-0 p-0">
                        <table className="table is-fullwidth is-striped is-hoverable">
                          <thead>
                            <tr>
                              <th className="has-text-centered">Drink Name</th>
                              <th className="has-text-centered">Quantity</th>
                              <th className="has-text-centered">Subtotal</th>
                            </tr>
                          </thead>
                          <tbody>
                            {drinkItems.map((item, index) => (
                              <tr key={index}>
                                <td>{item.drink_name}</td>
                                <td className="has-text-centered">{item.b_order_qty}</td>
                                <td>₱{item.b_order_subtotal.toFixed(2)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
          <footer className="modal-card-foot is-flex is-justify-content-flex-end is-align-items-center">
            <button className="button is-blue mr-2" onClick={toggleModal}>
              <IoArrowUndo style={{ marginRight: '0.5rem' }} />
              Back
            </button>
            <button className="button is-inverted-blue" onClick={printOrderDirectly}>
              <IoPrintOutline style={{ marginRight: '0.5rem' }} />
              Print
            </button>
          </footer>
        </div>
      </div>
    </section>
  );
};

export default DrinkOrderSummary;
