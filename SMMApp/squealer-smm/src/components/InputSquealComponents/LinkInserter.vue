<template>
  <button
    class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
    @click="promptForLink"
    aria-label="Inserisci un link"
  >
    Inserisci Link
  </button>
</template>

<script>
export default {
  methods: {
    promptForLink() {
      const url = prompt("Inserisci l'URL del link:");
      if (url) {
        this.$emit("insertLink", url);
      }
    },
  },
};
</script>
