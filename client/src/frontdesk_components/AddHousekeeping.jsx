import React, { useState } from 'react';
import 'bulma/css/bulma.min.css'; // Using Bulma CSS for styling
import '../App.css'; // Optional custom CSS
import AllHousekeepingRecordsModal from '../frontdesk_modals/AllHousekeepingRecordsModal';

const AddHousekeeping = () => {
  const initialRooms = [
    { id: 101 },
    { id: 102 },
    { id: 103 },
    { id: 104 },
    { id: 105 },
    { id: 106 },
  ]; // Initial rooms

  const [availableRooms, setAvailableRooms] = useState(initialRooms); // State for available rooms
  const [selectedRoom, setSelectedRoom] = useState(null); // State to manage selected room
  const [housekeepingNotes, setHousekeepingNotes] = useState(''); // State for housekeeping notes
  const [housekeepingType] = useState('Request'); // Hardcoded housekeeping type
  const [staffId, setStaffId] = useState(''); // State for Staff ID
  const [staffName, setStaffName] = useState(''); // State for Staff Name
  const [department, setDepartment] = useState(''); // State for Department
  const [isModalVisible, setModalVisible] = useState(false); // State to manage modal visibility
  const [savedRooms, setSavedRooms] = useState([]); // State to manage saved rooms

  const toggleModal = () => {
    setModalVisible(!isModalVisible);
    if (isModalVisible) {
      // Reset selected room when closing modal
      setSelectedRoom(null);
    }
  };

  // Handler for selecting a room
  const handleSelectRoom = (room) => {
    setSelectedRoom(room); // Set selected room directly
  };

  const handleSaveChanges = () => {
    // Save selected room to savedRooms if it is not already saved
    if (selectedRoom && !savedRooms.some(r => r.id === selectedRoom.id)) {
      setSavedRooms([...savedRooms, selectedRoom]);

      // Remove selected room from availableRooms
      setAvailableRooms(availableRooms.filter(room => room.id !== selectedRoom.id));

      // Clear selected room and notes after saving changes
      setSelectedRoom(null); // Clear selected room
      setHousekeepingNotes(''); // Clear notes
      setStaffId(''); // Clear Staff ID
      setStaffName(''); // Clear Staff Name
      setDepartment(''); // Clear Department
    }
  };

  // Handler for "CLEANED" button click
  const handleCleaned = () => {
    alert(`Rooms ${savedRooms.map(r => r.id).join(', ')} marked as CLEANED!`);
    setSavedRooms([]); // Clear saved rooms after cleaning
  };

  // Handler for "CANCEL HOUSEKEEPING" button click
  const handleCancelHousekeeping = () => {
    alert(`Housekeeping for rooms ${savedRooms.map(r => r.id).join(', ')} has been canceled.`);
    setSavedRooms([]); // Clear saved rooms after cancellation
  };

  return (
    <section className='section-p1'>
      <div className='columns'>
        {/* First Left Column: Add Housekeeping */}
        <div className="column is-3">
          <div style={{ backgroundColor: 'white', borderRadius: '10px', height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div style={{ flex: 1 }}>
              {/* Title and Button Section */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h1 className='subtitle' style={{ marginLeft: '25px', margin: 18 }}>
                  <strong>Add Housekeeping</strong>
                </h1>
                <div className='control'>
                  <button
                    style={{ backgroundColor: 'blue', color: 'white', border: 'none', padding: '10px 10px', cursor: 'pointer' }}
                    className='button mr-2'
                    onClick={toggleModal} // Open the modal
                  >
                    ALL RECORD
                  </button>
                </div>
              </div>
              <p className='has-text-grey' style={{ marginTop: '25px', marginLeft: '18px', fontSize: '16px', margin: 10 }}>
                Available rooms for cleaning
              </p>

              {/* Room List Section */}
              <div className="container section-p1" style={{ maxHeight: '350px', overflowY: 'auto', flex: 1 }}>
                <div className="columns is-multiline is-mobile">
                  {availableRooms.map((room) => (
                    <div key={room.id} className="column is-12">
                      <button
                        className="button is-fullwidth"
                        onClick={() => handleSelectRoom(room)} // Update selected room on click
                      >
                        Room {room.id}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Room Housekeeping Details */}
        <div className='column is-9'>
          {selectedRoom ? ( // Check if a room is selected
            <div className='box'>
              <div className='columns'>
                <div className='column is-6'>
                  <div className='field'>
                    <label className='label'>Housekeeping Type</label>
                    <div className='control'>
                      <input className='input' type='text' value={housekeepingType} readOnly />
                    </div>
                  </div>
                  <div className='field'>
                    <label className='label'>Housekeeping Notes</label>
                    <div className='control'>
                      <textarea
                        className='textarea'
                        placeholder='Enter housekeeping notes here...'
                        value={housekeepingNotes}
                        onChange={(e) => setHousekeepingNotes(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
                <div className='column is-6'>
                  <div className='field'>
                    <label className='label'>Room Requiring Housekeeping</label>
                    <div className='control'>
                      <input className='input' type='text' value={`Room ${selectedRoom.id}`} readOnly />
                    </div>
                  </div>
                </div>
              </div>
              <hr style={{ borderColor: 'black', borderWidth: '.5px', borderStyle: 'solid' }} />
              <div className='field is-grouped mt-4' style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <div className='control'>
                  <button
                    style={{ backgroundColor: 'blue', color: 'white', border: 'none', padding: '10px 20px', cursor: 'pointer' }}
                    className='button mr-2'
                    onClick={handleSaveChanges}
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className='box'>
              <p>Please select a room to mark as unclean.</p>
            </div>
          )}
        </div>
      </div>

      {/* Second Section: Add Another Housekeeping Record Below */}
      <div className='columns' style={{ minHeight: '100px' }}>
        {/* Second Left Column: Show Selected Rooms */}
        <div className="column is-3" style={{ backgroundColor: 'white', borderRadius: '10px', height: '100%' }}>
          <div className='column'>
            <h1 className='subtitle'>
              <strong>Room Housekeeping</strong>
            </h1>
            <p className='has-text-grey' style={{ marginTop: '-25px', marginLeft: '18px', fontSize: '16px', margin: 10 }}>
              Dirty rooms to clean
            </p>
          </div>

          {/* Show saved room list only after Save Changes */}
          {savedRooms.length > 0 && (
            <div className="container section-p1" style={{ height: 'calc(100% - 60px)', overflowY: 'auto' }}>
              <div className="columns is-multiline is-mobile">
                {savedRooms.map((room) => (
                  <div key={room.id} className="column is-12">
                    <button
                      className="button is-fullwidth" style={{ backgroundColor: 'red' }}
                      onClick={() => handleSelectRoom(room)} // Select the room when clicked
                    >
                      Room {room.id}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Second Right Column: Room Housekeeping Details */}
        <div className='column is-9'>
          <div className='box'>
            <div className='columns'>
              <div className='column is-6'>
                <div className='field'>
                  <label className='label'>Housekeeping Type</label>
                  <div className='control'>
                    <input className='input' type='text' value={housekeepingType} readOnly />
                  </div>
                </div>
                <div className='field'>
                  <label className='label'>Housekeeping Notes</label>
                  <div className='control'>
                    <textarea
                      className='textarea'
                      placeholder='Enter housekeeping notes here...'
                      value={housekeepingNotes}
                      onChange={(e) => setHousekeepingNotes(e.target.value)}
                    />
                  </div>
                </div>
              </div>
              <div className='column is-6'>
                <div className='field'>
                  <label className='label'>Room to Clean</label>
                  <div className='control'>
                    <input className='input' type='text' value={selectedRoom ? `Room ${selectedRoom.id}` : ''} readOnly />
                  </div>
                </div>
                
                {/* New Fields: Staff ID, Staff Name, Department */}
                <div className='field'>
                  <label className='label'>Staff ID</label>
                  <div className='control'>
                    <input
                      className='input'
                      type='text'
                      value={staffId}
                      onChange={(e) => setStaffId(e.target.value)} // Update Staff ID
                    />
                  </div>
                </div>
                <div className='field'>
                  <label className='label'>Staff Name</label>
                  <div className='control'>
                    <input
                      className='input'
                      type='text'
                      value={staffName}
                      onChange={(e) => setStaffName(e.target.value)} // Update Staff Name
                    />
                  </div>
                </div>
                <div className='field'>
                  <label className='label'>Department</label>
                  <div className='control'>
                    <input
                      className='input'
                      type='text'
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)} // Update Department
                    />
                  </div>
                </div>
              </div>
            </div>
            <hr style={{ borderColor: 'black', borderWidth: '.5px', borderStyle: 'solid' }} />
            <div className='field is-grouped mt-4' style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <div className='control'>
                <button
                  style={{ backgroundColor: 'green', color: 'white', border: 'none', padding: '10px 20px', cursor: 'pointer' }}
                  className='button mr-2'
                  onClick={handleCleaned}
                >
                  CLEANED
                </button>
              </div>
              <div className='control'>
                <button
                  style={{ backgroundColor: 'red', color: 'white', border: 'none', padding: '10px 20px', cursor: 'pointer' }}
                  className='button mr-2'
                  onClick={handleCancelHousekeeping}
                >
                  CANCEL HOUSEKEEPING
                </button>
              </div>
            </div>
            {/* Modal Component */}
            <AllHousekeepingRecordsModal isVisible={isModalVisible} onClose={toggleModal} />
          </div>
        </div>
      </div>
    </section>
  );
};

export default AddHousekeeping;
