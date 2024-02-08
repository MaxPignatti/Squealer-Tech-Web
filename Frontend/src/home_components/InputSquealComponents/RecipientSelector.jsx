import React from "react";
import { Form, Badge, Alert } from "react-bootstrap";
import PropTypes from "prop-types";
import "./RecipientSelector.css";

const RecipientSelector = ({
  recipientType,
  handleRecipientChange,
  searchTerm,
  handleSearchChange,
  filteredChannels,
  filteredUsers,
  handleUserSelect,
  handleChannelSelect,
  selectedUsers,
  selectedChannels,
  handleRemoveUser,
  handleRemoveChannel,
}) => {
  const isUserSelected = selectedUsers.length > 0;
  const isChannelSelected = selectedChannels.length > 0;

  return (
    <div>
      <Form.Group>
        <Form.Label>
          <h5 style={{ marginBottom: "0" }}>Seleziona il Destinatario:</h5>
        </Form.Label>
        <div>
          <Form.Check
            inline
            label="Utente Singolo"
            type="radio"
            name="recipientType"
            value="user"
            checked={recipientType === "user"}
            onChange={() => handleRecipientChange("user")}
          />
          <Form.Check
            inline
            label="Canale"
            type="radio"
            name="recipientType"
            value="channel"
            checked={recipientType === "channel"}
            onChange={() => handleRecipientChange("channel")}
          />
        </div>
      </Form.Group>
      <Form.Control
        type="text"
        placeholder={
          recipientType === "user" ? "Cerca utente..." : "Cerca canale..."
        }
        value={searchTerm}
        onChange={handleSearchChange}
      />
      <div className="my-2">
        {recipientType === "user" &&
          filteredUsers
            .filter((user) => !selectedUsers.includes(user))
            .map((user) => (
              <span key={user._id}>
                <Badge
                  pill
                  variant={
                    selectedUsers.includes(user) ? "primary" : "secondary"
                  }
                  className="mr-2 clickable"
                  onClick={() => handleUserSelect(user)}
                >
                  {user.username}
                </Badge>
                {!selectedUsers.includes(user) && (
                  <span style={{ marginRight: "8px" }}></span>
                )}
              </span>
            ))}

        {recipientType === "channel" &&
          filteredChannels
            .filter((channel) => !selectedChannels.includes(channel))
            .map((channel, index) => (
              <span key={channel._id}>
                <Badge
                  pill
                  variant={
                    selectedChannels.includes(channel) ? "primary" : "secondary"
                  }
                  className="mr-2 clickable"
                  onClick={() =>
                    selectedChannels.includes(channel)
                      ? handleRemoveChannel(channel._id)
                      : handleChannelSelect(channel)
                  }
                >
                  {channel.name}
                </Badge>
                {!selectedChannels.includes(channel) &&
                  index < filteredChannels.length - 1 && (
                    <span style={{ marginRight: "8px" }}></span>
                  )}
              </span>
            ))}
      </div>
      <div className="my-3">
        {isUserSelected && (
          <div>
            <h5>Utenti Selezionati:</h5>
            <div className="d-flex flex-wrap">
              {selectedUsers.map((user, index) => (
                <span key={user._id}>
                  <Badge
                    pill
                    variant="primary"
                    className="mr-2 mb-2 clickable"
                    onClick={() => handleUserSelect(user)}
                  >
                    {user.username}
                    <button
                      className="ml-2 btn-link p-0 border-0 bg-transparent"
                      onClick={() => handleRemoveUser(user._id)}
                      style={{ color: "red", cursor: "pointer" }}
                      aria-label="Remove user"
                    >
                      &#x2716;
                    </button>
                  </Badge>
                  <span style={{ marginRight: "8px" }}></span>
                </span>
              ))}
            </div>
          </div>
        )}
        {isChannelSelected && (
          <div>
            <h5>Canali Selezionati:</h5>
            <div className="d-flex flex-wrap">
              {selectedChannels.map((channel, index) => (
                <span key={channel._id}>
                  <Badge
                    pill
                    variant="primary"
                    className="mr-2 mb-2 clickable"
                    onClick={() => handleRemoveChannel(channel._id)}
                  >
                    {channel.name}
                    <button
                      className="ml-2 btn-link p-0 border-0 bg-transparent"
                      onClick={() => handleRemoveChannel(channel._id)}
                      style={{ color: "red", cursor: "pointer" }}
                      aria-label="Remove channel"
                    >
                      &#x2716;
                    </button>
                  </Badge>
                  <span style={{ marginRight: "8px" }}></span>
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {!isUserSelected && !isChannelSelected && (
        <Alert variant="info">
          Seleziona utenti o canali dalla lista sopra.
        </Alert>
      )}
    </div>
  );
};

RecipientSelector.propTypes = {
  recipientType: PropTypes.string.isRequired,
  handleRecipientChange: PropTypes.func.isRequired,
  searchTerm: PropTypes.string.isRequired,
  handleSearchChange: PropTypes.func.isRequired,
  filteredChannels: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
    })
  ).isRequired,
  filteredUsers: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string.isRequired,
      username: PropTypes.string.isRequired,
    })
  ).isRequired,
  handleUserSelect: PropTypes.func.isRequired,
  handleChannelSelect: PropTypes.func.isRequired,
  selectedUsers: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string.isRequired,
      username: PropTypes.string.isRequired,
    })
  ).isRequired,
  selectedChannels: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
    })
  ).isRequired,
  handleRemoveUser: PropTypes.func.isRequired,
  handleRemoveChannel: PropTypes.func.isRequired,
};

export default RecipientSelector;
