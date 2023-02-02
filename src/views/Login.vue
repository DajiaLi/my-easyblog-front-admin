<template>
  <div class="login-body">
    <div class="login-panel">
      <div class="login-title">用户登录</div>
      <el-form :model="formData" :rules="rules" ref="formDataRef">
        <el-form-item prop="account">
          <el-input placeholder="请输入账号" v-model="formData.account">
            <template #prefix>
              <span class="iconfont icon-Account"></span>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item prop="password">
          <el-input
            type="password"
            placeholder="请输入密码"
            v-model="formData.password"
          >
            <template #prefix>
              <span class="iconfont icon-password"></span> </template
          ></el-input>
        </el-form-item>
        <el-form-item prop="checkCode">
          <div class="check-code-panel">
            <el-input
              placeholder="请输入验证码"
              v-model="formData.checkCode"
              class="input-panel"
            ></el-input>
            <img
              :src="checkCodeUrl"
              class="check-code"
              @click="changeCheckCode"
            />
          </div>
        </el-form-item>
        <el-form-item label="">
          <el-checkbox v-model="formData.rememberMe" :label="true"
            >记住我</el-checkbox
          >
        </el-form-item>
        <el-form-item label="">
          <el-button type="primary" :style="{ width: '100%' }" @click="login"
            >登录</el-button
          >
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>


<script setup lang="ts">
import VueCookies from "vue-cookies";
import { getCurrentInstance, reactive, ref } from "vue";
import md5 from "js-md5";
import { useRouter } from "vue-router";
const { proxy } = getCurrentInstance();
const router = useRouter();
const api = {
  checkCode: "api/checkCode",
  login: "login",
};

const checkCodeUrl = ref(api.checkCode);
function changeCheckCode(): void {
  checkCodeUrl.value = api.checkCode + "?" + new Date().getTime();
}

//表单相关
const formData = reactive({});
const formDataRef = ref();
const rules = {
  account: [
    {
      required: true,
      message: "请输入用户名",
    },
  ],
  password: [
    {
      required: true,
      message: "请输入密码",
    },
  ],
  checkCode: [
    {
      required: true,
      message: "请输入验证码",
    },
  ],
};

//如果有cookie，需要初始化
function init(): void {
  const loginInfo = VueCookies.get("loginInfo");
  if (!loginInfo) {
    return;
  }
  Object.assign(formData, loginInfo);
  //添加回车事件
  document.onkeydown = (e: Event) => {
    if (e.keyCode !== 13) {
      return;
    }
    login();
  };
}
init();

function login(): void {
  formDataRef.value.validate(async (valid: any) => {
    if (!valid) {
      return;
    }
    //用于对login时从cookie中取出的密码进行md5转换
    let cookieloginInfo = VueCookies.get("loginInfo");
    let cookiePassword =
      cookieloginInfo == null ? null : cookieloginInfo.password;
    if (formData.password !== cookiePassword) {
      formData.password = md5(formData.password);
    }
    //放在post请求中
    let params = {
      account: formData.account,
      password: formData.password,
      checkCode: formData.checkCode,
    };
    //提交后端请求
    let result = await proxy.Request({
      url: api.login,
      params: params,
      errorCallback: () => {
        changeCheckCode(); //如果失败，自动更新验证码
      },
    });
    if (!result) {
      return; //登录失败直接结束
    }
    proxy.Message.success("登录成功");
    setTimeout(() => {
      router.push("/");
    }, 1500);
    //使用cookie
    const loginInfo = {
      account: params.account,
      password: params.password,
      rememberMe: formData.rememberMe,
    };
    VueCookies.set("userInfo", result.data, 0);
    if (formData.rememberMe) {
      VueCookies.set("loginInfo", loginInfo, "7d");
    }
  });
}
</script>


<style lang="scss">
.login-body {
  width: 100%;
  height: calc(100vh);
  background-size: cover;
  background-position: center;
  background-image: url("../assets/LoginBg.jpg");
  .login-panel {
    float: right;
    margin-top: 150px;
    margin-right: 100px;
    padding: 20px;
    width: 350px;
    background-color: rgb(255, 255, 255, 0.7);
    border-radius: 5px;
    box-shadow: 2px 2px 10px #ddd;
    .login-title {
      font-size: 20px;
      margin-bottom: 10px;
      text-align: center;
    }
    .check-code-panel {
      width: 100%;
      display: flex;
      align-items: center;
      .input-panel {
        flex: 1;
        margin-right: 5px;
      }
      .check-code {
        height: 30px;
        cursor: pointer;
      }
    }
  }
}
</style>
