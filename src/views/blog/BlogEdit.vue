<template>
  <div>
    <!-- 新增修改弹窗 -->
    <Window
      :show="windowConfig.show"
      :buttons="windowConfig.buttons"
      @close="closeWindow"
    >
      <el-form :model="blogFormData" :rules="rules" ref="blogFormDataRef">
        <el-form-item prop="title">
          <div class="title-input">
            <el-input placeholder="请输入博客标题" v-model="blogFormData.title">
            </el-input>
          </div>
        </el-form-item>
        <el-form-item prop="content">
          <div :style="{ width: '100%' }">
            <EditorMarkdown
              :height="editoMarkdownrHeight"
              v-model="blogFormData.markdownContent"
              @htmlContent="setHtmlContent"
            ></EditorMarkdown>
          </div>
        </el-form-item>
      </el-form>

      <!-- <EditorHtml :height="editorHtmlHeight"></EditorHtml> -->
      <Dialog
        :show="dialogConfig.show"
        :title="dialogConfig.title"
        :buttons="dialogConfig.buttons"
        :show-close="dialogConfig.showClose"
        width="800px"
        @close="dialogConfig.show = false"
        ><el-form
          :model="settingsFormData"
          :rules="rules"
          ref="settingsFormRef"
          label-width="80px"
          class="blog-setting-form"
        >
          <el-form-item prop="categoryID" label="博客分类">
            <el-select
              v-model="settingsFormData.categoryID"
              clearable
              placeholder="请选择分类"
              :style="{ width: '100%' }"
            >
              <el-option
                v-for="(item, index) in categoryList"
                :key="index"
                :value="item.categoryId"
                :label="item.categoryName"
              ></el-option>
            </el-select>
          </el-form-item>
          <el-form-item prop="cover" label="封面">
            <cover-upload v-model="settingsFormData.cover"></cover-upload>
          </el-form-item>
          <el-form-item label="博客类型" prop="type">
            <el-radio-group v-model="settingsFormData.type">
              <el-radio :label="1">原创</el-radio>
              <el-radio :label="0">转载</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item
            label="原文地址"
            prop="reprintUrl"
            v-if="settingsFormData.type == 0"
          >
            <el-input
              v-model="settingsFormData.reprintUrl"
              placeholder="请输入原文地址"
            >
            </el-input>
          </el-form-item>

          <el-form-item label="评论" prop="allowComment">
            <div class="allow-comment">
              <el-radio-group v-model="settingsFormData.allowComment">
                <el-radio :label="1">允许</el-radio>
                <el-radio :label="0">不允许</el-radio>
              </el-radio-group>
              <span class="info"
                >请现在评论设置里设置好相应参数，评论才会生效</span
              >
            </div>
          </el-form-item>
          <el-form-item prop="summary" label="博客摘要">
            <el-input
              placeholder="请输入摘要"
              v-model="settingsFormData.summary"
              type="textarea"
              :autosize="{ minRows: 4, maxRows: 4 }"
            >
            </el-input>
          </el-form-item>
          <el-form-item prop="tag" label="博客标签">
            <div class="tag-input-panel">
              <div class="tag-list">
                <el-tag
                  v-for="(item, index) in settingsFormData.tag"
                  :key="index"
                  @close="closeTag(index)"
                  closable
                  class="tag-item"
                >
                  {{ item }}
                </el-tag>
              </div>
              <span class="info" v-if="settingsFormData.tag.length == 0"
                >添加标签更容易被搜索引擎收录</span
              >
              <span
                class="iconfont icon-add"
                @click="showTagInputHandler"
              ></span>
              <el-input
                class="tag-input"
                v-if="showTagInput"
                v-model="tagInputValue"
                @blur="tagInputResult"
                @keyup.enter="tagInputResult"
              ></el-input>
            </div>
          </el-form-item> </el-form
      ></Dialog>
    </Window>
  </div>
</template>

<script setup lang="ts">
import { getCurrentInstance, onMounted, reactive, ref } from "vue";
const { proxy } = getCurrentInstance();
const editoMarkdownrHeight = window.innerHeight - 60 - 20 - 30 - 50 - 50 - 10;
const editorHtmlHeight = window.innerHeight - 60 - 20 - 30 - 50 - 100 - 50;

const api = {
  loadAllCategory4Blog: "/category/loadAllCategory4Blog",
  saveBlog: "/blog/saveBlog",
  getUserInfo: "getUserInfo",
  getBlogDetail: "/blog/getBlogById",
  autoSave: "/blog/autoSaveBlog",
};

//新增，修改
const windowConfig = reactive({
  show: false,
  title: "博客设置",
  buttons: [
    {
      type: "danger",
      text: "确定",
      click: (e: any) => {
        showSettings();
      },
    },
  ],
});

const closeWindow = () => {
  windowConfig.show = false;
  loadDataList();
};

const showEdit = (type, data) => {
  windowConfig.show = true;
};

//博客正文
const blogFormDataRef = ref();
const blogFormData = ref({});
const rules = {
  title: [{ required: true, message: "请输入标题" }],
  content: [{ required: true, message: "请输入正文" }],
  categoryID: [{ required: true, message: "请选择博客分类" }],
  type: [{ required: true, message: "请选择博客类型" }],
  allowComment: [{ required: true, message: "请选择是否允许评论" }],
  reprintUrl: [{ required: true, message: "请输入原文地址" }],
};

//markdown编辑器设置html内容
const setHtmlContent = (htmlContent) => {
  blogFormData.value.content = htmlContent;
};
//博客设置弹窗
const settingsFormData = ref({ tag: [] });
//博客分类
const categoryList = ref([]);
const loadCategory = async () => {
  let result = await proxy.Request({
    url: api.loadAllCategory4Blog,
  });
  if (!result) {
    result;
  }
  categoryList.value = result.data;
};
onMounted(() => {
  loadCategory();
});
const dialogConfig = reactive({
  title: "标题",
  show: false,
  showClose: false,
  buttons: [
    {
      type: "danger",
      text: "确定",
      click: (e: any) => {
        submitBlog();
      },
    },
  ],
});

//第一步提交 展示配置弹窗
const showSettings = () => {
  blogFormDataRef.value.validate(async (valid: any) => {
    if (!valid) {
      return;
    }
    blogFormData.tag = blogFormData.tag == null ? [] : blogFormData.tag;
    dialogConfig.show = true;
  });
};

//标签输入
//删除标签

const closeTag = (index: number) => {
  settingsFormData.value.tag.splice(index, 1);
};
//是否显示tag输入框，取反
const showTagInput = ref(false);
const showTagInputHandler = () => {
  showTagInput.value = true;
};
//tag的值
const tagInputValue = ref(undefined);
const tagInputResult = (e: any) => {
  if (tagInputValue.value == undefined) {
    return;
  }
  showTagInput.value = false;
  if (settingsFormData.value.tag.indexOf(tagInputValue.value) == -1) {
    settingsFormData.value.tag.push(tagInputValue.value);
  }
  tagInputValue.value = undefined;
};

const settingsFormRef = ref();
const submitBlog = () => {
  settingsFormRef.value.validate(async (valid: any) => {
    if (!valid) {
      return;
    }
    const params = {};
    Object.assign(params, settingsFormData.value);
    params.tag = params.tag.join("|");
    let result = await proxy.Request({
      url: api.saveBlog,
      params,
    });
    if (!result) {
      return;
    }
    proxy.Message.success("保存博客成功");
    dialogConfig.show = false;
    closeWindow();
  });
};
</script>

<style lang="scss" scoped>
.title-input {
  width: 100%;
  border-bottom: 1px solid #ddd;
  .el-input__wrapper {
    box-shadow: none;
  }
  .el-input {
    font-size: 18px;
  }
}

.blog-setting-form {
  .allow-comment {
    display: flex;
    .info {
      margin-left: 10px;
      color: rgb(163, 157, 157);
      font-size: 13px;
    }
  }
  .tag-input-panel {
    display: flex;
    align-items: center;
    .tag-list {
      .tag-item {
        margin-right: 10px;
      }
    }
    .info {
      color: rgb(163, 157, 157);
      font-size: 13px;
      margin-right: 10px;
    }
    .icon-add {
      color: red;
      cursor: pointer;
      margin-right: 10px;
    }
    .tag-input {
      width: 100px;
    }
  }
}
</style>