<template>
  <div class="layout">
    <el-container>
      <el-header class="header">
        <div class="logo">EasyBlog</div>
        <div class="user-info">
          <span>欢迎回来，</span>
          <el-dropdown trigger="click">
            <span class="nick-name">
              {{ userInfo.nickName }}
              <span class="iconfont icon-close"></span>
            </span>

            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="goUserInfo">
                  <span>个人信息</span>
                </el-dropdown-item>
                <el-dropdown-item @click="logout">退出</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
          <div class="avatar"><img :src="userInfo.avatar" /></div></div
      ></el-header>
      <el-container class="container">
        <el-aside width="200px" class="left-aside">
          <div>
            <el-button class="post-button">发布</el-button>
            <div class="menu-panel">
              <ul>
                <li v-for="(menu, index) in menuList" :key="index">
                  <span class="menu-title-parent" @click="openClose(index)">
                    <span :class="['iconfont', menu.icon]"></span>
                    <span class="menu-title">{{ menu.title }}</span>
                    <span
                      :class="[
                        'iconfont',
                        'open-close',
                        menu.open ? 'icon-open' : 'icon-close',
                      ]"
                    ></span>
                  </span>
                  <ul class="sub-menu" v-show="menu.open">
                    <li v-for="subMenu in menu.children" :key="subMenu.title">
                      <router-link
                        :to="subMenu.path"
                        :class="[
                          'sub-menu-item',
                          activePath == subMenu.path ? 'active' : '',
                        ]"
                        >{{ subMenu.title }}</router-link
                      >
                    </li>
                  </ul>
                </li>
              </ul>
            </div>
          </div>
        </el-aside>
        <el-main class="right-main">
          <router-view></router-view>
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>


<script setup lang="ts">
import { getCurrentInstance, ref, watch } from "vue";
import VueCookies from "vue-cookies";
import { useRouter, useRoute } from "vue-router";
// import store from "@/store";
import { useStore } from "vuex";

const store = useStore();
const router = useRouter();
const route = useRoute();
const { proxy } = getCurrentInstance();
const menuList = ref([
  {
    title: "博客",
    icon: "icon-blog",
    open: true,
    children: [
      {
        title: "博客管理",
        path: "/blog/list",
      },
      {
        title: "分类管理",
        path: "/blog/category",
      },
    ],
  },
  {
    title: "专题",
    icon: "icon-zhuanti",
    open: true,
    children: [
      {
        title: "专题管理",
        path: "/special/list",
      },
    ],
  },
  {
    title: "设置",
    icon: "icon-setting",
    open: true,
    children: [
      {
        title: "个人信息设置",
        path: "/setting/my",
      },
      {
        title: "博客成员",
        path: "/setting/user",
      },
      {
        title: "系统设置",
        path: "/setting/sysSetting",
        roleType: 1,
      },
    ],
  },
  {
    title: "回收站",
    icon: "icon-delete",
    open: true,
    children: [
      {
        title: "回收站",
        path: "/recovery/list",
      },
    ],
  },
]);

const api = {
  getUserInfo: "getUserInfo",
  logout: "logout",
};
function openClose(index: number): void {
  menuList.value[index].open = !menuList.value[index].open;
}

const userInfo = ref({});
async function init(): Promise<void> {
  let result = await proxy.Request({
    url: api.getUserInfo,
  });
  if (!result) {
    return;
  }
  userInfo.value = result.data;

  //以下是cookie方法
  // userInfo.value = VueCookies.get("userInfo");
  // // console.log(userInfo.value);
  // //没有该后端图片，直接采取本地
  // // userInfo.value.avatar = proxy.globalInfo.imageUrl + userInfo.value.avatar;
  // // console.log(userInfo.value.avatar);
  userInfo.value.avatar = "../../src/assets/avatar.jpg";
}

init();
// console.log(userInfo.value.avatar);

const activePath = ref<string>("");

//监听函数，随时监听路由变化，用于给最新的那个路由选项加深
watch(
  route,
  (newVal, oldVal) => {
    activePath.value = newVal.path;
  },
  { immediate: true, deep: true }
);

//跳转到个人信息页
function goUserInfo(): void {
  router.push("../setting/my");
}
//退出登录
const logout = (data: Object) => {
  proxy.Confirm(`你确定要退出吗?`, async () => {
    let result = await proxy.Request({
      url: api.logout,
    });
    if (!result) {
      return;
    }
    router.push("/login");
  });
};

watch(
  () => store.state.userInfo,
  (newVal, oldVal) => {
    const avatar = proxy.globalInfo.imageUrl + newVal.avatar;
    const nickName = newVal.nickName;
    userInfo.value = { avatar, nickName };
  },
  { immediate: true, deep: true }
);
</script>

<style lang="scss">
.layout {
  .header {
    border-bottom: 1px solid #ddd;
    display: flex;
    align-items: center;
    justify-content: space-between;
    .logo {
      font-size: 30px;
    }
    .user-info {
      display: flex;
      align-items: center;
      .nick-name {
        cursor: pointer;
        color: rgb(6, 143, 234);
        .icon-close {
          font-size: 14px;
        }
      }
      .avatar {
        width: 50px;
        height: 50px;
        margin-left: 10px;
        img {
          border-radius: 50px;
          width: 100%;
        }
      }
    }
  }
  .container {
    padding-top: 10px;
    background: #f5f6f7;
    height: calc(100vh - 60px);
    .left-aside {
      padding: 0px 15px;
      width: 280px;
      .post-button {
        background: green;
        color: #fff;
        height: 40px;
        width: 100%;
      }
      .menu-panel {
        margin-top: 5px;
        ul,
        li {
          padding: 0px;
          margin: 0px;
          list-style: none;
        }
        .menu-title-parent {
          padding: 0px, 5px;
          line-height: 45px;
          cursor: pointer;
          display: flex;
          .iconfont {
            font-size: 18px;
            color: #91949a;
          }
          .menu-title {
            flex: 1;
            color: #3f4042;
            margin-left: 10px;
          }
          .open-close {
            width: 20px;
            font-size: 16px;
          }
        }
        .menu-title-parent:hover {
          background: #ddd;
        }
        .sub-menu {
          font-size: 14px;
          .sub-menu-item {
            display: block;
            padding: 0px 10px 0px 28px;
            line-height: 40px;
            cursor: pointer;
            text-decoration: none;
            color: #3f4042;
          }
          .active {
            background: #ddd;
          }
          .sub-menu-item:hover {
            background: #ddd;
          }
        }
      }
    }
    .right-main {
      position: relative;
      background: #fff;
      padding: 20px 10px 10px 10px;
    }
  }
}
</style>