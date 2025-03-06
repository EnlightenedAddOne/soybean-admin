import { request } from '../request';

/**
 * 获取角色列表
 *
 * @param params - 角色搜索参数
 * @returns 角色列表数据
 */
export function fetchGetRoleList(params?: Api.SystemManage.RoleSearchParams) {
  return request<Api.SystemManage.RoleList>({
    url: '/systemManage/getRoleList',
    method: 'get',
    params
  });
}

/**
 * 获取所有启用的角色
 *
 * @returns 所有启用状态的角色列表
 */
export function fetchGetAllRoles() {
  return request<Api.SystemManage.AllRole[]>({
    url: '/systemManage/getAllRoles',
    method: 'get'
  });
}

/**
 * 获取用户列表
 *
 * @param params - 用户搜索参数
 * @returns 用户列表数据
 */
export function fetchGetUserList(params?: Api.SystemManage.UserSearchParams) {
  return request<Api.SystemManage.UserList>({
    url: '/systemManage/getUserList',
    method: 'get',
    params
  });
}

/** 获取菜单列表(v2版本) */
export function fetchGetMenuList() {
  return request<Api.SystemManage.MenuList>({
    url: '/systemManage/getMenuList/v2',
    method: 'get'
  });
}

/** 获取所有页面路径 */
export function fetchGetAllPages() {
  return request<string[]>({
    url: '/systemManage/getAllPages',
    method: 'get'
  });
}

/** 获取菜单树结构 */
export function fetchGetMenuTree() {
  return request<Api.SystemManage.MenuTree[]>({
    url: '/systemManage/getMenuTree',
    method: 'get'
  });
}
