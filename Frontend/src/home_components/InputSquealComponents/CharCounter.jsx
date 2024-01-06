const CharCounter = ({
  dailyCharacters,
  weeklyCharacters,
  monthlyCharacters,
}) => (
  <div className="text-right mt-2">
    <b>Caratteri rimanenti</b> <br />
    <ul>
      <li>Oggi: {dailyCharacters} </li>
      <li>Questa settimana: {weeklyCharacters}</li>
      <li>Questo mese: {monthlyCharacters}</li>
    </ul>
  </div>
);

export default CharCounter;
