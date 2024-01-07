<template>
  <div>
    <input
      type="text"
      class="form-control mb-2"
      :placeholder="'Cerca canale...'"
      :value="searchTerm"
      @input="$emit('update:searchTerm', $event.target.value)"
    />
    <!-- Aggiungi qui ulteriori elementi dell'interfaccia utente per filteredChannels, filteredUsers, ecc. -->
  </div>
</template>

<script>
export default {
  props: {
    searchTerm: String,
    filteredChannels: Array,
    selectedChannels: Array,
  },
  emits: ["update:searchTerm", "channelSelect", "removeChannel"],
};
</script>
