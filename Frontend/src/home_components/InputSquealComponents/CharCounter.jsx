import { Card } from 'react-bootstrap';
import PropTypes from 'prop-types';

const CharCounter = ({
	dailyCharacters,
	weeklyCharacters,
	monthlyCharacters,
}) => (
	<Card className='text-right mt-2'>
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

CharCounter.propTypes = {
	dailyCharacters: PropTypes.number.isRequired,
	weeklyCharacters: PropTypes.number.isRequired,
	monthlyCharacters: PropTypes.number.isRequired,
};

export default CharCounter;
