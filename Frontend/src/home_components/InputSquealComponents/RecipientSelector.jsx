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
				<div>
					<h5 style={{ marginBottom: "0" }}>Seleziona il Destinatario:</h5>
				</div>
				<div>
					<Form.Check
						inline
						label='Utente Singolo'
						type='radio'
						id='radioUser'
						name='recipientType'
						value='user'
						checked={recipientType === "user"}
						onChange={() => handleRecipientChange("user")}
					/>
					<Form.Check
						inline
						label='Canale'
						type='radio'
						id='radioChannel'
						name='recipientTypeChannel'
						value='channel'
						checked={recipientType === "channel"}
						onChange={() => handleRecipientChange("channel")}
					/>
				</div>
			</Form.Group>

			<Form.Control
				type='text'
				placeholder={
					recipientType === "user" ? "Cerca utente..." : "Cerca canale..."
				}
				value={searchTerm}
				onChange={handleSearchChange}
				id='searchTerm'
				name='searchTerm'
			/>
			<div className='my-2'>
				{recipientType === "user" &&
					filteredUsers
						.filter((user) => !selectedUsers.includes(user))
						.map((user) => (
							<button
								key={user._id}
								className='mr-2 clickable'
								onClick={() => handleUserSelect(user)}
								onKeyDown={(e) => e.key === "Enter" && handleUserSelect(user)}
								aria-label={`Select user ${user.username}`}
							>
								<Badge
									pill
									variant='secondary'
								>
									{user.username}
								</Badge>
							</button>
						))}

				{recipientType === "channel" &&
					filteredChannels
						.filter((channel) => !selectedChannels.includes(channel))
						.map((channel) => (
							<button
								key={channel._id}
								className='mr-2 clickable'
								onClick={() => handleChannelSelect(channel)}
								onKeyDown={(e) =>
									e.key === "Enter" && handleChannelSelect(channel)
								}
								aria-label={`Select channel ${channel.name}`}
							>
								<Badge
									pill
									variant='secondary'
								>
									{channel.name}
								</Badge>
							</button>
						))}
			</div>
			<div className='my-3'>
				{isUserSelected && (
					<div>
						<h5>Utenti Selezionati:</h5>
						<div className='d-flex flex-wrap'>
							{selectedUsers.map((user) => (
								<span key={user._id}>
									<Badge
										pill
										variant='primary'
										className='mr-2 mb-2'
										tabIndex='0'
										role='text'
										aria-label={`Selected user ${user.username}`}
									>
										{user.username}
										<button
											className='ml-2 btn-link p-0 border-0 bg-transparent'
											onClick={() => handleRemoveUser(user._id)}
											style={{ color: "red", cursor: "pointer" }}
											aria-label='Remove user'
										>
											&#x2716;
										</button>
									</Badge>
								</span>
							))}
						</div>
					</div>
				)}
				{isChannelSelected && (
					<div>
						<h5>Canali Selezionati:</h5>
						<div className='d-flex flex-wrap'>
							{selectedChannels.map((channel) => (
								<span key={channel._id}>
									<Badge
										pill
										variant='primary'
										className='mr-2 mb-2'
										tabIndex='0'
										role='text'
										aria-label={`Selected channel ${channel.name}`}
									>
										{channel.name}
										<button
											className='ml-2 btn-link p-0 border-0 bg-transparent'
											onClick={() => handleRemoveChannel(channel._id)}
											style={{ color: "red", cursor: "pointer" }}
											aria-label='Remove channel'
										>
											&#x2716;
										</button>
									</Badge>
								</span>
							))}
						</div>
					</div>
				)}
			</div>

			{!isUserSelected && !isChannelSelected && (
				<Alert
					variant='info'
					tabIndex='0'
				>
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
