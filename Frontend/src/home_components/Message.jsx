import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from 'react-router-dom';
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
	navigate(`/ricerca?user=${username}`);
	};
	
	window.handleChannelMentionClick = (channelName) => {
	navigate(`/ricerca?channel=${channelName}`);
	};
		
	const renderText = (text, userMentions, channelMentions) => {
	// Evidenzia gli hashtag
	let formattedText = text.replace(/#(\w+)/g, (match, hashtag) => {
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
	formattedText = formattedText.replace(/\[([^\]]+)\]\(((?!http:\/\/|https:\/\/).+)\)/g, "[$1](http://$2)");
	
	const rawMarkup = marked.parse(formattedText);
	return { __html: rawMarkup };
	};
	  
	  
	  

	return (
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
					{currentUser && currentUser === message.user && handleSaveChanges && (
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
	);
};

export default Message;
