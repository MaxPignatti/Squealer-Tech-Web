<template>
    <div class="login-container">
      <form @submit.prevent="login">
        <div>
          <label for="username">Username</label>
          <input type="text" id="username" v-model="username" required>
        </div>
        <div>
          <label for="password">Password</label>
          <input type="password" id="password" v-model="password" required>
        </div>
        <button type="submit">Login</button>
      </form>
    </div>
  </template>
  
  <script>
  export default {
    data() {
      return {
        username: '',
        password: ''
      };
    },
    methods: {
      login() {
        // Implementa qui la logica di login
      }
    }
  };
  </script>
  
  <style scoped>
  /* Aggiungi qui gli stili per il componente di login */
  </style>
  