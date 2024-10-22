import React, { useState, useEffect } from 'react';
import 'bulma/css/bulma.min.css';
import '../App.css';
import './components_m.css';
import { IoBedOutline, IoSearchCircle } from 'react-icons/io5';
import ErrorMsg from '../messages/errorMsg';
import SuccessMsg from '../messages/successMsg';
import axios from 'axios';

const ArchRooms = () => {
    const [isEditRoomPhotosModalOpen, setIsEditRoomPhotosModalOpen] = useState(false);
    const [isRoomVTModalOpen, setIsRoomVTModalOpen] = useState(false);
    const [isEditRoomVTModalOpen, setIsEditRoomVTModalOpen] = useState(false);
    const [currentRoomId, setCurrentRoomId] = useState(null);
    const [currentRoomTypeName, setCurrentRoomTypeName] = useState(null);
    const [rooms, setRooms] = useState([]); // State to store room data
    const [selectedRoom, setSelectedRoom] = useState(null); 
    const [searchTerm, setSearchTerm] = useState(''); // State for search term
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isArchiving, setIsArchiving] = useState(false); // State for archiving confirmation
    const [virtualTours, setVirtualTours] = useState([]);
    const [isLoading, setIsLoading] = useState(true); // State to track loading status


    useEffect(() => {
        fetchRooms();
    }, []);

    const fetchRooms = async () => {
        try {
            const response = await axios.get('http://localhost:3001/api/getRoomsAll');
            setRooms(response.data.filter(room => room.room_status === 'DELETE')); // Exclude INACTIVE rooms
        } catch (error) {
            console.error('Error fetching room data:', error);
            setError('Failed to fetch room data.');
        }
    };

    useEffect(() => {
        fetchRooms();
    }, []);


 
    useEffect(() => {
    const fetchVirtualTours = async () => {
        try {
            const response = await axios.get('http://localhost:3001/api/getTours');
            const groupedData = response.data;

            setIsLoading(true); // Set loading to true when starting fetch
            await fetchRooms(); // Fetch the room data or other needed data
            setIsLoading(false);
            
            // Convert grouped data into a flat array
            const toursArray = Object.values(groupedData).flat();
            setVirtualTours(Array.isArray(toursArray) ? toursArray : []);
        } catch (error) {
            console.error('Error fetching virtual tours:', error);
            setVirtualTours([]); // Ensure virtualTours is always an array
        }
    }; fetchVirtualTours();
}, []);
    

    const hasVirtualTourForRoomType = (roomTypeName) => {
        return virtualTours.some(tour => tour.ROOM.room_type_name === roomTypeName);
    };
    
    const hasVirtualTourForRoomId = (roomId) => {
        return virtualTours.some(tour => tour.room_id === roomId);
    };
    

    const toggleEditRoomPhotosModal = () => {
        setCurrentRoomId(selectedRoom ? selectedRoom.room_id : null);
        setIsEditRoomPhotosModalOpen(!isEditRoomPhotosModalOpen);  // Toggle the modal open/close
    };

    const toggleRoomVTModal = () => {
        setCurrentRoomId(selectedRoom ? selectedRoom.room_id : null);
        setCurrentRoomTypeName(selectedRoom ? selectedRoom.room_type_name : null); // Set room_type_name
        setIsRoomVTModalOpen(!isRoomVTModalOpen);
    };

    const toggleEditRoomVTModal = () => {
        setCurrentRoomId(selectedRoom ? selectedRoom.room_id : null);
        setIsEditRoomVTModalOpen(!isEditRoomVTModalOpen);  // Toggle the modal open/close
    };
    
    

    const getStatusColor = (status) => {
        switch (status) {
            case 'AVAILABLE':
                return 'green'; // Green for available
            case 'UNDER MAINTENANCE':
                return 'yellow'; // Yellow for under maintenance
            case 'OCCUPIED':
                return 'blue'; // Blue for occupied
            case 'INACTIVE':
                return 'red'; // Red for inactive
            default:
                return 'gray'; // Default color if no status matches
        }
    };


    const handleRoomClick = (room) => {
        setSelectedRoom(room);
        setCurrentRoomId(room ? room.room_id : null);
        setCurrentRoomTypeName(room ? room.room_type_name : null); 
        setError('');
        setSuccess('');// Set the room type name
    };



    const calculateFinalPrice = (price, discount) => {
        const discountAmount = price * (discount / 100);
        return price - discountAmount;
    };

    useEffect(() => {
        if (selectedRoom) {
            const { room_rate, room_disc_percentage } = selectedRoom;
            if (room_rate !== undefined && room_disc_percentage !== undefined) {
                const finalRate = calculateFinalPrice(room_rate, room_disc_percentage);
                setSelectedRoom((prev) => ({
                    ...prev,
                    room_final_rate: finalRate,
                }));
            }
        }
    }, [selectedRoom?.room_disc_percentage, selectedRoom?.room_rate]);

    const handleDetailChange = (e) => {
        const { name, value } = e.target;
        setSelectedRoom((prev) => {
            const updatedRoom = { ...prev, [name]: value };

            if (name === 'room_rate' || name === 'room_disc_percentage') {
                updatedRoom.room_final_rate = calculateFinalPrice(
                    parseFloat(updatedRoom.room_rate) || 0,
                    parseFloat(updatedRoom.room_disc_percentage) || 0
                );
            }

            return updatedRoom;
        });
    };



    const handleArchive = async () => {
        setIsArchiving(false); 

        try {
            setError('');
            setSuccess('');

            const response = await axios.put(
                `http://localhost:3001/api/updateRoom/${selectedRoom.room_id}`, 
                {
                    room_status: 'AVAILABLE'         
                }
            );

            if (response.status === 200) {
                setSuccess('Room restored successfully!');
                setError('');

                setRooms(prevRooms => prevRooms.filter(room => room.room_id !== selectedRoom.room_id));
                setSelectedRoom(null);

                setTimeout(() => {
                    setSuccess('');
                }, 3000);
            }
        } catch (error) {
            console.error('Error archiving room:', error.response?.data || error.message);
            setError('Failed to archive room: ' + (error.response?.data?.error || error.message));
            setSuccess('');
        }
    };

    // Filter rooms based on search term and exclude "INACTIVE" rooms
    const filteredRooms = rooms.filter(room =>
        room.room_type_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <section className='section-p1'>
            <div className="columns" style={{ minHeight: "100vh" }}>
                <div className="column is-3">
                    <div className="column">
                        <div className='columns is-vcentered tablet-column-layout'>
                            <div className='column'>
                                <h1 className='subtitle'>
                                    <strong>Rooms</strong>
                                </h1>
                            </div>
                        </div>
                    </div>

                    <div className="column is-hidden-tablet-only custom-hide-tablet is-fullwidth" style={{ padding: '0', margin: '0' }}>
                        <div className="field has-addons is-flex is-flex-direction-row is-fullwidth-mobile">
                            <div className="control is-expanded is-fullwidth">
                                <input
                                    className="input is-fullwidth-mobile"
                                    type="text"
                                    style={{ margin: '0' }}
                                    placeholder="Search..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)} // Update search term
                                />
                            </div>
                            <div className="control is-fullwidth">
                                <button className="button is-blue is-fullwidth-mobile" style={{ height: '100%' }}>
                                    <IoSearchCircle className="is-white" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Room List */}
                    <div style={{ marginBottom: "5px" }}>
                        {filteredRooms.map((room) => (
                            <div
                                key={room.room_id}
                                className={`staff-space ${selectedRoom && selectedRoom.room_id === room.room_id ? 'is-active' : ''}`} // Highlight selected room
                                onClick={() => handleRoomClick(room)} 
                                style={{ cursor: 'pointer', padding: '1rem',
                                    backgroundColor: selectedRoom?.room_id === room.room_id ? '#e8f4ff' : 'transparent' 
                                 }} 
                            >
                                <div className="columns is-vcentered is-mobile" style={{ paddingLeft: "5px" }}>
                                    <IoBedOutline style={{ marginRight: '5px', textAlign: 'center' }} />
                                    <div className="column is-flex is-align-items-center">
                                        <h3 style={{ marginRight: "8px" }}>
                                            {room.room_type_name} - {room.room_number}
                                        </h3>
                                        <div
                                            className="status-circle"
                                            style={{
                                                backgroundColor: getStatusColor(room.room_status), 
                                                borderRadius: '50%',
                                                width: '10px',
                                                height: '10px'
                                            }}
                                        ></div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="column" style={{ backgroundColor: "white" }}>
                    <main className="section-p1">
                        <div className="columns">
                            <h1 className="subtitle">
                                <strong>Room Details</strong>
                            </h1>
                        </div>

                        {error && <ErrorMsg message={error} />}
                        {success && <SuccessMsg message={success} />}

                        {selectedRoom ? (
                            <div>
                                <div className="columns is-vcentered">
                                    {/* First Column */}
                                    <div className="column is-one-half">
                                        <div className="staff-space">
                                            <div className="field "> 
                                                <div className="control">
                                                    <p className="label has-text-grey m-0">Room Type</p>
                                                    <p className='label is-size-4 ml-1'>{selectedRoom.room_type_name}</p>
                                                </div>
                                            </div>

                                            <div className="field is-flex">
                                                <div className="control">
                                                    <p className="label has-text-grey m-0">Room Number</p>
                                                    <p className='label is-size-4 ml-1'>{selectedRoom.room_number}</p>   
                                                </div>
                                            </div>
                                            <div className="field">
                                                <label className="label">Room Description</label>
                                                <div className="control">
                                                    <textarea
                                                        className="textarea"
                                                        name="room_description"
                                                        value={selectedRoom.room_description}
                                                        onChange={handleDetailChange}
                                                        readOnly
                                                    ></textarea>
                                                </div>
                                            </div>
                                            <label className='label'>Room Photos and Virtual Tour</label>

                                            <p>Available room photos and virtual tours will automatically be restored following the restoration of rooms.</p>
                                        </div>
                                    </div>
                                </div>
                                {/* Separator Line */}
                                <hr />

                                <div className="columns">
                                    <div className="column">
                                        <div className="columns">
                                            <h1 className="subtitle">
                                                <strong>Room Information</strong>
                                            </h1>
                                        </div>

                                        <div className="columns is-multiline">
                                            <div className="column is-6">
                                            <div className="field">
                                                <label className="label">Room PAX Minimum</label>
                                                <div className="control is-flex is-align-items-center">
                                                    <button
                                                        className="button is-blue mr-2"
                                                        onClick={() => {
                                                            if (selectedRoom.room_pax_min > 1) {
                                                                setSelectedRoom((prev) => ({
                                                                    ...prev,
                                                                    room_pax_min: prev.room_pax_min - 1,
                                                                }));
                                                            }
                                                        }}
                                                        disabled={selectedRoom.room_pax_min}
                                                    >
                                                        -
                                                    </button>
                                                    <span className="button is-static">{selectedRoom.room_pax_min} Guests</span>
                                                    <button
                                                        className="button is-blue ml-2"
                                                        onClick={() => {
                                                            if (selectedRoom.room_pax_min < 10) {
                                                                setSelectedRoom((prev) => ({
                                                                    ...prev,
                                                                    room_pax_min: prev.room_pax_min + 1,
                                                                }));
                                                            }
                                                        }}
                                                        disabled={selectedRoom.room_pax_min}
                                                    >
                                                        +
                                                    </button>
                                                </div>
                                            </div>

                                            </div>

                                            <div className="column is-6">
                                                
                                                <div className="field">
                                                    <label className="label">Room PAX Maximum</label>
                                                    <div className="control is-flex is-align-items-center">
                                                        <button
                                                            className="button is-blue mr-2"
                                                            onClick={() => {
                                                                if (selectedRoom.room_pax_max > 1) {
                                                                    setSelectedRoom((prev) => ({
                                                                        ...prev,
                                                                        room_pax_max: prev.room_pax_max - 1,
                                                                    }));
                                                                }
                                                            }}
                                                            disabled={selectedRoom.room_pax_max}
                                                        >
                                                            -
                                                        </button>
                                                        <span className="button is-static">{selectedRoom.room_pax_max} Guests</span>
                                                        <button
                                                            className="button is-blue ml-2"
                                                            onClick={() => {
                                                                if (selectedRoom.room_pax_max < 10) {
                                                                    setSelectedRoom((prev) => ({
                                                                        ...prev,
                                                                        room_pax_max: prev.room_pax_max + 1,
                                                                    }));
                                                                }
                                                            }}
                                                            disabled={selectedRoom.room_pax_max}
                                                        >
                                                            +
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="column is-6">
                                                <div className="field">
                                                    <label className="label">Room Rate</label>
                                                    <div className="control">
                                                        <input
                                                            className="input"
                                                            type="number"
                                                            name="room_rate"
                                                            value={selectedRoom.room_rate}
                                                            min="1" // Set the minimum value to 1
                                                            readOnly
                                                        />
                                                    </div>
                                                </div>
                                            </div>





                                            <div className="column is-6">
                                                <div className="field">
                                                    <label className="label">Room Discount</label>
                                                    <div className="control is-flex is-align-items-center">
                                                        {/* Decrease Button */}
                                                        <button
                                                            className="button is-blue mr-2"
                                                            onClick={() => {
                                                                if (selectedRoom.room_disc_percentage > 0) {
                                                                    setSelectedRoom((prev) => ({
                                                                        ...prev,
                                                                        room_disc_percentage: prev.room_disc_percentage - 1,
                                                                    }));
                                                                }
                                                            }}
                                                            disabled={selectedRoom.room_disc_percentage}
                                                        >
                                                            -
                                                        </button>

                                                        {/* Display Current Discount */}
                                                        <span className="button is-static">
                                                            {selectedRoom.room_disc_percentage}%
                                                        </span>

                                                        {/* Increase Button */}
                                                        <button
                                                            className="button is-blue ml-2"
                                                            onClick={() => {
                                                                if (selectedRoom.room_disc_percentage < 100) {
                                                                    setSelectedRoom((prev) => ({
                                                                        ...prev,
                                                                        room_disc_percentage: prev.room_disc_percentage + 1,
                                                                    }));
                                                                }
                                                            }}
                                                            disabled={selectedRoom.room_disc_percentage}
                                                        >
                                                            +
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="column is-6">
                                                <div className="field">
                                                    <label className="label">Room Final Rate</label>
                                                    <div className="control">
                                                        <input
                                                            className="input"
                                                            type="number"
                                                            name="room_final_rate"
                                                            value={selectedRoom.room_final_rate.toFixed(2)} // Display as a fixed decimal
                                                            readOnly // Make the field read-only to prevent manual editing
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="column is-6">
                                                <div className="field">
                                                    <label className="label">Room Breakfast Availability</label>
                                                    <div className="control">
                                                        <input 
                                                            className="input" 
                                                            type="text" 
                                                            name="room_breakfast_availability"
                                                            value={selectedRoom.room_breakfast_availability}
                                                            readOnly
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                        </div>

                                      
                                    </div>
                                </div>
                                {/* Separator Line */}
                                <hr />
                                <div className="columns">
                                    <div className="column">
                                        <div className="columns">
                                            <h1 className="subtitle">
                                                <strong>Restore Data</strong>
                                            </h1>
                                        </div>
                                        <div className="columns is-multiline is-mobile">
                                            <div className="column">
                                                <p>To ensure data integrity and maintain a clear historical record, all room data that is no longer active shall be archived. Archiving involves securely storing all associated data, including room information and history, in a read-only format. Archiving does not delete the room or its data but instead preserves it in its current state, safeguarding the integrity of the information while freeing up active room management resources.</p>
                                            </div>
                                            <div className="column is-12 is-left">
                                                <button className="button is-blue" onClick={() => setIsArchiving(true)}>Restore</button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                {/* Confirmation Modal for Archiving */}
                                {isArchiving && (
                                    <div className="modal is-active">
                                        <div className="modal-background" onClick={() => setIsArchiving(false)}></div>
                                        <div className="modal-content">
                                            <div className="box">
                                                <p>Are you sure you want to restore this room?</p>
                                                <div className="buttons is-right">
                                                    <button className="button is-blue" onClick={handleArchive}>Yes</button>
                                                    <button className="button" onClick={() => setIsArchiving(false)}>No</button>
                                                </div>
                                            </div>
                                        </div>
                                        <button className="modal-close is-large" aria-label="close" onClick={() => setIsArchiving(false)}></button>
                                    </div>
                                )}
                                {/* Separator Line */}
                                <hr />
                            </div>
                        
                        ) : (
                            <div>
                                <p>No room selected. Click on a room to view details.</p>
                            </div>
                        )}
                    </main>
                </div>
            </div>
        </section>
    );
};

export default ArchRooms;
