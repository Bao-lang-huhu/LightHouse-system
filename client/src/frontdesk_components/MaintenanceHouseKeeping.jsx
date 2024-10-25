import React from 'react';
import 'bulma/css/bulma.min.css';
import '../App.css';
import { Link } from 'react-router-dom';
import { IoConstructOutline, IoHomeOutline } from 'react-icons/io5';


const MaintenanceHousekeeping = () => {
  return (
    <section className='section-p1'>
        <header>
            <div style={{backgroundColor:'white', borderRadius:'10px 10px'}}>
                <div className='column' >
                    <h1 className='subtitle'>
                        <strong>Room Housekeeping and Maintenance</strong>
                    </h1>
                </div>
                <div className="container section-p1 ">
                    <div className="columns is-multiline is-mobile">
                        <div className="column is-6"> <Link to = "/frontdesk_housekeeping">
                            <div className="button is-blue box has-text-centered">
                               
                                <span>
                                        <IoHomeOutline size={100} className="is-violet" />
                                    </span>
                                <p className="is-size-5 has-text-weight-semibold mt-2">Housekeeping</p>
                           </div> </Link>
                        </div>

                        <div className="column is-6">
                            <Link to = "/frontdesk_maintenance"><div className="button is-dark-blue box has-text-centered">
                                    <span>
                                        <IoConstructOutline size={100} className="is-violet" />
                                    </span>
                                <p className="is-size-5 has-text-weight-semibold mt-2">Maintenance</p>
                               </div> </Link>
                        </div>
                    </div>

                </div>
           </div>
        </header>
        <section className='section-p1'>
            <div style={{backgroundColor:'white', borderRadius:'10px 10px'}}>
                <div className='column' >
                    <h1 className='subtitle'>
                        <strong>Rooms Available</strong>
                    </h1>
                </div>
                <div className="container section-p1 ">
                    <div className="columns is-multiline is-mobile">
                        {/* Room Container */}
                        <div className="column is-full-mobile">
                            <div className="box columns is-vcentered" style={{ margin: '0.25rem', padding: '0.5rem' }}>
                            {/* Room Number on the Left */}
                            <div className="column is-4">
                                <div className="has-text-centered">
                                <p className="is-size-6 has-text-weight-bold">Room 101</p>
                                </div>
                            </div>
                            {/* Stacked Containers on the Right */}
                            <div className="column is-8">
                                <div className="box" style={{ padding: '0.5rem' }}>
                                    <div className="box has-text-centered is-flex is-justify-content-space-between is-align-items-center"
                                        style={{ padding: '0.5rem', margin: '0', backgroundColor: 'lightgrey' }} >
                                        <p className="is-size-7 has-text-weight-semibold">Housekeeping</p>
                                        <IoHomeOutline size={20} />
                                    </div>

                                    <div className="box has-text-centered is-flex is-justify-content-space-between is-align-items-center"
                                        style={{ padding: '0.5rem', margin: '0', backgroundColor: 'gray' }} >
                                        <p className="is-size-7 has-text-weight-semibold">Maintenance</p>
                                        <IoConstructOutline size={20} />
                                    </div>
                                </div>
                            </div>
                            </div>
                        </div>

                         {/* Room Container */}
                         <div className="column is-full-mobile">
                            <div className="box columns is-vcentered" style={{ margin: '0.25rem', padding: '0.5rem' }}>
                            {/* Room Number on the Left */}
                            <div className="column is-4">
                                <div className="has-text-centered">
                                <p className="is-size-6 has-text-weight-bold">Room 101</p>
                                </div>
                            </div>
                            {/* Stacked Containers on the Right */}
                            <div className="column is-8">
                                <div className="box" style={{ padding: '0.5rem' }}>
                                    <div className="box has-text-centered is-flex is-justify-content-space-between is-align-items-center"
                                        style={{ padding: '0.5rem', margin: '0', backgroundColor: 'lightgrey' }} >
                                        <p className="is-size-7 has-text-weight-semibold">Housekeeping</p>
                                        <IoHomeOutline size={20} />
                                    </div>

                                    <div className="box has-text-centered is-flex is-justify-content-space-between is-align-items-center"
                                        style={{ padding: '0.5rem', margin: '0', backgroundColor: 'gray' }} >
                                        <p className="is-size-7 has-text-weight-semibold">Maintenance</p>
                                        <IoConstructOutline size={20} />
                                    </div>
                                </div>
                            </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    </section>
  );
};

export default MaintenanceHousekeeping;
