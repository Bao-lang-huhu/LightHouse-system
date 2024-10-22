import React from 'react';
import { useNavigate } from 'react-router-dom';
import { IoAlertCircle } from 'react-icons/io5'; 

const ErrorModal = ({ isOpen, toggleModal }) => {
    const navigate = useNavigate();

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
                        <IoAlertCircle size={128} style={{ color: '#f44336' }} /> 
                        <p className="is-size-5 has-text-centered mt-3">An error occurred. Please try again later.</p>
                    </div>
                </section>
                <footer className="modal-card-foot is-flex is-justify-content-center" style={{ backgroundColor: '#f7f9fc' }}>
                    <button className="button is-blue mr-2" onClick={handleClose}>
                        Back Home
                    </button>
                </footer>
            </div>
        </div>
    );
};

export default ErrorModal;
