const User = require("../models/user");
const Message = require("../models/message");
const bcrypt = require("bcrypt");

exports.getUser = async (req, res) => {
  try {
    const username = req.params.username;
    const user = await User.findOne({ username: username });
    if (!user) {
      return res.status(404).json({ message: "Utente non trovato" });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Errore del server" });
  }
};

// Funzione helper per determinare l'oggetto sort in base ai parametri della richiesta
function determineSortObject(sortField, sortOrder) {
  const sortDirection = sortOrder === "asc" ? 1 : -1;
  switch (sortField) {
    case "popularity":
      return { positiveMessages: sortDirection };
    case "accountType":
      return { isPro: sortDirection };
    default:
      return { [sortField]: sortDirection };
  }
}

exports.getAllUsers = async (req, res) => {
  try {
    const { sortField, sortOrder } = req.query;
    // Usa la funzione helper per costruire l'oggetto sort
    const sort =
      sortField && sortOrder ? determineSortObject(sortField, sortOrder) : {};
    const users = await User.find({}).sort(sort);
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Controller function to get user data by ID
exports.getUserByEmail = async (req, res) => {
  try {
    const { email } = req.params;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.updateUserProfile = async (req, res) => {
  try {
    let {
      profileImage,
      firstName,
      lastName,
      oldUserName,
      username,
      email,
      socialMediaManagerEmail,
    } = req.body;
    const newUserName = username;
    username = oldUserName;

    const user = await User.findOne({ username });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check if the new email is already in use
    if (email && email !== user.email) {
      const existingUserWithEmail = await User.findOne({ email });
      if (existingUserWithEmail) {
        return res.status(400).json({ error: "Email is already in use" });
      }
    }

    // Check if the new username is already in use
    if (newUserName && newUserName !== oldUserName) {
      const existingUserWithUsername = await User.findOne({ newUserName });
      if (existingUserWithUsername) {
        return res.status(400).json({ error: "Username is already in use" });
      }
    }

    // Verifica se l'utente è Pro per aggiungere/rimuovere un SMM
    if (!user.isPro) {
      return res.status(403).json({
        error: "Only Pro users can modify Social Media Manager settings",
      });
    }

    // Rimozione dell'SMM
    if (
      socialMediaManagerEmail === null &&
      user.socialMediaManagerEmail !== null
    ) {
      const currentSMM = await User.findOne({
        email: user.socialMediaManagerEmail,
      });
      if (currentSMM && currentSMM.vipUserName === user.username) {
        currentSMM.vipUserName = null;
        user.socialMediaManagerEmail = null;
        await currentSMM.save();
      }
    } else if (
      socialMediaManagerEmail &&
      socialMediaManagerEmail !== user.socialMediaManagerEmail
    ) {
      // Aggiunta o aggiornamento dell'SMM
      const newSMM = await User.findOne({
        email: socialMediaManagerEmail,
        isPro: true,
        vipUserName: null,
      });
      if (!newSMM) {
        return res
          .status(400)
          .json({ error: "Invalid SMM email or SMM cannot be assigned" });
      }
      newSMM.vipUserName = user.username;
      user.socialMediaManagerEmail = socialMediaManagerEmail;
      await newSMM.save();
    }

    user.username = newUserName || oldUserName;
    user.email = email || user.email;
    user.firstName = firstName || user.firstName;
    user.lastName = lastName || user.lastName;
    user.profileImage = profileImage || user.profileImage;

    await Message.updateMany(
      { user: oldUserName },
      { $set: { user: user.username, profileImage: user.profileImage } }
    );

    // Save the updated user data to the database
    await user.save();
    res.json({ message: "User profile updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.updateUserPassword = async (req, res) => {
  try {
    let { newPassword, oldPassword, username } = req.body;

    const user = await User.findOne({ username });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (oldPassword) {
      //check if the olderpassward match
      const passwordMatch = await bcrypt.compare(oldPassword, user.password);
      if (passwordMatch) {
        if (newPassword) {
          const hashedPassword = await bcrypt.hash(newPassword, 10);
          user.password = hashedPassword;
        } else {
          return res.status(401).json({ error: "new password miss" });
        }
      } else {
        return res
          .status(401)
          .json({ error: "the older password is incorrect" });
      }
    } else {
      return res.status(401).json({ error: "olser psw miss" });
    }

    // Save the updated user data to the database
    await user.save();

    res.json({ message: "Password updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.updateUserChars = async (req, res) => {
  try {
    const username = req.params.username;
    const { dailyChars, weeklyChars, monthlyChars } = req.body;

    // Trova l'utente dal database
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(404).json({ error: "Utente non trovato" });
    }

    // Aggiorna i valori dei caratteri rimanenti
    user.dailyChars = dailyChars;
    user.weeklyChars = weeklyChars;
    user.monthlyChars = monthlyChars;

    // Salva le modifiche nell'utente
    await user.save();

    res.json({ message: "Dati dell'utente aggiornati con successo" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Errore interno del server" });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const username = req.params.username;
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(404).json({ error: "Utente non trovato" });
    }

    // Elimina l'utente
    await User.deleteOne({ username });

    // Elimina i canali creati dall'utente
    await Channel.deleteMany({ creator: username });

    // Rimuove l'utente dalla lista dei membri di tutti i canali
    await Channel.updateMany(
      { members: username },
      { $pull: { members: username } }
    );

    res.json({ message: "Utente eliminato con successo" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Errore interno del server" });
  }
};

exports.toggleBlockUser = async (req, res) => {
  try {
    const username = req.params.username;
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(404).json({ error: "Utente non trovato" });
    }

    // Cambia lo stato di blocco dell'utente
    user.isBlocked = !user.isBlocked;

    // Salva le modifiche nell'utente
    await user.save();

    res.json({
      message: `Utente ${
        user.isBlocked ? "bloccato" : "sbloccato"
      } con successo`,
      blocked: user.isBlocked,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Errore interno del server" });
  }
};

exports.toggleModUser = async (req, res) => {
  try {
    const username = req.params.username;
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(404).json({ error: "Utente non trovato" });
    }

    // Cambia lo stato di blocco dell'utente
    user.isMod = !user.isMod;

    // Salva le modifiche nell'utente
    await user.save();

    res.json({
      message: `Utente ${
        user.isMod ? "é moderatore" : "non  é piú moderatore"
      } con successo`,
      isMod: user.isMod,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Errore interno del server" });
  }
};

exports.handleProAction = async (req, res) => {
  try {
    const { username } = req.params;
    const { action } = req.body; // 'action' può essere 'request' o 'cancel'

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ error: "Utente non trovato" });
    }

    if (action === "request") {
      // Logica per gestire la richiesta dell'account Pro
      user.isProRequested = true;
    } else if (action === "cancel") {
      // Logica per gestire l'annullamento della richiesta Pro
      user.isProRequested = false;
    } else {
      return res.status(400).json({ error: "Azione non valida" });
    }

    await user.save();
    res.json({
      message: `Richiesta Pro ${
        action === "request" ? "inviata" : "annullata"
      } con successo`,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Errore interno del server" });
  }
};

exports.proAcceptance = async (req, res) => {
  try {
    const { username } = req.params;
    const { accept } = req.body;

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ error: "Utente non trovato" });
    }

    if (accept) {
      user.isPro = true;
    }
    user.isProRequested = false;

    await user.save();
    res.json({
      message: `Richiesta Pro ${
        accept ? "accettata" : "rifiutata"
      } con successo per ${username}`,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Errore interno del server" });
  }
};
