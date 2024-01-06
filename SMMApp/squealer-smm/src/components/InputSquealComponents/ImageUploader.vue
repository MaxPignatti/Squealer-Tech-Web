<template>
  <div>
    <input type="file" @change="$emit('imageChange', $event)" class="mb-2" />
    <button
      class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-2"
      @click="$emit('removeImage')"
    >
      Rimuovi Immagine
    </button>
  </div>
</template>
