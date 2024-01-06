<template>
  <textarea
    class="form-textarea w-full p-2 border rounded"
    :value="message"
    @input="$emit('messageChange', $event.target.value)"
    @select="$emit('textSelect', $event)"
    placeholder="Inserisci il tuo messaggio..."
  ></textarea>
</template>

<script>
export default {
  props: {
    message: String,
  },
};
</script>
