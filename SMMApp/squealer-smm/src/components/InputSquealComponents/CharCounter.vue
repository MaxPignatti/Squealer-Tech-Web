<template>
  <div class="text-left mt-2 border-2 border-red-500 p-2" aria-live="polite">
    <b>Caratteri rimanenti</b>
    <ul>
      <li>Oggi: {{ dailyCharacters }}</li>
      <li>Questa settimana: {{ weeklyCharacters }}</li>
      <li>Questo mese: {{ monthlyCharacters }}</li>
    </ul>
  </div>
</template>

<script>
export default {
  props: {
    dailyCharacters: Number,
    weeklyCharacters: Number,
    monthlyCharacters: Number,
  },
};
</script>
