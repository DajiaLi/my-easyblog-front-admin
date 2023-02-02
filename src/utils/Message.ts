import { ElMessage } from 'element-plus';

const message = {
  error: (msg: string) => {
    ElMessage({
      message: msg,
      type: 'error',
      duration: 2000
    })
  },
  success: (msg: string) => {
    ElMessage({
      message: msg,
      type: 'success',
      duration: 2000
    })
  },
  warning: (msg: string) => {
    ElMessage({
      message: msg,
      type: 'warning',
      duration: 2000
    })
  }
}

export default message;