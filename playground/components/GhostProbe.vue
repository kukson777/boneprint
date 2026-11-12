<script setup lang="ts">
const inSkeleton = useInSkeleton()
</script>

<template>
  <p>{{ inSkeleton ? 'in the ghost' : 'live' }}</p>
</template>
