import React from "react";
import { Button, Form } from "react-bootstrap";

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
			{isTemp ? "Annulla Aggiornamento" : "Imposta Aggiornamento"}
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

export default TemporaryMessageOptions;
