import React, { useState, useEffect } from 'react';
import 'bulma/css/bulma.min.css';
import '../App.css';
import '../manager_components/components_m.css';
import { IoPeople, IoRestaurant } from 'react-icons/io5';
import axios from 'axios';
import { Link } from 'react-router-dom';

const TablReservations = () => {
  // Function to get today's date in YYYY-MM-DD format
  const getTodayDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [activeAccordion, setActiveAccordion] = useState(null);
  const [selectedDate, setSelectedDate] = useState(getTodayDate()); // Default to today's date
  const [timeSlots, setTimeSlots] = useState([]);
  const [tableStatuses, setTableStatuses] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedGuest, setSelectedGuest] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [tables, setTables] = useState([]);

  const fetchTables = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/getTables');
      setTables(response.data);
    } catch (error) {
      console.error('Error fetching tables:', error);
    }
  };

  const fetchReservations = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:3001/api/getTableReservations', {
        params: { table_reservation_date: selectedDate }, // Use selectedDate, which defaults to today
      });
      setTimeSlots(response.data || []); // Ensure response data is an array
    } catch (error) {
      console.error('Error fetching reservations:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTables();
    fetchReservations(); // Fetch today's reservations on component mount
  }, []); // Only run once when the component mounts

  useEffect(() => {
    if (selectedDate) {
      fetchReservations(); // Fetch reservations when the selected date changes
    } else {
      setTimeSlots([]);
    }
  }, [selectedDate]);

  const handleAccordionClick = (index) => {
    setActiveAccordion(activeAccordion === index ? null : index);

    if (activeAccordion !== index) {
      const newStatuses = {};

      if (timeSlots[index] && Array.isArray(timeSlots[index].reservations)) {
        timeSlots[index].reservations.forEach((reservation) => {
          newStatuses[reservation.table.table_name] = reservation.reservation_status;
        });
      }

      setTableStatuses(newStatuses);
    } else {
      setTableStatuses({});
    }
  };

  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
    setTimeSlots([]);
    setActiveAccordion(null);
    setTableStatuses({});
  };

  const openModal = (reservation) => {
    console.log('Selected Reservation:', reservation); // Log reservation data
    setSelectedGuest(reservation);
    setNewStatus(reservation.reservation_status);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedGuest(null);
    setNewStatus('');
  };

  const handleStatusSelect = (status) => {
    setNewStatus(status);
  };

  const saveStatusChange = async () => {
    if (selectedGuest) {
      console.log('Sending update for reservation:', selectedGuest.table_reservation_id);
      console.log('New status:', newStatus);

      try {
        const response = await axios.put(
          `http://localhost:3001/api/updateTableReservationStatus/${selectedGuest.table_reservation_id}`,
          {
            reservation_status: newStatus, 
          }
        );

        if (response.status === 200) {
          selectedGuest.reservation_status = newStatus;
          setTableStatuses((prevStatuses) => ({
            ...prevStatuses,
            [selectedGuest.table.table_name]: newStatus,
          }));
        }
      } catch (error) {
        console.error('Error updating reservation status:', error);
      }

      closeModal();
    }
  };

  const getTableColor = (status) => {
    switch (status) {
      case 'COMPLETED':
        return 'has-background-success-light'; 
      case 'PENDING':
        return 'has-background-warning-light'; // Yellow for pending
      case 'CANCELED':
        return 'has-background-danger-light'; 
      case 'NO SHOW':
        return 'has-background-grey-light';
      default:
        return 'has-background-light'; 
    }
  };

  const getChairClasses = (seat_quantity) => {
    switch (seat_quantity) {
      case 4:
        return ['top-left-chair', 'top-right-chair', 'bottom-left-chair', 'bottom-right-chair'];
      case 6:
        return ['top-left-chair', 'top-middle-chair', 'top-right-chair', 'bottom-left-chair', 'bottom-middle-chair', 'bottom-right-chair'];
      case 8:
        return ['top-left-chair', 'top-center-left-chair', 'top-center-right-chair', 'top-right-chair', 'bottom-left-chair', 'bottom-center-left-chair', 'bottom-center-right-chair', 'bottom-right-chair'];
      default:
        return [];
    }
  };

  return (
    <section className='section-p1'>
      <div className="columns" style={{ minHeight: "100vh" }}>
        {/* Left Side: Search and Time Slot Accordion */}
        <div className="column is-3">
          <div className="column">
            <h1 className='subtitle'><strong>Table Reservations</strong></h1>
          </div>
          <Link to="/restaurant_table_reservations_calendar"><button className='button is-blue'>Calendar View</button></Link>

          <div className="field mt-4">
            <label className="label">Select Date</label>
            <div className="control">
              <input type="date" className="input" value={selectedDate} onChange={handleDateChange} />
            </div>
          </div>

          {timeSlots.length > 0 && (
            <div className="mt-4">
              <h3 className ="m-1">Time Slots</h3>
              {timeSlots.map((slot, index) => (
                <div key={index} className="box p-1" style={{ marginBottom: '1rem' }}>
                  <div
                    className="accordion-header"
                    onClick={() => handleAccordionClick(index)}
                    style={{ padding: '1rem', cursor: 'pointer', fontWeight: 'bold' }}
                  >
                    {slot.time}
                  </div>

                  {activeAccordion === index && slot.reservations && Array.isArray(slot.reservations) && (
                    <div className="accordion-content mt-3">
                      {slot.reservations.map((reservation, guestIndex) => (
                        <div key={guestIndex} className="box is-flex is-justify-content-space-between is-align-items-center">
                          <div>
                            <p><IoPeople /> {reservation.guest.guest_fname} {reservation.guest.guest_lname} - {reservation.table_guest_quantity} people</p>
                            <p><IoRestaurant /> Table: {reservation.table.table_name} ({reservation.table.seat_quantity} seats)</p>
                          </div>
                          <div>
                            <button
                              className={`button is-small ${reservation.reservation_status === 'COMPLETED' ? 'is-success' : reservation.reservation_status === 'CANCELED' ? 'is-danger' : reservation.reservation_status === 'PENDING' ? 'is-warning' : 'is-dark'}`}
                              onClick={() => openModal(reservation)}
                            >
                              {reservation.reservation_status}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Side: Table Visualization */}
        <div className="column" style={{ backgroundColor: "white" }}>
          <main className="section-p1">
            <div className='event-padding-style event-color-table' style={{ backgroundColor: "#007" }}>
              <p className='subtitle has-text-white'> Restaurant Tables</p>
              <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
                <div className="columns is-multiline section-p1">
                  {tables.length > 0 ? (
                    tables.map((table) => {
                      const chairClasses = getChairClasses(table.seat_quantity);
                      const tableStatus = tableStatuses[table.table_name] || 'Available';

                      return (
                        <div className="column is-one-third" key={table.table_id}>
                          <div className="table-container">
                            <div className={`table-circle ${getTableColor(tableStatus)}`}>
                              <div className="column has-text-centered is-circle">
                                <p className="is-4"><strong>{table.table_name}</strong></p>
                                <p>({table.seat_quantity} Seats)</p>
                                <p>Status: {tableStatus}</p>
                              </div>
                            </div>
                            <div className="chairs-wrapper">
                              {chairClasses.map((chairClass, i) => (
                                <div key={i} className={`chair ${chairClass}`} />
                              ))}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <p>No tables available.</p>
                  )}
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>

      {/* Modal for Changing Status */}
      {isModalOpen && (
        <div className={`modal ${isModalOpen ? 'is-active' : ''}`}>
          <div className="modal-background" onClick={closeModal}></div>
          <div className="modal-content">
            <div className="box">
              <h3 className="title is-4">Change Status for {selectedGuest?.guest.guest_fname} {selectedGuest?.guest.guest_lname}</h3>
              <div className="buttons">
                <button className={`button ${newStatus === 'COMPLETED' ? 'is-success' : ''}`} onClick={() => handleStatusSelect('COMPLETED')}>Completed</button>
                <button className={`button ${newStatus === 'PENDING' ? 'is-warning' : ''}`} onClick={() => handleStatusSelect('PENDING')}>Pending</button>
                <button className={`button ${newStatus === 'CANCELED' ? 'is-danger' : ''}`} onClick={() => handleStatusSelect('CANCELED')}>Canceled</button>
                <button className={`button ${newStatus === 'NO SHOW' ? 'is-dark' : ''}`} onClick={() => handleStatusSelect('NO SHOW')}>No Show</button>
              </div>
              <div className="buttons mt-4 is-right">
                <button className="button is-blue" onClick={saveStatusChange}>Save Changes</button>
                <button className="button is-inverted-blue" onClick={closeModal}>Cancel</button>
              </div>
            </div>
          </div>
          <button className="modal-close is-large" aria-label="close" onClick={closeModal}></button>
        </div>
      )}
    </section>
  );
};

export default TablReservations;
