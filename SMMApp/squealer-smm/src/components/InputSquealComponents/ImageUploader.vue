<template>
  <div>
    <input
      type="file"
      id="imageInput"
      @change="onImageChange"
      class="hidden"
      ref="fileInput"
    />
    <label
      for="imageInput"
      class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-2 cursor-pointer"
    >
      Aggiungi Immagine
    </label>
    <button
      class="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded mb-2"
      @click="onRemoveImage"
    >
      Rimuovi Immagine
    </button>
    <div v-if="imagePreview">
      <img :src="imagePreview" alt="Anteprima immagine" class="max-w-xs" />
    </div>
  </div>
</template>

<script>
export default {
  props: {
    imagePreview: String,
  },
  methods: {
    onImageChange(event) {
      this.$emit("imageChange", event);
      this.$refs.fileInput.value = ""; // Resetta l'input file
    },
    onRemoveImage() {
      this.$emit("removeImage");
      this.$refs.fileInput.value = ""; // Resetta l'input file
    },
  },
};
</script>
