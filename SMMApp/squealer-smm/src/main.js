import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import store from './store'; // Importa lo store Vuex
import './assets/styles.css';
import Cookies from 'js-cookie';

// Controlla se esiste un token di autenticazione nei cookies
const authToken = Cookies.get('authToken');
if (authToken) {
  store.dispatch('authenticate', authToken);
}

const app = createApp(App);

app.use(router);
app.use(store); // Registra lo store Vuex con l'app Vue
app.mount('#app');
