<template>
  <div class="flex items-center justify-center min-h-screen bg-gray-100 px-4">
    <div class="max-w-lg w-full p-6 bg-white shadow-md rounded-lg space-y-6">
      <div class="text-center">
        <img
          src="../assets/logo.png"
          alt="Logo di Squealer"
          class="mx-auto h-48 w-auto"
        />
      </div>
      <form @submit.prevent="handleLogin" aria-labelledby="form-title">
        <h2 id="form-title" class="text-2xl font-semibold text-gray-800 mb-4">
          Login
        </h2>
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
            class="border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
            class="border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
            class="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:ring-4 focus:ring-blue-300 focus:ring-offset-2 transition-colors duration-200"
          >
            Login
          </button>
        </div>
      </form>
      <p class="mt-8 text-center text-sm text-gray-600">
        Non sei ancora registrato?
        <a
          href="http://localhost:3000/registration"
          class="text-blue-500 hover:text-blue-800"
          aria-label="Registrati sull'app principale"
        >
          Registrati sull'App principale</a
        >!
      </p>
    </div>
  </div>
</template>

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
            store.commit("setVip", data.user_data.vip);
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
