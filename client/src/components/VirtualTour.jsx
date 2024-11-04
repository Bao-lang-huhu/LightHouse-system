import React, { useState, useEffect, Suspense } from 'react';
import axios from 'axios';
import { Canvas, useThree, useLoader } from '@react-three/fiber';
import { OrbitControls, Environment, Html } from '@react-three/drei';
import { TextureLoader , Color, AdditiveBlending, MeshStandardMaterial} from 'three';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import * as THREE from 'three';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { IoSettingsOutline, IoHomeOutline, IoBulbOutline } from 'react-icons/io5'; 
import { ClipLoader } from 'react-spinners';


import room1 from '../images/lighthouse1.jpg';
import phoneObj from '../images/textures/phone.obj'; 
import phoneTexture from '../images/textures/phoneTexture.jpg'; 
import wifiObj from '../images/textures/wifi.obj';
import frontTexture from '../images/textures/1front.png';
import backTexture from '../images/textures/2qss.png';
import qssTexture from '../images/textures/3back.png';
import bagObj from '../images/textures/bag.obj';
import bagTexture from '../images/textures/bagText.jpg';


const RoomTexture = ({ texturePath }) => {
  const texture = useLoader(TextureLoader, texturePath);
  texture.wrapS = THREE.RepeatWrapping;
  texture.repeat.x = -1; 
  return (
    <mesh>
      <sphereGeometry args={[5, 100, 100]} />
      <meshBasicMaterial map={texture} side={THREE.DoubleSide} />
    </mesh>
  );
};



const WiFiModel = ({ position, infoText, scale = [0.009, 0.009, 0.009] }) => {
  const obj = useLoader(OBJLoader, wifiObj);
  const front = useLoader(TextureLoader, frontTexture);
  const back = useLoader(TextureLoader, backTexture);
  const qss = useLoader(TextureLoader, qssTexture);
  const [showInfo, setShowInfo] = useState(false);

  useEffect(() => {
    obj.traverse((child) => {
      if (child.isMesh) {
        if (child.name.includes('Front')) {
          child.material = new THREE.MeshStandardMaterial({ map: front });
        } else if (child.name.includes('Back')) {
          child.material = new THREE.MeshStandardMaterial({ map: back });
        } else {
          child.material = new THREE.MeshStandardMaterial({ map: qss });
        }
        child.material.needsUpdate = true;
      }
    });
  }, [obj, front, back, qss]);

  const handleClick = () => {
    setShowInfo(!showInfo);
  };

  return (
    <group position={position}>
      {/* Main WiFi object */}
      <primitive object={obj} scale={scale} onClick={handleClick} />

      {/* Glow effect */}
      <mesh scale={scale.map((s) => s * 1.5)} position={[0, 0, 0]}>
        <sphereGeometry args={[80, 32, 32]} />
        <meshBasicMaterial
          color={new Color('#1976d2')}
          blending={AdditiveBlending}
          transparent={true}
          opacity={0.2}
        />
      </mesh>

      {/* Info text */}
      {showInfo && (
        <Html position={position}>
          <div style={{
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            color: 'white',
            padding: '10px',
            borderRadius: '5px',
            maxWidth: '180px',
          }}>
            <p>{infoText}</p>
          </div>
        </Html>
      )}
    </group>
  );
};


const BagModel = ({ position, infoText, texturePath, scale = [0.03, 0.06, 0.03], rotation = [0, 0, 0] }) => {
  const obj = useLoader(OBJLoader, bagObj);
  const texture = useLoader(TextureLoader, texturePath || bagTexture);
  const [showInfo, setShowInfo] = useState(false);

  useEffect(() => {
    obj.traverse((child) => {
      if (child.isMesh) {
        child.material = new THREE.MeshStandardMaterial({ map: texture });
        child.material.needsUpdate = true;
      }
    });
  }, [obj, texture]);

  const handleClick = () => {
    setShowInfo(!showInfo);
  };

  return (
    <group position={position}>
      {/* Main object */}
      <primitive
        object={obj}
        scale={scale}
        rotation={rotation.map(THREE.MathUtils.degToRad)}
        onClick={handleClick}
      />

      {/* Glow effect as a surrounding transparent ring */}
      <mesh scale={scale.map((s) => s * 1.5)} position={[0, 0, 0]}>
        <sphereGeometry args={[25, 32, 32]} /> {/* Adjusted radius */}
        <meshBasicMaterial
          color={new THREE.Color('#1976d2')}
          blending={THREE.AdditiveBlending}
          transparent={true}
          opacity={0.2} // Adjust opacity to control glow intensity
        />
      </mesh>

      {/* Info text */}
      {showInfo && (
        <Html position={[0, 0.5, 0]}>
          <div style={{
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            color: 'white',
            padding: '10px',
            borderRadius: '5px',
            width: '190px'
          }}>
            <p>{infoText}</p>
          </div>
        </Html>
      )}
    </group>
  );
};


const HighlightedModel = ({ position, infoText, texturePath, objPath, scale = [0.03, 0.03, 0.03], rotation = [0, 0, 0] }) => {
  const obj = useLoader(OBJLoader, objPath);
  const texture = useLoader(TextureLoader, texturePath);
  const [showInfo, setShowInfo] = useState(false);

  useEffect(() => {
    obj.traverse((child) => {
      if (child.isMesh) {
        child.material = new THREE.MeshStandardMaterial({ map: texture });
        child.material.needsUpdate = true;
      }
    });
  }, [obj, texture]);

  const handleClick = () => {
    setShowInfo(!showInfo);
  };

  return (
    <group position={position}>
      {/* Main object */}
      <primitive
        object={obj}
        scale={scale}
        rotation={rotation.map(THREE.MathUtils.degToRad)}
        onClick={handleClick}
      />

      {/* Glow effect as a transparent surrounding sphere */}
    <mesh scale={scale.map((s) => s * 1.5)} position={[0, 0, 0]}>
      <sphereGeometry args={[11, 32, 32]} /> {/* Increase the radius to 1.5 */}
      <meshBasicMaterial
        color={new Color('#1976d2')}
        blending={AdditiveBlending}
        transparent={true}
        opacity={0.3}
      />
    </mesh>


      {/* Info text */}
      {showInfo && (
        <Html position={position}>
          <div style={{
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            color: 'white',
            padding: '10px',
            borderRadius: '5px',
            maxWidth: '150px'
          }}>
            <p>{infoText}</p>
          </div>
        </Html>
      )}
    </group>
  );
};


const CameraControls = () => {
  const { camera } = useThree();
  const moveSpeed = 0.1;

  const handleKeyDown = (event) => {
    switch (event.key) {
      case 'ArrowUp':
        camera.rotation.x -= moveSpeed;
        break;
      case 'ArrowDown':
        camera.rotation.x += moveSpeed;
        break;
      case 'ArrowLeft':
        camera.rotation.y += moveSpeed;
        break;
      case 'ArrowRight':
        camera.rotation.y -= moveSpeed;
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return null;
};

const ZoomComponent = ({ zoomEnabled }) => {
  useEffect(() => {
    document.body.style.cursor = zoomEnabled ? 'zoom-in' : 'default';
    return () => {
      document.body.style.cursor = 'default';
    };
  }, [zoomEnabled]);

  return null;
};

const VirtualTour = () => {
  const [isSupported, setIsSupported] = useState(true);
  const [roomTypes, setRoomTypes] = useState({});
  const [selectedRoomType, setSelectedRoomType] = useState('');
  const [selectedRoomTour, setSelectedRoomTour] = useState(null);
  const [autoRotate, setAutoRotate] = useState(true);
  const [zoomEnabled, setZoomEnabled] = useState(false);
  const [descriptionVisible, setDescriptionVisible] = useState(false);
  const [showARWidgets, setShowARWidgets] = useState(true);
  const [settingsAnchorEl, setSettingsAnchorEl] = useState(null);
  const [roomsAnchorEl, setRoomsAnchorEl] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for WebGL and Worker support
    const isWebGLAvailable = () => {
        try {
            const canvas = document.createElement('canvas');
            return !!window.WebGLRenderingContext && !!canvas.getContext('webgl');
        } catch (e) {
            return false;
        }
    };

    const isWorkerSupported = () => !!window.Worker;

    // Set support status
    if (!isWebGLAvailable() || !isWorkerSupported()) {
        setIsSupported(false);
        setLoading(false); // Stop loading spinner if unsupported
    } else {
        setLoading(false); // Stop loading if supported, continue fetching
    }
}, []);

  useEffect(() => {
    const fetchTours = async () => {
      try {
        const response = await axios.get('https://light-house-system-h74t-server.vercel.app/api/getTours');
        setRoomTypes(response.data);
      } catch (error) {
        console.error('Error fetching room types:', error);
      } finally {
        setLoading(false); 
      }
    };
    fetchTours();
  }, []);

  const handleSettingsMenuOpen = (event) => {
    setSettingsAnchorEl(event.currentTarget);
  };

  const handleSettingsMenuClose = () => {
    setSettingsAnchorEl(null);
  };

  const handleRoomsMenuOpen = (event) => {
    setRoomsAnchorEl(event.currentTarget);
  };

  const handleRoomsMenuClose = () => {
    setRoomsAnchorEl(null);
  };


  const toggleAutoRotate = () => {
    setAutoRotate(!autoRotate);
  };

  const toggleZoom = () => {
    setZoomEnabled(!zoomEnabled);
  };

  const toggleDescription = () => {
    setDescriptionVisible(!descriptionVisible);
  };

  const toggleARWidgets = () => {
    setShowARWidgets(!showARWidgets);
    handleSettingsMenuClose();
  };


  const handleRoomTypeSelect = (roomTypeName) => {
    setSelectedRoomType(roomTypeName);
    const selectedTour = roomTypes[roomTypeName] ? roomTypes[roomTypeName][0] : null;
    setSelectedRoomTour(selectedTour);
    handleRoomsMenuClose();
  };

  if (!isSupported) {
    return (
      <div className='section-p1 section-m1'>
        <div style={{ textAlign: 'center', padding: '20px', backgroundColor: 'rgba(255, 0, 0, 0.1)' }}>
            <h2>Browser Not Supported</h2>
            <p>Your browser does not support the virtual tour. Please try a different browser that supports WebGL and Worker features.</p>
        </div></div>
    );
}

  return (
    <section>
      <div style={{ margin: '20px' }}>  
          {loading ? (
        <div className="loader-container" style={{ display: 'flex', justifyContent: 'center', marginTop: '50px' }}>
          <ClipLoader color="#007bff" size={50} />
        </div>
      ) : ( <>
    <div style={{ height: '90vh', display: 'flex', flexDirection: 'column' }}>
      {/* Right side 3D Virtual Tour */}
      <div style={{ flex: 1, position: 'relative' }}>
        <Canvas>
          <Suspense fallback={null}>
            {selectedRoomTour ? (
              <RoomTexture texturePath={selectedRoomTour.vt_photo_url} />
            ) : (
              <RoomTexture texturePath={room1} />
            )}
            {showARWidgets && selectedRoomTour && (
              <>
                <HighlightedModel
                  position={[2, 0, 4]} 
                  infoText="Phone No: Front Desk - 09551850136 - 234-345-453 "
                  texturePath={phoneTexture} 
                  rotation={[180, 0 ,  180]} 
                  objPath={phoneObj}
                />
                <WiFiModel
                  position={[-2, 1, -4]}
                  infoText="Wi-Fi Password:(Room Number) +(Voucher) eg.101ABCDEFGF"
                  objPath={wifiObj}
                />
                 <BagModel
                  position={[0, -3, -1]}
                  infoText="Baggage Check-In: 2:00 P.M. Check-Out: 12:00 P.M."
                  rotation={[-90, 0 , 0]}

                />
              </>
              
              
            )}
            <OrbitControls
              enableZoom={zoomEnabled}
              autoRotate={autoRotate}
              minDistance={1}
              maxDistance={4}
              maxPolarAngle={Math.PI} // Limits upward rotation
              minPolarAngle={0} // Prevents flipping upside down
              enablePan={false} 
            />
            <Environment preset="sunset" />
          </Suspense>
          <CameraControls />
        </Canvas>

        <ZoomComponent zoomEnabled={zoomEnabled} />

        {/* Settings Menu Button */}
        <div style={{ position: 'absolute', top: 20, right: 20 }}>
          <IconButton onClick={handleSettingsMenuOpen} className='button' style={{backgroundColor: 'rgba(255,255,255,0.9)',  borderRadius: '4px', padding: '4px 4px'}}>
            <IoSettingsOutline size={24} className='mr-2' /> Settings
          </IconButton>
          <Menu
            anchorEl={settingsAnchorEl}
            open={Boolean(settingsAnchorEl)}
            onClose={handleSettingsMenuClose}
          >
            <MenuItem onClick={toggleAutoRotate}>
              {autoRotate ? 'Stop Rotation' : 'Start Rotation'}
            </MenuItem>
            <MenuItem onClick={toggleZoom}>
              {zoomEnabled ? 'Disable Zoom' : 'Enable Zoom'}
            </MenuItem>
            <MenuItem onClick={toggleDescription}>
              {descriptionVisible ? 'Hide Description' : 'Show Description'}
            </MenuItem>
            <MenuItem 
              onClick={toggleARWidgets} 
              disabled={!selectedRoomTour} // Disable when `selectedRoomTour` is not set
            >
              {showARWidgets ? 'Hide AR Widgets' : 'Show AR Widgets'}
            </MenuItem>
          </Menu>
        </div>

        {/* Room Selection Menu Button */}
        <div style={{ position: 'absolute', top: 20, left: 20 }}>
          <IconButton onClick={handleRoomsMenuOpen} style={{backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: '4px', padding: '4px 4px'}}>
            <IoHomeOutline size={24} className='mr-2' /> Rooms
          </IconButton>
          <Menu
            anchorEl={roomsAnchorEl}
            open={Boolean(roomsAnchorEl)}
            onClose={handleRoomsMenuClose}
          >
            <MenuItem className='label is-size-5' key="room1" onClick={() => handleRoomTypeSelect('room1')}>
              <IoBulbOutline className='mr-2'/>LightHouse Point Hotel
            </MenuItem>
            <MenuItem className='has-text-black' disabled><strong>Choose a Room</strong></MenuItem>
            {Object.keys(roomTypes).map((roomType) => (
              <MenuItem key={roomType} onClick={() => handleRoomTypeSelect(roomType)}>
                {roomType}
              </MenuItem>
            ))}
          </Menu>
        </div>
      </div>

      {/* Room Description Below the Virtual Tour */}
      {descriptionVisible && selectedRoomTour && (
        <div style={{
          position: 'absolute',
          bottom: 10,
          left: 20,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          color: 'white',
          padding: '15px',
          borderRadius: '10px',
          maxWidth: '400px'
        }}>
          <h3>{selectedRoomTour.ROOM.room_type_name}</h3>
          <p>{selectedRoomTour.vt_description}</p>
        </div>
      )}

      {descriptionVisible  && !selectedRoomTour &&  (
        <div style={{
          position: 'absolute',
          bottom: 10,
          left: 20,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          color: 'white',
          padding: '15px',
          borderRadius: '10px',
          maxWidth: '400px',
        }}>
          <h3>Lighthouse Point Hotel</h3>
          <p>Set in Dumaguete, 700 metres from Escano Beach, Lighthouse Point Hotel offers accommodation with the following: 
            </p>
          <ul className='has-text-white' style={{ listStyleType: 'disc', paddingLeft: '20px' }}>
            <li className='has-text-white'>Garden</li>
            <li className='has-text-white'>Free private parking</li>
            <li className='has-text-white'>Shared lounge and a terrace</li>
            <li className='has-text-white'>Restaurant</li>
            <li className='has-text-white'>Bar</li>
            <li className='has-text-white'>Indoor Pool</li>
            <li className='has-text-white'>Reservation Services: Event, Table and Rooms</li>
            <li className='has-text-white'>The accommodation provides a 24-hour front desk, airport transfers, room service and free WiFi throughout the property.</li>
          </ul>
        </div>
      )}

        
      </div></>
          )}
        </div>
</section>

  );
};

export default VirtualTour;
