<template>
  <div class="space-y-4">
    <div class="text-lg font-semibold">Seleziona i canali destinatari:</div>

    <!-- Input di ricerca con menu a tendina -->
    <div class="relative">
      <input
        type="text"
        class="form-control w-full p-2 border border-gray-300 rounded"
        placeholder="Cerca canale..."
        v-model="searchTerm"
        @focus="isFocused = true"
        @blur="handleBlur"
        aria-label="Cerca canale"
      />
      <ul
        v-if="isFocused && searchTerm.length && filteredChannels.length"
        class="absolute w-full mt-1 z-10 bg-white border border-gray-200 rounded shadow-lg overflow-hidden"
      >
        <li
          v-for="channel in filteredChannels"
          :key="channel._id"
          class="px-4 py-2 hover:bg-gray-100 cursor-pointer"
          @click="selectChannel(channel)"
        >
          {{ channel.name }}
        </li>
      </ul>
    </div>

    <!-- Elenco canali selezionati -->
    <div class="border-t border-gray-200 pt-2 mt-4">
      <ul class="flex flex-wrap gap-2">
        <li
          v-for="channel in selectedChannels"
          :key="channel._id"
          class="bg-gray-100 p-2 rounded flex items-center gap-2"
        >
          <span class="text-gray-700">{{ channel.name }}</span>
          <button
            @click="removeChannel(channel._id)"
            class="text-red-500 hover:text-red-600"
            aria-label="Rimuovi"
          >
            &times;
          </button>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    filteredChannels: Array,
  },
  data() {
    return {
      searchTerm: "",
      isFocused: false,
      selectedChannels: [],
    };
  },
  methods: {
    selectChannel(channel) {
      if (
        !this.selectedChannels.some((selected) => selected._id === channel._id)
      ) {
        this.selectedChannels.push(channel);
        console.log("Canale selezionato:", channel); // Aggiunto console.log per il controllo
      }
      this.searchTerm = "";
      this.isFocused = false;
    },
    removeChannel(channelId) {
      this.selectedChannels = this.selectedChannels.filter(
        (c) => c._id !== channelId
      );
    },
    handleBlur() {
      // Ritardo prima di nascondere il menu a tendina
      setTimeout(() => {
        this.isFocused = false;
      }, 300);
    },
  },
};
</script>
