import React from "react";
import { Form, Button, Badge } from "react-bootstrap";

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
	return (
		<div>
			<Form.Group>
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
					filteredUsers.map((user) => (
						<Badge
							key={user._id}
							pill
							variant="secondary"
							className="mr-2"
						>
							{user.username}
							<Button
								size="sm"
								onClick={() => handleUserSelect(user)}
							>
								+
							</Button>
						</Badge>
					))}
				{recipientType === "channel" &&
					filteredChannels.map((channel) => (
						<Badge
							key={channel._id}
							pill
							variant="secondary"
							className="mr-2"
						>
							{channel.name}
							<Button
								size="sm"
								onClick={() => handleChannelSelect(channel)}
							>
								+
							</Button>
						</Badge>
					))}
			</div>
			<div>
				<h5>Utenti Selezionati:</h5>
				<div className="d-flex flex-wrap">
					{selectedUsers.map((user) => (
						<Badge
							key={user._id}
							pill
							variant="primary"
							className="mr-2"
						>
							{user.username}
							<Button
								size="sm"
								variant="light"
								onClick={() => handleRemoveUser(user._id)}
							>
								X
							</Button>
						</Badge>
					))}
				</div>

				<h5>Canali Selezionati:</h5>
				<div className="d-flex flex-wrap">
					{selectedChannels.map((channel) => (
						<Badge
							key={channel._id}
							pill
							variant="secondary"
							className="mr-2"
						>
							{channel.name}
							<Button
								size="sm"
								variant="light"
								onClick={() => handleRemoveChannel(channel._id)}
							>
								X
							</Button>
						</Badge>
					))}
				</div>
			</div>
		</div>
	);
};

export default RecipientSelector;
