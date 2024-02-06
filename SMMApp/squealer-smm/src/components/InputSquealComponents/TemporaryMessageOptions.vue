<template>
  <div class="flex flex-col items-center justify-center space-y-2">
    <button
      class="bg-indigo-500 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded"
      @click="$emit('toggleTemp')"
    >
      {{ isTemp ? "Annulla" : "Messaggio Multiplo" }}
    </button>

    <div v-if="isTemp" class="space-y-2">
      <div v-if="isTemp" class="space-y-2">
        <div>
          <label class="block text-sm font-medium text-gray-700"
            >Intervallo di Aggiornamento (minuti):</label
          >
          <input
            ref="firstInput"
            type="number"
            aria-label="Intervallo di Aggiornamento in minuti"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            :value="updateInterval"
            @input="$emit('updateIntervalChange', Number($event.target.value))"
            min="1"
            max="15"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700"
            >Massimo Numero di Invii:</label
          >
          <input
            type="number"
            aria-label="Massimo Numero di Invii"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            :value="maxSendCount"
            @input="$emit('maxSendCountChange', Number($event.target.value))"
            min="1"
            max="20"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    isTemp: Boolean,
    updateInterval: Number,
    maxSendCount: Number,
  },
  methods: {
    toggleTempAndUpdateFocus() {
      this.$emit("toggleTemp");
      this.$nextTick(() => {
        if (this.isTemp) {
          this.$refs.firstInput.focus();
        }
      });
    },
  },
};
</script>
