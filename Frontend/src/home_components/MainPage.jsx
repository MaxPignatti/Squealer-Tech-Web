import InputSqueal from "./InputSquealComponents/InputSqueal";
import Squeals from "./Squeals";
import React, { useState } from "react";
import { Button, Card, Row, Col, Container } from "react-bootstrap";
import "./Profile_style.css";

const MainPage = () => {
  const [showInputSqueal, setShowInputSqueal] = useState(false);

  return (
    <Container>
      <Row className="justify-content-center align-items-center">
        <Col xs={12} md={8} lg={6}>
          <Button
            variant={showInputSqueal ? "light" : "primary"}
            onClick={() => setShowInputSqueal(!showInputSqueal)}
            style={{
              color: showInputSqueal ? "blue" : "white",
              backgroundColor: showInputSqueal ? "white" : "blue",
              border: showInputSqueal ? "1px solid blue" : "none",
            }}
          >
            {showInputSqueal ? "Annulla" : "Nuovo Squeal"}
          </Button>
        </Col>
      </Row>

      {showInputSqueal && (
        <Row className="justify-content-center align-items-center mt-3">
          <Col xs={12} md={8} lg={6}>
            <Card className="shadow">
              <Card.Body>
                <InputSqueal />
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}
      <Squeals />
    </Container>
  );
};

export default MainPage;
