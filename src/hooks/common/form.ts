import { ref, toValue } from 'vue';
import type { ComputedRef, Ref } from 'vue';
import type { FormInst } from 'naive-ui';
import { REG_CODE_SIX, REG_EMAIL, REG_PHONE, REG_PWD, REG_USER_NAME } from '@/constants/reg';
import { $t } from '@/locales';

/**
 * 表单验证规则Hook
 *
 * @returns 表单验证规则和创建规则的方法
 */
export function useFormRules() {
  const patternRules = {
    userName: {
      pattern: REG_USER_NAME,
      message: $t('form.userName.invalid'),
      trigger: 'change'
    },
    phone: {
      pattern: REG_PHONE,
      message: $t('form.phone.invalid'),
      trigger: 'change'
    },
    pwd: {
      pattern: REG_PWD,
      message: $t('form.pwd.invalid'),
      trigger: 'change'
    },
    code: {
      pattern: REG_CODE_SIX,
      message: $t('form.code.invalid'),
      trigger: 'change'
    },
    email: {
      pattern: REG_EMAIL,
      message: $t('form.email.invalid'),
      trigger: 'change'
    }
  } satisfies Record<string, App.Global.FormRule>;

  const formRules = {
    userName: [createRequiredRule($t('form.userName.required')), patternRules.userName],
    phone: [createRequiredRule($t('form.phone.required')), patternRules.phone],
    pwd: [createRequiredRule($t('form.pwd.required')), patternRules.pwd],
    code: [createRequiredRule($t('form.code.required')), patternRules.code],
    email: [createRequiredRule($t('form.email.required')), patternRules.email]
  } satisfies Record<string, App.Global.FormRule[]>;

  /** 默认的必填规则 */
  const defaultRequiredRule = createRequiredRule($t('form.required'));

  /**
   * 创建必填规则
   *
   * @param message 错误提示信息
   * @returns 必填规则对象
   */
  function createRequiredRule(message: string): App.Global.FormRule {
    return {
      required: true,
      message
    };
  }

  /**
   * 创建确认密码规则
   *
   * @param pwd 密码字段的值或引用
   * @returns 确认密码规则数组
   */
  function createConfirmPwdRule(pwd: string | Ref<string> | ComputedRef<string>) {
    const confirmPwdRule: App.Global.FormRule[] = [
      { required: true, message: $t('form.confirmPwd.required') },
      {
        asyncValidator: (rule, value) => {
          if (value.trim() !== '' && value !== toValue(pwd)) {
            return Promise.reject(rule.message);
          }
          return Promise.resolve();
        },
        message: $t('form.confirmPwd.invalid'),
        trigger: 'input'
      }
    ];
    return confirmPwdRule;
  }

  return {
    patternRules,
    formRules,
    defaultRequiredRule,
    createRequiredRule,
    createConfirmPwdRule
  };
}

/**
 * Naive UI 表单操作Hook
 *
 * @returns 表单引用和验证方法
 */
export function useNaiveForm() {
  const formRef = ref<FormInst | null>(null);

  /** 验证表单 */
  async function validate() {
    await formRef.value?.validate();
  }

  /** 恢复表单验证状态 */
  async function restoreValidation() {
    formRef.value?.restoreValidation();
  }

  return {
    formRef,
    validate,
    restoreValidation
  };
}
