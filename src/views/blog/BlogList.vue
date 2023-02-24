<template>
  <div>
    <div class="top-panel">
      <el-form :model="searchFormData" label-width="50px">
        <el-row>
          <el-col :span="4">
            <el-form-item label="标题" prop="titleFuzzy">
              <el-input
                placeholder="请输入名称"
                v-model="searchFormData.titleFuzzy"
              ></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="4">
            <el-form-item label="状态" prop="status">
              <el-select
                v-model="searchFormData.status"
                clearable
                placeholder="请选择状态"
                :style="{ width: '100%' }"
              >
                <el-option :value="0" label="草稿"></el-option
                ><el-option :value="1" label="已发布"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="4">
            <el-form-item label="分类" prop="status">
              <el-select
                v-model="searchFormData.categoryID"
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
          </el-col>
          <el-col :span="4" :style="{ 'padding-left': '10px' }">
            <el-button type="danger" @click="loadDataList">搜索</el-button>
            <el-button type="primary" @click="showEdit('add')"
              >新增博客</el-button
            >
          </el-col>
        </el-row>
      </el-form>
    </div>
  </div>
  <Table
    :columns="columns"
    :showPagination="true"
    :dataSource="tableData"
    :fetch="loadDataList"
    :options="tableOptions"
  >
    <!-- 封面 -->
    <template #cover="{ index, row }">
      <Cover :cover="row.cover"></Cover>
    </template>

    <!-- 文章信息 -->
    <template #blogInfo="{ index, row }">
      <div>标题: {{ row.title }}</div>
      <div>分类: {{ row.categoryName }}</div>
      <div>标题: {{ row.nickName }}</div>
    </template>
    <!-- 类型 -->
    <template #typeName="{ index, row }">
      <div>{{ row.type == 0 ? "原创" : "转载" }}</div>
      <div v-if="row.type == 1">转载地址：{{ row.reprintUrl }}</div>
    </template>
    <!-- 状态 -->
    <template #statusName="{ index, row }">
      <span v-if="row.status == 0" :style="{ color: 'red' }">{{
        row.statusName
      }}</span>
      <span v-else :style="{ color: 'green' }">{{ row.statusName }}</span>
    </template>
    <!-- 时间 -->
    <template #time="{ index, row }">
      <div>创建时间: {{ row.createTime }}</div>
      <div>修改时间: {{ row.lastUpdateTime }}</div>
    </template>
    <!-- 操作 -->
    <template #op="{ index, row }">
      <div class="op">
        <a href="javascript:;" class="a-link" @click="showEdit('update', row)"
          >修改</a
        >
        <el-divider direction="vertical" />
        <a href="javascript:;" class="a-link" @click="del(row)">删除</a>
        <el-divider direction="vertical" />
        <a href="javascript:;" class="a-link">预览</a>
      </div>
    </template>
  </Table>
  <BlogEdit ref="blogEditRef" @callback="loadDataList"></BlogEdit>
</template>

<script setup lang="ts">
import { getCurrentInstance, reactive, ref } from "vue";
import BlogEdit from "./BlogEdit.vue";
const { proxy } = getCurrentInstance();

const api = {
  loadCategory: "/category/loadAllCategory4Blog",
  loadDataList: "/blog/loadBlog",
};

//搜索
const searchFormData = reactive({});
const categoryList = ref([]);
async function loadCategoryList(): Promise<void> {
  let result = await proxy.Request({
    url: api.loadCategory,
  });
  categoryList.value = result.data;
}
loadCategoryList();

//列表
const columns = [
  {
    label: "封面",
    prop: "cover",
    width: 80,
    scopedSlots: "cover",
  },
  {
    label: "文章信息",
    prop: "blogInfo",
    scopedSlots: "blogInfo",
  },
  {
    label: "编辑器",
    prop: "editorTypeName",
    width: 100,
  },
  {
    label: "类型",
    prop: "typeName",
    width: 200,
    scopedSlots: "typeName",
  },
  {
    label: "评论",
    prop: "allowCommentTypeName",
    width: 100,
  },
  {
    label: "状态",
    prop: "status",
    width: 100,
    scopedSlots: "statusName",
  },
  {
    label: "时间",
    prop: "time",
    width: 300,
    scopedSlots: "time",
  },
  {
    label: "操作",
    prop: "op",
    width: 200,
    scopedSlots: "op",
  },
];
const tableOptions = {
  extHeight: 50,
};
const tableData = ref({});
const loadDataList = async () => {
  let params = {
    pageNo: tableData.value.pageNo,
    pageSize: tableData.value.pageSize,
  };

  Object.assign(params, searchFormData);
  let result = await proxy.Request({
    url: api.loadDataList,
    params,
  });
  if (!result) {
    return;
  }
  tableData.value = result.data;
};

const blogEditRef = ref(null);
const showEdit = (type: string, data) => {
  blogEditRef.value.init(type, data);
};
</script>

<style lang="scss">
</style>