import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { IoEyeOutline, IoCashOutline, IoArchiveOutline } from 'react-icons/io5'; // Icons for actions
import 'bulma/css/bulma.min.css';
import ReservationDetailsModal from '../frontdesk_modals/ReservationDetailModal'; // Import the modal component

const CheckInTable = () => {
  const [checkIns, setCheckIns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReservationId, setSelectedReservationId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchCheckInData = async () => {
      try {
        const response = await axios.get('https://light-house-system.vercel.app/api/getCheckInData'); // Example API call
        setCheckIns(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching check-in data:', error);
        setLoading(false);
      }
    };

    fetchCheckInData();
  }, []);

  const handleViewDetails = (reservationId) => {
    setSelectedReservationId(reservationId);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedReservationId(null);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="section">
      <h1 className="title">Check-In Records</h1>

      <div className="table-container">
        <table className="table is-striped is-fullwidth is-hoverable">
          <thead>
            <tr>
              <th>Check-In ID</th>
              <th>Room Reservation ID</th>
              <th>Staff ID</th>
              <th>Check-In Date</th>
              <th>Initial Payment</th>
              <th>Payment Status</th>
              <th>Check-In Status</th>
              <th className="has-text-centered">Actions</th>
            </tr>
          </thead>
          <tbody>
            {checkIns.map((checkIn) => (
              <tr key={checkIn.check_in_id}>
                <td>{checkIn.check_in_id}</td>
                <td>{checkIn.room_reservation_id}</td>
                <td>{checkIn.staff_id}</td>
                <td>{new Date(checkIn.check_in_date_time).toLocaleDateString()}</td>
                <td>₱{checkIn.initial_payment ? checkIn.initial_payment.toFixed(2) : 'N/A'}</td>
                <td>{checkIn.payment_status || 'N/A'}</td>
                <td>{checkIn.check_in_status || 'N/A'}</td>
                <td className="has-text-centered">
                  <div className="button-container">
                    <div className="button-row">
                      <button
                        className="button is-info is-small"
                        onClick={() => handleViewDetails(checkIn.room_reservation_id)}
                      >
                        <IoEyeOutline className="m-1" />
                        View Details
                      </button>
                      <button
                        className="button is-warning is-small"
                        onClick={() => handleViewBill(checkIn.check_in_id)}
                      >
                        <IoCashOutline className="m-1" />
                        Bill
                      </button>
                    </div>
                    <div className="button-fullwidth">
                      <button
                        className="button is-danger is-small"
                        onClick={() => handleArchive(checkIn.check_in_id)}
                      >
                        <IoArchiveOutline className="m-1" />
                        Archive
                      </button>
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pass selectedReservationId to ReservationDetailsModal */}
      {isModalOpen && (
        <ReservationDetailsModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          roomReservationId={selectedReservationId}
        />
      )}
    </div>
  );
};

// Example action handlers
const handleViewBill = (checkInId) => {
  console.log(`Viewing bill for check-in ID: ${checkInId}`);
};

const handleArchive = (checkInId) => {
  console.log(`Archiving check-in ID: ${checkInId}`);
};

export default CheckInTable;
