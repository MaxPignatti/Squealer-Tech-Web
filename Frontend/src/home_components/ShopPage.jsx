import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, Button, Badge } from "react-bootstrap";
import { useAuth } from "../AuthContext";
import { Navigate } from "react-router-dom";
import Cookies from "js-cookie";

const ShopPage = () => {
	const { isAuthenticated } = useAuth();
	const [selectedQuantity, setSelectedQuantity] = useState(null);
	const [username, setUsername] = useState(null);

	if (!isAuthenticated) {
		return <Navigate to="/login" />;
	}

	useEffect(() => {
		const userDataCookie = Cookies.get("user_data");
		if (userDataCookie) {
			const userData = JSON.parse(userDataCookie);
			const userUsername = userData.username;
			setUsername(userUsername);
		}
	}, []);

	const remCharOptions = [
		{ quantity: 50, price: 5, discount: 0 },
		{ quantity: 100, price: 10, discount: 5 },
		{ quantity: 200, price: 20, discount: 10 },
		{ quantity: 500, price: 50, discount: 15 },
	];

	const handleQuantitySelection = (quantity) => {
		setSelectedQuantity(quantity);
	};

	const calculateDiscountedPrice = (price, discount) => {
		return (price - (price * discount) / 100).toFixed(2);
	};

	const handleConfirmPurchase = async () => {
		try {
			if (username && selectedQuantity !== null) {
				// Include username in the API request
				const data = { username, quantity: selectedQuantity };
				const requestOptions = {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify(data),
				};

				const response = await fetch(
					"http://localhost:3500/purchase",
					requestOptions
				);

				if (response.status === 200) {
					const result = await response.json();
					console.log("Purchase successful:", result);
					// Reset selectedQuantity after the purchase is confirmed
					setSelectedQuantity(null);
				} else {
					const data = await response.json();
					console.error("Error in purchase:", data.error);
				}
			} else {
				console.error("Username or selected quantity is missing.");
			}
		} catch (error) {
			console.error("Error in purchase:", error);
		}
	};

	return (
		<Container>
			<Row className="justify-content-center mt-5">
				<Col md={6}>
					<Card>
						<Card.Body>
							<h2 className="text-center mb-4">Shop Page</h2>
							<p className="text-center">Buy chars and enhance your profile!</p>

							<Row className="justify-content-center">
								{remCharOptions.map((option) => (
									<Col
										key={option.quantity}
										md={12}
										className="mb-2"
									>
										<Button
											variant="primary"
											style={{ width: "100%" }}
											onClick={() => handleQuantitySelection(option.quantity)}
											disabled={selectedQuantity === option.quantity}
										>
											<div className="d-flex justify-content-between align-items-center">
												<span>{`Buy ${option.quantity} chars`}</span>
												<Badge
													pill
													variant="success"
												>
													{option.discount > 0 && `-${option.discount}%`}
												</Badge>
											</div>
											<div className="mt-1">
												<strong>
													$
													{calculateDiscountedPrice(
														option.price,
														option.discount
													)}
												</strong>
											</div>
										</Button>
									</Col>
								))}
							</Row>
							<Row>
								{selectedQuantity && (
									<div className="text-center mt-3">
										<p>Selected Quantity: {selectedQuantity} chars</p>
										<Button
											variant="success"
											onClick={handleConfirmPurchase}
										>
											Confirm Purchase
										</Button>
									</div>
								)}
							</Row>
						</Card.Body>
					</Card>
				</Col>
			</Row>
		</Container>
	);
};

export default ShopPage;
