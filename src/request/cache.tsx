import EventEimtter from "events";
import React, { useContext, FC, PropsWithChildren } from "react";
import { post as originPost, get as originGet } from "./index";

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

  constructor(options?: { timeout: number }) {
    this.timeout = options?.timeout;
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
    forceRequest = false
  ): Promise<T> {
    if (this._requesting.has(props.url)) {
      const pend = this._requesting.get(props.url);
      await pend;
      const result = this._result.get(props.url);
      this._requesting.delete(props.url);
      if (result) {
        return result as T;
      }
    }
    if (this._result.has(props.url)) {
      if (forceRequest) {
        const result = await originGet({
          url: props.url,
          params: props.params,
          template: props.template,
        });
        if (result.data) {
          this._counter.set(props.url, Date.now());
          this._result.set(props.url, result.data);
          return result.data as T;
        } else {
          throw Error(JSON.stringify(result));
        }
      } else {
        const lastTime = this._counter.get(props.url);
        const nowTime = Date.now();
        if (nowTime - lastTime < this.timeout) {
          return this._result.get(props.url);
        } else {
          this._counter.set(props.url, nowTime);
          const result = await originGet({
            url: props.url,
            params: props.params,
            template: props.template,
          });
          this._result.set(props.url, result.data);
          return result.data as T;
        }
      }
    } else {
      const { resolve, reject, pend } = this.pend();
      this._requesting.set(props.url, pend);
      const result = await originGet({
        url: props.url,
        params: props.params,
        template: props.template,
      });
      setTimeout(() => {
        this._requesting.delete(props.url);
      }, 500);
      if (result.data) {
        this._counter.set(props.url, Date.now());
        this._result.set(props.url, result.data);
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
    forceRequest = false
  ): Promise<T> {
    if (this._requesting.has(props.url)) {
      const pend = this._requesting.get(props.url);
      await pend;
      const result = this._result.get(props.url);
      this._requesting.delete(props.url);
      if (result) {
        return result as T;
      }
    }
    if (this._result.has(props.url)) {
      if (forceRequest) {
        const result = await originPost({
          url: props.url,
          data: props.data,
        });
        if (result.data) {
          this._counter.set(props.url, Date.now());
          this._result.set(props.url, result.data);
          return result.data as T;
        } else {
          throw Error(JSON.stringify(result));
        }
      } else {
        const lastTime = this._counter.get(props.url);
        const nowTime = Date.now();
        if (nowTime - lastTime < this.timeout) {
          return this._result.get(props.url);
        } else {
          this._counter.set(props.url, nowTime);
          const result = await originPost({
            url: props.url,
            data: props.data,
          });
          this._result.set(props.url, result.data);
          return result.data as T;
        }
      }
    } else {
      const { resolve, reject, pend } = this.pend();
      this._requesting.set(props.url, pend);
      const result = await originPost({
        url: props.url,
        data: props.data,
      });
      setTimeout(() => {
        this._requesting.delete(props.url);
      }, 500);
      if (result.data) {
        this._counter.set(props.url, Date.now());
        this._result.set(props.url, result.data);
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
    <CacheStore.Provider value={cacheInstance}>
      {children}
    </CacheStore.Provider>
  );
};

export async function postWithoutThrow<T>(
  props: {
    url: string;
    data?: Record<string, unknown>;
    onOk?: (data: T) => void | Promise<void>;
    onError?: (props: {
      code: number;
      data: T;
      message: string;
    }) => void | Promise<void>;
  },
  noCache = false
) {
  const { url, data, onOk, onError } = props;
  try {
    const result = await cacheInstance.post<T>(
      {
        url,
        data,
      },
      noCache
    );
    onOk?.(result);
  } catch (e) {
    try {
      const response = JSON.parse(e.message);
      onError?.(response);
    } catch {}
  }
}

export async function getWithoutThrow<T>(
  props: {
    url: string;
    params?: Record<string, unknown>;
    onOk?: (data: T) => void | Promise<void>;
    onError?: (props: {
      code: number;
      data: T;
      message: string;
    }) => void | Promise<void>;
  },
  noCache = false
) {
  const { url, params, onOk, onError } = props;
  try {
    const result = await cacheInstance.get<T>(
      {
        url,
        params,
      },
      noCache
    );
    onOk?.(result);
  } catch (e) {
    try {
      const response = JSON.parse(e.message);
      onError?.(response);
    } catch {}
  }
}
