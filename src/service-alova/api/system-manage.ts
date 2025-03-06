import { alova } from '../request';

/**
 * 获取角色列表
 *
 * @param params - 角色搜索参数
 * @returns 角色列表数据
 */
export function fetchGetRoleList(params?: Api.SystemManage.RoleSearchParams) {
  return alova.Get<Api.SystemManage.RoleList>('/systemManage/getRoleList', { params });
}

/**
 * 获取所有启用的角色
 *
 * @returns 所有启用的角色列表
 */
export function fetchGetAllRoles() {
  return alova.Get<Api.SystemManage.AllRole[]>('/systemManage/getAllRoles');
}

/**
 * 获取用户列表
 *
 * @param params - 用户搜索参数
 * @returns 用户列表数据
 */
export function fetchGetUserList(params?: Api.SystemManage.UserSearchParams) {
  return alova.Get<Api.SystemManage.UserList>('/systemManage/getUserList', { params });
}

/** 用户模型类型：包含用户基本信息字段 */
export type UserModel = Pick<
  Api.SystemManage.User,
  'userName' | 'userGender' | 'nickName' | 'userPhone' | 'userEmail' | 'userRoles' | 'status'
>;

/**
 * 添加用户
 *
 * @param data - 用户信息
 */
export function addUser(data: UserModel) {
  return alova.Post<null>('/systemManage/addUser', data);
}

/**
 * 更新用户信息
 *
 * @param data - 用户信息
 */
export function updateUser(data: UserModel) {
  return alova.Post<null>('/systemManage/updateUser', data);
}

/**
 * 删除用户
 *
 * @param id - 用户ID
 */
export function deleteUser(id: number) {
  return alova.Delete<null>('/systemManage/deleteUser', { id });
}

/**
 * 批量删除用户
 *
 * @param ids - 用户ID数组
 */
export function batchDeleteUser(ids: number[]) {
  return alova.Delete<null>('/systemManage/batchDeleteUser', { ids });
}

/** 获取菜单列表(v2版本) */
export function fetchGetMenuList() {
  return alova.Get<Api.SystemManage.MenuList>('/systemManage/getMenuList/v2');
}

/** 获取所有页面路径 */
export function fetchGetAllPages() {
  return alova.Get<string[]>('/systemManage/getAllPages');
}

/** 获取菜单树结构 */
export function fetchGetMenuTree() {
  return alova.Get<Api.SystemManage.MenuTree[]>('/systemManage/getMenuTree');
}
