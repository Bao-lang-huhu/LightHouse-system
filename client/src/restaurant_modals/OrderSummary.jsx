import React from 'react';
import 'bulma/css/bulma.min.css';
import '../manager_modals/modals_m.css';
import { IoArrowUndo, IoPrintOutline } from 'react-icons/io5';

const OrderSummary = ({ isOpen, toggleModal, order }) => {
  if (!order) return null; // Return null if no order is selected

  const { foodItems = [], guest_fname, guest_lname, room_number, f_order_date, f_notes, STAFF } = order;
  const numberOfItems = foodItems.length;
  const total = foodItems.reduce((sum, item) => sum + item.f_order_subtotal, 0);

  return (
    <section className="section-p1">
      {/* Modal for Order Summary */}
      <div className={`modal ${isOpen ? 'is-active' : ''}`}>
        <div className="modal-background" onClick={toggleModal}></div>
        <div className="modal-card">
          <header className="modal-card-head">
            <p className="modal-card-title">Order Summary</p>
            <button className="delete" aria-label="close" onClick={toggleModal}></button>
          </header>
          <section className="modal-card-body">
            <div className="columns is-multiline ">
              {/* First Column for Order Details */}
              <div className="column is-6 mb-1">
                  {/* Only show "Charged To" if the order status is "ROOM" */}
                  {order.f_order_status === 'ROOM' && (
                      <div className="field">
                          <label className="label has-text-grey">
                              Charged To: <strong>{`${guest_fname} ${guest_lname}`}</strong>
                          </label>
                      </div>
                  )}
                  <div className="field">
                      <label className="label has-text-grey">
                          Order Date: <strong>{new Date(f_order_date).toLocaleDateString()}</strong>
                      </label>
                  </div>
              </div>

              <div className="column is-6 m-0">
                  <div className="field">
                      <label className="label has-text-grey">
                          Order Status: <strong>{order.f_order_status}</strong>
                      </label>
                  </div>
                  {/* Only show "Room Number" if the order status is "ROOM" */}
                  {order.f_order_status === 'ROOM' && (
                      <div className="field">
                          <label className="label has-text-grey">
                              Room Number: <strong>{room_number || 'Outside Guest'}</strong>
                          </label>
                      </div>
                  )}
                  <div className="field">
                      <label className="label has-text-grey">
                          Staff Name: <strong>{STAFF ? `${STAFF.staff_fname} ${STAFF.staff_lname}` : 'No Staff'}</strong>
                      </label>
                  </div>
              </div>

              {/* Table Container for Food Items */}
              <div className="column m-0">
                <hr style={{ border: '1px solid grey' }} className='m-0 p-0'/>
                <div className="container-blue-space">
                  <h1 className="subtitle">
                    <strong>Total Order : <span className='is-size-4'>₱{total.toFixed(2)}</span>  </strong>
                    <p>Line Items: {numberOfItems}</p>
                  </h1>
                  <div className="columns is-multiline">
                    {/* Food Items Table */}
                    <div className="column is-12 m-0">
                      <div className="table-container m-0 p-0">
                        <table className="table is-fullwidth is-striped is-hoverable">
                          <thead>
                            <tr>
                              <th className="has-text-centered">Food Name</th>
                              <th className="has-text-centered">Quantity</th>
                              <th className="has-text-centered">Subtotal</th>
                            </tr>
                          </thead>
                          <tbody>
                            {foodItems.map((item, index) => (
                              <tr key={index}>
                                <td>{item.food_name}</td>
                                <td className="has-text-centered">{item.f_order_qty}</td>
                                <td>₱{item.f_order_subtotal.toFixed(2)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Summary and Notes */}
                    <div className="column is-12">
                      <div style={{ marginBottom: '1rem' }}>
                        <label className="label"><strong>Notes:</strong></label>
                        <textarea
                          placeholder="No additional notes."
                          className="textarea"
                          value={f_notes || ''}
                          readOnly
                          style={{ width: '100%', minHeight: '100px' }}
                        />
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
            <button className="button is-primary">
              <IoPrintOutline style={{ marginRight: '0.5rem' }} />
              Print
            </button>
          </footer>
        </div>
      </div>
    </section>
  );
};

export default OrderSummary;
