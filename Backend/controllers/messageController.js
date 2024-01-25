const Message = require("../models/message");
const User = require("../models/user");
const Channel = require("../models/channel");
const consts = require("../consts");

exports.reply = async (req, res) => {
	try {
		const {
			originalMessageId,
			userName,
			image,
			text,
			dailyCharacters,
			weeklyCharacters,
			monthlyCharacters,
			location,
		} = req.body;

		// Verifica se il messaggio originale esiste
		const originalMessage = await Message.findById(originalMessageId);
		if (!originalMessage) {
			return res
				.status(404)
				.json({ error: "Messaggio originale non trovato." });
		}

		const user = await User.findOne({ username: userName });
		if (!user) {
			return res.status(400).json({ error: "User not found" });
		}

		// Crea un nuovo messaggio di risposta
		const replyMessage = new Message({
			user: userName,
			profileImage: user.profileImage,
			image: image ? image.toString("base64") : null,
			text: text,
			channel: originalMessage.channel,
			replyTo: originalMessageId,
			location: location ? [location.latitude, location.longitude] : null,
		});

		// Salva il messaggio di risposta
		const savedReply = await replyMessage.save();
		if (user.privateMessagesReceived.includes(originalMessageId)) {
			const senderUser = await User.findOne({ username: originalMessage.user });

			if (senderUser) {
				// Aggiungi l'ID del messaggio di risposta ai messaggi privati del mittente
				await User.updateOne(
					{ _id: senderUser._id },
					{ $push: { privateMessagesReceived: savedReply._id } }
				);
			}
		}

		user.dailyChars = dailyCharacters;
		user.weeklyChars = weeklyCharacters;
		user.monthlyChars = monthlyCharacters;
		await user.save();

		// Invia una risposta di successo
		res
			.status(201)
			.json({ message: "Risposta creata con successo", reply: savedReply._id });
	} catch (error) {
		console.error("Errore durante la creazione della risposta:", error);
		res.status(500).json({ error: "Errore interno del server." });
	}
};

// Create a new message
exports.createMessage = async (req, res) => {
	try {
		const {
			userName,
			image,
			text,
			dailyCharacters,
			weeklyCharacters,
			monthlyCharacters,
			recipients,
			updateInterval,
			maxSendCount,
			nextSendTime,
			location,
		} = req.body;

		const user = await User.findOne({ username: userName });
		if (!user) {
			return res.status(400).json({ error: "User not found" });
		}

		// Estrai le menzioni utente e i canali
		const userMentions = await extractUserMentions(text);
		const channelMentions = await extractChannelMentions(text);

		// Creare un nuovo messaggio
		const newMessage = new Message({
			user: userName,
			profileImage: user.profileImage,
			image: image ? image.toString("base64") : null,
			text: text,
			channel: recipients.channels,
			updateInterval: updateInterval,
			maxSendCount: maxSendCount,
			nextSendTime: nextSendTime,
			location: location ? [location.latitude, location.longitude] : null,
			beepRequested: updateInterval !== null,
			hashtags: extractHashtags(text),
			userMentions: userMentions,
			channelMentions: channelMentions,
		});

		// Salvare il messaggio
		const savedMessage = await newMessage.save();

		// Aggiornare i messaggi privati ricevuti per ciascun utente destinatario
		if (recipients.users && recipients.users.length > 0) {
			await User.updateMany(
				{ username: { $in: recipients.users } },
				{ $push: { privateMessagesReceived: savedMessage._id } }
			);
		}

		// Aggiornare i caratteri rimanenti dell'utente
		user.dailyChars = dailyCharacters;
		user.weeklyChars = weeklyCharacters;
		user.monthlyChars = monthlyCharacters;
		await user.save();

		return res.status(201).json({
			message: "Message created successfully",
			_id: savedMessage._id,
		});
	} catch (error) {
		console.error(error);
		return res.status(500).json({ error: "Server error" });
	}
};

exports.getMessageById = async (req, res) => {
	try {
		const messageId = req.params.id;
		const message = await Message.findById(messageId);
		if (!message) {
			return res.status(404).json({ error: "Messaggio non trovato" });
		}
		return res.status(200).json(message);
	} catch (error) {
		console.error("Errore durante il recupero del messaggio:", error);
		return res.status(500).json({ error: "Errore interno del server" });
	}
};

exports.getAllSqueals = async (req, res) => {
	try {
		const { username } = req.params;

		const user = await User.findOne({ username });

		if (!user) {
			return res.status(404).json({ error: "User not found" });
		}

		const userChannels = await User.findOne({ username: username }).select(
			"channels"
		);

		const messages = await Message.find({
			channel: { $in: userChannels.channels },
		});

		res.json({messages: messages});
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: "Internal Server Error" });
	}
};

exports.getPrivateMessages = async (req, res) => {
	try {
		const username = req.params.username;

		// Trova l'utente tramite username
		const user = await User.findOne({ username });
		if (!user) {
			return res.status(404).json({ message: "Utente non trovato" });
		}

		// Trova tutti i messaggi privati ricevuti dall'utente
		const privateMessages = await Message.find({
			_id: { $in: user.privateMessagesReceived },
		});

		res.json({messages: privateMessages});
	} catch (error) {
		console.error("Errore durante il recupero dei messaggi privati:", error);
		res.status(500).json({ error: "Errore interno del server." });
	}
};

exports.getPublicMessagesByUser = async (req, res) => {
	try {
		const { username } = req.params; // Ottiene lo username dai parametri della richiesta

		// Trova l'utente tramite username
		const user = await User.findOne({ username });
		if (!user) {
			return res.status(404).json({ error: "Utente non trovato" });
		}

		// Trova tutti i messaggi pubblici inviati dall'utente
		// I messaggi pubblici sono quelli in cui il campo 'channel' non è un array vuoto
		const publicMessages = await Message.find({
			user: username,
			channel: { $ne: [] },
			replyTo: null,
		});

		res.json({messages: publicMessages}); // Invia i messaggi come risposta JSON
	} catch (error) {
		console.error("Errore durante il recupero dei messaggi pubblici:", error);
		res.status(500).json({ error: "Errore interno del server." });
	}
};

exports.getRepliesToMessage = async (req, res) => {
	try {
		const { messageId } = req.params; // Ottiene l'ID del messaggio originale dai parametri della richiesta

		// Verifica se il messaggio originale esiste
		const originalMessage = await Message.findById(messageId);
		if (!originalMessage) {
			return res
				.status(404)
				.json({ error: "Messaggio originale non trovato." });
		}

		// Trova tutte le risposte al messaggio originale
		const replies = await Message.find({ replyTo: messageId });

		res.json(replies); // Invia le risposte come risposta JSON
	} catch (error) {
		console.error("Errore durante il recupero delle risposte:", error);
		res.status(500).json({ error: "Errore interno del server." });
	}
};

exports.addReaction = async (req, res) => {
	try {
		const { messageId } = req.params;
		const { reaction, username } = req.body;

		const message = await Message.findById(messageId);

		if (!message) {
			return res.status(404).json({ error: "Message not found" });
		}

		const user = await User.findOne({ username });

		if (!user) {
			return res.status(404).json({ error: "User not found" });
		}

		if (
			(reaction && user.positiveReactionsGiven.includes(messageId)) ||
			(!reaction && user.negativeReactionsGiven.includes(messageId))
		) {
			return res
				.status(400)
				.json({ error: "User has already reacted to this message" });
		}

		if (reaction) {
			if (user.negativeReactionsGiven.includes(messageId)) {
				message.negativeReactions -= 1;
				user.negativeReactionsGiven.pop(messageId);
			}
			message.positiveReactions += 1;
			user.positiveReactionsGiven.push(messageId);
		} else {
			if (user.positiveReactionsGiven.includes(messageId)) {
				message.positiveReactions -= 1;
				user.positiveReactionsGiven.pop(messageId);
			}
			message.negativeReactions += 1;
			user.negativeReactionsGiven.push(messageId);
		}

		const cm = consts.CMParameter * message.impressions.length; //massa critica
		const newChar = 10; // caratteri da aggiungere o togliere

		if (message.positiveReactions > cm && message.negativeReactions <= cm) {
			//il messaggio è popolare
			message.popularity = "popular";
			if (user.negativeMessages.includes(messageId)) {
				// il messaggio è controverso
				message.popularity = "controversial";
				if (!user.controversialMessages.includes(messageId)) {
					user.controversialMessages.push(messageId);
				}
			}

			if (!user.positiveMessages.includes(messageId)) {
				user.positiveMessages.push(messageId);
				user.dailyChars += charForReaction(user, newChar); //modifico caratteri
				user.weeklyChars += charForReaction(user, newChar);
				user.monthlyChars += charForReaction(user, newChar);
			}
		} else if (
			message.positiveReactions <= cm &&
			message.negativeReactions > cm
		) {
			//il messaggio è impopolare
			message.popularity = "unpopular";
			if (user.positiveMessages.includes(messageId)) {
				// il messaggio è controverso
				message.popularity = "controversial";
				if (!user.controversialMessages.includes(messageId)) {
					user.controversialMessages.push(messageId);
				}
			}

			if (!user.negativeMessages.includes(messageId)) {
				user.negativeMessages.push(messageId);
				user.dailyChars -= charForReaction(user, newChar); //modifico i caratteri
				user.weeklyChars -= charForReaction(user, newChar);
				user.monthlyChars -= charForReaction(user, newChar);
			}
		}
		await Promise.all([message.save(), user.save()]);

		res.json({
			message: "Reaction added successfully",
			positiveReactions: message.positiveReactions, // Invia il numero aggiornato di reazioni positive
			negativeReactions: message.negativeReactions, // Invia il numero aggiornato di reazioni negative
		});
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: "Internal server error" });
	}
};

// Retrieve a message by ID
exports.getMessage = async (req, res) => {
	try {
		const messageId = req.params.id;
		const message = await Message.findById(messageId);
		if (!message) {
			return res.status(404).json({ error: "Message not found" });
		}
		return res.status(200).json(message);
	} catch (error) {
		console.error(error);
		return res.status(500).json({ error: "Server error" });
	}
};

exports.updateMessage = async (req, res) => {
	try {
		const { messageId } = req.params;
		const { text, username } = req.body;

		const message = await Message.findById(messageId);
		if (!message) {
			return res.status(404).json({ error: "Message not found" });
		}
		const user = await User.findOne({ username });

		if (!user) {
			return res.status(404).json({ error: "User not found" });
		}
		const userMentions = await extractUserMentions(text);
		const channelMentions = await extractChannelMentions(text);
		const oldTextLength = message.text.length;

		if (text) {
			message.text = text;
			message.hashtags = extractHashtags(text);
			message.userMentions = userMentions;
			message.channelMentions = channelMentions;
		}

		const newTextLength = message.text.length;

		const charDifference = newTextLength - oldTextLength;

		user.dailyChars -= charDifference;
		user.weeklyChars -= charDifference;
		user.monthlyChars -= charDifference;

		await Promise.all([message.save(), user.save()]);

		res.json({
			text: message.text,
		});
	} catch (error) {
		console.error(error);
		return res.status(500).json({ error: "Server error" });
	}
};

// Delete a message by ID
exports.deleteMessage = async (req, res) => {
	try {
		const messageId = req.params.id;

		const message = await Message.findById(messageId);
		if (!message) {
			return res.status(404).json({ error: "Message not found" });
		}

		// Remove the message from the database
		await message.remove();

		return res.status(204).send(); // 204 No text for successful deletion
	} catch (error) {
		console.error(error);
		return res.status(500).json({ error: "Server error" });
	}
};

exports.updatePosition = async (req, res) => {
	try {
		const { messageId } = req.params;
		const { position } = req.body;
		const message = await Message.findById(messageId);

		if (!message) {
			return res.status(404).json({ error: "Message not found" });
		}
		if (position && position != message.location) {
			message.location = position;
		}

		await message.save();
		res.json({
			message: "position added successfully",
		});
	} catch {
		return res.status(500).json({ error: "Server error" });
	}
};

const charForReaction = (user, newChar) => {
	let char = 0;

	if (user.positiveMessages && user.positiveMessages.length > 10) {
		char += newChar;
	} else if (user.negativeMessages && user.negativeMessages.length > 3) {
		char -= newChar;
	}
	return char;
};

exports.incrementImpressions = async (req, res) => {
	try {
		const { messageId } = req.params;
		const { username } = req.body; // Assumi che il nome utente venga inviato nel corpo della richiesta

		const message = await Message.findById(messageId);
		if (!message) {
			return res.status(404).json({ error: "Messaggio non trovato" });
		}

		// Aggiungi il nome utente alle impressioni se non è già presente
		if (!message.impressions.includes(username)) {
			message.impressions.push(username);
			await message.save();
		}

		res.status(200).json({ message: "Impressions incrementate" });
	} catch (error) {
		console.error("Errore durante l'incremento delle impressions:", error);
		res.status(500).json({ error: "Errore interno del server" });
	}
};

exports.getMessageByHashtag = async (req, res) => {
    try {
        const { username, hashtag } = req.params;

        const user = await User.findOne({ username });
        if (!user) {
            return res.status(404).json({ error: "Utente non trovato" });
        }

        // Prendi i canali dell'utente e filtra i messaggi pubblici in base all'hashtag
        const userChannels = await User.findOne({ username }).select("channels");
        const messages = await Message.find({
            channel: { $in: userChannels.channels },
            hashtags: hashtag,
        });

        let response = {
            messages: messages,
            publicMessage: ""
        };

        if (messages.length === 0) {
            response.publicMessage = `Nessun messaggio trovato con l'hashtag '${hashtag}'`;
        }

        res.json(response);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};


exports.getPrivateMessByHashtag = async (req, res) => {
	try {
		const { username, hashtag } = req.params;

		const user = await User.findOne({ username });
		if (!user) {
			return res.status(404).json({ error: "Utente non trovato" });
		}

		const privateMessages = await Message.find({
			_id: { $in: user.privateMessagesReceived },
			hashtags: hashtag,
		});

		let response = {
            messages: privateMessages,
            privateMessage: ""
        };

        if (privateMessages.length === 0) {
            response.privateMessage = `Nessun messaggio Privato trovato con l'hashtag '${hashtag}'`;
        }

        res.json(response);
	} catch (error) {
		console.error("Errore durante il recupero dei messaggi privati:", error);
		res.status(500).json({ error: "Errore interno del server." });
	}
};

exports.getMessageByUser = async (req, res) => {
	try {
		const { username, targetUsername } = req.params;

		const user = await User.findOne({ username });
		if (!user) {
			return res.status(404).json({ error: "Utente non trovato" });
		}

		const userChannels = await User.findOne({ username }).select("channels");
		const messages = await Message.find({
			channel: { $in: userChannels.channels },
			user: targetUsername,
			replyTo: null,
		});

		let response = {
            messages: messages,
            publicMessage: ""
        };

        if (messages.length === 0) {
            response.publicMessage = `Nessun messaggio di '${targetUsername}' trovato`;
        }

        res.json(response);
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: "Internal Server Error" });
	}
};

exports.getPrivateMessByUser = async (req, res) => {
	try {
		const { username, targetUsername } = req.params;

		const user = await User.findOne({ username });
		if (!user) {
			return res.status(404).json({ error: "Utente non trovato" });
		}

		// Prendi i messaggi privati dell'utente target inviati dall'utente attuale
		const privateMessages = await Message.find({
			user: targetUsername,
			replyTo: null,
			_id: { $in: user.privateMessagesReceived },
		});

		let response = {
            messages: privateMessages,
            privateMessage: ""
        };

        if (privateMessages.length === 0) {
            response.privateMessage = `Nessun messaggio Privato di '${targetUsername}' trovato`;
        }

        res.json(response);
	} catch (error) {
		console.error("Errore durante il recupero dei messaggi privati:", error);
		res.status(500).json({ error: "Errore interno del server." });
	}
};
exports.getMessageByChannel = async (req, res) => {
    try {
        const { username, channel } = req.params;

        // Trova l'utente e verifica se esiste
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(404).json({ error: "Utente non trovato", messages: [] });
        }

        // Verifica se il canale esiste
        const channelExists = await Channel.findOne({ name: channel });
        if (!channelExists) {
            return res.json({ publicMessage: "Il canale non esiste", messages: [] });
        }

        // Verifica se l'utente è iscritto al canale
        const isSubscribed = user.channels.includes(channel);
        if (!isSubscribed) {
            return res.json({ publicMessage: "Devi iscriverti per vedere i messaggi di questo canale", messages: [] });
        }

        // Se l'utente è iscritto, trova e restituisce i messaggi del canale
        const messages = await Message.find({ channel: channel });
        res.json({ messages: messages });
    } catch (error) {
        console.error("Errore durante il recupero dei messaggi:", error);
        res.status(500).json({ error: "Errore interno del server.", messages: [] });
    }
};


exports.getPrivateMessByChannel = async (req, res) => {
    try {
        const { username, channel } = req.params;

        const user = await User.findOne({ username });
        if (!user) {
            return res.status(404).json({ error: "Utente non trovato" });
        }

        // Poiché i messaggi privati non sono associati a canali, restituisci un array vuoto e un messaggio personalizzato
        const response = {
            messages: [],
            privateMessage: "I messaggi privati non sono associati a canali specifici, vai nella sezione Pubblici se vuoi vedere i canali."
        };

        res.json(response);
    } catch (error) {
        console.error("Errore durante il recupero dei messaggi privati:", error);
        res.status(500).json({ error: "Errore interno del server." });
    }
};


exports.getMessageByText = async (req, res) => {
	try {
		const { username, text } = req.params;

		const user = await User.findOne({ username });
		if (!user) {
			return res.status(404).json({ error: "Utente non trovato" });
		}

		const userChannels = await User.findOne({ username }).select("channels");
		const messages = await Message.find({
			channel: { $in: userChannels.channels },
			text: { $regex: text, $options: "i" }, // La ricerca è case-insensitive
		});

		let response = {
            messages: messages,
            publicMessage: ""
        };

        if (messages.length === 0) {
            response.publicMessage = `Nessun messaggio pubblico contiene '${text}'`;
        }

        res.json(response);
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: "Internal Server Error" });
	}
};

exports.getPrivateMessByText = async (req, res) => {
	try {
		const { username, text } = req.params;

		const user = await User.findOne({ username });
		if (!user) {
			return res.status(404).json({ error: "Utente non trovato" });
		}

		// Prendi i messaggi privati dell'utente che contengono il testo specificato
		const privateMessages = await Message.find({
			_id: { $in: user.privateMessagesReceived },
			text: { $regex: text, $options: "i" }, // La ricerca è case-insensitive
		});

		let response = {
            messages: privateMessages,
            privateMessage: ""
        };

        if (privateMessages.length === 0) {
            response.privateMessage = `Nessuno dei tuoi messaggi privati contiene'${text}'`;
        }

        res.json(response);
	} catch (error) {
		console.error("Errore durante il recupero dei messaggi privati:", error);
		res.status(500).json({ error: "Errore interno del server." });
	}
};

exports.getAllMessages = async (req, res) => {
	try {
		const messages = await Message.find({});
		res.json(messages);
	} catch (error) {
		console.error("Errore durante il recupero di tutti i messaggi:", error);
		res.status(500).json({ error: "Errore interno del server" });
	}
};

const extractHashtags = (text) => {
	const hashtagRegex = /#(\w+)/g;
	let match;
	const hashtags = new Set();
	while ((match = hashtagRegex.exec(text)) !== null) {
		hashtags.add(match[1]);
	}
	return Array.from(hashtags);
};

const extractUserMentions = async (text) => {
	const userMentionRegex = /@(\w+)/g;
	let match;
	const userMentionsSet = new Set();

	while ((match = userMentionRegex.exec(text)) !== null) {
		const username = match[1];
		const userExists = await User.findOne({ username: username }).exec();
		if (userExists) {
			userMentionsSet.add(username);
		}
	}

	return Array.from(userMentionsSet);
};

const extractChannelMentions = async (text) => {
	const channelMentionRegex = /§(\w+)/g;
	let match;
	const channelMentionsSet = new Set();

	while ((match = channelMentionRegex.exec(text)) !== null) {
		const channelName = match[1];
		const channelExists = await Channel.findOne({ name: channelName }).exec();
		if (channelExists) {
			channelMentionsSet.add(channelName);
		}
	}

	return Array.from(channelMentionsSet);
};

exports.acknowledgeBeep = async (req, res) => {
	try {
		const messageId = req.params.id;

		// Trova e aggiorna il messaggio impostando beepRequested a false
		const message = await Message.findByIdAndUpdate(
			messageId,
			{ beepRequested: false },
			{ new: true }
		);

		if (!message) {
			return res.status(404).json({ error: "Message not found" });
		}

		return res.status(200).json({
			message: "Beep acknowledged",
			beepRequested: message.beepRequested,
		});
	} catch (error) {
		console.error(error);
		return res.status(500).json({ error: "Server error" });
	}
};

exports.updateMessageChannels = async (req, res) => {
	try {
		const { messageId } = req.params;
		const { channels } = req.body;

		const message = await Message.findById(messageId);
		if (!message) {
			return res.status(404).json({ error: "Messaggio non trovato" });
		}

		// Aggiorna i canali del messaggio
		message.channel = channels;
		await message.save();

		res.status(200).json({
			message: "Canali aggiornati con successo",
			updatedChannels: message.channel,
		});
	} catch (error) {
		console.error(
			"Errore durante l'aggiornamento dei canali del messaggio:",
			error
		);
		res.status(500).json({ error: "Errore interno del server" });
	}
};

exports.updateReactions = async (req, res) => {
	try {
		const { messageId } = req.params;
		const { positiveReactions, negativeReactions } = req.body;

		const message = await Message.findById(messageId);
		if (!message) {
			return res.status(404).json({ error: "Message not found" });
		}

		// Aggiorna le reazioni positive e negative
		message.positiveReactions = positiveReactions;
		message.negativeReactions = negativeReactions;
		await message.save();

		res.status(200).json({
			message: "Reactions updated successfully",
			updatedMessage: message,
		});
	} catch (error) {
		console.error("Error updating reactions:", error);
		res.status(500).json({ error: "Internal server error" });
	}
};
