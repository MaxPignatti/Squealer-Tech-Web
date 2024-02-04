import React from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { Icon } from "leaflet";
import "leaflet/dist/leaflet.css";
import PropTypes from "prop-types";

const Maps = ({ position }) => {
	const customIcon = new Icon({
		iconUrl: "https://cdn-icons-png.flaticon.com/512/447/447031.png",
		iconSize: [38, 38],
	});
	return (
		<MapContainer
			center={position}
			zoom={14}
			scrollWheelZoom={false}
			style={{ height: "200px", width: "100%" }}
		>
			<TileLayer
				attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
				url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
			/>
			<Marker
				position={position}
				icon={customIcon}
			>
				<Popup>You are Here.</Popup>
			</Marker>
		</MapContainer>
	);
};

Maps.propTypes = {
	position: PropTypes.arrayOf(PropTypes.number).isRequired,
};

export default Maps;
