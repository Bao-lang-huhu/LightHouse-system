import React from 'react';
import 'bulma/css/bulma.min.css';
import { IoSearchCircle } from 'react-icons/io5';
import '../App.css';

// Function to return color based on status
const getStatusColor = (status) => {
  if (status === 'DONE') return 'green';
  if (status === 'CANCELLED') return 'red';
  return 'black'; // Default color
};

// Modal component for displaying housekeeping records
const AllMaintenanceRecordsModal = ({ isVisible, onClose }) => {
  if (!isVisible) return null; // Don't render if not visible

  return (
    <div className="modal is-active">
      <div className="modal-background" onClick={onClose}></div>
      <div className="modal-content" style={{ width: '80%', maxHeight: '80vh', overflow: 'auto' }}>
        <span className="close" onClick={onClose} aria-label="Close modal">&times;</span>

        {/* Header Section */}
        <div style={{ backgroundColor: 'white', borderRadius: '10px 10px 0 0', padding: '20px' }}>
          <div className="columns is-multiline is-mobile is-vcentered">
            <div className="column is-narrow">
              <h1 className="subtitle" style={{ marginLeft: '10px', fontSize: '25px' }}>
                <strong>Maintenance Records</strong>
              </h1>
            </div>

            {/* Search input and button on the right */}
            <div className="column is-4 is-hidden-mobile" style={{ padding: '0', margin: '0' }}>
              <div className="field has-addons is-flex is-flex-direction-row is-fullwidth-mobile">
                <div className="control is-expanded is-fullwidth">
                  <input
                    className="input is-fullwidth-mobile"
                    type="date"
                    style={{ margin: '0', fontSize: '12px', padding: '18px', marginTop: '12px', marginLeft: '80px' }}
                    placeholder="Search..."
                  />
                </div>
                <div className="control is-fullwidth">
                  <button className="button is-blue is-fullwidth-mobile" style={{ height: '77%', fontSize: '12px', padding: '10px', marginTop: '12px', marginLeft: '80px' }}>
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
                  <th className="has-text-left" style={{ backgroundColor: '#add8e6', fontSize: '18px', borderRadius: '10px 0 0 10px' }}>Maintenance ID</th>
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
                  <td>M00001</td>
                  <td>101</td>
                  <td>Sarah Gary</td>
                  <td>Request</td>
                  <td>2024-08-03 14:00:00</td>
                  <td>2024-08-03 15:00:00</td>
                  <td>Plumbing</td>
                  <td style={{ color: getStatusColor('CANCELLED') }}>CANCELLED</td>
                </tr>

                <tr className="has-text-left">
                  <td>M00002</td>
                  <td>102</td>
                  <td>Sarag Gary</td>
                  <td>Request</td>
                  <td>2024-08-03 14:00:00</td>
                  <td>2024-08-03 15:00:00</td>
                  <td>Bed Repair</td>
                  <td style={{ color: getStatusColor('DONE') }}>DONE</td>
                </tr>

                <tr className="has-text-left">
                  <td>M00003</td>
                  <td>102</td>
                  <td>Sarag Gary</td>
                  <td>Request</td>
                  <td>2024-08-03 14:00:00</td>
                  <td>2024-08-03 15:00:00</td>
                  <td>Vacuumed</td>
                  <td style={{ color: getStatusColor('DONE') }}>DONE</td>
                </tr>

                <tr className="has-text-left">
                  <td>M00004</td>
                  <td>103</td>
                  <td>John Doe</td>
                  <td>Request</td>
                  <td>2024-08-03 14:00:00</td>
                  <td>2024-08-03 15:00:00</td>
                  <td>Table Repair</td>
                  <td style={{ color: getStatusColor('CANCELLED') }}>CANCELLED</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AllMaintenanceRecordsModal;