<template>
  <div class="flex justify-center">
    <div class="max-w-3xl w-full p-4 bg-white shadow-md rounded-lg">
      <div class="input-squeals-container">
        <RecipientSelector
          :searchTerm="searchTerm"
          @update:searchTerm="searchTerm = $event"
          :filteredChannels="filteredChannels"
          @channelSelect="handleChannelSelect"
          :selectedChannels="selectedChannels"
          @removeChannel="handleRemoveChannel"
        />
        <div class="flex flex-wrap">
          <div class="flex-1 min-w-0">
            <MessageInput
              :message="message"
              :dailyCharactersLimit="initialDailyCharacters"
              :weeklyCharactersLimit="initialWeeklyCharacters"
              :monthlyCharactersLimit="initialMonthlyCharacters"
              :imageAttached="image != null"
              @messageChange="handleMessageChange"
              @textSelect="handleTextSelect"
            />
          </div>
          <div class="flex-none px-2">
            <LinkInserter @insertLink="handleInsertLink" />
          </div>
        </div>

        <div class="flex justify-between items-center mt-4">
          <ImageUploader
            :image="image"
            :imagePreview="imagePreview"
            @imageChange="handleImageChange"
            @removeImage="handleRemoveImage"
          />
          <TemporaryMessageOptions
            :isTemp="isTemp"
            @toggleTemp="toggleTemp"
            :updateInterval="updateInterval"
            @updateIntervalChange="handleUpdateIntervalChange"
            :maxSendCount="maxSendCount"
            @maxSendCountChange="handleMaxSendCountChange"
          />
        </div>
        <div class="flex flex-wrap mt-4">
          <div class="flex-1 min-w-0">
            <CharCounter
              :dailyCharacters="dailyCharacters"
              :weeklyCharacters="weeklyCharacters"
              :monthlyCharacters="monthlyCharacters"
            />
          </div>

          <div class="flex-1 flex flex-col justify-end">
            <button
              class="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded self-end"
              @click="handlePublish"
            >
              Pubblica
            </button>
          </div>
        </div>
        <div v-if="errorMessage" style="color: red">{{ errorMessage }}</div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, watch } from "vue";
import Cookies from "js-cookie";
import CharCounter from "./CharCounter.vue";
import ImageUploader from "./ImageUploader.vue";
import LinkInserter from "./LinkInserter.vue";
import MessageInput from "./MessageInput.vue";
import RecipientSelector from "./RecipientSelector.vue";
import TemporaryMessageOptions from "./TemporaryMessageOptions.vue";

export default {
  components: {
    CharCounter,
    RecipientSelector,
    ImageUploader,
    LinkInserter,
    MessageInput,
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

    const filteredChannels = ref([]);
    const searchTerm = ref("");
    const channels = ref([]);
    const selectedChannels = ref([]);

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

            // Prima chiamata API per i canali
            return fetch(
              `http://localhost:3500/channels/subscribed/${vipUsername.value}`
            );
          })
          .then((response) => response.json())
          .then((data) => {
            const nonModeratorChannels = data.filter(
              (channel) => !channel.moderatorChannel
            );
            channels.value = nonModeratorChannels;

            // Seconda chiamata API per gli utenti
            return fetch(`http://localhost:3500/usr/${vipUsername.value}`);
          })
          .then((response) => {
            if (response.status === 200) {
              return response.json();
            } else {
              throw new Error("API call failed");
            }
          })
          .then((data) => {
            dailyCharacters.value = data.dailyChars;
            weeklyCharacters.value = data.weeklyChars;
            monthlyCharacters.value = data.monthlyChars;
            initialDailyCharacters.value = data.dailyChars;
            initialWeeklyCharacters.value = data.weeklyChars;
            initialMonthlyCharacters.value = data.monthlyChars;
          })
          .catch((error) => {
            console.error("API call error:", error);
          });
      } else {
        console.error("User data not found in cookies");
      }
    });

    watch([searchTerm, channels], () => {
      filteredChannels.value = channels.value
        .filter((channel) =>
          channel.name.toLowerCase().includes(searchTerm.value.toLowerCase())
        )
        .slice(0, 5);
    });

    watch([image], () => {
      const charCounter = (image.value != null ? 50 : 0) + message.value.length;

      dailyCharacters.value = initialDailyCharacters.value - charCounter;
      weeklyCharacters.value = initialWeeklyCharacters.value - charCounter;
      monthlyCharacters.value = initialMonthlyCharacters.value - charCounter;
    });

    //FUNZIONI PER DESTINATARI
    watch([searchTerm], () => {
      filteredChannels.value = channels.value.filter((channel) =>
        channel.name.toLowerCase().includes(searchTerm.value.toLowerCase())
      );
    });

    const handleChannelSelect = (newChannel) => {
      if (
        !selectedChannels.value.some(
          (channel) => channel._id === newChannel._id
        )
      ) {
        selectedChannels.value.push(newChannel);
      }
    };

    const handleRemoveChannel = (channelId) => {
      selectedChannels.value = selectedChannels.value.filter(
        (channel) => channel._id !== channelId
      );
    };

    //FUNZIONI PER MESSAGGIO
    const handleMessageChange = (newMessage) => {
      message.value = newMessage;
      const charCounter = (image.value != null ? 50 : 0) + newMessage.length;

      dailyCharacters.value = initialDailyCharacters.value - charCounter;
      weeklyCharacters.value = initialWeeklyCharacters.value - charCounter;
      monthlyCharacters.value = initialMonthlyCharacters.value - charCounter;
    };

    //FUNZIONI PER IMMAGINI
    const handleImageChange = (event) => {
      if (
        dailyCharacters.value <= 50 ||
        weeklyCharacters.value <= 50 ||
        monthlyCharacters.value <= 50
      ) {
        alert("Not enough characters for an image upload.");
        return;
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
        alert("Per favore, seleziona il testo a cui vuoi attribuire un link.");
      }
    };

    //FUNZIONI PER MESSAGGI TEMPORANEI
    const toggleTemp = () => {
      isTemp.value = !isTemp.value;
      if (!isTemp.value) {
        updateInterval.value = "";
        maxSendCount.value = "";
      }
    };

    const handleUpdateIntervalChange = (newInterval) => {
      updateInterval.value = Number(newInterval) || 0;
    };

    const handleMaxSendCountChange = (newMaxSendCount) => {
      maxSendCount.value = Number(newMaxSendCount) || 0;
    };

    //PUBLISH
    const handlePublish = async () => {
      const savedMessage = message.value;

      if (savedMessage && selectedChannels.value.length > 0) {
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
              location: null,
              recipients: {
                channels: selectedChannels.value.map((channel) => channel.name),
                users: [],
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
        } else if (selectedChannels.value.length === 0) {
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
      isTemp,
      updateInterval,
      maxSendCount,
      filteredChannels,
      searchTerm,
      channels,
      selectedChannels,
      image,
      imagePreview,

      handleChannelSelect,
      handleRemoveChannel,
      handleMessageChange,
      handleImageChange,
      handleRemoveImage,
      handleTextSelect,
      handleInsertLink,
      toggleTemp,
      handleUpdateIntervalChange,
      handleMaxSendCountChange,
      handlePublish,
    };
  },
};
</script>
