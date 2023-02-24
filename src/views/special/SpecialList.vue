<template>
  <div>
    <el-button type="danger" size="small" @click="showEdit('add')"
      >新增专题</el-button
    >
    <el-row :gutter="10" :style="{ 'margin-top': '10px' }">
      <el-col :span="14">
        <el-card>
          <template #header>
            <div><span>专题</span></div>
          </template>
          <Table
            :columns="columns"
            :showPagination="true"
            :dataSource="tableData"
            :fetch="loadDataList"
            :options="tableOptions"
            @rowClick="rowClick"
            ref="dataTableRef"
          >
            <template #cover="{ index, row }">
              <Cover :cover="row.cover"></Cover>
            </template>
            <template #op="{ index, row }">
              <div class="op">
                <a
                  href="javascript:;"
                  class="a-link"
                  @click="showEdit('update', row)"
                  >修改</a
                >
                <el-divider direction="vertical" />
                <a href="javascript:;" class="a-link" @click="del(row)">删除</a>
                <el-divider direction="vertical" />
                <!-- <a
                href="javascript:;"
                :class="[index == 0 ? 'not-allow' : 'a-link']"
                @click="changeSort(index, 'up')"
                >上移</a
              >
              <el-divider direction="vertical" />
              <a
                href="javascript:;"
                :class="[
                  index == tableData.list.length - 1 ? 'not-allow' : 'a-link',
                ]"
                @click="changeSort(index, 'down')"
                >下移</a
              > -->
              </div>
            </template>
          </Table>
        </el-card>
      </el-col>
      <el-col :span="10">
        <el-card>
          <template #header>
            <div><span>专题文章</span></div>
          </template>
          <div class="special-blog-tree">
            <el-tree
              class="tree-panel"
              ref="refTree"
              :data="blogList"
              defaultExpandAll
              node-key="blogId"
              :expand-on-click-node="false"
              :props="treeProps"
              :highlight-current="true"
              draggable
              @node-drop="blogDrag"
            >
              <template #default="{ node, data }">
                <span class="custom-node-style">
                  <span class="node-title">
                    <span
                      v-if="data.status == 0"
                      :style="{ color: 'red', 'font-size': '13px' }"
                    >
                      {{ data.title }}</span
                    >
                    <span
                      v-else
                      :style="{ color: 'green', 'font-size': '13px' }"
                    >
                      {{ data.title }}</span
                    >
                  </span>
                  <span class="node-op">
                    <template v-if="data.blogId === '0'">
                      <a
                        class="a-link"
                        href="javascript:void(0)"
                        @click="editBlog('add', data)"
                        >新增文章</a
                      >
                    </template>
                    <template v-else>
                      <a
                        class="a-link"
                        href="javascript:void(0)"
                        @click="showDetail(data)"
                        >预览</a
                      >
                      <el-divider direction="vertical" />
                      <a
                        class="a-link"
                        href="javascript:void(0)"
                        @click="editBlog('edit', data)"
                        >修改</a
                      >
                      <!-- <span>--</span> -->
                      <el-divider direction="vertical" />
                      <a
                        class="a-link"
                        href="javascript:void(0)"
                        @click="delBlog(data)"
                        >删除</a
                      >
                      <!-- <span>--</span> -->
                      <el-divider direction="vertical" />
                      <a
                        class="a-link"
                        href="javascript:void(0)"
                        @click="editBlog('add', data)"
                        >新增下级文章</a
                      >
                    </template>
                  </span>
                </span>
              </template>
            </el-tree>
          </div>
        </el-card></el-col
      >
    </el-row>

    <Dialog
      :show="dialogConfig.show"
      :title="dialogConfig.title"
      :buttons="dialogConfig.buttons"
      :show-close="dialogConfig.showClose"
      width="500px"
      @close="dialogConfig.show = false"
      ><el-form
        :model="formData"
        :rules="rules"
        ref="formDataRef"
        label-width="80px"
      >
        <el-form-item prop="categoryName" label="名称">
          <el-input placeholder="请输入名称" v-model="formData.categoryName">
          </el-input>
        </el-form-item>
        <el-form-item prop="cover" label="封面">
          <cover-upload v-model="formData.cover"></cover-upload>
        </el-form-item>
        <el-form-item prop="brief" label="简介">
          <el-input
            placeholder="请输入简介"
            v-model="formData.brief"
            type="textarea"
            :autosize="{ minRows: 4, maxRows: 4 }"
          >
          </el-input>
        </el-form-item> </el-form
    ></Dialog>
    <BlogEdit ref="blogEditRef" @callback="saveBlogCallback"></BlogEdit>
  </div>
</template>

<script setup lang="ts">
import BlogEdit from "./BlogEdit.vue";
import { getCurrentInstance, nextTick, reactive, ref } from "vue";
const { proxy } = getCurrentInstance();

const api = {
  loadDataList: "/category/loadCategory4Special",
  saveCategory: "/category/saveCategory4Special",
  delCategory: "category/delCategory4Special",
  getSpecialInfo: "blog/getSpecialInfo",
  delBlog: "/blog/recoveryBlog",
  updateSpecialBlogSort: "blog/updateSpecialBlogSort",
};
const columns = [
  {
    label: "封面",
    prop: "cover",
    width: 100,
    scopedSlots: "cover",
  },
  {
    label: "名称",
    prop: "categoryName",
    width: 200,
  },
  {
    label: "简介",
    prop: "categoryDesc",
  },
  {
    label: "博客数量",
    prop: "blogCount",
    width: 100,
  },
  {
    label: "操作",
    prop: "op",
    width: 100,
    scopedSlots: "op",
  },
];
const tableOptions = {
  extHeight: 1,
};
const tableData = reactive({});
const loadDataList = async () => {
  let result = await proxy.Request({
    url: api.loadDataList,
  });

  if (!result) {
    return;
  }
  Object.assign(tableData, result.data);
};

//新增修改
const dialogConfig = reactive({
  title: "标题",
  show: false,
  showClose: false,
  buttons: [
    {
      type: "danger",
      text: "确定",
      click: (e: any) => {
        submitForm();
      },
    },
  ],
});
function submitForm(): void {
  //验证必填项
  formDataRef.value.validate(async (valid: any) => {
    if (!valid) {
      return;
    }
    let params = {};
    Object.assign(params, formData);
    let result = await proxy.Request({
      url: api.saveCategory,
      params,
    });
    if (!result) {
      return;
    }
    dialogConfig.show = false;
    proxy.message.success("保存成功");
    loadDataList();
  });
}

//新增表单
const formData = reactive({});
const formDataRef = ref();
const rules = {
  categoryName: [
    {
      required: true,
      message: "请输入分类名",
    },
  ],
};
const showEdit = (type: String, data: Object) => {
  dialogConfig.show = true;
  //在页面加载之后再赋值，防止报错，即延时进行
  nextTick(() => {
    formDataRef.value.resetFields();
    if (type == "add") {
      dialogConfig.title = "新增分类";
    } else if (type == "update") {
      dialogConfig.title = "编辑分类";
      // console.log(data);
      Object.assign(formData, data);
    }
  });
};
const del = (data: Object) => {
  proxy.Confirm(`你确定要删除${data.categoryName}?`, async () => {
    let result = await proxy.Request({
      url: api.delCategory,
      params: {
        categoryId: data.categoryId,
      },
    });
    if (!result) {
      return;
    }
    loadDataList();
    currentCategoryId.value = null;
  });
};
const changeSort = async (index: Number, type: string) => {
  let categoryList = tableData.list;
  if (
    (type === "down" && index === categoryList.length - 1) ||
    (type === "up" && index === 0)
  ) {
    return;
  }
  let temp = categoryList[index];
  let number = type == "down" ? 1 : -1;
  categoryList.splice(index, 1);
  categoryList.splice(index + number, 0, temp);
  let result = await proxy.Request({
    url: api.changeSort,
    dataType: "json",
    params: categoryList,
  });

  if (!result) {
    return;
  }
  proxy.Message.success("重新排序成功");
  loadDataList();
};

//树
const dataTableRef = ref(null);
const currentCategoryId = ref(null);
//属性展示专题
const treeProps = {
  children: "children",
  label: "title",
  value: "blogId",
};
//获取专题文章
const rowClick = (row) => {
  currentCategoryId.value = row.categoryId;
  loadBlogList();
};
//获取树
const blogList = ref([]);
const loadBlogList = async () => {
  let result = await proxy.Request({
    url: api.getSpecialInfo,
    params: {
      categoryId: currentCategoryId.value,
      showType: "1",
    },
  });
  blogList.value = result.data;
  if (currentCategoryId.value == null && result.data.list.length > 0) {
    currentCategoryId.value = result.data.list[0].categoryId;
    loadBlogList();
  }
  nextTick(() => {
    dataTableRef.value.setCurrentRow("categoryId", currentCategoryId.value);
  });
};

//拖动改变排序，修改父级
const blogDrag = async (draggingNode, dropNode, dropType, ev) => {
  console.log(draggingNode, dropNode, dropType);
  //拖入某个节点内，修改父级节点为目标节点，同时修改目标节点下的所有子节点的排序
  let parentNode = null;
  if (dropType == "inner") {
    //拖入某个几点内，修改父级节点为目标节点，同时修改目标节点下的所有子节点的排序
    parentNode = dropNode;
  } else {
    //拖入之前，之后，修改被拖动的节点的父节点为目标节点的父节点，同时修改目标节点父节点下所有的子节点的排序
    parentNode = dropNode.parent;
  }
  //操作的节点ID
  const blogId = draggingNode.data.blogId;
  const pBlogId = parentNode.data.blogId;
  //需要从新排序的博客ID
  const blogIds = [];
  parentNode.childNodes.forEach((element) => {
    blogIds.push(element.data.blogId);
  });
  let params = {
    blogId,
    pBlogId,
    blogIds: blogIds.join(","),
  };
  let result = await proxy.Request({
    url: api.updateSpecialBlogSort,
    params,
  });
  if (!result) {
    return;
  }
  //重新加载文章树
  loadBlogList();
};

//新增，修改 专题博客
const blogEditRef = ref(null);
const editBlog = (type, data) => {
  blogEditRef.value.init(type, data);
};

//保存专题博客回调
const saveBlogCallback = () => {
  loadBlogList();
};
</script>

<style lang="scss">
.tree-panel {
  height: calc(100vh - 290px);
  overflow: auto;
  .el-tree-node__label {
    flex: 1;
  }
  .custom-node-style {
    display: flex;
    justify-content: space-between;
  }
}
</style>