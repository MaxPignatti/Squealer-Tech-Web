<template>
  <div
    class="container mx-auto px-4"
    role="region"
    aria-label="Gestione dei messaggi"
  >
    <div class="flex flex-col md:flex-row md:items-center mb-4">
      <!-- Bottoni per il filtraggio -->
      <div
        class="flex flex-wrap justify-center md:justify-start space-x-2 mb-2 md:mb-0"
      >
        <button :class="buttonClass('all')" @click="filterMessages('all')">
          Mostra Tutti
        </button>
        <button
          :class="buttonClass('popular')"
          @click="filterMessages('popular')"
        >
          Popolari
        </button>
        <button
          :class="buttonClass('unpopular')"
          @click="filterMessages('unpopular')"
        >
          Impopolari
        </button>
        <button
          :class="buttonClass('controversial')"
          @click="filterMessages('controversial')"
        >
          Controversi
        </button>
      </div>

      <div class="flex items-center space-x-2 ml-auto">
        <label for="sortOrder" class="text-gray-700 font-bold"
          >Ordina per:</label
        >
        <select
          id="sortOrder"
          v-model="selectedSort"
          class="bg-white text-gray-700 font-bold py-2 px-4 rounded border border-gray-300"
        >
          <option value="createdAt">Data</option>
          <option value="positiveReactions">Reazioni Positive</option>
          <option value="negativeReactions">Reazioni Negative</option>
        </select>

        <button
          @click="sortMessages(true)"
          class="bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-2 px-4 rounded"
        >
          ↑
        </button>
        <button
          @click="sortMessages(false)"
          class="bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-2 px-4 rounded"
        >
          ↓
        </button>
      </div>
    </div>
    <div v-if="messages.length === 0">Caricamento messaggi...</div>
    <div v-for="message in filteredMessages" :key="message._id" class="mb-4">
      <MessageComponent :message="message" />
    </div>
  </div>
</template>

<script>
import MessageComponent from "./MessageComponent.vue";
import Cookies from "js-cookie";

export default {
  components: {
    MessageComponent,
  },
  data() {
    return {
      messages: [],
      filteredMessages: [],
      vipUsername: null,
      currentFilter: "all",
      selectedSort: "createdAt",
    };
  },
  mounted() {
    this.verifyTokenAndFetchMessages();
  },
  methods: {
    verifyTokenAndFetchMessages() {
      const authToken = Cookies.get("authToken");
      if (authToken) {
        fetch("http://localhost:3500/verifyTokenSMM", {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        })
          .then((response) => response.json())
          .then((data) => {
            this.vipUsername = data.vip;
            return fetch(
              `http://localhost:3500/sentSqueals/${this.vipUsername}`
            );
          })
          .then((response) => response.json())
          .then((data) => {
            this.messages = data;
            this.filteredMessages = data;
            this.sortMessages(false);
          })
          .catch((error) => {
            console.error("Errore durante il recupero dei messaggi:", error);
          });
      } else {
        console.error("User data not found in cookies");
      }
    },
    filterMessages(filter) {
      this.currentFilter = filter; // Aggiorna il filtro corrente
      if (filter === "all") {
        this.filteredMessages = this.messages;
      } else {
        this.filteredMessages = this.messages.filter(
          (m) => m.popularity === filter
        );
      }
    },
    buttonClass(filter) {
      return [
        "text-white font-bold py-2 px-4 rounded mr-2",
        this.currentFilter === filter
          ? "bg-blue-700" // Colore per il bottone selezionato
          : "bg-blue-500 hover:bg-blue-700", // Colore per il bottone non selezionato
      ];
    },
    sortMessages(ascending) {
      this.filteredMessages.sort((a, b) => {
        let aValue = a[this.selectedSort];
        let bValue = b[this.selectedSort];

        // Convertire le date in timestamp per il confronto
        if (this.selectedSort === "createdAt") {
          aValue = new Date(aValue).getTime();
          bValue = new Date(bValue).getTime();
        }

        return ascending ? aValue - bValue : bValue - aValue;
      });
    },
  },
};
</script>
