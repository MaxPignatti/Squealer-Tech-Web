import React, { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Polyline } from "react-leaflet";
import { Icon } from "leaflet";
import "leaflet/dist/leaflet.css";
import PropTypes from "prop-types";
import { BASE_URL } from "../config";

const Maps = ({
  position,
  livePositions,
  isLive = false,
  message,
  currentUser,
}) => {
  const customIcon = new Icon({
    iconUrl: "https://cdn-icons-png.flaticon.com/512/447/447031.png",
    iconSize: [38, 38],
  });

  useEffect(() => {
    let interval;
    if (isLive && currentUser === message.user && message.maxSendCount > 0) {
      interval = setInterval(() => {
        if (message.maxSendCount > 0) {
          sendLivePositionToBackend(message._id);
        } else {
          clearInterval(interval);
        }
      }, 20000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isLive, currentUser, message]);

  const center =
    livePositions.length > 0 ? livePositions[0].coordinates : position;

  const sendLivePositionToBackend = async (messageId) => {
    try {
      const currentPosition = await getCurrentPosition();

      if (currentPosition) {
        const { latitude, longitude } = currentPosition.coords;

        const response = await fetch(
          `${BASE_URL}/messages/${messageId}/position`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ position: [latitude, longitude] }),
          }
        );

        if (!response.ok) {
          console.error("Failed to update live position on the backend");
        }
      } else {
        console.error("User position not available");
      }
    } catch (error) {
      console.error("Error sending live position to backend:", error);
    }
  };

  const getCurrentPosition = () => {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject);
    });
  };

  return (
    <MapContainer
      center={center}
      zoom={14}
      scrollWheelZoom={false}
      style={{ height: "200px", width: "100%" }}
    >
      <TileLayer
        attribution="&copy; contributors"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {isLive && livePositions.length > 0 ? (
        <>
          {livePositions.map((geoPoint, index) => (
            <Marker
              key={`${geoPoint.coordinates[0]}-${geoPoint.coordinates[1]}`}
              position={geoPoint.coordinates}
              icon={customIcon}
            />
          ))}
          <Polyline
            positions={livePositions.map((geoPoint) => geoPoint.coordinates)}
            color="blue"
          />
        </>
      ) : (
        <Marker position={position} icon={customIcon} />
      )}
    </MapContainer>
  );
};

Maps.propTypes = {
  position: PropTypes.arrayOf(PropTypes.number).isRequired,
  livePositions: PropTypes.arrayOf(
    PropTypes.shape({
      coordinates: PropTypes.arrayOf(PropTypes.number).isRequired,
    })
  ).isRequired,
  isLive: PropTypes.bool,
  message: PropTypes.shape({
    user: PropTypes.string.isRequired,
    maxSendCount: PropTypes.number,
    _id: PropTypes.string.isRequired,
  }).isRequired,
  currentUser: PropTypes.string.isRequired,
};

export default Maps;
