<template>
  <div class="text-right mt-2">
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
