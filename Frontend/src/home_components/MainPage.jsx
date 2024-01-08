import InputSqueal from "./InputSquealComponents/InputSqueal";
import Squeals from "./Squeals";
import React, { useState } from "react";
import { Button, Card } from "react-bootstrap";
import "./Profile_style.css";
import { Row, Col, Container } from "react-bootstrap";

const MainPage = () => {
	const [showInputSqueal, setShowInputSqueal] = useState(false);

	return (
		<Container>
			<Row className="justify-content-center align-items-center">
				<Col
					xs={12}
					md={8}
					lg={6}
				>
					<Button
						variant="primary"
						onClick={() => setShowInputSqueal(!showInputSqueal)}
					>
						Nuovo Squeal
					</Button>
				</Col>
			</Row>

			{showInputSqueal && (
				<Row className="justify-content-center align-items-center">
					<Col
						xs={12}
						md={8}
						lg={6}
					>
						<Card>
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
