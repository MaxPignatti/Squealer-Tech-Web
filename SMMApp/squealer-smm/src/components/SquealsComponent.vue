<template>
  <div class="container mx-auto p-4">
    <div v-if="messages.length === 0">Caricamento messaggi...</div>
    <div v-for="message in messages" :key="message._id" class="mb-4">
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
      vipUsername: null,
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
          })
          .catch((error) => {
            console.error("Errore durante il recupero dei messaggi:", error);
          });
      } else {
        console.error("User data not found in cookies");
      }
    },
  },
};
</script>
