<template>
  <div>
    <el-config-provider :locale="locale" :message="config">
      <router-view></router-view
    ></el-config-provider>
  </div>
</template>


<script setup lang="ts">
import zhCn from "element-plus/lib/locale/lang/zh-cn";
import { reactive } from "vue";
const locale = zhCn; //使用中文
const config = reactive({
  max: 1, //弹窗最大只有一个
});
</script>


<style scoped>
</style>
