import { action, computed, makeObservable, observable, toJS } from "mobx";
import { EventEmitter2 } from "eventemitter2";
import { cloneDeep } from "lodash";
import {
  BasicValue,
  ConfigProps,
  EffectProps,
  FieldHookProps,
  FlatFormValue,
  FormHookProps,
  FormValue,
  ValidateProps,
} from "./types";
import { Field } from "./Field";
import { ComponentType } from "react";
import { FieldCollapseView, FieldNormalView } from "./view";
import { fn } from "moment";

/**
 * 对于value为undefined的key-value对会直接delete
 */
const removeKeyOfNull = (target: FormValue) => {
  if (!target) return undefined;
  const value = cloneDeep(target);
  for (const key of Object.keys(value)) {
    const v = value[key];
    if (typeof v === "object") {
      value[key] = removeKeyOfNull(v);
      if (Object.keys(v).length === 0) {
        return undefined;
      }
    } else if (v === undefined) {
      return undefined;
    }
  }

  return Object.keys(value).length === 0 ? undefined : value;
};

export enum FormEvent {
  FormValueChange = "FormValueChange",
  FormOutput = "FormOutput",
  FormBeforeSubmit = "FormBeforeSubmit",
  FormAfterSubmit = "FormAfterSubmit",

  FormValidating = "FormValidating",
  FormAfterValidate = "FormAfterValidate",
}

export type EmitFn = (event: FormEvent, value: any) => void;

export class Form {
  private _emitter = new EventEmitter2();

  public emit = (event: FormEvent, value: any) => {
    this._emitter.emit(event, value);
  };

  @observable public tree: Field[] = [];

  @observable private _fieldMap: Map<string, Field> = new Map();

  @observable private _validateMap: Map<string, FieldHookProps> =
    new Map();

  @observable public viewMap: {
    [key: string]: ComponentType<Record<string, any>>;
  } = {
    normal: FieldNormalView,
    collapse: FieldCollapseView,
  };

  @observable public controlMap: { [key: string]: ComponentType<any> } =
    {};

  constructor(private configs: ConfigProps[]) {
    makeObservable(this);

    this.tree = this.configs.map((config) => {
      return new Field(config, [], this, null, this.emit);
    });
  }

  /**
   * 删除所有undefined的路径
   */
  @action public getValue(keys: string) {
    if (keys === "*") {
      return this.tree.reduce((prev, node) => {
        if (node.relativeKey) {
          return {
            ...prev,
            [node.relativeKey]: node.getValue(),
          };
        } else {
          return {
            ...prev,
            ...node.getValue(),
          };
        }
      }, {});
    } else {
      if (!this._fieldMap.has(keys)) {
        console.error(`Can not get [${keys}]'s value`);
        return;
      } else {
        const field = this._fieldMap.get(keys);
        return field.getValue();
      }
    }
  }

  @action public setValue(keys: string, value: any) {
    const field = this._fieldMap.get(keys);
    if (field) {
      field.setValue(value);
      this._emitter.emit(FormEvent.FormValueChange, this);
    } else {
      console.error(
        `Can not set value by ${keys} because it has no matched field`
      );
    }
  }

  /**
   * 保存所有key对应的Field对象
   */
  @action public setFieldMap(keys: string, field: Field) {
    // this._flatValue[keys] = undefined;
    this._fieldMap.set(keys, field);
  }

  /**
   * 动态添加字段校验
   */
  @action public addValidate(props: ValidateProps[]) {
    for (const prop of props) {
      const { driveKey, validate } = prop;
      this._validateMap.set(driveKey, validate);
    }
  }

  @action public addFieldView(type: string, view: ComponentType<any>) {
    this.viewMap[type] = view;
  }

  /**
   * 提交时候需要执行各种钩子
   */
  @action public async submit(validate = true) {
    if (validate) {
      if (await this.validate()) {
        const result = this.getValue("*");
        this._emitter.emit(FormEvent.FormAfterSubmit, result);
        return toJS(result);
      } else {
        return "校验不通过，无法提交";
      }
    } else {
      const result = this.getValue("*");
      this._emitter.emit(FormEvent.FormAfterSubmit, result);
      return toJS(result);
    }
  }

  @action public async validate() {
    const fns: (() => Promise<{
      result: string;
      field: Field;
    }>)[] = [];
    const pushFn = (fields: Field[]) => {
      for (const field of fields) {
        if (field.list.length) {
          pushFn(field.list);
        } else {
          const key = field.absoluteKey;
          if (field.require && !field.getValue()) {
            fns.push(async () => ({
              field,
              result: "该项为必填项",
            }));
          } else if (this._validateMap.has(key)) {
            fns.push(async () => {
              const result = await this._validateMap.get(key)(
                field.getValue(),
                field,
                this
              );
              return {
                field,
                result,
              };
            });
          }
        }
      }
    };
    pushFn(this.tree);

    return Promise.all(fns.map((fn) => fn())).then((datas) => {
      let status = true;
      for (const data of datas) {
        const { field, result } = data;
        if (result) {
          field.setErrors([result]);
          status = false;
        } else {
          field.isError && field.resetError();
        }
      }
      return status;
    });
  }

  @action public onSubmit(fn: FormHookProps) {
    if (fn) {
      this._emitter.on(FormEvent.FormAfterSubmit, fn);
    }
  }

  @action public afterSubmit(fn: FormHookProps) {
    if (fn) {
      this._emitter.on(FormEvent.FormAfterSubmit, fn);
    }
  }

  @action public beforeSubmit(fn: FormHookProps) {
    if (fn) {
      this._emitter.on(FormEvent.FormBeforeSubmit, fn);
    }
  }

  @action public onChange(fn: FormHookProps) {
    if (fn) {
      this._emitter.on(FormEvent.FormValueChange, fn);
    }
  }
}
