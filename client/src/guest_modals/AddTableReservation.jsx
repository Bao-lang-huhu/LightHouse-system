import React from 'react';
import 'bulma/css/bulma.min.css';


const AddTableReservation = ({ isOpen, toggleModal }) => {
    return (
        <div className={`modal ${isOpen ? 'is-active' : ''}`}>
            <div className="modal-background" onClick={toggleModal}></div>
            <div className="modal-card custom-modal-card">
                <header className="modal-card-head">
                    <p className="modal-card-title">Restaurant Table Booking Review</p>
                    <button className="delete" aria-label="close" onClick={toggleModal}></button>
                </header>
                <section className="modal-card-body">
                <div className="columns">

                    <div className="column is-8">
                        <div className="columns is-multiline">
                                <div className="column is-6">
                                    <div className="field">
                                        <label className="label">First Name</label>
                                        <div className="control">
                                            <input className="input" type="text" placeholder="Enter first name" />
                                        </div>
                                    </div>
                                </div>

                                <div className="column is-6">
                                    <div className="field">
                                        <label className="label">Last Name</label>
                                        <div className="control">
                                            <input className="input" type="text" placeholder="Enter last name" />
                                        </div>
                                    </div>
                                </div>

                                <div className="column is-6">
                                    <div className="field">
                                        <label className="label">Address</label>
                                        <div className="control">
                                            <input className="input" type="text" placeholder="Enter address" />
                                        </div>
                                    </div>
                                </div>

                                <div className="column is-6">
                                    <div className="field">
                                        <label className="label">Gender</label>
                                        <div className="control">
                                            <input className="input" type="text" placeholder="Enter gender" />
                                        </div>
                                    </div>
                                </div>
                                {/* Continue for other fields */}
                                <div className="column is-6">
                                    <div className="field">
                                        <label className="label">Email</label>
                                        <div className="control">
                                            <input className="input" type="email" placeholder="Enter email" />
                                        </div>
                                    </div>
                                </div>

                                <div className="column is-6">
                                    <div className="field">
                                        <label className="label">Phone Number</label>
                                        <div className="control">
                                            <input className="input" type="email" placeholder="Enter email" />
                                        </div>
                                    </div>
                                </div>

                                <div className="column is-6">
                                    <div className="field">
                                        <label className="label">Account Role</label>
                                        <div className="control">
                                            <input className="input" type="email" placeholder="Enter email" />
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="column is-6">
                                        <div className="field">
                                            <label className="label">Department</label>
                                            <div className="control">
                                                <input className="input" type="text" placeholder="Enter department" />
                                            </div>
                                        </div>
                                </div>

                                <div className="column is-6">
                                    <div className="field">
                                        <label className="label">Hire Date</label>
                                        <div className="control">
                                            <input className="input" type="text" placeholder="Enter username" />
                                        </div>
                                    </div>
                                </div>

                                <div className="column is-6">
                                <label className="label">Shift Time</label>
                                    <div className="columns">
                                        <div className="column is-6">
                                            <input className="input" type="time" placeholder="Start Time" />
                                        </div>
                                        <div className="column is-6">
                                            <input className="input" type="time" placeholder="End Time" />
                                        </div>
                                    </div>
                                </div>


                                <div className="column is-6">
                                    <div className="field">
                                        <label className="label">Username</label>
                                        <div className="control">
                                            <input className="input" type="text" placeholder="Enter username" />
                                        </div>
                                    </div>
                                </div>

                            <div className="column is-6">
                                <div className="field">
                                    <label className="label">New Password</label>
                                    <div className="control">
                                        <input className="input" type="text" placeholder="Enter new password" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="column is-4">
                        {/* Second Column with image preview and file input */}
                        <div className="staff-space">
                           
                        </div>
                    </div>
                    </div>
                </section>

                <footer className="modal-card-foot is-flex is-justify-content-flex-end is-align-items-center">
                    <button className="button is-blue mr-2">Save</button>
                    <button className="button is-red" onClick={toggleModal}>Cancel</button>
                </footer>

            </div>
        </div>
    );
};

export default AddTableReservation;