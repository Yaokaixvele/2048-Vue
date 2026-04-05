<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';

// 获取浏览器宽度  注意：ref是在windowWith变后视图变，而非让windowWith和window.innerWIdth一样，所以需要设立方法然后绑定事件
const windowWith = ref(window.innerWidth)
const updateWith = () =>{
  windowWith.value = window.innerWidth
}
onMounted(() => {
  document.addEventListener('resize',updateWith)
})
onUnmounted(() => {
  document.removeEventListener('resize',updateWith)
})
</script>

<template>
  <div>
    
  </div>
</template>
