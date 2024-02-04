import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Card, Button, Form, Badge } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
	faThumbsUp,
	faThumbsDown,
	faPenToSquare,
} from "@fortawesome/free-solid-svg-icons";
import Maps from "./Maps";
import { marked } from "marked";
import ReplySqueal from "./ReplySqueal";
import { useMessageRefs } from "../MessageRefsContext";
import Cookies from "js-cookie";
import PropTypes from "prop-types";

const Message = ({
	message,
	handleReaction,
	seteditMessage,
	editMessage,
	handleSaveChanges,
	currentUser,
	scrollToMessage,
	onStartReplying,
	onEndReplying,
}) => {
	const [editedText, setEditedText] = useState(message.text);
	const [linkData, setLinkData] = useState([]);
	const [showReply, setShowReply] = useState(false);
	const [originalMessageUser, setOriginalMessageUser] = useState(null);
	const [originalMessageId, setOriginalMessageId] = useState(null);
	const messageRef = useRef(null);
	const { setRef } = useMessageRefs();
	const [hasBeenViewed, setHasBeenViewed] = useState(false);
	const [userChannels, setUserChannels] = useState([]);

	const [showInviteCard, setShowInviteCard] = useState(false);
	const [inviteChannelName, setInviteChannelName] = useState("");
	const [channel, setChannel] = useState([]);
	const [selectedChannel, setSelectedChannel] = useState([]);

	const navigate = useNavigate();

	useEffect(() => {
		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting && !hasBeenViewed) {
						// Il messaggio è entrato nel viewport e non è stato ancora visualizzato
						setHasBeenViewed(true);

						// Chiamata API per incrementare le impressions
						fetch(
							`http://localhost:3500/message/incrementImpressions/${message._id}`,
							{
								method: "POST",
								headers: {
									"Content-Type": "application/json",
								},
								body: JSON.stringify({ username: currentUser }),
							}
						)
							.then((response) => response.json())
							.then((data) => console.log(data.message))
							.catch((error) =>
								console.error(
									"Errore durante l'incremento delle impressions:",
									error
								)
							);
					}
				});
			},
			{ threshold: 0.5 }
		);

		if (messageRef.current) {
			observer.observe(messageRef.current);
		}

		return () => {
			if (messageRef.current) {
				observer.unobserve(messageRef.current);
			}
		};
	}, [message._id, currentUser, hasBeenViewed]);
	const beepSoundRef = useRef(new Audio("./beep-01a.mp3"));
	const [isReplying, setIsReplying] = useState(false);

	useEffect(() => {
		const checkForTimedMessages = () => {
			if (message.beepRequested) {
				beepSoundRef.current
					.play()
					.catch((error) =>
						console.error("Errore durante la riproduzione del suono:", error)
					);
				handleBeepAcknowledged(message._id);
			}
		};

		checkForTimedMessages();
		const intervalId = setInterval(() => {
			checkForTimedMessages();
		}, 60000);

		return () => clearInterval(intervalId);
	}, [message]);

	useEffect(() => {
		const userDataCookie = Cookies.get("user_data");
		if (userDataCookie) {
			const userData = JSON.parse(userDataCookie);
			const username = userData.username;

			fetch(`http://localhost:3500/usr/${username}`)
				.then((response) => {
					if (response.status === 200) {
						return response.json();
					} else {
						throw new Error("API call failed");
					}
				})
				.then((data) => {
					if (data && data.channels) {
						setUserChannels(data.channels);
					}
					//setUserData(newData);
				})
				.catch((error) => {
					console.error("API call error:", error);
				});
		} else {
			console.error("User data not found in cookies");
		}
	}, []);

	useEffect(() => {
		const userDataCookie = Cookies.get("user_data");
		if (userDataCookie) {
			const userData = JSON.parse(userDataCookie);
			const username = userData.username;

			fetch(`http://localhost:3500/channels/all/${username}`)
				.then((response) => response.json())
				.then((data) => setChannel(data))
				.catch((error) =>
					console.error("Errore durante il recupero di tutti i canali:", error)
				);
		}
	}, []);

	const handleBeepAcknowledged = async (messageId) => {
		try {
			const response = await fetch(
				`http://localhost:3500/messages/acknowledgeBeep/${messageId}`,
				{
					method: "POST",
				}
			);

			if (!response.ok) {
				throw new Error("Network response was not ok.");
			}
		} catch (error) {
			console.error("Errore durante l'acknowledge del beep:", error);
		}
	};

	useEffect(() => {
		const positions = [];
		const regex = /\[([^\]]+)\]\(([^\)]+)\)/g;
		let match;
		while ((match = regex.exec(message.text)) != null) {
			positions.push({
				text: match[1],
				url: match[2],
				startText: match.index + 1,
				endText: match.index + match[0].indexOf("]"),
				startUrl: match.index + match[0].indexOf("(") + 1,
				endUrl: regex.lastIndex - 1,
			});
		}
		setLinkData(positions);
	}, [message.text]);

	useEffect(() => {
		setRef(message._id, messageRef);
	}, [message._id, setRef]);

	const handleReplyClick = () => {
		setIsReplying(!isReplying);
		setShowReply(!showReply);
		if (!isReplying) {
			onStartReplying();
		} else {
			onEndReplying();
		}
	};

	const handleTextChange = (e) => {
		setEditedText(e.target.value);
	};

	const handleSaveClick = () => {
		handleSaveChanges(message._id, editedText);
	};

	window.handleHashtagClick = (hashtag) => {
		navigate(`/ricerca?getHashtag=${hashtag}`);
	};

	window.handleUserMentionClick = (username) => {
		navigate(`/UserMention?user=${username}`);
	};

	window.handleChannelMentionClick = (channelName) => {
		if (isUserSubscribedToChannel(channelName, userChannels)) {
			navigate(`/ricerca?channel=${channelName}`);
			setShowInviteCard(false);
		} else {
			const c = channel.find((chan) => chan.name === channelName);
			setSelectedChannel(c);
			setInviteChannelName(channelName);
			setShowInviteCard(true);
		}
	};

	const isUserSubscribedToChannel = (channelName, userChannels) => {
		return userChannels.includes(channelName);
	};

	const subscribeToChannel = async (channel, channelName) => {
		try {
			const userDataCookie = Cookies.get("user_data");
			if (userDataCookie) {
				const userData = JSON.parse(userDataCookie);
				const username = userData.username;

				const response = await fetch(
					`http://localhost:3500/channels/subscribe/${channel._id}`,
					{
						method: "POST",
						headers: {
							"Content-Type": "application/json",
						},
						body: JSON.stringify({ username }),
					}
				);

				if (response.status === 200) {
					console.log("Iscrizione avvenuta con successo.");
					setShowInviteCard(false);
					navigate(`/ricerca?channel=${channelName}`);
				} else {
					console.error("Errore durante l'iscrizione:", response.status);
				}
			}
		} catch (error) {
			console.error("Errore durante la richiesta di iscrizione:", error);
		}
	};

	const renderText = (text) => {
		let formattedText = text;
		// Evidenzia gli hashtag
		formattedText = formattedText.replace(/#(\w+)/g, (match, hashtag) => {
			return `<span style="color: #009688; font-weight: bold; cursor: pointer;" onClick="window.handleHashtagClick('${hashtag}')">${match}</span>`;
		});

		// Evidenzia le menzioni utente
		formattedText = formattedText.replace(/@(\w+)/g, (match, username) => {
			if (message.userMentions.includes(username)) {
				return `<span style="color: #009688; cursor: pointer;" onClick="window.handleUserMentionClick('${username}')">${match}</span>`;
			}
			return match;
		});

		// Evidenzia le menzioni canale
		formattedText = formattedText.replace(/§(\w+)/g, (match, channelName) => {
			if (message.channelMentions.includes(channelName)) {
				return `<span style="color: #009688; cursor: pointer;" onClick="window.handleChannelMentionClick('${channelName}')">${match}</span>`;
			}
			return match;
		});

		// Gestione dei link
		formattedText = formattedText.replace(
			/\[([^\]]+)\]\(((?!http:\/\/|https:\/\/).+)\)/g,
			"[$1](http://$2)"
		);

		const rawMarkup = marked.parse(formattedText);
		return { __html: rawMarkup };
	};

	const overlayStyle = {
		position: "fixed",
		top: 0,
		left: 0,
		width: "100%",
		height: "100%",
		display: "flex",
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: "rgba(0, 0, 0, 0.5)",
		zIndex: 1050, // Sovraimpressione rispetto agli altri contenuti
	};

	const cardStyle = {
		maxWidth: "600px",
		width: "90%",
		padding: "20px",
		margin: "20px",
		display: "flex",
		flexDirection: "column",
		alignItems: "center",
		backgroundColor: "#fff",
		borderRadius: "8px",
		boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
	};

	return (
		<>
			{showInviteCard && (
				<div style={overlayStyle}>
					<Card style={cardStyle}>
						<Card.Body>
							<Card.Title>
								Non sei iscritto a questo canale, unisciti così potrai vedere i
								suoi squeals
							</Card.Title>
							<Card.Text>Vuoi unirti al canale {inviteChannelName}?</Card.Text>
							<Button
								variant="primary"
								onClick={() =>
									subscribeToChannel(selectedChannel, inviteChannelName)
								}
							>
								Unisciti
							</Button>{" "}
							<Button
								variant="secondary"
								onClick={() => setShowInviteCard(false)}
							>
								Chiudi
							</Button>
						</Card.Body>
					</Card>
				</div>
			)}
			<Card
				ref={messageRef}
				key={message._id}
				className="mb-3"
			>
				<Card.Body>
					{message.replyTo && (
						<div className="reply-header">
							Risposta a{" "}
							<a
								href="#"
								onClick={() => scrollToMessage(originalMessageId)}
							>
								Squeal di {originalMessageUser}
							</a>
						</div>
					)}
					<div className="d-flex align-items-center">
						<div className="mr-3">
							<img
								src={message.profileImage}
								alt="Profile Image"
								style={{ maxWidth: "50px", borderRadius: "50%" }}
							/>
						</div>
						<div>
							<strong>{message.user}:</strong> <br />
							<div dangerouslySetInnerHTML={renderText(message.text)} />
						</div>
					</div>

					{message.channel && message.channel.length > 0 && (
						<div className="mb-2">
							{message.channel.map((channel, index) => (
								<Badge
									key={index}
									pill
									bg="secondary"
									className="mr-1"
								>
									{channel}
								</Badge>
							))}
						</div>
					)}

					{message.image && (
						<div className="text-center my-3">
							<img
								src={message.image}
								alt="Message Image"
								style={{ maxWidth: "100%" }}
							/>
						</div>
					)}

					{message.location &&
						message.location[0] != null &&
						message.location[1] != null && <Maps position={message.location} />}

					<div className="d-flex justify-content-end">
						<small className="text-muted">
							<em>
								Pubblicato il{" "}
								{new Date(message.createdAt).toLocaleString("it-IT", {
									year: "numeric",
									month: "long",
									day: "numeric",
									hour: "2-digit",
									minute: "2-digit",
								})}
							</em>
						</small>
					</div>
					<div className="d-flex justify-content-end">
						<small className="text-muted">
							<em>{message.updateInterval && " Messaggio Temporizzato"}</em>
						</small>
					</div>
					<div className="d-flex justify-content-between">
						{currentUser &&
							currentUser === message.user &&
							handleSaveChanges && (
								<Button onClick={() => seteditMessage(true)}>
									<FontAwesomeIcon icon={faPenToSquare} />
								</Button>
							)}

						{currentUser && handleReaction && (
							<>
								<div>
									<button
										className="btn btn-link"
										onClick={() => handleReaction(message._id, true)}
									>
										<FontAwesomeIcon icon={faThumbsUp} />
									</button>
									<span>{message.positiveReactions}</span>
								</div>

								<div>
									<button
										className="btn btn-link"
										onClick={() => handleReaction(message._id, false)}
									>
										<FontAwesomeIcon icon={faThumbsDown} />
									</button>
									<span>{message.negativeReactions}</span>
								</div>
							</>
						)}
					</div>

					{currentUser &&
						editMessage &&
						currentUser === message.user &&
						handleSaveChanges && (
							<div>
								<Form>
									<Form.Group controlId="formBasicEditText">
										<Form.Label>Modifica Testo</Form.Label>
										<Form.Control
											type="text"
											name="editedText"
											value={editedText}
											onChange={handleTextChange}
										/>
									</Form.Group>
								</Form>

								<Button
									variant="primary"
									onClick={handleSaveClick}
								>
									Salva Modifiche
								</Button>
								<Button
									variant="secondary"
									onClick={() => seteditMessage(false)}
								>
									Annulla
								</Button>
							</div>
						)}

					{currentUser && handleReplyClick && (
						<button onClick={handleReplyClick}>Rispondi</button>
					)}
					{currentUser && showReply && onStartReplying && onEndReplying && (
						<ReplySqueal
							originalMessage={message}
							onStartReplying={onStartReplying}
							onEndReplying={onEndReplying}
						/>
					)}
				</Card.Body>
			</Card>
		</>
	);
};

Message.propTypes = {
	message: PropTypes.object.isRequired,
	handleReaction: PropTypes.func.isRequired,
	seteditMessage: PropTypes.func,
	editMessage: PropTypes.bool,
	handleSaveChanges: PropTypes.func,
	currentUser: PropTypes.string,
	scrollToMessage: PropTypes.func.isRequired,
	onStartReplying: PropTypes.func,
	onEndReplying: PropTypes.func,
};

export default Message;
