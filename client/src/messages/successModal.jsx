import React from 'react';
import { useNavigate } from 'react-router-dom';
import { IoCheckmarkCircle } from 'react-icons/io5'; 

const SuccessModal = ({ isOpen, toggleModal }) => {
    const navigate = useNavigate();

    const handleCheckReservations = () => {
        navigate('/reservations'); 
    };

    const handleClose = () => {
        toggleModal();
        navigate('/');
    };

    return (
        <div className={`modal ${isOpen ? 'is-active' : ''}`}>
            <div className="modal-background" onClick={toggleModal}></div>
            <div className="modal-card" style={{ borderRadius: '2rem', boxShadow: '0 5px 15px rgba(0, 0, 0, 0.1)' }}>
                <section className="modal-card-body" style={{ padding: '2rem', backgroundColor: '#fff' }}>
                    <div className="has-text-centered">
                        <IoCheckmarkCircle size={128} style={{ color: '#4caf50' }} />
                        <p className="is-size-5 has-text-centered mt-3">Your reservation has been successfully created! Your room booking is confirmed, and you can view the details in your Reservations. </p>
                    </div>
                </section>
                <footer className="modal-card-foot is-flex is-justify-content-center" style={{ backgroundColor: '#f7f9fc' }}>
                    <button className="button is-blue mr-2" onClick={handleCheckReservations}>
                        Check Reservations
                    </button>
                    <button className="button is-inverted-blue" onClick={handleClose}>
                        Back to Home
                    </button>
                </footer>
            </div>
        </div>
    );
};

export default SuccessModal;
