import React from 'react';
import {
	MapContainer,
	TileLayer,
	Marker,
	Popup,
	Polyline,
} from 'react-leaflet';
import { Icon } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import PropTypes from 'prop-types';

const Maps = ({ position, livePositions = [], isLive = false }) => {
	const customIcon = new Icon({
		iconUrl: 'https://cdn-icons-png.flaticon.com/512/447/447031.png',
		iconSize: [38, 38],
	});

	// Calcola il centro della mappa in base alla posizione iniziale o alle posizioni live
	const center = livePositions.length > 0 ? livePositions[0] : position;

	return (
		<MapContainer
			center={center}
			zoom={14}
			scrollWheelZoom={false}
			style={{ height: '200px', width: '100%' }}
		>
			<TileLayer
				attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
				url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
			/>
			{isLive && livePositions.length > 0 ? (
				<>
					{livePositions.map((pos, index) => (
						<Marker
							key={index}
							position={pos}
							icon={customIcon}
						>
							<Popup>You are here</Popup>
						</Marker>
					))}
					<Polyline
						positions={livePositions}
						color='blue'
					/>
				</>
			) : (
				<Marker
					position={position}
					icon={customIcon}
				>
					<Popup>You are here.</Popup>
				</Marker>
			)}
		</MapContainer>
	);
};

Maps.propTypes = {
	position: PropTypes.arrayOf(PropTypes.number),
	livePositions: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.number)),
	isLive: PropTypes.bool,
};

export default Maps;
