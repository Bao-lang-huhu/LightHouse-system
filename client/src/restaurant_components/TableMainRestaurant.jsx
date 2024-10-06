import React, { useState, useEffect } from 'react';
import 'bulma/css/bulma.min.css';
import '../App.css';
import '../manager_components/components_m.css';
import { IoSearchCircle } from 'react-icons/io5';
import ErrorMsg from '../messages/errorMsg';
import SuccessMsg from '../messages/successMsg';
import axios from 'axios';

const TableMainRestaurant = () => {
  const [tables, setTables] = useState([]); // State to store table items
  const [selectedTable, setSelectedTable] = useState(null); // State to manage selected table
  const [searchTerm, setSearchTerm] = useState(''); // State to handle search term
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Fetch tables on component mount
  useEffect(() => {
    const fetchTables = async () => {
      try {
        const response = await axios.get('https://light-house-system.vercel.app/api/getTables'); // Replace with your API endpoint
        setTables(response.data); // Set the fetched tables data to state
      } catch (error) {
        console.error('Error fetching table data:', error);
      }
    };
    fetchTables();
  }, []);

  // Handle table click to view details
  const handleTableClick = (table) => {
    setSelectedTable({ ...table }); // Set the clicked table as selected
    setError(''); // Clear error
    setSuccess(''); // Clear success
  };

  // Handle input change in the detail view
  const handleDetailChange = (e) => {
    const { name, value } = e.target;
    setSelectedTable((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle save changes
  const handleSaveChanges = async () => {
    try {
      setError('');
      setSuccess('');

      const response = await axios.put(`https://light-house-system.vercel.app/api/updateTable/${selectedTable.table_id}`, selectedTable);

      if (response.status === 200) {
        setSuccess('Table updated successfully!');

        setTables(prevTables =>
          prevTables.map(table =>
            table.table_id === selectedTable.table_id ? { ...table, ...selectedTable } : table
          )
        );

        setTimeout(() => {
          setSuccess('');
        }, 3000);
      }
    } catch (error) {
      console.error('Error updating table item:', error.response?.data || error.message);
      setError('Failed to update table item: ' + (error.response?.data?.error || error.message));
      setSuccess('');
    }
  };

  // Filter tables based on search term
  const filteredTables = tables.filter(table => {
    const lowercasedTerm = searchTerm.toLowerCase();

    return (
      table.table_name.toLowerCase().includes(lowercasedTerm) ||
      table.seat_quantity.toString().includes(lowercasedTerm) || // Check seat quantity
      table.table_status.toLowerCase().includes(lowercasedTerm) // Check table status
    );
  });

  return (
    <section className='section-p1'>
      <div className="columns" style={{ minHeight: "100vh" }}>
        <div className="column is-3">
          <div className="column">
            <div className='columns is-vcentered tablet-column-layout'>
              <div className='column'>
                <h1 className='subtitle'>
                  <strong>Tables</strong>
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

          {/* Table List */}
          <div style={{ marginBottom: "5px" }}>
            {filteredTables.map((table) => (
              <div
                key={table.table_id}
                className={`staff-space ${selectedTable && selectedTable.table_id === table.table_id ? 'is-active' : ''}`} // Highlight selected table
                onClick={() => handleTableClick(table)} // Handle table item click
                style={{ cursor: 'pointer', padding: '1rem', backgroundColor: selectedTable?.table_id === table.table_id ? '#e8f4ff' : 'transparent' }}
              >
                <div className="columns is-vcentered is-mobile" style={{ paddingLeft: "5px" }}>
                  <div className="column is-flex is-align-items-center">
                    <h3 style={{ marginRight: "8px" }}>{table.table_name}</h3>
                    <div
                      className="status-circle"
                      style={{
                        backgroundColor: table.table_status === 'ACTIVE' ? 'green' : 'red',
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
                <strong>Table Details</strong>
              </h1>
            </div>

            {error && <ErrorMsg message={error} />}
            {success && <SuccessMsg message={success} />}

            {selectedTable ? (
              <div>
                <div className="columns is-vcentered">
                  <div className="column is-6">
                    <div className="staff-space">
                      <div className="field">
                        <label className="label">Table Name</label>
                        <div className="control">
                          <input
                            className="input"
                            type="text"
                            name="table_name"
                            value={selectedTable.table_name}
                            onChange={handleDetailChange}
                          />
                        </div>
                      </div>
                      <div className="field">
                        <label className="label">Seat Quantity</label>
                        <div className="control">
                          <input
                            className="input"
                            type="number"
                            name="seat_quantity"
                            value={selectedTable.seat_quantity}
                            onChange={handleDetailChange}
                          />
                        </div>
                      </div>
                      <div className="field">
                        <label className="label">Status</label>
                        <div className="control">
                          <div className="select is-fullwidth">
                            <select
                              name="table_status"
                              value={selectedTable.table_status}
                              onChange={handleDetailChange}
                            >
                              <option value="ACTIVE">ACTIVE</option>
                              <option value="INACTIVE">INACTIVE</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="columns">
                  <div className="column is-12 is-left">
                    <button className="button is-blue" onClick={handleSaveChanges}>Save Changes</button>
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <p>No table selected. Click on a table to view details.</p>
              </div>
            )}
          </main>
        </div>
      </div>
    </section>
  );
};

export default TableMainRestaurant;
