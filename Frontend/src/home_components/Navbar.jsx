import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
	faUser,
	faBars,
	faXmark,
	faMagnifyingGlass,
	faCheckCircle,
	faTv,
	faShoppingBag,
} from "@fortawesome/free-solid-svg-icons";
import { Link, NavLink } from "react-router-dom";
import "./Navbar.css";
import { Navbar, Nav, Container } from "react-bootstrap";

const CustomNavbar = () => {
	const [verticalNavbarOpen, setVerticalNavbarOpen] = useState(false);
	const toggleNavbar = () => {
		setVerticalNavbarOpen(!verticalNavbarOpen);
	};

	return (
		<Navbar
			bg='white'
			variant='light'
			expand='lg'
			sticky='top'
		>
			<Container>
				<Navbar.Brand
					as={Link}
					to='/'
				>
					<img
						src='pic/logo.png'
						alt='Logo'
						className='logo'
					/>
				</Navbar.Brand>
				<Navbar.Toggle
					aria-controls='basic-navbar-nav'
					onClick={toggleNavbar}
				>
					<FontAwesomeIcon
						icon={verticalNavbarOpen ? faXmark : faBars}
						id='symbol'
					/>
				</Navbar.Toggle>
				<Navbar.Collapse id='basic-navbar-nav'>
					<Nav className='ml-auto'>
						<Nav.Link
							as={NavLink}
							to='/Profile'
							className='nav-link'
						>
							<FontAwesomeIcon
								icon={faUser}
								className='profile-icon'
							/>{" "}
							<span className='nav-text'>Profile</span>
						</Nav.Link>
						<Nav.Link
							as={NavLink}
							to='/Channels'
							className='nav-link'
						>
							<FontAwesomeIcon icon={faTv} />{" "}
							<span className='nav-text'>Canali</span>
						</Nav.Link>
						<Nav.Link
							as={NavLink}
							to='/Shop'
							className='nav-link'
						>
							<FontAwesomeIcon icon={faShoppingBag} />{" "}
							<span className='nav-text'>Shop</span>
						</Nav.Link>
						<Nav.Link
							as={NavLink}
							to='/Ricerca'
							className='nav-link'
						>
							<FontAwesomeIcon icon={faMagnifyingGlass} />{" "}
							<span className='nav-text'>Ricerca</span>
						</Nav.Link>
						<Nav.Link
							as={NavLink}
							to='/Pro'
							className='nav-link'
						>
							<FontAwesomeIcon icon={faCheckCircle} />{" "}
							<span className='nav-text'>Richiedi il Pro!</span>
						</Nav.Link>
					</Nav>
				</Navbar.Collapse>
			</Container>
		</Navbar>
	);
};

export default CustomNavbar;
