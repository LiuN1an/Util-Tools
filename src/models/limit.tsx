import React, { useContext, FC, PropsWithChildren } from "react";

const isBrowser = () => typeof window !== "undefined";

const deadline = (hour: number) => Date.now() + 1000 * 60 * 60 * hour;

const notNull = (local: string) =>
  local && local !== "null" && local !== "undefined";

export class Limit {
  public count_key;

  public expire_key;

  public count;

  public expire;

  public init_count;

  public init_expire;

  constructor(props: {
    count_key: string;
    expire_key: string;
    count?: number;
    // 小时
    expire?: number;
  }) {
    const { count_key, expire_key, count = 10, expire = 24 } = props;
    this.count_key = count_key;
    this.expire_key = expire_key;
    this.count = count;
    this.init_count = count;
    this.expire = expire;
    this.init_expire = expire;

    this.default();
  }

  public default() {
    if (isBrowser()) {
      const localCount = window.localStorage.getItem(this.count_key);
      if (notNull(localCount)) {
        this.count = Number(localCount);
      } else {
        window.localStorage.setItem(this.count_key, String(this.count));
        window.localStorage.setItem(
          this.expire_key,
          deadline(this.expire).toString()
        );
      }
    }
  }

  public reset() {
    if (isBrowser()) {
      window.localStorage.setItem(this.count_key, this.init_count);
      window.localStorage.setItem(
        this.expire_key,
        deadline(this.init_expire).toString()
      );
      this.count = this.init_count;
      this.expire = this.init_expire;
    }
  }

  public consume(props?: { resetTime?: boolean }) {
    const { resetTime = false } = props || {};
    this.count--;
    if (isBrowser()) {
      window.localStorage.setItem(this.count_key, String(this.count));
      resetTime &&
        window.localStorage.setItem(
          this.expire_key,
          deadline(this.expire).toString()
        );
    }
  }

  public check() {
    let count = this.count;
    if (isBrowser()) {
      count = Number(window.localStorage.getItem(this.count_key));
      if (this.count !== count) {
        console.log("report: Not Equal");
      }
      const expire = window.localStorage.getItem(this.expire_key);
      if (Number(expire) < Date.now()) {
        this.reset();
        return true;
      }
    }
    return count > 0;
  }

  public clear() {
    this.count = 0;
    window.localStorage.removeItem(this.count_key);
    window.localStorage.removeItem(this.expire_key);
  }
}

export const LimitStore = React.createContext<Limit | null>(null);

export const useLimitStore = () => {
  return useContext(LimitStore);
};

export const LimitProvider: FC<PropsWithChildren<{}>> = ({ children }) => {
  return (
    <LimitStore.Provider
      value={
        new Limit({
          count_key: "limit_count",
          expire_key: "limit_expire",
        })
      }
    >
      {children}
    </LimitStore.Provider>
  );
};
