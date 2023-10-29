import EventEimtter from "events";
import React, { useContext, FC, PropsWithChildren } from "react";
import { mapHashIdByObj } from "src/utils/hashID";
import { post as originPost, get as originGet } from "./index";

export type CachePost = {};

export type CacheRequestConfig = {
  forceRequest?: boolean;
  sameAbort?: boolean;
};
/**
 * TODO:
 * 1、缓存涉及到固定url以及payload组合起来的请求结果
 * 2、提供上述结果的刷新机制
 */
export class CacheRequest {
  private _event = new EventEimtter();

  private _requesting: Map<string, Promise<unknown>> = new Map();

  private _result: Map<string, any> = new Map();

  private _counter: Map<string, number> = new Map();

  private timeout = 0;

  private _process;

  constructor(options?: {
    timeout: number;
    resultProcess?: () => boolean | Promise<boolean>; // 这里和下面的TODO对应，可以自定义结果处理函数
  }) {
    this.timeout = options?.timeout;
    this._process = options?.resultProcess;
  }

  public setTimeout(number: number) {
    this.timeout = number;
  }

  public delete(url: string) {
    if (this._result.has(url)) {
      this._result.delete(url);
    }
  }

  public refresh(url: string) {
    this.delete(url);
    this._event.emit("refresh", { url });
  }

  public onRefresh(fn) {
    this._event.on("refresh", fn);
    return () => {
      this._event.off("refresh", fn);
    };
  }

  public pend() {
    let resolve, reject;
    const pend = new Promise((res, rej) => {
      resolve = res;
      reject = rej;
    });
    return { resolve, reject, pend };
  }

  public async get<T>(
    props: {
      url: string;
      params?: Record<string, unknown>;
      template?: Record<string, string>;
    },
    config: CacheRequestConfig
  ): Promise<T> {
    const { forceRequest = false, sameAbort = false } = config || {};
    const [{ hashId }] = await mapHashIdByObj([props], ["url", "params"]);
    if (this._requesting.has(hashId)) {
      if (sameAbort) {
        throw Error(
          JSON.stringify({
            code: -1,
            message: "sameAbort",
          })
        );
      }
      const pend = this._requesting.get(hashId);
      await pend;
      const result = this._result.get(hashId);
      this._requesting.delete(hashId);
      if (result) {
        return result as T;
      }
    }
    if (this._result.has(hashId)) {
      if (forceRequest) {
        const result = await originGet({
          url: props.url,
          params: props.params,
          template: props.template,
        });
        if (result.data) {
          this._counter.set(hashId, Date.now());
          this._result.set(hashId, result.data);
          return result.data as T;
        } else {
          throw Error(JSON.stringify(result));
        }
      } else {
        const lastTime = this._counter.get(hashId);
        const nowTime = Date.now();
        if (nowTime - lastTime < this.timeout) {
          return this._result.get(hashId);
        } else {
          this._counter.set(hashId, nowTime);
          const result = await originGet({
            url: props.url,
            params: props.params,
            template: props.template,
          });
          this._result.set(hashId, result.data);
          return result.data as T;
        }
      }
    } else {
      const { resolve, reject, pend } = this.pend();
      this._requesting.set(hashId, pend);
      const result = await originGet({
        url: props.url,
        params: props.params,
        template: props.template,
      });
      setTimeout(() => {
        this._requesting.delete(hashId);
      }, 500);
      if (result.data) {
        this._counter.set(hashId, Date.now());
        this._result.set(hashId, result.data);
        resolve();
        return result.data as T;
      } else {
        reject(result.message);
        throw Error(JSON.stringify(result));
      }
    }
  }

  public async post<T>(
    props: { url: string; data?: Record<string, unknown> },
    config: CacheRequestConfig
  ): Promise<T> {
    const { forceRequest = false, sameAbort = false } = config || {};
    const [{ hashId }] = await mapHashIdByObj([props], ["url", "data"]);
    if (this._requesting.has(hashId)) {
      if (sameAbort) {
        throw Error(
          JSON.stringify({
            code: -1,
            message: "sameAbort",
          })
        );
      }
      const pend = this._requesting.get(hashId);
      await pend;
      const result = this._result.get(hashId);
      this._requesting.delete(hashId);
      if (result) {
        return result as T;
      }
    }
    if (this._result.has(hashId)) {
      if (forceRequest) {
        const result = await originPost({
          url: props.url,
          data: props.data,
        });
        if (result.data) {
          // TODO: 这里可以外置一些判断条件给不同项目复用
          this._counter.set(hashId, Date.now());
          this._result.set(hashId, result.data);
          return result.data as T;
        } else {
          throw Error(JSON.stringify(result));
        }
      } else {
        const lastTime = this._counter.get(hashId);
        const nowTime = Date.now();
        if (nowTime - lastTime < this.timeout) {
          return this._result.get(hashId);
        } else {
          this._counter.set(hashId, nowTime);
          const result = await originPost(props);
          this._result.set(hashId, result.data);
          return result.data as T;
        }
      }
    } else {
      const { resolve, reject, pend } = this.pend();
      this._requesting.set(hashId, pend);
      const result = await originPost(props);
      setTimeout(() => {
        this._requesting.delete(hashId);
      }, 500);
      if (result.data) {
        this._counter.set(hashId, Date.now());
        this._result.set(hashId, result.data);
        resolve();
        return result.data as T;
      } else {
        reject(result.message);
        throw Error(JSON.stringify(result));
      }
    }
  }
}

const cacheInstance = new CacheRequest();

export const CacheStore = React.createContext<CacheRequest | null>(null);

export const useCacheStore = () => {
  return useContext(CacheStore);
};

export const CacheRequestProvider: FC<
  PropsWithChildren<{ timeout?: number }>
> = ({ children, timeout }) => {
  cacheInstance.setTimeout(timeout || 1000 * 60);
  return (
    <CacheStore.Provider value={cacheInstance}>{children}</CacheStore.Provider>
  );
};
