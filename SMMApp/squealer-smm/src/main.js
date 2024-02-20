import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import "./assets/styles.css";
import Cookies from "js-cookie";
import { library } from "@fortawesome/fontawesome-svg-core";
import { faImages } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
const BASE_URL = "https://site222327.tw.cs.unibo.it/api";

library.add(faImages);
async function verifyAuthentication() {
	const authToken = Cookies.get("authToken");
	if (authToken) {
		try {
			// Sostituisci 'URL_DEL_SERVER' con l'URL effettivo del tuo server
			const response = await fetch(`${BASE_URL}/smm/session`, {
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
			router.push("/smm/login");
		}
	} else {
		store.dispatch("logout");
		router.push("/smm/login");
	}
}

const app = createApp(App);

app.use(router);
app.use(store);
app.component("font-awesome-icon", FontAwesomeIcon);
app.mount("#app");

verifyAuthentication();
