<template>
  <div>
    <v-skeleton-loader type="article" class="mb-4" />
    <v-skeleton-loader
      v-for="n in 2"
      :key="n"
      type="list-item-two-line, list-item-two-line, list-item-two-line"
      class="mb-4"
    />
  </div>
</template>

<script setup lang="ts">
</script>
