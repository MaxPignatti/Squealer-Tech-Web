<template>
  <div class="container mx-auto">
    <InputSqueal />
    <Squeals />
  </div>
</template>

<script>
import InputSqueal from "./InputSquealComponents/InputSqueal.vue";
import Squeals from "./SquealsComponent.vue";
export default {
  components: {
    InputSqueal,
    Squeals,
  },
};
</script>
