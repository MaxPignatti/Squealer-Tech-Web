<template>
  <div class="space-y-4">
    <div class="text-lg font-semibold">Seleziona i canali destinatari:</div>

    <input
      type="text"
      class="form-control mb-2 p-2 border border-gray-300 rounded w-full"
      :placeholder="'Cerca canale...'"
      :value="searchTerm"
      @input="$emit('update:searchTerm', $event.target.value)"
      aria-label="Cerca canale"
    />

    <div class="border-t border-gray-200 pt-2">
      <ul class="space-y-1">
        <li
          v-for="channel in filteredChannels"
          :key="channel._id"
          class="flex justify-between items-center"
        >
          <span class="text-gray-700">{{ channel.name }}</span>
          <button
            v-for="channel in filteredChannels"
            :key="channel._id"
            @click="$emit('channelSelect', channel)"
            class="text-green-500 hover:text-green-600 font-bold py-1 px-3"
            :aria-label="`Aggiungi ${channel.name}`"
          >
            +
          </button>
        </li>
      </ul>
    </div>

    <div class="border-t border-gray-200 pt-2 mt-4">
      <ul class="space-y-1">
        <li
          v-for="channel in selectedChannels"
          :key="channel._id"
          class="flex justify-between items-center bg-gray-100 p-2 rounded"
        >
          <span class="text-gray-700">{{ channel.name }}</span>
          <button
            v-for="channel in selectedChannels"
            :key="channel._id"
            @click="$emit('removeChannel', channel._id)"
            class="text-red-500 hover:text-red-600 font-bold py-1 px-3"
            :aria-label="`Rimuovi ${channel.name}`"
          >
            -
          </button>
        </li>
      </ul>
    </div>
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
