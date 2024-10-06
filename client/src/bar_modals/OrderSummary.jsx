import React from 'react';
import 'bulma/css/bulma.min.css';
import '../manager_modals/modals_m.css';
import { IoArrowUndo, IoPrintOutline } from 'react-icons/io5';

const DrinkOrderSummary = ({ isOpen, toggleModal, order }) => {
  if (!order) return null; // Return null if no order is selected

  const { drinkItems = [], guest_fname, guest_lname, room_number, b_order_date, STAFF } = order;
  const numberOfItems = drinkItems.length;
  const total = drinkItems.reduce((sum, item) => sum + item.b_order_subtotal, 0);

  return (
    <section className="section-p1">
      {/* Modal for Drink Order Summary */}
      <div className={`modal ${isOpen ? 'is-active' : ''}`}>
        <div className="modal-background" onClick={toggleModal}></div>
        <div className="modal-card custom-modal-card">
          <header className="modal-card-head">
            <p className="modal-card-title">Drink Order Summary</p>
            <button className="delete" aria-label="close" onClick={toggleModal}></button>
          </header>
          <section className="modal-card-body">
            <div className="columns is-multiline">
              {/* First Column for Order Details */}
              <div className="column is-6">
                <div className="field">
                  <label className="label">Order ID</label>
                  <p>{order.bar_order_id}</p>
                </div>
                <div className="field">
                  <label className="label">Charged To</label>
                  <p>{`${guest_fname} ${guest_lname}`}</p>
                </div>
                <div className="field">
                  <label className="label">Order Date</label>
                  <p>{new Date(b_order_date).toLocaleDateString()}</p>
                </div>
              </div>

              {/* Second Column for Additional Details */}
              <div className="column is-6">
                <div className="field">
                  <label className="label">Order Status</label>
                  <p>{order.b_order_status}</p>
                </div>
                <div className="field">
                  <label className="label">Room Number</label>
                  <p>{room_number || 'N/A'}</p>
                </div>
                <div className="field">
                  <label className="label">Staff Username</label>
                  <p>{STAFF?.staff_id || 'N/A'} : {STAFF?.staff_username || 'Unknown'}</p>
                </div>
              </div>

              {/* Table Container for Drink Items */}
              <div className="column is-12">
                <hr style={{ border: '1px solid grey' }} />
                <div className="container-blue-space">
                  <h1 className="subtitle">
                    <strong>Total Order</strong>
                  </h1>
                  <div className="columns">
                    <div className="column is-8">
                      <div className="table-container">
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

                    {/* Summary */}
                    <div className="column is-4">
                      <div style={{ marginBottom: '1rem' }}>
                          <p className="title is-6">Number of Items: {numberOfItems}</p>
                          <p className="title is-6">Total: ₱{total.toFixed(2)}</p>
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

export default DrinkOrderSummary;
