import InputSqueal from "./InputSquealComponents/InputSqueal"; 
import Squeals from "./Squeals"; 
import React, { useState } from "react";
import { Button, Card } from "react-bootstrap";
import "./Profile_style.css";

const MainPage = () => {
  const [showInputSqueal, setShowInputSqueal] = useState(false);

  return (
    <div className="container">
      <div className="d-flex justify-content-center align-items-center">
        <Button
          variant="primary"
          onClick={() => setShowInputSqueal(!showInputSqueal)}
        >
          Nuovo Squeal
        </Button>
      </div>

      {showInputSqueal && (
        <div className="row justify-content-center mt-3">
          <div className="col-md-6">
            <Card>
              <Card.Body>
                <InputSqueal />
              </Card.Body>
            </Card>
          </div>
        </div>
      )}
      <Squeals />
    </div>
  );
};

export default MainPage;
