import { defineMock } from '@sa/alova/mock';

/** 用户管理相关的mock数据 可以根据项目版本将mock数据拆分为多个文件 */
export default defineMock({
  /** 添加用户接口 */
  '[POST]/systemManage/addUser': () => {
    return {
      code: '0000',
      msg: 'success',
      data: null
    };
  },

  /** 更新用户信息接口 */
  '[POST]/systemManage/updateUser': () => {
    return {
      code: '0000',
      msg: 'success',
      data: null
    };
  },

  /** 删除单个用户接口 */
  '[DELETE]/systemManage/deleteUser': () => {
    return {
      code: '0000',
      msg: 'success',
      data: null
    };
  },

  /** 批量删除用户接口 */
  '[DELETE]/systemManage/batchDeleteUser': () => {
    return {
      code: '0000',
      msg: 'success',
      data: null
    };
  },

  /** 发送验证码接口 */
  '[POST]/auth/sendCaptcha': () => {
    return {
      code: '0000',
      msg: 'success',
      data: null
    };
  },

  /** 验证验证码接口 */
  '[POST]/auth/verifyCaptcha': () => {
    return {
      code: '0000',
      msg: 'success',
      data: null
    };
  },

  /** 获取最新时间接口 - 返回当前本地时间字符串 */
  '/mock/getLastTime': () => {
    return {
      code: '0000',
      msg: 'success',
      data: {
        time: new Date().toLocaleTimeString()
      }
    };
  }
});
