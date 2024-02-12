import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, Container, Row, Col, Button, Image } from 'react-bootstrap';

const UserMention = () => {
	const [searchParams] = useSearchParams();
	const username = searchParams.get('user');
	const [userData, setUserData] = useState({});
	const navigate = useNavigate();

	useEffect(() => {
		fetch(`http://localhost:3500/usr/${username}`)
			.then((response) => response.json())
			.then((data) => setUserData(data))
			.catch((error) => console.error('Error fetching user data:', error));
	}, [username]);

	const handleSearchRedirect = () => {
		navigate(`/ricerca?user=${username}`);
	};

	return (
		<Container>
			<Row className='justify-content-center mt-5'>
				<Col
					xs={12}
					md={8}
					lg={6}
				>
					<Card className='text-center'>
						<Card.Body>
							<Image
								src={`${userData.profileImage || 'defaultProfileImage.png'}`}
								alt={`${userData.username}'s profile`}
								roundedCircle
								style={{ maxWidth: '20%', margin: '0 auto' }}
							/>
							<Card.Text>
								<strong>First Name:</strong> {userData.firstName}
							</Card.Text>
							<Card.Text>
								<strong>Last Name:</strong> {userData.lastName}
							</Card.Text>
							<Card.Text>
								<strong>Username:</strong> {userData.username}
							</Card.Text>
							<Card.Text>
								<strong>Email:</strong> {userData.email}
							</Card.Text>
							<Button
								variant='primary'
								onClick={handleSearchRedirect}
								aria-label={`Vedi post di ${username}`}
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
