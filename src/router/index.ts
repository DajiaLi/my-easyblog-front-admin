import { createRouter, createWebHistory } from 'vue-router'
import VueCookies from "vue-cookies";

const routes = [
  {
    name: '登录',
    path: '/login',
    component: () => import("../views/Login.vue"),
  },
  {
    name: '框架页',
    path: '/',
    component: () => import("../views/Framework.vue"),
    redirect: "blog/list",
    children: [
      {
        path: "blog/test",
        name: "test",
        component: () => import("../views/blog/test.vue"),
      },
      {
        path: "blog/list",
        name: "博客管理",
        component: () => import("../views/blog/BlogList.vue"),
      },
      {
        path: "blog/category",
        name: "分类管理",
        component: () => import("../views/blog/BlogCategory.vue"),
      },
      {
        path: "special/list",
        name: "专题管理",
        component: () => import("../views/special/SpecialList.vue"),
      },
      {
        path: "setting/my",
        name: "个人信息",
        component: () => import("../views/settings/MyInfo.vue"),
      },
      {
        path: "setting/user",
        name: "团队成员",
        component: () => import("../views/settings/TeamUser.vue"),
      },
    ]
  }
];

//这里不是通过new来创建，通过createRouter 方法创建，使用的模式不是通过mode来定义
const router = createRouter({
  routes,
  history: createWebHistory(),
})
//如果没有cookie。即没有登录信息的话，那么到任何一个页面都会被重定向到登录页面
router.beforeEach((to, from, next) => {
  const userInfo = VueCookies.get("userInfo");
  if (!userInfo && to.path != "/login") {
    router.push("/login");
  }
  next();
})

export default router