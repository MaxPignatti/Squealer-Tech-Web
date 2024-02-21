<template>
  <div id="app" role="main">
    <router-view></router-view>
  </div>
</template>

<script>
export default {
  mounted() {
    window.addEventListener("keydown", this.handleFirstTab);
  },
  methods: {
    handleFirstTab(e) {
      if (e.keyCode === 9) {
        // Codice 9 corrisponde al tasto Tab
        document.body.classList.add("user-is-tabbing");
        window.removeEventListener("keydown", this.handleFirstTab);
        window.addEventListener("mousedown", this.handleMouseDown);
      }
    },
    handleMouseDown() {
      document.body.classList.remove("user-is-tabbing");
      window.removeEventListener("mousedown", this.handleMouseDown);
      window.addEventListener("keydown", this.handleFirstTab);
    },
  },
};
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

.user-is-tabbing :focus {
  outline: 2px solid #ffd700;
  box-shadow: 0 0 0 3px rgba(0, 0, 0, 0.7);
  transition: outline 0.3s, box-shadow 0.3s;
}
</style>
