<template>
  <div>
    <input
      type="radio"
      name="recipientType"
      value="user"
      :checked="recipientType === 'user'"
      @change="$emit('update:recipientType', 'user')"
    />
    <input
      type="radio"
      name="recipientType"
      value="channel"
      :checked="recipientType === 'channel'"
      @change="$emit('update:recipientType', 'channel')"
    />
    <input
      type="text"
      class="form-control mb-2"
      :placeholder="
        recipientType === 'user' ? 'Cerca utente...' : 'Cerca canale...'
      "
      :value="searchTerm"
      @input="$emit('update:searchTerm', $event.target.value)"
    />
    <!-- Aggiungi qui ulteriori elementi dell'interfaccia utente per filteredChannels, filteredUsers, ecc. -->
  </div>
</template>

<script>
export default {
  props: {
    recipientType: String,
    searchTerm: String,
    filteredChannels: Array,
    filteredUsers: Array,
    selectedUsers: Array,
    selectedChannels: Array,
  },
  emits: [
    "update:recipientType",
    "update:searchTerm",
    "userSelect",
    "channelSelect",
    "removeUser",
    "removeChannel",
  ],
  // Metodi per gestire eventi come userSelect, channelSelect, ecc.
};
</script>
