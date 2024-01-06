<template>
  <div class="p-4">
    <div class="flex mb-4">
      <label class="flex items-center mr-4">
        <input
          type="radio"
          class="form-radio"
          value="user"
          v-model="recipientType"
        />
        <span class="ml-2">Utente Singolo</span>
      </label>
      <label class="flex items-center">
        <input
          type="radio"
          class="form-radio"
          value="channel"
          v-model="recipientType"
        />
        <span class="ml-2">Canale</span>
      </label>
    </div>
    <input
      type="text"
      class="form-input w-full mb-4"
      :placeholder="
        recipientType === 'user' ? 'Cerca utente...' : 'Cerca canale...'
      "
      v-model="searchTerm"
    />
  </div>
</template>

<script>
export default {
  props: {
    recipientType: String,
    searchTerm: String,
  },
};
</script>
