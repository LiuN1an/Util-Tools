import { action, computed, makeObservable, observable } from "mobx";
import React, { FC, Fragment, useMemo } from "react";

export interface ChangeProps {
  request: string;
  data: Record<string, any>;
}

export interface ComponentProps<T = Record<string, any>> {
  /**
   * 组件需要的外部数据
   */
  //   value: T;
  /**
   * 需要发起数据更改时的接口
   */
  //   onChange: (
  //     props: ChangeProps | ChangeProps[]
  //   ) => Promise<any>;
}

type Component = FC<ComponentProps<any>>;

type IOPipe = (props: Record<string, any>) => Promise<any>;
/**
 * 数据IO侧的注册配置
 */
export interface IOConfig {
  name: string;
  /**
   * IO开发者必须定义这个管道函数
   * 输入为请求payload，经过处理发起请求，输出为处理后的response
   */
  pipe: IOPipe;
  /**
   * 注册的组件
   */
  component: string;
}

/**
 * 组件中间件
 * - 给任意业务项目提供管理所有已注册组件的数据IO以及组件显隐
 */
export class ComponentMiddleWare {
  @observable private _componentProps: Map<string, Record<string, any>> =
    new Map();

  @observable private _IOs: Map<string, IOPipe> = new Map();

  @observable private _components: Map<string, Component> = new Map();

  @observable private _cache: Map<string, React.ComponentProps<any>> =
    new Map();

  @computed public get components() {
    return this._components;
  }

  @computed public get IOs() {
    return this._IOs;
  }

  constructor() {
    makeObservable(this);
  }

  @action public addProps(
    name: string,
    props: Record<string, (...args: any[]) => Promise<any>>
  ) {
    const prop = this._componentProps.get(name) || {};
    this._componentProps.set(name, { ...prop, ...props });
  }

  /**
   * 注册组件
   */
  @action public addComp(
    widget:
      | { name: string; component: Component }[]
      | { name: string; component: Component }
  ) {
    if (Array.isArray(widget)) {
      widget.forEach((w) => {
        this._components.set(w.name, w.component);
      });
    } else {
      this._components.set(widget.name, widget.component);
    }
  }

  /**
   * 注册IO
   */
  @action public addIO(io: IOConfig | IOConfig[]) {
    if (Array.isArray(io)) {
      io.forEach((i) => {
        this._IOs.set(i.name, i.pipe);
      });
    } else {
      this._IOs.set(io.name, io.pipe);
    }
  }

  @action public render<T extends Record<string, any>>(name: string) {
    if (this._cache.get(name)) {
      return this._cache.get(name);
    }
    if (this._components.has(name)) {
      const Component = this._components.get(name);

      const element = (props: T) => {
        // const onChange = useCallback(
        //   async (props: {
        //     request: string;
        //     data: Record<string, any>;
        //   }) => {
        //     const { request, data } = props;

        //     if (this._IOs.has(request)) {
        //       const result = await this._IOs.get(request)(data);
        //       if (result && isObject(result)) {
        //         setValue((v) => (v ? { ...v, ...result } : { ...result }));
        //       }
        //     } else {
        //       throw Error("暂无此数据通道");
        //     }
        //     return result;
        //   },
        //   [value]
        // );

        const wrapProps = useMemo(() => {
          const componentProps = this._componentProps.get(name);
          return componentProps
            ? Object.keys(componentProps).reduce((prev, nxt) => {
                return {
                  ...prev,
                  [nxt]: async (data: Record<string, any>) => {
                    const result = await componentProps[nxt](data);
                    return result;
                  },
                };
              }, {})
            : {};
        }, [this._componentProps]);

        return <Component {...wrapProps} {...props} />;
      };
      this._cache.set(name, element);
      return element;
    } else {
      return Fragment;
    }
  }
}

export const middleware = new ComponentMiddleWare();

(window as unknown as { middleware: ComponentMiddleWare }).middleware =
  middleware;

/**
 *  开放给组件内部调用显示
 */
export const componentRender = <T extends Record<string, any>>(
  name: string,
  deps: any[] = []
) => {
  return useMemo(() => middleware.render<T>(name), [...deps]);
};
