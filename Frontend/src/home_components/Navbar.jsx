import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
	faUser,
	faBars,
	faXmark,
	faMagnifyingGlass,
} from "@fortawesome/free-solid-svg-icons";
import { Link, NavLink } from "react-router-dom";
import "./Navbar.css";
import { Navbar, Nav, Container, NavDropdown } from "react-bootstrap";

const CustomNavbar = () => {
	const [isVerticalNavbarOpen, setVerticalNavbarOpen] = useState(false);

	const toggleNavbar = () => {
		setVerticalNavbarOpen(!isVerticalNavbarOpen);
	};

	return (
		<Navbar
			bg="light"
			expand="lg"
			sticky="top"
		>
			<Container>
				<Navbar.Brand
					as={Link}
					to="/"
				>
					<img
						src="pic/logo.png"
						alt="Logo"
						className="logo"
					/>
				</Navbar.Brand>
				<Navbar.Toggle
					aria-controls="basic-navbar-nav"
					onClick={toggleNavbar}
				>
					<FontAwesomeIcon
						icon={isVerticalNavbarOpen ? faXmark : faBars}
						id="symbol"
					/>
				</Navbar.Toggle>
				<Navbar.Collapse id="basic-navbar-nav">
					<Nav className="ml-auto">
						<Nav.Link
							as={NavLink}
							to="/Profile"
						>
							<FontAwesomeIcon
								icon={faUser}
								className="profile-icon"
							/>
						</Nav.Link>
						<NavDropdown
							title="Menu"
							id="basic-nav-dropdown"
						>
							<NavDropdown.Item
								as={NavLink}
								to="/Channels"
							>
								Canali
							</NavDropdown.Item>
							<NavDropdown.Item
								as={NavLink}
								to="/Assistance"
							>
								Assistenza
							</NavDropdown.Item>
							<NavDropdown.Item
								as={NavLink}
								to="/Shop"
							>
								Shop
							</NavDropdown.Item>
							<NavDropdown.Item
								as={NavLink}
								to="/Ricerca"
							>
								<FontAwesomeIcon icon={faMagnifyingGlass} /> Ricerca
							</NavDropdown.Item>
							<NavDropdown.Item
								as={NavLink}
								to="/Pro"
							>
								<FontAwesomeIcon icon={faMagnifyingGlass} /> Richiedi il Pro!
							</NavDropdown.Item>
						</NavDropdown>
					</Nav>
				</Navbar.Collapse>
			</Container>
		</Navbar>
	);
};

export default CustomNavbar;
