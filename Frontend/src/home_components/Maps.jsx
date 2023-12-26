import React, { useState, useEffect, useRef  } from 'react';
import {MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Icon } from 'leaflet';
import "leaflet/dist/leaflet.css";

const Maps = ({position}) => {

    const [currentPosition, setCurrentPosition] = useState(position);    

    
    const customIcon = new Icon({
        iconUrl: "https://cdn-icons-png.flaticon.com/512/447/447031.png",
        iconSize: [38, 38],
    });

    useEffect(() => {
        // Aggiorna la posizione corrente quando la prop 'position' cambia
        setCurrentPosition(position);
    
        // Usa flyTo per spostare la mappa alla nuova posizione con animazione
        if (mapRef.current) {
          mapRef.current.flyTo(position, 14, {
            duration: 1.5, // durata dell'animazione in secondi
          });
        }
      }, [position]);
    
    const [markers, setMarkers] = useState([]);

    useEffect(() => {
        // Aggiungi un nuovo marker ogni volta che la posizione cambia
        setMarkers((prevMarkers) => [
        ...prevMarkers,
        <Marker key={position.toString()} position={position} icon={customIcon}>
            <Popup>
            You are Here.
            </Popup>
        </Marker>,
        ]);
    }, [position]);
    
    const mapRef = useRef(null);
    return (
        <MapContainer
          ref={mapRef}
          center={currentPosition}
          zoom={14}
          scrollWheelZoom={false}
          style={{ height: '200px' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {markers}
        </MapContainer>
      );
    };

export default Maps;
