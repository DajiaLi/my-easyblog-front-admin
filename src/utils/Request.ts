import axios from 'axios'

import { ElLoading } from 'element-plus';
import message from "@/utils/Message"
import router from '@/router';

const contentTypeForm = "application/x-www-form-urlencoded;charset=UTF-8";
const contentTypeJson = "application/json";
const contentTypeFile = "multipart/form-data";

const request = (config: any) => {
  let { url, params, dataType, showLoading } = config;
  dataType = dataType ? dataType : "form";
  showLoading = showLoading ? true : showLoading;

  let contentType = contentTypeForm;
  if (dataType == "json") {
    contentType = contentTypeJson;
  } else if (dataType == "file") {
    contentType = contentTypeFile;
    let param = new FormData();
    for (let key in params) {
      param.append(key, params[key]);
    }
    params = param;
  }

  const instance = axios.create({
    baseURL: '/api',
    timeout: 10 * 1000,
    headers: {
      'Content-Type': contentType,
      'X-Requested-With': 'XMLHttpRequest',
    }
  })

  let loading: any = null;
  //请求前拦截
  instance.interceptors.request.use(
    (config) => {
      if (showLoading) {
        loading = ElLoading.service({
          lock: true,
          text: '加载中......',
          background: 'rgba(0, 0, 0, 0.7)',
        })
      }
      return config;
    },
    (error) => {
      if (showLoading && loading) {
        loading.close();
      }
      message.error("发送请求失败")
      return Promise.reject("发送请求失败");
    }
  )
  //请求后拦截
  instance.interceptors.response.use(
    (response) => {
      if (showLoading && loading) {
        loading.close();
      }
      const responseData = response.data;
      if (responseData.status == "error") {
        if (config.errorCallback) {
          config.errorCallback();
        }
        return Promise.reject(responseData.info);
      } else {
        if (responseData.code == 200) {
          //登录成功代码
          return responseData;
        } else if (responseData.code == 901) {
          //登录超时代码
          setTimeout(() => {
            router.push("/login");
          }, 2000);
          return Promise.reject("登录超时");
        }

      }

    },
    (error) => {
      if (showLoading && loading) {
        loading.close();
      }
      return Promise.reject("网络异常");
    }
  )


  return instance.post(url, params).catch(error => {
    message.error(error)
    return null;
  })
}

export default request;