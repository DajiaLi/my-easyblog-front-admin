<template>
  <div>
    <el-button type="danger" size="small" @click="showEdit('add')"
      >新增分类</el-button
    >
    <Table
      :columns="columns"
      :showPagination="false"
      :dataSource="tableData"
      :fetch="loadDataList"
      :options="tableOptions"
    >
      <template #cover="{ index, row }">
        <Cover :cover="row.cover"></Cover>
      </template>
      <template #op="{ index, row }">
        <div class="op">
          <a href="javascript:;" class="a-link" @click="showEdit('update', row)"
            >修改</a
          >
          <el-divider direction="vertical" />
          <a href="javascript:;" class="a-link" @click="del(row)">删除</a>
          <el-divider direction="vertical" />
          <a
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
          >
        </div>
      </template>
    </Table>
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
  </div>
</template>

<script setup lang="ts">
import { getCurrentInstance, nextTick, reactive, ref } from "vue";
const { proxy } = getCurrentInstance();

const api = {
  loadDataList: "/category/loadAllCategory4Blog",
  saveCategory: "/category/saveCategory4Blog",
  delCategory: "/category/delCategory4Blog",
  changeSort: "/category/changeCategorySort4Blog",
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
    width: 200,
    scopedSlots: "op",
  },
];
const tableOptions = {
  extHeight: 10,
};
const tableData = reactive({});
const loadDataList = async () => {
  let result = await proxy.Request({
    url: api.loadDataList,
  });

  if (!result) {
    return;
  }
  // console.log(result);

  tableData.list = result.data;
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
</script>

<style lang="scss">
</style>