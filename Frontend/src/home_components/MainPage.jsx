import InputSqueal from './InputSquealComponents/InputSqueal'; // Importa il componente InputSqueel
import Squeels from './Squeels'; // Importa il componente per visualizzare i messaggi
import React, {useState} from "react";
import {Button, Card} from "react-bootstrap";
import './Profile_style.css';

const MainPage = () => {
  const [showInputSqueal, setShowInputSqueal] = useState(false);

  return (
    <div className="container">
      <div className="d-flex justify-content-center align-items-center">
        <Button variant="primary" onClick={() => setShowInputSqueal(true)}>
          Nuovo Squeal
        </Button>
      </div>

      {showInputSqueal && (
        <div className="row justify-content-center mt-3">
          <div className="col-md-4">
            <Card>
              <Card.Body>
                <InputSqueal />
              </Card.Body>
            </Card>
          </div>
        </div>
      )}
      < Squeels />
    </div>
  );
};

export default MainPage;