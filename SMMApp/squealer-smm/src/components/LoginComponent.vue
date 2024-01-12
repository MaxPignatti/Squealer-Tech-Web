<template>
  <div class="flex items-center justify-center min-h-screen bg-gray-100">
    <div
      class="max-w-md w-full bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4"
      role="form"
    >
      <div class="mb-6">
        <img
          src="../assets/logo.png"
          alt="Logo di Squealer"
          class="mx-auto h-100 w-auto"
        />
      </div>
      <form
        @submit.prevent="handleLogin"
        class="space-y-6"
        aria-labelledby="form-title"
      >
        <h2 id="form-title" class="sr-only">Login</h2>
        <div>
          <label for="email" class="block text-gray-700 text-sm font-bold mb-2"
            >Email</label
          >
          <input
            type="text"
            id="email"
            v-model="email"
            required
            aria-required="true"
            class="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
        </div>
        <div>
          <label
            for="password"
            class="block text-gray-700 text-sm font-bold mb-2"
            >Password</label
          >
          <input
            type="password"
            id="password"
            v-model="password"
            required
            aria-required="true"
            class="appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
          />
        </div>
        <div
          v-if="errorMessage"
          class="text-red-500 text-center py-2"
          role="alert"
        >
          {{ errorMessage }}
        </div>
        <div>
          <button
            type="submit"
            class="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Login
          </button>
        </div>
      </form>
      <p class="mt-8 text-center text-sm text-gray-600">
        Non sei ancora registrato? Registrati sull'
        <a
          href="http://localhost:3000/registration"
          class="text-blue-500 hover:text-blue-800"
          aria-label="Registrati sull'app principale"
        >
          App principale
        </a>
        !
      </p>
    </div>
  </div>
</template>

<!-- Resto del codice JavaScript e CSS rimane invariato -->

<script>
import { ref } from "vue";
import { useStore } from "vuex";
import { useRouter } from "vue-router";
import Cookies from "js-cookie";
import { watch } from "vue";

export default {
  setup() {
    const store = useStore();
    const router = useRouter();
    const email = ref("");
    const password = ref("");
    const errorMessage = ref("");

    watch(
      () => store.state.isAuthenticated,
      (isAuthenticated) => {
        if (isAuthenticated) {
          router.push("/");
        }
      }
    );

    const handleLogin = async () => {
      try {
        const response = await fetch("http://localhost:3500/loginSMM", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email.value,
            password: password.value,
          }),
        });

        if (response.status === 200) {
          const data = await response.json();
          Cookies.set("authToken", data.user_data.accessToken, { expires: 1 });
          store.dispatch("login", data.user_data.email); // Aggiorna lo stato globale con userData
          if (data.user_data.vip) {
            store.commit("setVip", data.user_data.vip); // Aggiorna lo stato globale con l'oggetto VIP
          }
          router.push("/");
        } else {
          const data = await response.json();
          errorMessage.value = data.error;
        }
      } catch (error) {
        console.error(error);
        errorMessage.value = "Si è verificato un errore durante il login.";
      }
    };

    return { email, password, errorMessage, handleLogin };
  },
};
</script>
