import { Button } from 'react-bootstrap';
const PublishButton = ({ handlePublish }) => (
    <Button variant="success" onClick={handlePublish}>
      Pubblica
    </Button>
  );

export default PublishButton;  