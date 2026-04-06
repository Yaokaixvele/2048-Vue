<script setup lang="ts">
import Block from './components/Block.vue';


</script>

<template>
  <div>
    <Block :is-merged="true" :is-new="true" :col="1" :row="1" :value="2"/>
  </div>
</template>
