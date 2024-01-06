<template>
  <div class="input-squeals-container">
    <RecipientSelector
      :recipientType="recipientType"
      @update:recipientType="(val) => (recipientType = val)"
      :searchTerm="searchTerm"
      @update:searchTerm="handleSearchChange"
      :filteredChannels="filteredChannels"
      :filteredUsers="filteredUsers"
      @userSelect="handleUserSelect"
      @channelSelect="handleChannelSelect"
      :selectedUsers="selectedUsers"
      :selectedChannels="selectedChannels"
      @removeUser="handleRemoveUser"
      @removeChannel="handleRemoveChannel"
    />
    <MessageInput
      :message="message"
      @messageChange="handleMessageChange"
      @textSelect="handleTextSelect"
    />
    <LinkInserter @insertLink="handleInsertLink" />
    <CharCounter
      :dailyCharacters="dailyCharacters"
      :weeklyCharacters="weeklyCharacters"
      :monthlyCharacters="monthlyCharacters"
    />
    <ImageUploader
      :image="image"
      :imagePreview="imagePreview"
      @imageChange="handleImageChange"
      @removeImage="handleRemoveImage"
    />
    <LocationSharer :showMap="showMap" @toggleMap="toggleMap" />
    <TemporaryMessageOptions
      :isTemp="isTemp"
      @toggleTemp="toggleTemp"
      :updateInterval="updateInterval"
      @updateIntervalChange="handleUpdateIntervalChange"
      :maxSendCount="maxSendCount"
      @maxSendCountChange="handleMaxSendCountChange"
    />
    <PublishButton @publish="handlePublish" />
    <div v-if="errorMessage" style="color: red">{{ errorMessage }}</div>
  </div>
</template>

<script>
import { ref, onMounted, watch } from "vue";
import Cookies from "js-cookie";
import CharCounter from "./CharCounter.vue";
import ImageUploader from "./ImageUploader.vue";
import LinkInserter from "./LinkInserter.vue";
import LocationSharer from "./LocationSharer.vue";
import MessageInput from "./MessageInput.vue";
import PublishButton from "./PublishButton.vue";
import RecipientSelector from "./RecipientSelector.vue";
import TemporaryMessageOptions from "./TemporaryMessageOptions.vue";

export default {
  components: {
    CharCounter,
    RecipientSelector,
    ImageUploader,
    LinkInserter,
    LocationSharer,
    MessageInput,
    PublishButton,
    TemporaryMessageOptions,
  },
  setup() {
    const message = ref("");

    const dailyCharacters = ref(0);
    const weeklyCharacters = ref(0);
    const monthlyCharacters = ref(0);
    const initialDailyCharacters = ref(0);
    const initialWeeklyCharacters = ref(0);
    const initialMonthlyCharacters = ref(0);

    const errorMessage = ref("");

    const selection = ref({ start: 0, end: 0 });

    const isTemp = ref(false);
    const updateInterval = ref(0);
    const maxSendCount = ref(0);

    const currentLocation = ref(null);
    const showMap = ref(false);

    const recipientType = ref("user");
    const filteredChannels = ref([]);
    const searchTerm = ref("");
    const channels = ref([]);
    const selectedChannels = ref([]);
    const filteredUsers = ref([]);
    const users = ref([]);
    const selectedUsers = ref([]);
    const publicMessage = ref(false);

    const image = ref(null);
    const imagePreview = ref(null);

    const vipUsername = ref(null);

    onMounted(() => {
      const authToken = Cookies.get("authToken");
      if (authToken) {
        fetch("http://localhost:3500/verifyTokenSMM", {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        })
          .then((response) => response.json())
          .then((data) => {
            vipUsername.value = data.vip; // Salva lo username del VIP

            fetch(
              `http://localhost:3500/channels/subscribed/${vipUsername.value}`
            )
              .then((response) => response.json())
              .then((data) => {
                const nonModeratorChannels = data.filter(
                  (channel) => !channel.moderatorChannel
                );
                channels.value = nonModeratorChannels;
              })
              .catch((error) =>
                console.error("Errore durante il recupero dei canali:", error)
              );

            fetch("http://localhost:3500/usr")
              .then((response) => response.json())
              .then((data) => (users.value = data))
              .catch((error) =>
                console.error("Errore durante il recupero degli utenti:", error)
              );
          })
          .catch((error) =>
            console.error("Errore durante la verifica del token:", error)
          );
      }
    });

    watch(selectedChannels, (newValue) => {
      if (newValue.length === 0) {
        publicMessage.value = false;
      } else if (!publicMessage.value) {
        publicMessage.value = true;
      }
    });

    watch(publicMessage, (newValue) => {
      if (newValue) {
        const charCounter =
          (currentLocation.value != null ? 50 : 0) +
          (image.value != null ? 50 : 0) +
          message.value.length;
        if (
          charCounter <= initialDailyCharacters.value &&
          charCounter <= initialWeeklyCharacters.value &&
          charCounter <= initialMonthlyCharacters.value
        ) {
          dailyCharacters.value = initialDailyCharacters.value - charCounter;
          weeklyCharacters.value = initialWeeklyCharacters.value - charCounter;
          monthlyCharacters.value =
            initialMonthlyCharacters.value - charCounter;
        } else {
          selectedChannels.value = [];
          alert("Not enough characters to send your message (to a channel)");
        }
      } else {
        dailyCharacters.value = initialDailyCharacters.value;
        weeklyCharacters.value = initialWeeklyCharacters.value;
        monthlyCharacters.value = initialMonthlyCharacters.value;
      }
    });

    watch([searchTerm, channels, users, recipientType], () => {
      if (recipientType.value === "channel") {
        filteredChannels.value = channels.value
          .filter((channel) =>
            channel.name.toLowerCase().includes(searchTerm.value.toLowerCase())
          )
          .slice(0, 5); // Limita a 5 canali
      } else if (recipientType.value === "user") {
        filteredUsers.value = users.value
          .filter((user) =>
            user.username.toLowerCase().includes(searchTerm.value.toLowerCase())
          )
          .slice(0, 5); // Limita a 5 utenti
      }
    });

    //FUNZIONI PER DESTINATARI
    const handleSearchChange = () => {
      if (recipientType.value === "user") {
        filteredUsers.value = users.value.filter((user) =>
          user.username.toLowerCase().includes(searchTerm.value.toLowerCase())
        );
      } else if (recipientType.value === "channel") {
        filteredChannels.value = channels.value.filter((channel) =>
          channel.name.toLowerCase().includes(searchTerm.value.toLowerCase())
        );
      }
    };

    const handleUserSelect = (newUser) => {
      if (!selectedUsers.value.some((user) => user._id === newUser._id)) {
        selectedUsers.value.push(newUser);
      }
    };

    const handleChannelSelect = (newChannel) => {
      if (
        !selectedChannels.value.some(
          (channel) => channel._id === newChannel._id
        )
      ) {
        selectedChannels.value.push(newChannel);
      }
    };

    const handleRemoveUser = (userId) => {
      selectedUsers.value = selectedUsers.value.filter(
        (user) => user._id !== userId
      );
    };

    const handleRemoveChannel = (channelId) => {
      selectedChannels.value = selectedChannels.value.filter(
        (channel) => channel._id !== channelId
      );
    };

    //FUNZIONI PER MESSAGGIO
    const handleMessageChange = () => {
      const charCounter =
        (currentLocation.value != null ? 50 : 0) +
        (image.value != null ? 50 : 0) +
        message.value.length;
      if (
        charCounter <= initialDailyCharacters.value &&
        charCounter <= initialWeeklyCharacters.value &&
        charCounter <= initialMonthlyCharacters.value
      ) {
        dailyCharacters.value = initialDailyCharacters.value - charCounter;
        weeklyCharacters.value = initialWeeklyCharacters.value - charCounter;
        monthlyCharacters.value = initialMonthlyCharacters.value - charCounter;
      }
    };

    //FUNZIONI PER IMMAGINI
    const handleImageChange = (event) => {
      if (selectedChannels.value.length !== 0) {
        if (
          dailyCharacters.value >= 50 &&
          weeklyCharacters.value >= 50 &&
          monthlyCharacters.value >= 50
        ) {
          dailyCharacters.value -= 50;
          weeklyCharacters.value -= 50;
          monthlyCharacters.value -= 50;
        } else {
          alert("Not enough characters for an image upload.");
          return;
        }
      }

      const file = event.target.files && event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          image.value = e.target.result; // Salva l'immagine in base64
          imagePreview.value = e.target.result; // Imposta l'anteprima dell'immagine
        };
        reader.readAsDataURL(file);
      }
    };

    const handleRemoveImage = () => {
      image.value = null;
      imagePreview.value = null;
      if (selectedChannels.value.length !== 0) {
        dailyCharacters.value += 50;
        weeklyCharacters.value += 50;
        monthlyCharacters.value += 50;
      }
    };

    //FUNZIONI PER POSIZIONE
    const toggleMap = () => {
      if (showMap.value) {
        handleCloseMap();
      } else {
        handleOpenMap();
      }
    };

    const handleOpenMap = () => {
      if (selectedChannels.value.length !== 0) {
        if (
          dailyCharacters.value >= 50 &&
          weeklyCharacters.value >= 50 &&
          monthlyCharacters.value >= 50
        ) {
          dailyCharacters.value -= 50;
          weeklyCharacters.value -= 50;
          monthlyCharacters.value -= 50;
        } else {
          alert("Not enough characters for a position upload.");
          return;
        }
      }
      showMap.value = true;
      handleGetLocation();
    };

    const handleCloseMap = () => {
      showMap.value = false;
      currentLocation.value = null;
      if (selectedChannels.value.length !== 0) {
        dailyCharacters.value += 50;
        weeklyCharacters.value += 50;
        monthlyCharacters.value += 50;
      }
    };

    const handleGetLocation = () => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          if (latitude != null && longitude != null) {
            currentLocation.value = [latitude, longitude];
          } else {
            console.error("Invalid coordinates received");
          }
        },
        (error) => {
          console.error("Error getting location:", error);
        }
      );
    };

    //FUNZIONI PER LINK
    const handleTextSelect = (event) => {
      selection.value = {
        start: event.target.selectionStart,
        end: event.target.selectionEnd,
      };
    };

    const handleInsertLink = (url) => {
      if (url && selection.value.start !== selection.value.end) {
        const beforeText = message.value.substring(0, selection.value.start);
        const linkText = message.value.substring(
          selection.value.start,
          selection.value.end
        );
        const afterText = message.value.substring(selection.value.end);
        message.value = `${beforeText}[${linkText}](${url})${afterText}`;
      } else {
        alert("Per favore, seleziona del testo nel messaggio per linkarlo.");
      }
    };

    const promptForLink = () => {
      const url = prompt("Inserisci l'URL del link:");
      handleInsertLink(url);
    };

    //FUNZIONI PER MESSAGGI TEMPORANEI
    const toggleTemp = () => {
      isTemp.value = !isTemp.value;
      if (!isTemp.value) {
        updateInterval.value = "";
        maxSendCount.value = "";
      }
    };

    const handleUpdateIntervalChange = () => {
      const numericValue = parseInt(updateInterval.value);
      if (!isNaN(numericValue)) {
        if (numericValue >= 1 && numericValue <= 15) {
          updateInterval.value = numericValue;
        } else {
          updateInterval.value = numericValue < 1 ? 1 : 60;
        }
      }
    };

    const handleMaxSendCountChange = () => {
      const numericValue = parseInt(maxSendCount.value);
      if (!isNaN(numericValue)) {
        if (numericValue >= 1 && numericValue <= 20) {
          maxSendCount.value = numericValue;
        } else {
          maxSendCount.value = numericValue < 1 ? 1 : 20;
        }
      }
    };

    const handlePublish = async () => {
      const savedMessage = message.value;

      if (
        savedMessage &&
        (selectedChannels.value.length > 0 || selectedUsers.value.length > 0)
      ) {
        message.value = "";
        image.value = null;
        imagePreview.value = null;
        errorMessage.value = "";
        if (vipUsername.value) {
          try {
            const currentTime = new Date();
            const isTempMessage = updateInterval.value && maxSendCount.value;
            if (
              isTempMessage &&
              (!updateInterval.value || !maxSendCount.value)
            ) {
              alert(
                "Please enter valid update interval and max send count for temporary messages."
              );
              return;
            }
            const requestData = {
              userName: vipUsername.value,
              image: image.value,
              text: savedMessage,
              dailyCharacters: dailyCharacters.value,
              weeklyCharacters: weeklyCharacters.value,
              monthlyCharacters: monthlyCharacters.value,
              updateInterval: isTempMessage ? updateInterval.value : undefined,
              maxSendCount: isTempMessage ? maxSendCount.value : undefined,
              nextSendTime: isTempMessage
                ? new Date(currentTime.getTime() + updateInterval.value * 60000)
                : undefined,
              location: currentLocation.value
                ? {
                    latitude: currentLocation.value[0],
                    longitude: currentLocation.value[1],
                  }
                : null,
              recipients: {
                channels: selectedChannels.value.map((channel) => channel.name),
                users: selectedUsers.value.map((user) => user.username),
              },
            };

            const url = "http://localhost:3500/create";
            const requestOptions = {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(requestData),
            };

            const response = await fetch(url, requestOptions);

            if (response.status === 201) {
              window.location.reload(); //Da modificare, non va bene ricaricare tutto
            } else {
              const data = await response.json();
              console.error(
                "Errore nella creazione del messaggio:",
                data.error
              );
            }
          } catch (error) {
            console.error("Errore nella creazione del messaggio:", error);
          }
        }
      } else {
        let errorText = "";
        if (!savedMessage) {
          errorText = "Scrivi qualcosa";
        } else if (
          selectedChannels.value.length === 0 &&
          selectedUsers.value.length === 0
        ) {
          errorText = "Seleziona un destinatario";
        }
        errorMessage.value = errorText;
      }
    };

    return {
      message,
      dailyCharacters,
      weeklyCharacters,
      monthlyCharacters,
      initialDailyCharacters,
      initialWeeklyCharacters,
      initialMonthlyCharacters,
      errorMessage,
      publicMessage,
      isTemp,
      updateInterval,
      maxSendCount,
      currentLocation,
      showMap,
      recipientType,
      filteredChannels,
      searchTerm,
      channels,
      selectedChannels,
      filteredUsers,
      users,
      selectedUsers,
      image,
      imagePreview,

      handleSearchChange,
      handleChannelSelect,
      handleUserSelect,
      handleRemoveChannel,
      handleRemoveUser,
      handleMessageChange,
      handleImageChange,
      handleRemoveImage,
      toggleMap,
      handleCloseMap,
      handleOpenMap,
      handleGetLocation,
      handleTextSelect,
      handleInsertLink,
      promptForLink,
      toggleTemp,
      handleUpdateIntervalChange,
      handleMaxSendCountChange,
      handlePublish,
    };
  },
};
</script>
