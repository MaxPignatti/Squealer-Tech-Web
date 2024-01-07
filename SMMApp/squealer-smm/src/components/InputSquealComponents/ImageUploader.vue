<template>
  <div class="flex flex-col items-center justify-center space-y-2">
    <input
      type="file"
      id="imageInput"
      @change="onImageChange"
      class="hidden"
      ref="fileInput"
    />
    <label
      v-if="!imagePreview"
      for="imageInput"
      class="bg-yellow-500 hover:bg-yellow-700 text-black font-bold py-2 px-4 rounded cursor-pointer"
    >
      <font-awesome-icon icon="images" />
    </label>
    <button
      v-if="imagePreview"
      class="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
      @click="onRemoveImage"
    >
      Rimuovi Immagine
    </button>
    <div v-if="imagePreview">
      <img
        :src="imagePreview"
        alt="Anteprima immagine"
        class="max-w-xs mx-auto"
      />
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
