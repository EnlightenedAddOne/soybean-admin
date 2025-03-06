import { transformRecordToOption } from '@/utils/common';

// 是或否记录
export const yesOrNoRecord: Record<CommonType.YesOrNo, App.I18n.I18nKey> = {
  Y: 'common.yesOrNo.yes',
  N: 'common.yesOrNo.no'
};

// 是或否选项
export const yesOrNoOptions = transformRecordToOption(yesOrNoRecord);
