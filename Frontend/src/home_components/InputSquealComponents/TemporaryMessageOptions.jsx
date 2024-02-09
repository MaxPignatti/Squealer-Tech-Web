import React from "react";
import { Button, Form } from "react-bootstrap";
import PropTypes from "prop-types";

const TemporaryMessageOptions = ({
	isTemp,
	toggleTemp,
	updateInterval,
	handleUpdateIntervalChange,
	maxSendCount,
	handleMaxSendCountChange,
}) => (
	<div>
		<Button
			variant="info"
			onClick={toggleTemp}
			className="mb-2"
		>
			{isTemp ? "Annulla" : "Messaggio Multiplo"}
		</Button>
		{isTemp && (
			<Form>
				<Form.Group>
					<Form.Control
						type="number"
						className="mb-2"
						value={updateInterval}
						onChange={handleUpdateIntervalChange}
						placeholder="Intervallo Update (minuti)"
					/>
				</Form.Group>
				<Form.Group>
					<Form.Control
						type="number"
						className="mb-2"
						value={maxSendCount}
						onChange={handleMaxSendCountChange}
						placeholder="Max Send Count"
					/>
				</Form.Group>
			</Form>
		)}
	</div>
);

TemporaryMessageOptions.propTypes = {
	isTemp: PropTypes.bool.isRequired,
	toggleTemp: PropTypes.func.isRequired,
	updateInterval: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
		.isRequired,
	handleUpdateIntervalChange: PropTypes.func.isRequired,
	maxSendCount: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
		.isRequired,
	handleMaxSendCountChange: PropTypes.func.isRequired,
};

export default TemporaryMessageOptions;
