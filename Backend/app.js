const express = require("express");
require("./config/env");
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
const path = require("path");
const port = 8000;
const app = express();

app.use(bodyParser.json({ limit: "10mb" }));
const corsOptions = {
  origin: [
    "http://localhost:3000",
    "http://localhost:3001",
    "http://localhost:3002",
    "http://localhost:8080",
    "http://127.0.0.1:5500",
    "https://site222327.tw.cs.unibo.it",
  ],
  credentials: true,
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

app.use("/api", authRoutes);
app.use("/api", secureRoutes);
app.use("/api", userRoutes);
app.use("/api", messageRoutes);
app.use("/api", channelRoutes);
app.use("/api", shopRoutes);

mongoose
  .connect("mongodb://site222327:uo9feeGu@mongo_site222327", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {})
  .catch((err) => console.error("MongoDB connection error:", err));

const db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));
db.on("connected", console.error.bind(console, "MongoDB connected:"));

Channel.findOne({ name: "PUBLIC" })
  .then((channel) => {
    if (!channel) {
      const publicChannel = new Channel({
        name: "PUBLIC",
        creator: "Squealer",
        description: "Canale Pubblico",
        moderatorChannel: false,
      });
      publicChannel
        .save()
        .then(() => console.log('Canale "PUBLIC" creato con successo.'))
        .catch((err) =>
          console.error("Errore durante il salvataggio del canale:", err)
        );
    }
  })
  .catch((err) => console.error("Errore durante la ricerca del canale:", err));

Channel.findOne({ name: "CONTROVERSIAL" })
  .then((channel) => {
    if (!channel) {
      const controversialChannel = new Channel({
        name: "CONTROVERSIAL",
        creator: "Squealer",
        description: "Canale controverso",
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
        description: "Canale per vedere aggiornamenti",
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
        description: "Tutte le emergenze in tempo reale",
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
        description: "Iscriviti per fantastiche ricette!",
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
        description: "Notizie dell'ultima ora, solo da noi!",
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
          message.loveReactions +
          message.likeReactions +
          message.dislikeReactions +
          message.angryReactions;
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

//funzione per recuperare una ricetta dal TheMealDB API
const fetchDailyRecipe = async () => {
  try {
    const response = await fetch(
      "https://www.themealdb.com/api/json/v1/1/random.php"
    );
    const data = await response.json();
    return data.meals[0];
  } catch (error) {
    console.error("Errore durante il recupero della ricetta:", error);
  }
};

//funzione per recuperare notizie dal NewsAPI
const fetchLatestNews = async () => {
  try {
    const response = await fetch(
      "https://newsapi.org/v2/top-headlines?country=us&apiKey=7e852106213a4de0a77368882cc8c7bc"
    );
    const data = await response.json();
    return data.articles;
  } catch (error) {
    console.error("Errore durante il recupero delle notizie:", error);
  }
};

const translateRecipeToMessage = async (recipe) => {
  try {
    await fetch(recipe.strMealThumb);
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

cron.schedule("0 0 * * *", async () => {
  const news = await fetchLatestNews();
  if (news?.length) {
    try {
      const newsMessages = await translateNewsToMessages(news);

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
app.use((req, res, next) => {
  if (path.extname(req.path).toLowerCase() === ".js") {
    res.type("text/javascript");
  }
  next();
});

app.use((req, res, next) => {
  if (path.extname(req.path).toLowerCase() === ".css") {
    res.type("text/css");
  }
  next();
});

//mod dashboard

app.use("/moddash", express.static(path.join(__dirname, "../mod_dash")));
app.get("/moddash", (req, res) => {
  res.sendFile(path.join(__dirname, "../mod_dash/", "login.html"));
});

app.use("/smm", express.static(path.join(__dirname, "../smm/dist")));
app.use("/smm", (req, res) => {
  res.sendFile(path.join(__dirname, "../smm/dist", "index.html"));
});

//react app
app.use(express.static(path.join(__dirname, "../app/build")));
app.get("*", function (req, res) {
  res.sendFile(path.join(__dirname, "../app/build", "index.html"));
});
module.exports = app;
