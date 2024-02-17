import React, { useState, useEffect } from 'react';
import {
	Container,
	Row,
	Col,
	Form,
	Button,
	ButtonGroup,
} from 'react-bootstrap';
import { useAuth } from '../AuthContext';
import { Navigate, useLocation } from 'react-router-dom';
import Squeals from './Squeals';

const Ricerca = () => {
	const { isAuthenticated } = useAuth();
	const location = useLocation();
	const [searchCriteria, setSearchCriteria] = useState('user');
	const [tempSearchText, setTempSearchText] = useState('');
	const [searchType, setSearchType] = useState('user');
	const [searchText, setSearchText] = useState('');

	useEffect(() => {
		if (!isAuthenticated) {
			return <Navigate to='/login' />;
		}
		const query = new URLSearchParams(location.search);
		const hashtagParam = query.get('getHashtag');
		const userParam = query.get('user');
		const channelParam = query.get('channel');

		if (hashtagParam) {
			setTempSearchText(hashtagParam);
			setSearchCriteria('hashtag');
			setSearchType('hashtag');
			setSearchText(hashtagParam);
		} else if (userParam) {
			setTempSearchText(userParam);
			setSearchCriteria('user');
			setSearchType('user');
			setSearchText(userParam);
		} else if (channelParam) {
			setTempSearchText(channelParam);
			setSearchCriteria('channel');
			setSearchType('channel');
			setSearchText(channelParam);
		}
	}, [location]);

	const handleSearchClick = () => {
		setSearchType(searchCriteria);
		setSearchText(tempSearchText);
	};
	const handleReset = () => {
		setTempSearchText('');
		setSearchText('');
	};

	return (
		<Container>
			<Row className='justify-content-center mt-4'>
				<Col
					xs={12}
					md={8}
				>
					<h1 className='text-center mb-4'>Qui puoi cercare e filtrare i messaggi</h1>
					<Form className='mb-4'>
						<Form.Group as={Row}>
							<Col sm='3'>
								<Form.Control
									as='select'
									value={searchCriteria}
									onChange={(e) => setSearchCriteria(e.target.value)}
									aria-label='Tipo di ricerca'
									id='searchCriteriaSelect' 
								>
									<option value='user'>Utente</option>
									<option value='channel'>Canale</option>
									<option value='hashtag'>Hashtag</option>
									<option value='text'>Testo</option>
								</Form.Control>
							</Col>
							<Col sm='7'>
								<Form.Control
									type='text'
									placeholder={`Cerca per ${searchCriteria}...`}
									value={tempSearchText}
									onChange={(e) => setTempSearchText(e.target.value)}
									aria-label={`Cerca per ${searchCriteria}`}
									id='searchTextInput' 
								/>
							</Col>
							<Col sm={2} className='mt-2 mt-sm-0'>
								<ButtonGroup>
									<Button
										variant='primary'
										onClick={handleSearchClick}
									>
										Cerca
									</Button>
									<Button
										variant='outline-secondary'
										onClick={handleReset}
									>
										Reset
									</Button>
								</ButtonGroup>
							</Col>
						</Form.Group>
					</Form>
					<Squeals
						searchType={searchType}
						searchText={searchText}
					/>
				</Col>
			</Row>
		</Container>
	);
};

export default Ricerca;
