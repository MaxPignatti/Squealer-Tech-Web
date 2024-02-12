import React from 'react';
import { Button } from 'react-bootstrap';
import PropTypes from 'prop-types';

const PublishButton = ({ handlePublish }) => (
	<Button
		variant='success'
		onClick={handlePublish}
		className='mt-2'
	>
		Pubblica
	</Button>
);

PublishButton.propTypes = {
	handlePublish: PropTypes.func.isRequired,
};

export default PublishButton;
