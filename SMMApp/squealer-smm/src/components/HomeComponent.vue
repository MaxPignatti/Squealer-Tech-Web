<template>
  <div>
    <nav class="bg-gray-800 text-white p-4" aria-label="Navigazione principale">
      <div class="container mx-auto flex justify-between items-center">
        <div>
          <a href="/" class="text-xl font-bold">SMM Squealer</a>
        </div>
        <div class="flex items-center">
          <span class="mr-4">VIP: {{ vipName }}</span>
          <button
            @click="logout"
            class="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-red-300 focus:ring-offset-2"
            aria-label="Logout"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
    <main class="container mx-auto py-4" role="main">
      <button
        @click="showInputSqueal = !showInputSqueal"
        :class="{
          'bg-green-500 hover:bg-green-700 text-white': !showInputSqueal,
          'bg-white text-green-500 border border-green-500 hover:bg-green-500 hover:text-white':
            showInputSqueal,
        }"
        class="font-bold py-2 px-4 rounded mb-4 transition-colors duration-200"
      >
        Nuovo Squeal
      </button>

      <div
        v-if="showInputSqueal"
        class="input-squeal-container"
        aria-live="polite"
      >
        <InputSqueal />
      </div>

      <div class="mt-6">
        <Squeals />
      </div>
    </main>
  </div>
</template>

<script>
import InputSqueal from "./InputSquealComponents/InputSqueal.vue";
import Squeals from "./SquealsComponent.vue";
import { useStore } from "vuex";
import { useRouter } from "vue-router";
import { ref } from "vue";
import Cookies from "js-cookie";

export default {
  components: {
    InputSqueal,
    Squeals,
  },
  setup() {
    const store = useStore();
    const router = useRouter();
    const vipName = ref(store.state.vip);
    const showInputSqueal = ref(false);

    const logout = () => {
      Cookies.remove("authToken");
      store.dispatch("logout");
      router.push("/login");
    };

    return {
      logout,
      vipName,
      showInputSqueal,
    };
  },
};
</script>

<style>
nav {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 1000;
}

.container.mx-auto.py-4 {
  padding-top: 6rem;
}

.input-squeal-container {
  padding: 1rem; /* Aggiunge spazio intorno a InputSqueal */
}

.mt-6 {
  margin-top: 1.5rem; /* Aggiunge spazio sopra Squeals */
}
</style>
