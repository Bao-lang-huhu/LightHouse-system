import React from 'react';
import 'bulma/css/bulma.min.css';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { IoHome, IoMap, IoMail, IoPhonePortrait, IoTime, IoBusOutline, IoBagOutline, IoLocateOutline, IoFastFoodOutline } from 'react-icons/io5';
import 'leaflet/dist/leaflet.css';
import one from '../images/icons/icon1.png'
import './pages.css';
import '../App.css';

const center = [9.326439105046058, 123.30676578031755]; 
const zoom = 25;
const customIcon = new L.Icon({
    iconUrl: one, 
    iconSize: [64, 64], 
    iconAnchor: [16, 32], 
    popupAnchor: [0, -32] 
  });

function ContactUs() {
    return (
        <section className='section-m1'>
            <div className="contact-hero-image">
                <div className="text-content-title">
                    <h1 className='title'>Contact Us</h1>
                    <h3 className='subtitle'>Get in touch with us for any inquiries or support.</h3>
                </div>
            </div>

            <div className="contact-details">
                <div id="map" className="map-container">
                        <MapContainer center={center} zoom={zoom} style={{ height: '400px', width: '100%' }}>
                        <TileLayer
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        />
                        <Marker position={center} icon={customIcon}>
                            <Popup>LightHouse Point Hotel</Popup>
                        </Marker>
                        </MapContainer>
                </div>
                <div className="details">
                    <h3 className='subtitle'>Come visit our hotel and discover all the amazing services!</h3>
                    <ul>
                    <li>
                        <IoHome style={{ fontSize: '1.5rem' }} />
                        <p>LightHouse Point Hotel</p>
                    </li>
                    <li>
                        <IoMap style={{ fontSize: '1.5rem' }} />
                        <p>Airport Highway, Brgy. 40a Hibbard Ave, Dumaguete City, 6200 Negros Oriental</p>
                    </li>
                    <li>
                        <IoMail style={{ fontSize: '1.5rem' }} />
                        <p>lighthousepoint@gmail.com</p>
                    </li>
                    <li>
                        <IoPhonePortrait style={{ fontSize: '1.5rem' }} />
                        <p>+6392 234 3454</p>
                    </li>
                    <li>
                        <IoTime style={{ fontSize: '1.5rem' }} />
                        <p>Check-in: 2 p.m.</p>
                    </li>
                    <li>
                        <IoTime style={{ fontSize: '1.5rem' }} />
                        <p>Check-out: 12 p.m.</p>
                    </li>
                    </ul>
                </div>
            </div>

            <div className="property-views-container">
                <h4><strong>Nearby Locations</strong></h4>
                <h3>Enjoy and Explore the Attractions near Lighthouse Point Hotel</h3>
                
                <div className="columns">

                    {/* Transportation */}
                    <div className="column">
                        <div className="box">
                            <h5 className="title is-5"><IoBusOutline style={{ fontSize: '1.5rem', marginRight: '0.5rem' }} />Transportation</h5>
                            <ul className="has-text-left">
                                <li><IoBusOutline style={{ fontSize: '1.2rem', marginRight: '0.5rem' }} /> Airport: Sibulan Airport - 2.4 km</li>
                            </ul>
                        </div>

                        {/* Shopping */}
                        <div className="box">
                            <h5 className="title is-5"><IoBagOutline style={{ fontSize: '1.5rem', marginRight: '0.5rem' }} />Shopping</h5>
                            <ul className="has-text-left">
                                <li><IoBagOutline style={{ fontSize: '1.2rem', marginRight: '0.5rem' }} /> Ruiz Recording and Rehearsal Studios - 670 m</li>
                                <li><IoBagOutline style={{ fontSize: '1.2rem', marginRight: '0.5rem' }} /> CityMall Dumaguete - 900 m</li>
                                <li><IoBagOutline style={{ fontSize: '1.2rem', marginRight: '0.5rem' }} /> Cang's Inc Shopping Complex - 1.3 km</li>
                                <li><IoBagOutline style={{ fontSize: '1.2rem', marginRight: '0.5rem' }} /> Negros CD Department Store - 1.8 km</li>
                                <li><IoBagOutline style={{ fontSize: '1.2rem', marginRight: '0.5rem' }} /> Thousand Island Store - 1.8 km</li>
                                <li><IoBagOutline style={{ fontSize: '1.2rem', marginRight: '0.5rem' }} /> Ever Mall Shopping Center - 2.0 km</li>
                                <li><IoBagOutline style={{ fontSize: '1.2rem', marginRight: '0.5rem' }} /> Lee Super Plaza - 2.0 km</li>
                                <li><IoBagOutline style={{ fontSize: '1.2rem', marginRight: '0.5rem' }} /> Unitop - 2.2 km</li>
                                <li><IoBagOutline style={{ fontSize: '1.2rem', marginRight: '0.5rem' }} /> Tops & Bottoms - 2.2 km</li>
                                <li><IoBagOutline style={{ fontSize: '1.2rem', marginRight: '0.5rem' }} /> Dumaguete Public Market - 2.3 km</li>
                                <li><IoBagOutline style={{ fontSize: '1.2rem', marginRight: '0.5rem' }} /> Mercado de Negrense - 2.3 km</li>
                            </ul>
                        </div>
                    </div>

                    {/* Landmarks */}
                    <div className="column">
                        <div className="box">
                            <h5 className="title is-5"><IoLocateOutline style={{ fontSize: '1.5rem', marginRight: '0.5rem' }} />Landmarks</h5>
                            <ul className="has-text-left">
                                <li><IoLocateOutline style={{ fontSize: '1.2rem', marginRight: '0.5rem' }} /> Silliman Park - 320 m</li>
                                <li><IoLocateOutline style={{ fontSize: '1.2rem', marginRight: '0.5rem' }} /> Silliman University Marine Mammal Museum - 600 m</li>
                                <li><IoLocateOutline style={{ fontSize: '1.2rem', marginRight: '0.5rem' }} /> First Baptist Church of Dumaguete - 620 m</li>
                                <li><IoLocateOutline style={{ fontSize: '1.2rem', marginRight: '0.5rem' }} /> Christmas House - 680 m</li>
                                <li><IoLocateOutline style={{ fontSize: '1.2rem', marginRight: '0.5rem' }} /> Hassaram Courtyard - 730 m</li>
                                <li><IoLocateOutline style={{ fontSize: '1.2rem', marginRight: '0.5rem' }} /> Ang Tay Golf Course - 800 m</li>
                                <li><IoLocateOutline style={{ fontSize: '1.2rem', marginRight: '0.5rem' }} /> Silliman University Zoo - 850 m</li>
                                <li><IoLocateOutline style={{ fontSize: '1.2rem', marginRight: '0.5rem' }} /> Ninoy Aquino Freedom Park - 1.5 km</li>
                                <li><IoLocateOutline style={{ fontSize: '1.2rem', marginRight: '0.5rem' }} /> Negros Oriental Convention Center - 1.7 km</li>
                                <li><IoLocateOutline style={{ fontSize: '1.2rem', marginRight: '0.5rem' }} /> Rizal Boulevard - 2.2 km</li>
                                <li><IoLocateOutline style={{ fontSize: '1.2rem', marginRight: '0.5rem' }} /> Campanario de Dumaguete - 2.4 km</li>
                            </ul>
                        </div>
                    </div>

                    {/* Dining */}
                    <div className="column">
                        <div className="box">
                            <h5 className="title is-5"><IoFastFoodOutline style={{ fontSize: '1.5rem', marginRight: '0.5rem' }} />Dining</h5>
                            <ul className="has-text-left">
                                <li><IoFastFoodOutline style={{ fontSize: '1.2rem', marginRight: '0.5rem' }} /> ARBOUR by Jan from your cooking class - &lt;100 m</li>
                                <li><IoFastFoodOutline style={{ fontSize: '1.2rem', marginRight: '0.5rem' }} /> Gabby's Bistro - 300 m</li>
                                <li><IoFastFoodOutline style={{ fontSize: '1.2rem', marginRight: '0.5rem' }} /> Himawari Izakaya (Japanese Restaurant) - &lt;100 m</li>
                                <li><IoFastFoodOutline style={{ fontSize: '1.2rem', marginRight: '0.5rem' }} /> Tiki Bar - 630 m</li>
                                <li><IoFastFoodOutline style={{ fontSize: '1.2rem', marginRight: '0.5rem' }} /> Rice N Box 24/7 Delivery - 740 m</li>
                                <li><IoFastFoodOutline style={{ fontSize: '1.2rem', marginRight: '0.5rem' }} /> Chia Eatery - 760 m</li>
                                <li><IoFastFoodOutline style={{ fontSize: '1.2rem', marginRight: '0.5rem' }} /> Lab-as Restaurant - 830 m</li>
                                <li><IoFastFoodOutline style={{ fontSize: '1.2rem', marginRight: '0.5rem' }} /> Señorita's Mexican Grill - 1.4 km</li>
                            </ul>
                        </div>
                    </div>

                </div>
            </div>


        </section>
    );
  }
  
  export default ContactUs;