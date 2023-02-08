import React, { useContext, FC, PropsWithChildren } from "react";
import axios from "axios";

export class CacheRequest {
  private _result: Map<string, any> = new Map();

  private _counter: Map<string, number> = new Map();

  private timeout = 0;

  constructor(options?: { timeout: number }) {
    this.timeout = options?.timeout;
  }

  public setTimeout(number: number) {
    this.timeout = number;
  }

  public async get<T>(
    props: { url: string; query?: Record<string, unknown> },
    forceRequest = false
  ): Promise<T> {
    if (this._result.has(props.url)) {
      if (forceRequest) {
        const result = await axios.get(props.url, { params: props.query });
        this._counter.set(props.url, Date.now());
        this._result.set(props.url, result.data);
        return result.data as T;
      } else {
        const lastTime = this._counter.get(props.url);
        const nowTime = Date.now();
        if (nowTime - lastTime < this.timeout) {
          return this._result.get(props.url);
        } else {
          this._counter.set(props.url, nowTime);
          const result = await axios.get(props.url, {
            params: props.query,
          });
          this._result.set(props.url, result.data);
          return result.data as T;
        }
      }
    } else {
      this._counter.set(props.url, Date.now());
      const result = await axios.get(props.url, { params: props.query });
      this._result.set(props.url, result.data);
      return result.data as T;
    }
  }

  public async post<T>(
    props: { url: string; data?: Record<string, unknown> },
    forceRequest = false
  ): Promise<T> {
    if (this._result.has(props.url)) {
      if (forceRequest) {
        const result = await axios.post(props.url, { data: props.data });
        this._counter.set(props.url, Date.now());
        this._result.set(props.url, result.data);
        return result.data as T;
      } else {
        const lastTime = this._counter.get(props.url);
        const nowTime = Date.now();
        if (nowTime - lastTime < this.timeout) {
          return this._result.get(props.url);
        } else {
          this._counter.set(props.url, nowTime);
          const result = await axios.post(props.url, { data: props.data });
          this._result.set(props.url, result.data);
          return result.data as T;
        }
      }
    } else {
      this._counter.set(props.url, Date.now());
      const result = await axios.post(props.url, { data: props.data });
      this._result.set(props.url, result.data);
      return result.data as T;
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
