import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Card, Container, Row, Col, Button } from "react-bootstrap";

const UserMention = () => {
	const [searchParams] = useSearchParams();
	const username = searchParams.get("user");
	const [userData, setUserData] = useState({});
	const navigate = useNavigate();

	useEffect(() => {
		fetch(`http://localhost:3500/usr/${username}`)
			.then((response) => response.json())
			.then((data) => setUserData(data))
			.catch((error) => console.error("Error fetching user data:", error));
	}, [username]);

	const handleSearchRedirect = () => {
		navigate(`/ricerca?user=${username}`);
	};

	return (
		<Container>
			<Row className="justify-content-center mt-5">
				<Col
					xs={12}
					md={8}
					lg={6}
				>
					<Card>
						<Card.Body>
							<div>
								<img
									src={`${userData.profileImage}`}
									alt="Profile"
									style={{ maxWidth: "20%" }}
								/>
							</div>
							<div>
								<p>First Name: {userData.firstName}</p>
								<p>Last Name: {userData.lastName}</p>
								<p>Username: {userData.username}</p>
								<p>Email: {userData.email}</p>
							</div>
							<Button
								variant="primary"
								onClick={handleSearchRedirect}
							>
								Vedi Post di {username}
							</Button>
						</Card.Body>
					</Card>
				</Col>
			</Row>
		</Container>
	);
};

export default UserMention;
