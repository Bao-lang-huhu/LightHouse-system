import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { IoHome, IoPerson, IoBed, IoWine,  IoBagOutline, IoWalkOutline, IoCheckmarkCircle, IoHappy, IoAddCircle, IoStar } from 'react-icons/io5';
import { Grid, Box, Typography } from '@mui/material';
import axios from 'axios';
import {jwtDecode} from 'jwt-decode';

const DashboardFront = () => {
    const [currentDateTime, setCurrentDateTime] = useState(new Date());
    const [counts, setCounts] = useState({
        staffCount: 0,
        roomCount: 0,
        foodItemCount: 0,
        barDrinkCount: 0,
        conciergeDetailCount: 0,
        laundryDetailCount: 0,
        eventFoodPackageCount: 0,
        eventCount: 0
    });
    const [staffUsername, setStaffUsername] = useState('Manager'); 

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const decoded = jwtDecode(token);
                setStaffUsername(decoded.staff_username);
            } catch (error) {
                console.error('Error decoding token:', error);
                setStaffUsername('Manager');
            }
        }

        const fetchCounts = async () => {
            try {
                const response = await axios.get('http://localhost:3001/api/counts');
                setCounts(response.data || {});
            } catch (error) {
                console.error('Error fetching counts:', error);
            }
        };
        fetchCounts();
    }, []);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentDateTime(new Date());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const formatDateTime = (date) => date.toLocaleString('en-US', { 
        year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' 
    });

    const [rooms, setRooms] = useState({ firstFloor: [], secondFloor: [], thirdFloor: [] });

    useEffect(() => {
      fetchRooms();
    }, []);
  
    const fetchRooms = async () => {
      try {
        const response = await axios.get('http://localhost:3001/api/getAllRoomsCheckedIn');
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

    const getBackgroundColor = (status) => {
        return status === 'CHECKED_IN' ? '#a4dded' : 'lightgrey'; // green for With Guest, red for No Guest
      };

    const boxes = [
        { icon: <IoHome />, label: 'Home', link: '/frontdesk_home' },
        { icon: <IoPerson />, label: 'Dashboard', link: '/frontdesk_dashboard' },
        { icon: <IoBed />, label: 'Walk-In Room', link: '/frontdesk_room_walk_in' },
        { icon: <IoWine />, label: 'Walk-In Event', link: '/frontdesk_event_walk_in' },
        { icon: <IoBed />, label: 'Rooms', link: '/frontdesk_room_reservation' },
        { icon: <IoWine />, label: 'Events', link: '/frontdesk_event_reservation' },
        { icon: <IoCheckmarkCircle />, label: 'Check-In Guest', link: '/frontdesk_check_in' },
        { icon: <IoHappy />, label: 'Checked-Out History', link: '/frontdesk_check_out' },
        { icon: <IoAddCircle />, label: 'Additional Services', link: '/frontdesk_additional_item' },
        { icon: <IoStar />, label: 'Maintenance', link: '/frontdesk_maintenance_and_housekeeping' },
    ];

    return (
        <section className='section-p1'>
            <div className="container has-background-light p-5">
                <div className="columns is-vcentered">
                    <div className="column is-half">
                        <div className="notification is-white">
                            <h1 className="title is-4">Hello, {staffUsername}!</h1>
                            <p className="subtitle">Welcome to the Front Desk Dashboard.</p>
                        </div>
                    </div>
                    <div className="column is-half has-text-right">
                        <div className="box">
                            <p className="title is-5">{formatDateTime(currentDateTime)}</p>
                        </div>
                    </div>
                </div>
            </div>
            <Grid container spacing={2} className="section-p1">
                {boxes.map((box, index) => (
                    <Grid item xs={6} sm={4} md={3} key={index}>
                        <Link to={box.link} style={{ textDecoration: 'none' }}>
                            <Box
                                display="flex"
                                flexDirection="column"
                                alignItems="center"
                                justifyContent="center"
                                bgcolor="white"
                                borderRadius={2}
                                p={2}
                                boxShadow={2}
                                sx={{
                                    height: 120,
                                    transition: 'background-color 0.3s',
                                    '&:hover': { backgroundColor: '#e0f7fa' },
                                }}
                            >
                                <div style={{ fontSize: '2rem', color: '#0288d1' }}>{box.icon}</div>
                                <Typography variant="body1" color="textPrimary" fontWeight="bold" mt={1}>
                                    {box.label}
                                </Typography>
                            </Box>
                        </Link>
                    </Grid>
                ))}
            </Grid>

            <header>
         
           <div style={{ backgroundColor: 'white', borderRadius: '10px', padding: '20px' }}>
             <div className="column is-align-items-center">
               <h1 className='subtitle'><strong>Rooms with Checked-In Guest</strong></h1>
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
                 <label className="ml-2">Checked_in Guest</label>
               </div>
             </div>
           </div>

         </header>

            <div className='section-p1'>
    
                {/* Floor Sections */}
                <FloorSection title="First Floor" rooms={rooms.firstFloor} getBackgroundColor={getBackgroundColor} />
                <FloorSection title="Second Floor" rooms={rooms.secondFloor} getBackgroundColor={getBackgroundColor} />
                <FloorSection title="Third Floor" rooms={rooms.thirdFloor} getBackgroundColor={getBackgroundColor} />
            </div>
        </section>
       
    );
};

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
    <div className="column is-one-quarter"> {/* Sets each room box to 1/4 of the row */}
      <div className="box" style={{ margin: '0.5rem', padding: '1rem' }}>
        <div className="has-text-centered">
          <p className="is-size-6 has-text-weight-bold">Room {room.room_number}</p>
        </div>
        <div className="box" style={{ padding: '0.5rem', marginTop: '0.5rem' }}>
          <div
            className="box has-text-centered is-flex is-justify-content-space-between is-align-items-center"
            style={{
              padding: '0.5rem',
              margin: '0',
              backgroundColor: getBackgroundColor(room.check_in_status),
            }}
          >
            <p className="is-size-7 has-text-weight-semibold">
              {room.check_in_status === 'CHECKED_IN' ? 'With Guest' : 'No Guest'}
            </p>
            <IoWalkOutline size={20} />
          </div>
        </div>
      </div>
    </div>
  );
  
export default DashboardFront;
