import React from "react";
import { Button } from "react-bootstrap";

const PublishButton = ({ handlePublish }) => (
	<Button
		variant="success"
		onClick={handlePublish}
		className="mt-2"
	>
		Pubblica
	</Button>
);

export default PublishButton;
