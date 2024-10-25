import React from 'react';
import 'bulma/css/bulma.min.css';


const EditAdditionalItemModal = ({ isOpen, toggleModal }) => {
    return (
        <div className={`modal ${isOpen ? 'is-active' : ''}`}>
            <div className="modal-background" onClick={toggleModal}></div>
            <div className="modal-card">
                <header className="modal-card-head">
                    <p className="modal-card-title">Edit Additional Item</p>
                    <button className="delete" aria-label="close" onClick={toggleModal}></button>
                </header>
                <section className="modal-card-body">
                    <div className="columns">
                        <div className="column is-12">
                            <div className="columns is-multiline">
                                    <div className="column is-6">
                                        <div className="field">
                                            <label className="label">Room Number</label>
                                            <div className="control">
                                                <p>Example 101</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="column is-6">
                                        <div className="field">
                                            <label className="label">Item Name</label>
                                            <div className="control">
                                                <p>Example Item</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="column is-6">
                                        <div className="field">
                                            <label className="label">Borrowed Date</label>
                                            <div className="control">
                                                <p>Example Date</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="column is-6">
                                        <div className="field">
                                            <label className="label">Status</label>
                                            <div className="control">
                                                <div className="select is-fullwidth">
                                                    <select>
                                                        <option>AVAILABLE</option>
                                                        <option>NOT AVAILABLE</option>
                                                    </select>
                                                </div>
                                            </div>
                                        </div>
                                    </div> 
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

export default EditAdditionalItemModal;
