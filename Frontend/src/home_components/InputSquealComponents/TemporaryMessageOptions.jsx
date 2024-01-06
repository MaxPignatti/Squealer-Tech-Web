import { Button } from "react-bootstrap";

const TemporaryMessageOptions = ({
  isTemp,
  toggleTemp,
  updateInterval,
  handleUpdateIntervalChange,
  maxSendCount,
  handleMaxSendCountChange,
}) => (
  <div>
    <Button variant="info" onClick={toggleTemp} className="mb-2">
      {isTemp ? "Annulla Aggiornamento" : "Imposta Aggiornamento"}
    </Button>
    {isTemp && (
      <div>
        <input
          type="number"
          className="form-control mb-2"
          value={updateInterval}
          onChange={handleUpdateIntervalChange}
          placeholder="Intervallo Update (minuti)"
        />
        <input
          type="number"
          className="form-control mb-2"
          value={maxSendCount}
          onChange={handleMaxSendCountChange}
          placeholder="Max Send Count"
        />
      </div>
    )}
  </div>
);

export default TemporaryMessageOptions;
