import React, { useState, useEffect } from 'react';
import 'bulma/css/bulma.min.css';
import '../App.css';
import { Link } from 'react-router-dom';
import { IoBagOutline, IoWalkOutline } from 'react-icons/io5';
import axios from 'axios';

const ConciergeLaundry = () => {
  const [rooms, setRooms] = useState([]);

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/getAllRoomsCL');
      const sortedRooms = response.data.sort((a, b) => a.room_number - b.room_number);
      setRooms(sortedRooms);
    } catch (error) {
      console.error('Error fetching rooms:', error);
    }
  };
  

  const getBackgroundColor = (status) => {
    console.log("Status:", status); // Debugging line
    switch (status) {
      case 'ONGOING':
        return '#a4dded';
      default:
        return 'lightgrey';
    }
  };

  return (
    <section className='section-p1'>
      <header>
        <div style={{ backgroundColor: 'white', borderRadius: '10px 10px' }}>
          <div className='column'>
            <h1 className='subtitle'>
              <strong>Room Concierge and Laundry</strong>
            </h1>
          </div>
          <div className="container section-p1">
            <div className="columns is-multiline is-mobile">
              <div className="column is-6">
                <Link to="/frontdesk_concierge">
                  <div className="button is-blue box has-text-centered">
                    <span>
                      <IoWalkOutline size={100} className="is-violet" />
                    </span>
                    <p className="is-size-5 has-text-weight-semibold mt-2">Concierge</p>
                  </div>
                </Link>
              </div>

              <div className="column is-6">
                <Link to="/frontdesk_laundry">
                  <div className="button is-dark-blue box has-text-centered">
                    <span>
                      <IoBagOutline size={100} className="is-violet" />
                    </span>
                    <p className="is-size-5 has-text-weight-semibold mt-2">Laundry</p>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </header>
      <section className='section-p1'>
        <div style={{ backgroundColor: 'white', borderRadius: '10px 10px' }}>
          <div className='column'>
            <h1 className='subtitle'>
              <strong>Rooms Available</strong>
            </h1>
          </div>
          <div className="container section-p1">
            <div className="columns is-multiline is-mobile">
              {rooms.map((room) => (
                <div key={room.room_id} className="column is-full-mobile">
                  <div className="box columns is-vcentered" style={{ margin: '0.25rem', padding: '0.5rem' }}>
                    {/* Room Number */}
                    <div className="column is-4">
                      <div className="has-text-centered">
                        <p className="is-size-6 has-text-weight-bold">Room {room.room_number}</p>
                      </div>
                    </div>

                    {/* Status Containers */}
                    <div className="column is-8">
                      <div className="box" style={{ padding: '0.5rem' }}>
                        <div
                          className="box has-text-centered is-flex is-justify-content-space-between is-align-items-center"
                          style={{
                            padding: '0.5rem',
                            margin: '0',
                            backgroundColor: getBackgroundColor(room.concierge_status),
                          }}
                        >
                          <p className="is-size-7 has-text-weight-semibold">Concierge</p>
                          <IoWalkOutline size={20} />
                        </div>

                        <div
                          className="box has-text-centered is-flex is-justify-content-space-between is-align-items-center"
                          style={{
                            padding: '0.5rem',
                            margin: '0',
                            backgroundColor: getBackgroundColor(room.laundry_status),
                          }}
                        >
                          <p className="is-size-7 has-text-weight-semibold">Laundry</p>
                          <IoBagOutline size={20} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </section>
  );
};

export default ConciergeLaundry;
