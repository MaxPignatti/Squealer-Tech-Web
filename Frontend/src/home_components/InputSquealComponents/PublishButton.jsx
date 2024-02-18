import React from "react";
import PropTypes from "prop-types";

import { Button } from "react-bootstrap";

const PublishButton = ({ handlePublish }) => {
	return (
		<Button
			variant='success'
			onClick={handlePublish}
			className='mt-2'
		>
			Pubblica
		</Button>
	);
};

PublishButton.propTypes = {
	handlePublish: PropTypes.func.isRequired,
};

export default PublishButton;
