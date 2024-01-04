<template>
    <div class="flex items-center justify-center min-h-screen bg-gray-100">
      <div class="max-w-md w-full bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
        <div class="mb-6">
          <!-- Logo -->
          <img src="../assets/logo.png" alt="Logo" class="mx-auto h-100 w-auto">
        </div>
        <form @submit.prevent="handleRegister" class="space-y-6">
          <div>
            <label for="firstName" class="block text-gray-700 text-sm font-bold mb-2">Nome</label>
            <input type="text" id="firstName" v-model="formData.firstName" required class="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
          </div>
          <div>
            <label for="lastName" class="block text-gray-700 text-sm font-bold mb-2">Cognome</label>
            <input type="text" id="lastName" v-model="formData.lastName" required class="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
          </div>
          <div>
            <label for="email" class="block text-gray-700 text-sm font-bold mb-2">Email</label>
            <input type="email" id="email" v-model="formData.email" required class="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
          </div>
          <div>
            <label for="password" class="block text-gray-700 text-sm font-bold mb-2">Password</label>
            <input type="password" id="password" v-model="formData.password" required class="appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline">
          </div>
          <div>
            <label for="confirmPassword" class="block text-gray-700 text-sm font-bold mb-2">Conferma Password</label>
            <input type="password" id="confirmPassword" v-model="formData.confirmPassword" required class="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
          </div>
          <div>
            <button type="submit" class="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">Registrati</button>
          </div>
        </form>
        <p class="mt-8 text-center text-sm text-gray-600">
          Hai già un account?
          <a href="/login" class="text-blue-500 hover:text-blue-800">Accedi</a>
        </p>
      </div>
    </div>
  </template>
  
  <script>
  import { useStore } from 'vuex';
  import { useRouter } from 'vue-router';
  import { onMounted } from 'vue';
    export default {
      setup() {
        const store = useStore();
        const router = useRouter();

        onMounted(() => {
          if (store.state.isAuthenticated) {
            router.push('/'); // Reindirizza alla homepage
          }
        });
      },
      data() {
          return {
          formData: {
              firstName: "",
              lastName: "",
              email: "",
              password: "",
              confirmPassword: "",
          },
          errorMessage: ""
          };
      },
      methods: {
        async handleRegister() {
          try {
              const response = await fetch('http://localhost:3500/registerSMM', {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
              },
              body: JSON.stringify(this.formData),
              });

              if (response.status === 201) {
              this.$router.push('/login'); // Redirect to the login page
              } else {
              const data = await response.json();
              this.errorMessage = data.error; // Set the error message
              }
          } catch (error) {
              console.error(error);
              this.errorMessage = 'Si è verificato un errore durante la registrazione.';
          }
        }
      }
    };
  </script>
  
  <style scoped>
  /* Aggiungi qui gli stili per il componente di registrazione */
  </style>
  