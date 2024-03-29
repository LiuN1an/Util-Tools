import { action, computed, makeObservable, observable, toJS } from "mobx";
import { ComponentType } from "react";
import { EmitFn, Form, FormEvent } from "./Form";
import { BasicValue, ConfigProps, FormValue } from "./types";

export class Field {
  public absoluteKey = "";

  public relativeKey = "";

  @observable public fieldType = "normal";

  @observable public label = "";

  @observable public horizontal = false;

  @observable public require = false;

  @observable public content: ComponentType<any> | string;

  /**
   * 只有在叶子节点才生效
   */
  @observable public value: BasicValue;

  @observable public restProps: Record<string, any> = {};

  @observable public list: Field[] = [];

  /**
   * 只有在fieldType为table的时候会采用
   */
  @observable public tableValue: FormValue[] = [];

  @observable public errors: string[] = [];

  @computed public get isError() {
    return this.errors.length > 0;
  }

  constructor(
    readonly _dsl: ConfigProps,
    readonly _position: string[],
    readonly _form: Form,
    readonly _parentField: Field = null,
    readonly _emit: EmitFn
  ) {
    makeObservable(this);
    const {
      children,
      fieldType,
      label,
      content,
      key,
      require = false,
      horizontal = false,
      defaultValue = undefined,
      ...rest
    } = _dsl;

    const keyPath = [..._position, key].filter(Boolean);
    this.relativeKey = key;
    this.absoluteKey = keyPath.join(".");
    this.fieldType = fieldType || "normal";
    this.horizontal = horizontal;
    this.require = require;
    this.label = label;
    this.content = content;

    if (children && Array.isArray(children)) {
      this.list = children.map(
        (child) => new Field(child, keyPath, this._form, this, _emit)
      );
    } else {
      // 只有在叶子节点上才会对defaultValue进行赋值
      this.value = defaultValue;
    }

    if (key) {
      _form.setFieldMap(this.absoluteKey, this);
    }
    this.restProps = rest;
  }

  @action public getContent() {
    if (this.content === "string") {
      return this._form.controlMap[this.content];
    } else {
      return this.content;
    }
  }

  @action public setErrors(errors: string[]) {
    this.errors = [...errors];
  }

  @action public resetError() {
    this.errors = [];
  }

  /**
   * TODO: 此处无法给非叶子节点赋值，起初是为了保证无法直接给嵌套的field赋值一个对象
   */
  @action public setValue(value: any) {
    if (this.fieldType === "table") {
      if (Array.isArray(value)) {
        this.tableValue = value;
      } else {
        this.tableValue = [value];
      }
    } else {
      if (this.list && this.list.length && typeof value === "object") {
        for (const child of this.list) {
          child.setValue(value[child.relativeKey]);
        }
      } else {
        this.value = value;
      }
    }

    this._emit(FormEvent.FormValueChange, value);
  }

  @action public getValue() {
    if (this.fieldType === "table") {
      return toJS(this.tableValue);
    } else {
      if (this.list && this.list.length) {
        let result = {};
        for (const child of this.list) {
          if (child.relativeKey) {
            result[child.relativeKey] = child.getValue();
          } else {
            result = { ...result, ...child.getValue() };
          }
        }
        return toJS(result);
      } else {
        return toJS(this.value);
      }
    }
  }
}
