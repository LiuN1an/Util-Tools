import { ComponentType } from "react";
import { Field } from "./Field";
import { Form } from "./Form";

export type ControlProps = {
  key: string;
  label?: string;
  content?: string | ComponentType<unknown>;

  [addonKey: string]: unknown;
};

export type BasicValue = string | number;

export type FormValue = {
  [key: string]: FormValue | BasicValue;
};

export type FlatFormValue = {
  [key: string]: BasicValue;
};

export type FormHookProps = (form: Form) => Promise<any>;

export type ConfigProps = {
  /**
   * 用于表示表单项的值
   */
  key: string;
  /**
   * 表示FieldView的类型
   */
  fieldType?: string;
  label: string;
  /**
   * 表单项的具体展示内容（除标题）,我们称为control
   */
  content: ComponentType<{
    field: Field;
    error: boolean;
    value: any;
    setValue: (value: any) => void;

    [key: string]: any;
  }>;
  children?: ConfigProps[];
  /**
   * 默认值
   */
  defaultValue?: any;
  /**
   * 是否为左右布局
   */
  horizontal?: boolean;
  /**
   * 是否必填
   */
  require?: boolean;

  /**
   * 对应content的扩展属性
   */
  [key: string]: any;
};

export type FieldHookProps = (
  value: unknown,
  field: Field,
  form: Form
) => Promise<string | undefined>;

/**
 * - 无法抽离，严重依赖field和form来做字段联动
 */
export type EffectProps = {
  driveKey: string;
  effect: FieldHookProps;
};

/**
 * - 抽离校验函数，前提是不依赖field和form
 */
export type ValidateProps = {
  driveKey: string;
  validate: FieldHookProps;
};
