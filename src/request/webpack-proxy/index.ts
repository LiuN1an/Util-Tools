/**
 * 在nextjs下直接使用webpack的rewrites配置
 * source: "/:path"
 * destination: "https://xxx.com/:path"
*/

import axios from "axios";

const SESSION_KEY = "xxx";

export const getStorage = (key: string, isSession = false) => {
  if (typeof window !== "undefined") {
    if (isSession) {
      return sessionStorage.getItem(key) || localStorage.getItem(key);
    } else {
      return localStorage.getItem(key);
    }
  }
};

export const setStorage = (key: string, value: string, isSession = true) => {
  if (typeof window !== "undefined") {
    if (value === undefined) {
      localStorage.removeItem(key);
    } else {
      localStorage.setItem(key, value);
    }
    if (isSession) {
      if (value === undefined) {
        sessionStorage.removeItem(key);
      } else {
        sessionStorage.setItem(key, value);
      }
    }
  }
};

export interface RequestProps<D, Q> {
  url: string;
  method: "POST" | "GET";
  params?: Q;
  data?: D;
}

interface BaseProps<Q> {
  url: string;
  template?: Record<string, string>;
  params?: Q;
}

export interface PostProps<D, Q> extends BaseProps<Q> {
  data?: D;
  isMultipart?: boolean;
  listener?: (...args: any[]) => void;
}

export interface GetProps<Q> extends BaseProps<Q> {}

const templateURL = /(\{.*?\})/g;

type RequestReturn<T> = {
  code: number;
  message: string;
  data: T;
};

const axiosInstance = axios.create({
  baseURL: `/`,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 100000,
});

export const post = async <R, D = Record<string, any>, Q = Record<string, any>>(
  props: PostProps<D, Q>
) => {
  const { url, params, data, template, isMultipart = false, listener } = props;
  const matches = url.match(templateURL);
  let realURL = url as string;
  if (matches && matches.length > 0) {
    matches.forEach((match) => {
      const output = match.replaceAll(" ", "");
      const variable = output.slice(1, output.length - 1);
      realURL = realURL.replace(match, template[variable]);
    });
  }

  const response = await axiosInstance({
    method: "POST",
    url: realURL,
    data: data || {},
    params,
    headers: {
      Authorization: `Bearer ${getStorage(SESSION_KEY, true)}`,
      "Content-Type": isMultipart ? "multipart/form-data" : "application/json",
    },
  });
  if (response.status === 200) {
    return response.data as RequestReturn<R>;
  } else {
    throw response.data?.message;
  }
};

export const get = async <R, Q = Record<string, any>>(props: GetProps<Q>) => {
  const { url, params, template } = props;
  const matches = url.match(templateURL);
  let realURL = url as string;
  if (matches && matches.length > 0) {
    matches.forEach((match) => {
      const output = match.replaceAll(" ", "");
      const variable = output.slice(1, output.length - 1);
      realURL = realURL.replace(match, template[variable]);
    });
  }
  const response = await axiosInstance({
    method: "GET",
    url: realURL,
    params,
    headers: {
      Authorization: `Bearer ${getStorage(SESSION_KEY, true)}`,
    },
  });

  if (response.status === 200) {
    return response.data as RequestReturn<R>;
  } else {
    throw response.data?.message;
  }
};
