<template>
  <div>
    <button
      class="bg-indigo-500 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded mb-2"
      @click="$emit('toggleTemp')"
    >
      {{ isTemp ? "Annulla Aggiornamento" : "Imposta Aggiornamento" }}
    </button>
  </div>
</template>

<script>
export default {
  props: {
    isTemp: Boolean,
    updateInterval: Number,
    maxSendCount: Number,
  },
};
</script>
