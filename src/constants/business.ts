import { transformRecordToOption } from '@/utils/common';

// 启用状态记录
export const enableStatusRecord: Record<Api.Common.EnableStatus, App.I18n.I18nKey> = {
  '1': 'page.manage.common.status.enable',
  '2': 'page.manage.common.status.disable'
};

// 启用状态选项
export const enableStatusOptions = transformRecordToOption(enableStatusRecord);

// 用户性别记录
export const userGenderRecord: Record<Api.SystemManage.UserGender, App.I18n.I18nKey> = {
  '1': 'page.manage.user.gender.male',
  '2': 'page.manage.user.gender.female'
};

// 用户性别选项
export const userGenderOptions = transformRecordToOption(userGenderRecord);

// 菜单类型记录
export const menuTypeRecord: Record<Api.SystemManage.MenuType, App.I18n.I18nKey> = {
  '1': 'page.manage.menu.type.directory',
  '2': 'page.manage.menu.type.menu'
};

// 菜单类型选项
export const menuTypeOptions = transformRecordToOption(menuTypeRecord);

// 菜单图标类型记录
export const menuIconTypeRecord: Record<Api.SystemManage.IconType, App.I18n.I18nKey> = {
  '1': 'page.manage.menu.iconType.iconify',
  '2': 'page.manage.menu.iconType.local'
};

// 菜单图标类型选项
export const menuIconTypeOptions = transformRecordToOption(menuIconTypeRecord);
