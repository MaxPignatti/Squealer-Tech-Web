import { Card } from "react-bootstrap";
const CharCounter = ({
	dailyCharacters,
	weeklyCharacters,
	monthlyCharacters,
}) => (
	<Card className="text-right mt-2">
		<Card.Body>
			<b>Caratteri rimanenti</b>
			<ul>
				<li>Oggi: {dailyCharacters} </li>
				<li>Questa settimana: {weeklyCharacters}</li>
				<li>Questo mese: {monthlyCharacters}</li>
			</ul>
		</Card.Body>
	</Card>
);

export default CharCounter;
