import React from 'react'; // Import React
import 'bulma/css/bulma.min.css';
import { IoSearchCircle } from 'react-icons/io5'; // Import the IoSearchCircle icon
import '../App.css';

// Function to return color based on status
const getStatusColor = (status) => {
  if (status === 'CLEANED') return 'green';
  if (status === 'DIRTY') return 'red';
  return 'black'; // Default color if status is neither CLEANED nor DIRTY
};

// Modal component for displaying housekeeping records
const AllHousekeepingRecordsModal = ({ isVisible, onClose }) => {
  if (!isVisible) return null; // Don't render if not visible
  return (
    <div className="modal is-active">
      <div className="modal-background" onClick={onClose}></div>
      <div className="modal-content" style={{ width: '80%', maxHeight: '80vh', overflow: 'auto' }}>
        <span className="close" onClick={onClose} aria-label="Close modal">&times;</span>
        
        {/* Header Section */}
        <div style={{ backgroundColor: 'white', borderRadius: '10px 10px 0 0', padding: '20px' }}>
          <div className="columns is-multiline is-mobile is-vcentered">
            {/* Heading on the left */}
            <div className="column is-narrow">
              <h1 className="subtitle" style={{ marginLeft: '10px', fontSize: '25px' }}>
                <strong>Housekeeping Records</strong>
              </h1>
            </div>

            {/* Search input and button on the right */}
            <div className="column is-4 is-hidden-mobile" style={{ padding: '0', margin: '0' }}>
              <div className="field has-addons is-flex is-flex-direction-row is-fullwidth-mobile">
                <div className="control is-expanded is-fullwidth">
                  <input
                    className="input is-fullwidth-mobile"
                    type="date"
                    style={{ margin: '0', fontSize: '12px', padding: '18px', marginTop: '12px' }}
                    placeholder="Search..."
                  />
                </div>
                <div className="control is-fullwidth">
                  <button className="button is-blue is-fullwidth-mobile" style={{ height: '77%', fontSize: '12px', padding: '10px', marginTop: '12px' }}>
                    <IoSearchCircle className="is-white" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Table Section */}
        <div style={{ backgroundColor: 'white', borderRadius: '0 0 10px 10px', padding: '20px', marginTop: '-35px' }}>
          <div className="table-container">
            <table className="table is-striped is-hoverable is-fullwidth">
              <thead>
                <tr>
                  <th className="has-text-left" style={{ backgroundColor: '#add8e6', fontSize: '18px', borderRadius: '10px 0 0 10px' }}>Housekeeping ID</th>
                  <th className="has-text-left" style={{ backgroundColor: '#add8e6', fontSize: '18px' }}>Room ID</th>
                  <th className="has-text-left" style={{ backgroundColor: '#add8e6', fontSize: '18px' }}>Staff Name</th>
                  <th className="has-text-left" style={{ backgroundColor: '#add8e6', fontSize: '18px' }}>Type</th>
                  <th className="has-text-left" style={{ backgroundColor: '#add8e6', fontSize: '18px' }}>Start</th>
                  <th className="has-text-left" style={{ backgroundColor: '#add8e6', fontSize: '18px' }}>End</th>
                  <th className="has-text-left" style={{ backgroundColor: '#add8e6', fontSize: '18px' }}>Notes</th>
                  <th className="has-text-left" style={{ backgroundColor: '#add8e6', fontSize: '18px', borderRadius: '0 10px 10px 0px' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {/* Record Entries */}
                <tr className="has-text-left">
                  <td>H00001</td>
                  <td>101</td>
                  <td>Sarah Gary</td>
                  <td>Request</td>
                  <td>2024-08-03 14:00:00</td>
                  <td>2024-08-03 15:00:00</td>
                  <td>Cleaned and Vacuumed</td>
                  <td style={{ color: getStatusColor('CLEANED') }}>CLEANED</td> {/* Dynamically set color */}
                </tr>

                <tr className="has-text-left">
                  <td>H00002</td>
                  <td>102</td>
                  <td>Sara Gary</td>
                  <td>Request</td>
                  <td>2024-08-03 14:00:00</td>
                  <td>2024-08-03 15:00:00</td>
                  <td>Vacuumed</td>
                  <td style={{ color: getStatusColor('CLEANED') }}>CLEANED</td> {/* Dynamically set color */}
                </tr>

                <tr className="has-text-left">
                  <td>H00003</td>
                  <td>102</td>
                  <td>Sara Gary</td>
                  <td>Request</td>
                  <td>2024-08-03 14:00:00</td>
                  <td>2024-08-03 15:00:00</td>
                  <td>Vacuumed</td>
                  <td style={{ color: getStatusColor('CLEANED') }}>CLEANED</td> {/* Dynamically set color */}
                </tr>

                {/* Additional record with 'DIRTY' status */}
                <tr className="has-text-left">
                  <td>H00004</td>
                  <td>103</td>
                  <td>John Doe</td>
                  <td>Request</td>
                  <td>2024-08-03 14:00:00</td>
                  <td>2024-08-03 15:00:00</td>
                  <td>Uncleaned</td>
                  <td style={{ color: getStatusColor('DIRTY') }}>DIRTY</td> {/* Dynamically set color */}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AllHousekeepingRecordsModal; // Export the main component
