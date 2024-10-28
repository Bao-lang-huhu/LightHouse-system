import React, { useState, useEffect } from 'react';
import 'bulma/css/bulma.min.css';
import '../App.css';
import { Link } from 'react-router-dom';
import { IoConstructOutline, IoHomeOutline } from 'react-icons/io5';
import axios from 'axios';


const MaintenanceHousekeeping = () => {
    const [rooms, setRooms] = useState({ firstFloor: [], secondFloor: [], thirdFloor: [] });

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      const response = await axios.get('https://light-house-system-h74t-server.vercel.app/api/getAllRoomsHM');
      const sortedRooms = response.data.sort((a, b) => a.room_number - b.room_number);

      const groupedRooms = {
        firstFloor: sortedRooms.filter(room => String(room.room_number).startsWith('1')),
        secondFloor: sortedRooms.filter(room => String(room.room_number).startsWith('2')),
        thirdFloor: sortedRooms.filter(room => String(room.room_number).startsWith('3')),
      };

      setRooms(groupedRooms);
    } catch (error) {
      console.error('Error fetching rooms:', error);
    }
  };

  const getBackgroundColor = (status, type) => {
    if (type === 'housekeeping' && status === 'DIRTY') {
      return '#ff3860'; // Bulma 'danger' color for dirty housekeeping status
    } else if (type === 'maintenance' && status === 'ONGOING') {
      return '#a4dded'; // Light blue for ongoing maintenance status
    }
    return 'lightgrey'; // Default background color
  };
  return (
    <section className='section-p1'>
        <header>
            <div style={{backgroundColor:'white', borderRadius:'10px 10px'}}>
                <div className='column'>
                    <h1 className='subtitle'>
                        <strong>Room Housekeeping and Maintenance</strong>
                    </h1>
                </div>
                <div className="container section-p1">
                    <div className="columns is-multiline is-mobile">
                        {/* Housekeeping Button */}
                        <div className="column is-6">
                            <Link to="/frontdesk_housekeeping">
                                <div className="button is-blue box has-text-centered">
                                    <span>
                                        <IoHomeOutline size={100} className="is-violet" />
                                    </span>
                                    <p className="is-size-5 has-text-weight-semibold mt-2">Housekeeping</p>
                                </div>
                            </Link>
                        </div>

                        {/* Maintenance Button */}
                        <div className="column is-6">
                            <Link to="/frontdesk_maintenance">
                                <div className="button is-dark-blue box has-text-centered">
                                    <span>
                                        <IoConstructOutline size={100} className="is-violet" />
                                    </span>
                                    <p className="is-size-5 has-text-weight-semibold mt-2">Maintenance</p>
                                </div>
                            </Link>
                        </div>
                    </div>
                </div>
           </div>
        </header>

        <div style={{ backgroundColor: 'white', borderRadius: '10px', padding: '20px' }}>
          <div className="column is-align-items-center">
            <h1 className='subtitle'><strong>Room Housekeeping and Maintenance</strong></h1>
            
          </div>
          <div className='ml-2 is-flex is-align-items-center'>
              <div
                style={{
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  backgroundColor: '#a4dded',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 'bold',
                  marginLeft: '10px',
                  boxShadow: '0px 2px 5px rgba(0, 0, 0, 0.2)',
                }}
              ></div>
              <label className="ml-2">ONGOING Transactions</label>
            </div>

          <div className='ml-2 is-flex is-align-items-center'>
              <div
                style={{
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  backgroundColor: '#ff3860',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 'bold',
                  marginLeft: '10px',
                  boxShadow: '0px 2px 5px rgba(0, 0, 0, 0.2)',
                }}
              ></div>
              <label className="ml-2">DIRTY Room - Ongoing Cleaning</label>
        </div>
          
        </div>

        <FloorSection title="First Floor" rooms={rooms.firstFloor} getBackgroundColor={getBackgroundColor} />
      <FloorSection title="Second Floor" rooms={rooms.secondFloor} getBackgroundColor={getBackgroundColor} />
      <FloorSection title="Third Floor" rooms={rooms.thirdFloor} getBackgroundColor={getBackgroundColor} />
        
    </section>
  );
};

// FloorSection Component
const FloorSection = ({ title, rooms, getBackgroundColor }) => (
    rooms.length > 0 && (
      <section className='section-p1'>
        <div style={{ backgroundColor: 'white', borderRadius: '10px', padding: '20px' }}>
          <div className='column'>
            <h2 className="subtitle has-text-centered" style={{ backgroundColor: '#a4dded', color: 'black', padding: '0.5rem', borderRadius: '5px' }}>
              {title}
            </h2>
          </div>
          <div className="container section-p1">
            <div className="columns is-multiline">
              {rooms.map(room => (
                <RoomBox key={room.room_id} room={room} getBackgroundColor={getBackgroundColor} />
              ))}
            </div>
          </div>
        </div>
      </section>
    )
  );
  
  // RoomBox Component to display individual room details
  const RoomBox = ({ room, getBackgroundColor }) => (
    <div className="column is-one-quarter"> {/* Adjust column size for four rooms per row */}
      <div className="box columns is-vcentered" style={{ margin: '0.25rem', padding: '0.5rem' }}>
        <div className="column is-4">
          <div className="has-text-centered">
            <p className="is-size-6 has-text-weight-bold">Room {room.room_number}</p>
          </div>
        </div>
        <div className="column is-8">
          <div className="box" style={{ padding: '0.5rem' }}>
            <div
              className="box has-text-centered is-flex is-justify-content-space-between is-align-items-center"
              style={{
                padding: '0.5rem',
                margin: '0',
                backgroundColor: getBackgroundColor(room.housekeeping_status, 'housekeeping'),
              }}
            >
              <p className="is-size-7 has-text-weight-semibold">Housekeeping</p>
            </div>
            <div
              className="box has-text-centered is-flex is-justify-content-space-between is-align-items-center"
              style={{
                padding: '0.5rem',
                margin: '0',
                backgroundColor: getBackgroundColor(room.maintenance_status, 'maintenance'),
              }}
            >
              <p className="is-size-7 has-text-weight-semibold">Maintenance</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

export default MaintenanceHousekeeping;