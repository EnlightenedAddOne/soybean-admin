/** 通用类型命名空间 */
declare namespace CommonType {
  /** 策略模式 */
  interface StrategicPattern {
    /** 条件 */
    condition: boolean;
    /** 如果条件为真，则调用动作函数 */
    callback: () => void;
  }

  /**
   * 选项类型
   *
   * @property value: 选项值
   * @property label: 选项标签
   */
  type Option<K = string> = { value: K; label: string };

  type YesOrNo = 'Y' | 'N';

  /** 为所有属性添加null类型 */
  type RecordNullable<T> = {
    [K in keyof T]?: T[K] | null;
  };
}
