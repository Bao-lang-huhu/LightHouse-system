import React, { useState, useEffect } from 'react';
import 'bulma/css/bulma.min.css';
import '../App.css';
import './components_m.css';
import { IoAdd, IoAddCircleOutline, IoBedOutline, IoPencilOutline, IoSearchCircle } from 'react-icons/io5';
import AddRoomModal from '../manager_modals/AddRoomModal';
import AddRoomPhotos from '../manager_modals/AddRoomPhotos';
import EditRoomPhotos from  '../manager_modals/EditRoomPhotos';
import ErrorMsg from '../messages/errorMsg';
import SuccessMsg from '../messages/successMsg';
import axios from 'axios';

const RoomManager = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isRoomPhotosModalOpen, setIsRoomPhotosModalOpen] = useState(false);
    const [isEditRoomPhotosModalOpen, setIsEditRoomPhotosModalOpen] = useState(false);
    const [currentRoomId, setCurrentRoomId] = useState(null);
    const [rooms, setRooms] = useState([]); // State to store room data
    const [selectedRoom, setSelectedRoom] = useState(null); // State for the selected room
    const [searchTerm, setSearchTerm] = useState(''); // State for search term
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isArchiving, setIsArchiving] = useState(false); // State for archiving confirmation

    // Fetch room data on component mount
    useEffect(() => {
        fetchRooms();
    }, []);

    const fetchRooms = async () => {
        try {
            const response = await axios.get('https://light-house-system.vercel.app/api/getRoomsAll');
            setRooms(response.data.filter(room => room.room_status !== 'DELETE')); // Exclude INACTIVE rooms
        } catch (error) {
            console.error('Error fetching room data:', error);
            setError('Failed to fetch room data.');
        }
    };

    const toggleModal = () => {
        setIsModalOpen(!isModalOpen);
    };

    const toggleRoomPhotosModal = () => {
        setCurrentRoomId(selectedRoom ? selectedRoom.room_id : null);
        setIsRoomPhotosModalOpen(!isRoomPhotosModalOpen);
    };

    const toggleEditRoomPhotosModal = () => {
        setCurrentRoomId(selectedRoom ? selectedRoom.room_id : null);
        setIsEditRoomPhotosModalOpen(!isEditRoomPhotosModalOpen);  // Toggle the modal open/close
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
        setError('');
        setSuccess('');
    };

          // Function to calculate the final price based on price and discount percentage
          const calculateFinalPrice = (price, discount) => {
            const discountAmount = price * (discount / 100);
            return price - discountAmount;
        };
    
            // Handle input change in the detail view
         const handleDetailChange = (e) => {
                const { name, value } = e.target;
                setSelectedRoom((prev) => {
                    const updatedRoom = { ...prev, [name]: value };
        
                    // Update the final price whenever price or discount percentage changes
                    if (name === 'room_rate' || name === 'room_disc_percentage') {
                        updatedRoom.room_final_rate = calculateFinalPrice(
                            parseFloat(updatedRoom.room_rate) || 0,
                            parseFloat(updatedRoom.room_disc_percentage) || 0
                        );
                    }
        
                    return updatedRoom;
                });
            };

    const handleSaveChanges = async () => {
        try {
            setError('');
            setSuccess('');

            const response = await axios.put(`https://light-house-system.vercel.app/api/updateRoom/${selectedRoom.room_id}`, selectedRoom);

            if (response.status === 200) {
                setSuccess('Room details updated successfully!');
                setError('');

                // Update the room list with the new data
                setRooms(prevRooms => 
                    prevRooms.map(room => 
                        room.room_id === selectedRoom.room_id ? { ...room, ...selectedRoom } : room
                    )
                );

                setTimeout(() => {
                    setSuccess('');
                }, 3000);
            }
        } catch (error) {
            console.error('Error updating room:', error.response?.data || error.message);
            setError('Failed to update room: ' + (error.response?.data?.error || error.message));
            setSuccess('');
        }
    };

    const handleArchive = async () => {
        setIsArchiving(false); // Hide the confirmation dialog

        try {
            setError('');
            setSuccess('');

            const response = await axios.put(
                `https://light-house-system.vercel.app/api/updateRoom/${selectedRoom.room_id}`, 
                {
                    room_status: 'DELETE'         
                }
            );

            if (response.status === 200) {
                setSuccess('Room archived successfully!');
                setError('');

                // Remove the archived room from the list
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
                            <div className='column is-narrow'>
                                <button className='button is-blue' onClick={toggleModal}>
                                    <IoAdd style={{ marginRight: '5px' }} /> Add
                                </button>
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
                                            {room.room_type_name}
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
                                            <div className="field">
                                                <label className="label">Room Type</label>
                                                <div className="control">
                                                    <input
                                                        className="input"
                                                        type="text"
                                                        name="room_type_name"
                                                        value={selectedRoom.room_type_name}
                                                        onChange={handleDetailChange}
                                                    />
                                                </div>
                                            </div>

                                            <div className="field">
                                                <label className="label">Room Number</label>
                                                <div className="control">
                                                    <input
                                                        className="input"
                                                        type="number"
                                                        name="room_number"
                                                        value={selectedRoom.room_number}
                                                        onChange={handleDetailChange}
                                                    />
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
                                                    ></textarea>
                                                </div>
                                            </div>
                                            <div className="field is-grouped is-flex is-flex-wrap-wrap is-flex-direction-row-mobile is-flex-direction-column-tablet">
                                                <div className="control">
                                                    <button className="button is-blue mb-2 mr-2 is-fullwidth-tablet" onClick={toggleRoomPhotosModal}>
                                                        <span className="mr-1"><IoAddCircleOutline /></span>
                                                        <span>Add Room Photos</span>
                                                    </button>
                                                </div>
                                                <div className="control">
                                                    <button className="button is-inverted-blue mb-2 is-fullwidth-tablet" onClick={toggleEditRoomPhotosModal}>
                                                        <span className="mr-1"><IoPencilOutline /></span>
                                                        <span>Edit Room Photos</span>
                                                    </button>
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
                                                <strong>Room Information</strong>
                                            </h1>
                                        </div>

                                        <div className="columns is-multiline">
                                            <div className="column is-6">
                                                <div className="field">
                                                    <label className="label">Room PAX Maximum</label>
                                                    <div className="control">
                                                        <input
                                                            className="input"
                                                            type="number"
                                                            name="room_pax_max"
                                                            value={selectedRoom.room_pax_max}
                                                            onChange={handleDetailChange}
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="column is-6">
                                                <div className="field">
                                                    <label className="label">Room PAX Minimum</label>
                                                    <div className="control">
                                                        <input
                                                            className="input"
                                                            type="number"
                                                            name="room_pax_min"
                                                            value={selectedRoom.room_pax_min}
                                                            onChange={handleDetailChange}
                                                        />
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
                                                            onChange={handleDetailChange}
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="column is-6">
                                                <div className="field">
                                                    <label className="label">Room Discount</label>
                                                    <div className="control">
                                                        <input
                                                            className="input"
                                                            type="number"
                                                            name="room_disc_percentage"
                                                            value={selectedRoom.room_disc_percentage}
                                                            onChange={handleDetailChange}
                                                        />
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
                                                            value={selectedRoom.room_final_rate}
                                                            onChange={handleDetailChange}
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="column is-6">
                                                <div className="field">
                                                    <label className="label">Room Breakfast Availability</label>
                                                    <div className="control">
                                                        <div className="select is-fullwidth">
                                                            <select
                                                                name="room_breakfast_availability"
                                                                value={selectedRoom.room_breakfast_availability}
                                                                onChange={handleDetailChange}
                                                            >
                                                                <option value="AVAILABLE">AVAILABLE</option>
                                                                <option value="NOT AVAILABLE">NOT AVAILABLE</option>
                                                            </select>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="column is-6">
                                                <div className="field">
                                                    <label className="label">Room Status</label>
                                                    <div className="control">
                                                        <div className="select is-fullwidth">
                                                            <select
                                                                name="room_status"
                                                                value={selectedRoom.room_status}
                                                                onChange={handleDetailChange}
                                                            >
                                                                <option value="AVAILABLE">AVAILABLE</option>
                                                                <option value="NOT AVAILABLE">NOT AVAILABLE</option>
                                                                <option value="UNDER MAINTENANCE">UNDER MAINTENANCE</option>
                                                                <option value="OCCUPIED">OCCUPIED</option>
                                                            </select>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="column is-6">
                                                <div className="field">
                                                    <label className="label">Edit Virtual Tour Room</label>
                                                    <figure className="image is-fullwidth">
                                                        <img src="https://via.placeholder.com/128x128" alt="Virtual Tour" style={{ height: '128px' }} />
                                                    </figure>
                                                    <div className="container">
                                                        <button className="button is-blue is-fullwidth">Edit Virtual Tour Details</button>
                                                    </div>
                                                </div>
                                            </div>

                                        </div>

                                        <div className="columns">
                                            <div className="column is-12 has-text-left">
                                                <button className="button is-blue" onClick={handleSaveChanges}>Save Changes</button>
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
                                                <strong>Archive Data</strong>
                                            </h1>
                                        </div>
                                        <div className="columns is-multiline is-mobile">
                                            <div className="column">
                                                <p>To ensure data integrity and maintain a clear historical record, all room data that is no longer active shall be archived. Archiving involves securely storing all associated data, including room information and history, in a read-only format. Archiving does not delete the room or its data but instead preserves it in its current state, safeguarding the integrity of the information while freeing up active room management resources.</p>
                                            </div>
                                            <div className="column is-12 is-left">
                                                <button className="button is-red" onClick={() => setIsArchiving(true)}>Archive</button>
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
                                                <p>Are you sure you want to archive this room?</p>
                                                <div className="buttons is-right">
                                                    <button className="button is-danger" onClick={handleArchive}>Yes</button>
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
                <AddRoomModal isOpen={isModalOpen} toggleModal={toggleModal} />
                <AddRoomPhotos isOpen={isRoomPhotosModalOpen} toggleModal={toggleRoomPhotosModal}  roomId={currentRoomId}/>
                {isEditRoomPhotosModalOpen && (
                <EditRoomPhotos isOpen={isEditRoomPhotosModalOpen}  toggleModal={toggleEditRoomPhotosModal}  roomId={currentRoomId}  // Pass the current roomId to the modal
                />
            )}
            </div>
        </section>
    );
};

export default RoomManager;
