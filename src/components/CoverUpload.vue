<template>
  <el-upload
    name="file"
    :show-file-list="false"
    accept=".png,.PNG,.jpg,.JPG,.jpeg,.JPEG,.gif,.GIF,.bmp,.BMP"
    :multiple="false"
    :http-request="uploadImage"
  >
    <div class="cover-upload-btn">
      <template v-if="modelValue">
        <!-- 采用本地路径 -->
        <img :src="modelValue" alt="" />
        <!-- <img :src="proxy.globalInfo.imageUrl + modelValue" alt="" /> -->
      </template>
      <span class="iconfont icon-add" v-else></span>
    </div>
  </el-upload>
</template>

<script setup lang="ts">
import { getCurrentInstance } from "vue";
const { proxy } = getCurrentInstance();
const props = defineProps({
  modelValue: {
    type: String,
    default: null,
  },
});
const api = {
  uploadUrl: "file/uploadImage",
};

const emit = defineEmits();
const uploadImage = async (file: any) => {
  console.log(file);
  let result = await proxy.Request({
    url: api.uploadUrl,
    dataType: "file",
    params: {
      file: file.file,
      type: 0,
    },
  });
  //获取文件名
  const fileName = "../../src/assets/default_cover.bmp";
  //更新父参数
  // const fileName = result.data.fileName;
  emit("update:modelValue", fileName);
};
</script>

<style lang="scss">
.cover-upload-btn {
  width: 150px;
  height: 150px;
  background: #ddd;
  display: flex;
  align-items: center;
  justify-content: center;
  .iconfont {
    font-size: 30px;
    color: rgb(164, 164, 164);
  }
  img {
    width: 100%;
  }
}
</style>