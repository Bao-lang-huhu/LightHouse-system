import React from 'react';
import 'bulma/css/bulma.min.css';
import { IoBedSharp, IoFastFood, IoGlassesSharp, IoPeople, IoWalk, IoWine } from "react-icons/io5";
import home_hero from '../images/hero.png';
import garden from '../images/guest_home/garden.jpg';
import garden2 from '../images/guest_home/garden 2.jpg';
import lobby from '../images/guest_home/lobby.jpg';
import lobby2 from '../images/guest_home/lobby design.webp';
import outside from '../images/guest_home/outside view.webp';
import pool from '../images/guest_home/pool.webp';
import parking from '../images/guest_home/parking.jpg';
import './pages.css';
import '../App.css';

function AboutUs() {
    return (
      <section>
            <div className="hero is-color">
                <div className="hero-body" style={{ backgroundImage: `url(${home_hero})` }}>
                </div>
                <div className="floating-container">
                     <div className='about-white'>
                        <div className="container is-centered">
                            <h2 className='title has-text-centered m-3'>About LightHouse Point Hotel</h2>
                        </div>
                        <h3 className="about-space"><strong>Beacon of Luxury, Stay Enlightened Here.</strong></h3>
                        <div className='about-space'>
                            <p>Experience the charm of Dumaguete City at Lighthouse Point Hotel, where the laid-back atmosphere and friendly locals create a welcoming retreat. 
                                Immerse yourself in the vibrant street art and explore historical sites like Silliman University, or dive into the breathtaking Apo Island Marine Reserve. Our hotel offers spacious, 
                                nautical-themed rooms perfect for solo travelers seeking comfort and style. Begin your day with a delightful breakfast, unwind by our refreshing pool, and savor panoramic views from 
                                our rooftop lounge. Take advantage of our convenient shuttle service to explore the city with ease.</p>

                            <p>Stay connected with complimentary Wi-Fi, rejuvenate in our invigorating showers, and indulge in luxurious toiletries. 
                                Lighthouse Point Hotel ensures a seamless blend of relaxation and adventure. Nearby attractions like the Silliman 
                            University Anthropology Museum, Freedom Park, and Hayahay Treehouse Bar and Viewdeck offer a glimpse into the local culture and vibrant nightlife. 
                                Discover a delightful stay at Lighthouse Point Hotel, where every detail is designed to enhance your experience in Dumaguete City.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
                   
            <div className="property-views-container">
                <h4><strong>Services</strong></h4>
                <h3>Unwind, Dine, and Explore – Luxury Services at Lighthouse Point Hotel</h3>
                <div className="cards">
                    <div className="card">
                        <div className="info">
                            <IoBedSharp style={{ fontSize: '2rem' }} />
                        </div>
                        <div className="body">
                            <div className="text">
                                <h3><strong>Room Reservation</strong></h3>
                                <div className="body-text">Book your ideal stay effortlessly - choose from our cozy and thoughtfully  designed rooms that guarantees a memorable experience.</div>
                            </div>
                        </div>
                    </div>

                    <div className="card">
                        <div className="info">
                            <IoWalk style={{ fontSize: '2rem' }} />
                        </div>
                        <div className="body">
                            <div className="text">
                                <h3><strong>Concierge and Laundry</strong></h3>
                                <div className="body-text">Elevate your experience with our dedicated concierge services and convenient laundry options, ensuring your visit is tailored to your needs.</div>
                            </div>
                        </div>
                    </div>

                    <div className="card">
                        <div className="info">
                            <IoFastFood style={{ fontSize: '2rem' }} />
                        </div>
                        <div className="body">
                            <div className="text">
                                <h3><strong>Resturant Services</strong></h3>
                                <div className="body-text">Savor the flavors of our on-site restaurant, where each dish is made to delight your taste buds.</div>
                            </div>
                        </div>
                    </div>

                    <div className="card">
                        <div className="info">
                            <IoGlassesSharp style={{ fontSize: '2rem' }} />
                        </div>
                        <div className="body">
                            <div className="text">
                                <h3><strong>Virtual Tour</strong></h3>
                                <div className="body-text">Take a virtual tour of our cozy hotel rooms and amenities from the comfort of your device, giving you a sneak peek of your upcoming stay.</div>
                            </div>
                        </div>
                    </div>

                    <div className="card">
                        <div className="info">
                            <IoPeople style={{ fontSize: '2rem' }} />
                        </div>
                        <div className="body">
                            <div className="text">
                                <h3><strong>Event Services</strong></h3>
                                <div className="body-text">Mark your milestone with us and let our professional event services turn your special occasions into truly memorable experiences.</div>
                            </div>
                        </div>
                    </div>

                    <div className="card">
                        <div className="info">
                            <IoWine style={{ fontSize: '2rem' }} />
                        </div>
                        <div className="body">
                            <div className="text">
                                <h3><strong>Bar Services</strong></h3>
                                <div className="body-text">Raise a toast and enjoy our accommodating bar services, where every drink is prepared to make your unwind session even more enjoyable.</div>
                            </div>
                        </div>
                    </div>

                    
                </div>
            </div>

            <div className="panel-image-double">
                <div className="image-placeholder"></div>
                    <img className="image " src={garden} alt="Garden At Night" />
                    <img className="image flipped " src={garden2} alt="Garden At Day" />
                <div className="image-placeholder"></div>
            </div>

            <div className="about-us-container">
                <div className="flex-boxes-container">
                    <div className="flex-box-head">
                    <h2 className="flex-box-title">A bit more about the hotel...</h2>
                        <div className='flex-column'>

                            <div className="flex-box">
                                <h3 className='has-text-white m-2'>Opened on 2023.</h3>
                                    <img className="flex-image " src={lobby} alt="Lobby"/>
                            </div>
                            <div className="flex-box">
                                <h3 className='has-text-white m-2'>There are 15 active rooms.</h3>
                                    <img className="flex-image" src={lobby2} alt="Lobby"/>
                            </div>
                        </div>

                        <div className='flex-column'>
                            <div className="flex-box">
                                <h3 className='has-text-white m-2' > This hotel also features complimentary wireless internet access.</h3>
                                    <img className="flex-image" src={parking} alt="Parking Lot" />
                            </div>
                            <div className="flex-box">
                                <h3 className='has-text-white m-2'>Has a Relaxing Garden.</h3>
                                    <img className="flex-image" src={outside} alt="Outside Terrance" />
                            </div>
                        </div>

                        <div className="flex-box">
                                <h3 className='has-text-white m-2'>Enjoy a satisfying meal at Captain's Galley and outdoor pool.</h3>
                                <img className="flex-image-bottom" src={pool} alt="Pool on 3rd floor" />
                        </div>

                    </div>
                </div>
            </div>
 
      </section>
    );
  }
  
  export default AboutUs;
