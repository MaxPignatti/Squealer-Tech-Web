const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const Channel = require("./models/channel");
const cron = require("node-cron");
const User = require("./models/user");
const Message = require("./models/message");
const consts = require("./consts");
const fetch = require("node-fetch");
const app = express();
const port = 3500;

// Load environment variables
require("./config/env");

app.use(bodyParser.json({ limit: "10mb" }));
const corsOptions = {
	origin: [
		"http://localhost:3000",
		"http://localhost:3001",
		"http://localhost:3002",
		"http://localhost:8080",
		"http://127.0.0.1:5500",
	],
	credentials: true, // Permette l'invio di cookie e credenziali di autenticazione
};
app.use(cors(corsOptions));
app.use(cookieParser());

// Routes
const authRoutes = require("./routes/authRoutes");
const secureRoutes = require("./routes/secureRoutes");
const userRoutes = require("./routes/userRoutes");
const messageRoutes = require("./routes/messageRoutes");
const channelRoutes = require("./routes/channelRoutes");
const shopRoutes = require("./routes/shopRoutes");

app.use(authRoutes);
app.use(secureRoutes);
app.use(userRoutes);
app.use(messageRoutes);
app.use(channelRoutes);
app.use(shopRoutes);

mongoose
	.connect("mongodb://127.0.0.1:27017/test", {
		useNewUrlParser: true,
		useUnifiedTopology: true,
	})
	.then(() => {
		Channel.findOne({ name: "PUBLIC" })
			.then((channel) => {
				if (!channel) {
					const publicChannel = new Channel({
						name: "PUBLIC",
						creator: "Squealer",
					});
					publicChannel
						.save()
						.then(() => console.log('Canale "PUBLIC" creato con successo.'))
						.catch((err) =>
							console.error("Errore durante il salvataggio del canale:", err)
						);
				}
			})
			.catch((err) =>
				console.error("Errore durante la ricerca del canale:", err)
			);
	})
	.catch((err) => console.error("MongoDB connection error:", err));

const db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));
db.on("connected", console.error.bind(console, "MongoDB connected:"));

Channel.findOne({ name: "CONTROVERSIAL" })
	.then((channel) => {
		if (!channel) {
			const controversialChannel = new Channel({
				name: "CONTROVERSIAL",
				creator: "Squealer",
				moderatorChannel: true,
			});
			controversialChannel
				.save()
				.then(() => console.log('Canale "CONTROVERSIAL" creato con successo.'))
				.catch((err) =>
					console.error("Errore durante il salvataggio del canale:", err)
				);
		}
	})
	.catch((err) => console.error("Errore durante la ricerca del canale:", err));

Channel.findOne({ name: "SQUEALER-UPDATES" })
	.then((channel) => {
		if (!channel) {
			const updatesChannel = new Channel({
				name: "SQUEALER-UPDATES",
				creator: "Squealer",
				moderatorChannel: true,
			});
			updatesChannel
				.save()
				.then(() =>
					console.log('Canale "SQUEALER-UPDATES" creato con successo.')
				)
				.catch((err) =>
					console.error("Errore durante il salvataggio del canale:", err)
				);
		}
	})
	.catch((err) => console.error("Errore durante la ricerca del canale:", err));

Channel.findOne({ name: "EMERGENCY" })
	.then((channel) => {
		if (!channel) {
			const emergencyChannel = new Channel({
				name: "EMERGENCY",
				creator: "Squealer",
				moderatorChannel: true,
			});
			emergencyChannel
				.save()
				.then(() => console.log('Canale "EMERGENCY" creato con successo.'))
				.catch((err) =>
					console.error("Errore durante il salvataggio del canale:", err)
				);
		}
	})
	.catch((err) => console.error("Errore durante la ricerca del canale:", err));

Channel.findOne({ name: "DAILY-RECIPE" })
	.then((channel) => {
		if (!channel) {
			const dailyRecipeChannel = new Channel({
				name: "DAILY-RECIPE",
				creator: "Squealer",
				moderatorChannel: true,
			});
			dailyRecipeChannel
				.save()
				.then(() => console.log('Canale "DAILY-RECIPE" creato con successo.'))
				.catch((err) =>
					console.error("Errore durante il salvataggio del canale:", err)
				);
		}
	})
	.catch((err) => console.error("Errore durante la ricerca del canale:", err));

Channel.findOne({ name: "DAILY-NEWS" })
	.then((channel) => {
		if (!channel) {
			const dailyNewsChannel = new Channel({
				name: "DAILY-NEWS",
				creator: "Squealer",
				moderatorChannel: true,
			});
			dailyNewsChannel
				.save()
				.then(() => console.log('Canale "DAILY-NEWS" creato con successo.'))
				.catch((err) =>
					console.error("Errore durante il salvataggio del canale:", err)
				);
		}
	})
	.catch((err) => console.error("Errore durante la ricerca del canale:", err));

const {
	checkAndSendTempMessages,
} = require("./background-task/tempMessageTask");
checkAndSendTempMessages();

app.listen(port, () => {
	console.log(`Server is running on port ${port}`);
});

// Reset giornaliero
cron.schedule("0 0 * * *", async () => {
	await User.updateMany({}, { $set: { dailyChars: consts.dailyCharacters } });
	console.log("Reset giornaliero eseguito");
});

// Reset settimanale (alla mezzanotte di lunedì)
cron.schedule("0 0 * * 1", async () => {
	await User.updateMany({}, { $set: { weeklyChars: consts.weeklyCharacters } });
	console.log("Reset settimanale eseguito");
});

// Reset mensile (il primo di ogni mese)
cron.schedule("0 0 1 * *", async () => {
	await User.updateMany(
		{},
		{ $set: { monthlyChars: consts.monthlyCharacters } }
	);
	console.log("Reset mensile eseguito");
});

// Cron job per selezionare e pubblicare il messaggio più controverso
cron.schedule("*/30 * * * *", async () => {
	try {
		// Trova tutti i messaggi controversi
		const users = await User.find({});
		let allControversialMessageIds = [];

		users.forEach((user) => {
			allControversialMessageIds = allControversialMessageIds.concat(
				user.controversialMessages
			);
		});

		// Elimina eventuali duplicati
		allControversialMessageIds = [...new Set(allControversialMessageIds)];

		// Trova tutti i messaggi controversi
		const controversialMessages = await Message.find({
			_id: { $in: allControversialMessageIds },
			channel: { $ne: "CONTROVERSIAL" }, // Escludi i messaggi già nel canale CONTROVERSIAL
		});

		let mostControversialMessage = null;
		let highestReactionCount = 0;

		controversialMessages.forEach((message) => {
			if (!message.channel.includes("CONTROVERSIAL")) {
				const totalReactions =
					message.positiveReactions + message.negativeReactions;
				if (totalReactions > highestReactionCount) {
					mostControversialMessage = message;
					highestReactionCount = totalReactions;
				}
			}
		});

		// Aggiungi il canale "CONTROVERSIAL" al messaggio selezionato
		if (mostControversialMessage) {
			mostControversialMessage.channel.push("CONTROVERSIAL");
			await mostControversialMessage.save();
			console.log(
				'Messaggio più controverso pubblicato nel canale "CONTROVERSIAL".'
			);
		}
	} catch (error) {
		console.error(
			"Errore durante la selezione del messaggio controverso:",
			error
		);
	}
});

// Esempio di funzione per recuperare una ricetta dal TheMealDB API
const fetchDailyRecipe = async () => {
	try {
		const response = await fetch(
			"https://www.themealdb.com/api/json/v1/1/random.php"
		);
		const data = await response.json();
		// Estrai la ricetta dai dati ricevuti
		return data.meals[0];
	} catch (error) {
		console.error("Errore durante il recupero della ricetta:", error);
	}
};

// Esempio di funzione per recuperare notizie dal NewsAPI
const fetchLatestNews = async () => {
	try {
		const response = await fetch(
			"https://newsapi.org/v2/top-headlines?country=us&apiKey=7e852106213a4de0a77368882cc8c7bc"
		);
		const data = await response.json();
		// Estrai le notizie dai dati ricevuti
		return data.articles;
	} catch (error) {
		console.error("Errore durante il recupero delle notizie:", error);
	}
};

const translateRecipeToMessage = async (recipe) => {
	try {
		const response = await fetch(recipe.strMealThumb);
	} catch (error) {
		console.error(
			"Errore durante il recupero e la conversione dell'immagine:",
			error
		);
	}

	return {
		user: "Squealer",
		profileImage: consts.logoBase64,
		image: recipe.strMealThumb,
		text: `${recipe.strMeal}\n\n${recipe.strInstructions}`,
		channel: ["DAILY-RECIPE"],
	};
};

const translateNewsToMessages = async (newsArray) => {
	// Prendi solo le prime 3 notizie
	const topNews = newsArray.slice(0, 3);

	const newsMessages = await Promise.all(
		topNews.map(async (newsItem) => {
			let imageBase64 = "";

			try {
				if (newsItem.urlToImage) {
					const response = await fetch(newsItem.urlToImage);
					const buffer = await response.buffer();
					imageBase64 = buffer.toString("base64");
				}
			} catch (error) {
				console.error(
					"Errore durante il recupero e la conversione dell'immagine:",
					error
				);
			}

			return {
				user: "Squealer",
				profileImage: consts.logoBase64,
				image: imageBase64 ? `data:image/jpeg;base64,${imageBase64}` : null,
				text: `${newsItem.title}\n\n${newsItem.description}`,
				channel: ["DAILY-NEWS"],
			};
		})
	);

	return newsMessages;
};

// Pubblica una ricetta al giorno
cron.schedule("0 0 * * *", async () => {
	const recipe = await fetchDailyRecipe();
	if (recipe) {
		const recipeMessageData = await translateRecipeToMessage(recipe);
		const recipeMessage = new Message(recipeMessageData);
		try {
			await recipeMessage.save();
			console.log("Messaggio della ricetta salvato con successo nel database.");
		} catch (error) {
			console.error(
				"Errore durante il salvataggio del messaggio della ricetta:",
				error
			);
		}
	}
});

// Pubblica le notizie ogni ora
cron.schedule("0 0 * * *", async () => {
	const news = await fetchLatestNews();
	if (news?.length) {
		try {
			const newsMessages = await translateNewsToMessages(news);

			// Itera su ogni messaggio di notizia e salvalo nel database
			for (const newsMessageData of newsMessages) {
				const newsMessage = new Message(newsMessageData);
				await newsMessage.save();
			}

			console.log("Notizie salvate con successo nel database.");
		} catch (error) {
			console.error("Errore durante il salvataggio delle notizie:", error);
		}
	}
});

app.use("/messages", messageRoutes);

module.exports = app;
