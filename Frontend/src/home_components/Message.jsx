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
import { BASE_URL } from "../config";

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
	const [showReply, setShowReply] = useState(false);
	const [isReplying, setIsReplying] = useState(false);
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

	const handleReplyClick = () => {
		setShowReply(!showReply);
		if (!showReply) {
			onStartReplying();
			setIsReplying(true);
		} else {
			onEndReplying();
			setIsReplying(false);
		}
	};

	useEffect(() => {
		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting && !hasBeenViewed) {
						// Il messaggio è entrato nel viewport e non è stato ancora visualizzato
						setHasBeenViewed(true);

						// Chiamata API per incrementare le impressions
						fetch(`${BASE_URL}/messages/${message._id}/impressions`, {
							method: "PATCH",
							headers: {
								"Content-Type": "application/json",
							},
							body: JSON.stringify({ username: currentUser }),
						})
							.then((response) => response.json())
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

	useEffect(() => {
		const getMessageById = async () => {
			try {
				const response = await fetch(`${BASE_URL}/message/${message.replyTo}`);
				const data = await response.json();
				setOriginalMessageUser(data.user);
				setOriginalMessageId(data._id);
			} catch (error) {
				console.error("Errore durante il recupero del messaggio:", error);
			}
		};

		if (message.replyTo) {
			getMessageById();
		}
	}, [message.replyTo]);

	const beepSoundRef = useRef(new Audio("./beep-01a.mp3"));

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

			fetch(`${BASE_URL}/usr/${username}`)
				.then((response) => {
					if (response.status === 200) {
						return response.json();
					} else {
						throw new Error("API call failed");
					}
				})
				.then((data) => {
					if (data?.channels) {
						setUserChannels(data.channels);
					}
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

			fetch(`${BASE_URL}/channels?excludeSubscribedBy=${username}`)
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
				`${BASE_URL}/messages/${messageId}/acknowledge`,
				{
					method: "PATCH",
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
		setRef(message._id, messageRef);
	}, [message._id, setRef]);

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
					`${BASE_URL}/channels/${channel._id}/members/${username}`,
					{
						method: "PUT",
						headers: {
							"Content-Type": "application/json",
						},
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
		zIndex: 1050,
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
								variant='primary'
								onClick={() =>
									subscribeToChannel(selectedChannel, inviteChannelName)
								}
							>
								Unisciti
							</Button>{" "}
							<Button
								variant='secondary'
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
				className='mb-3'
			>
				<Card.Body>
					{message.replyTo && (
						<div className='reply-header'>
							Risposta a{" "}
							<button
								style={{
									background: "none",
									border: "none",
									color: "blue",
									textDecoration: "underline",
									cursor: "pointer",
									padding: 0,
								}}
								onClick={() => scrollToMessage(originalMessageId)}
							>
								Squeal di {originalMessageUser}
							</button>
						</div>
					)}
					<div className='d-flex align-items-center'>
						<div className='mr-3'>
							<img
								src={message.profileImage}
								alt='Profile'
								style={{ maxWidth: "50px", borderRadius: "50%" }}
							/>
						</div>
						<div>
							<strong>{message.user}:</strong> <br />
							<div dangerouslySetInnerHTML={renderText(message.text)} />
						</div>
					</div>

					{message.channel && message.channel.length > 0 && (
						<div className='mb-2'>
							{message.channel.map((channel) => (
								<Badge
									key={channel}
									pill
									bg='secondary'
									style={{ marginRight: "10px" }}
								>
									{channel}
								</Badge>
							))}
						</div>
					)}

					{message.image && (
						<div className='text-center my-3'>
							<img
								src={message.image}
								alt='Message'
								style={{ maxWidth: "100%" }}
							/>
						</div>
					)}

					{message.location?.[0] != null && message.location?.[1] != null && (
						<Maps
							position={message.location}
							isLive={message.isLive}
							livePositions={message.liveLocation}
							message={message}
							currentUser={currentUser}
						/>
					)}

					<div className='d-flex justify-content-end'>
						<small className='text-muted'>
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
					<div className='d-flex justify-content-end'>
						<small className='text-muted'>
							<em>{message.updateInterval && " Messaggio Temporizzato"}</em>
						</small>
					</div>
					{currentUser && currentUser === message.user && handleSaveChanges && (
						<div className='position-absolute top-0 end-0 mt-2 me-2'>
							<Button onClick={() => seteditMessage(true)}>
								<FontAwesomeIcon icon={faPenToSquare} />
							</Button>
						</div>
					)}
					<hr />
					<div className='d-flex justify-content-between'>
						{currentUser && handleReaction && (
							<>
								<div>
									<button
										className='btn btn-link'
										onClick={() => handleReaction(message._id, true)}
									>
										<FontAwesomeIcon icon={faThumbsUp} />
									</button>
									<span>{message.positiveReactions}</span>
								</div>

								<div>
									<button
										className='btn btn-link'
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
							<div className='mb-3'>
								{/* Aggiungiamo margine al fondo del blocco */}
								<Form>
									<Form.Group controlId='formBasicEditText'>
										<Form.Label>
											<b>MODIFICA TESTO</b>
										</Form.Label>
										<Form.Control
											type='text'
											name='editedText'
											value={editedText}
											onChange={handleTextChange}
										/>
									</Form.Group>
								</Form>
								<div className='mb-3'></div>{" "}
								{/* Aggiungiamo spazio tra il form e i bottoni */}
								<div className='d-flex justify-content-between'>
									{/* Utilizziamo flexbox per allineare i bottoni */}
									<Button
										variant='primary'
										onClick={handleSaveClick}
									>
										Salva Modifiche
									</Button>
									<Button
										variant='secondary'
										onClick={() => seteditMessage(false)}
									>
										Annulla
									</Button>
								</div>
								<hr className='my-3' />{" "}
								{/* Aggiungiamo margine sopra e sotto la linea */}
							</div>
						)}

					{currentUser && (
						<Button
							onClick={handleReplyClick}
							variant={isReplying ? "danger" : "outline-primary"}
						>
							{isReplying ? "Annulla" : "Rispondi"}
						</Button>
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
