import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import "./assets/styles.css";
import Cookies from "js-cookie";

async function verifyAuthentication() {
  const authToken = Cookies.get("authToken");
  if (authToken) {
    try {
      // Sostituisci 'URL_DEL_SERVER' con l'URL effettivo del tuo server
      const response = await fetch("http://localhost:3500/verifyTokenSMM", {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      if (response.status === 200) {
        const userData = await response.json();
        store.dispatch("login", userData.email);
        store.commit("setVip", userData.vip);
      } else {
        throw new Error("Autenticazione fallita");
      }
    } catch (error) {
      console.error(error.message);
      Cookies.remove("authToken");
      store.dispatch("logout");
      router.push("/login");
    }
  } else {
    console.log("Nessun token di autenticazione trovato.");
    store.dispatch("logout");
    router.push("/login");
  }
}

const app = createApp(App);

app.use(router);
app.use(store);

app.mount("#app");

verifyAuthentication();
