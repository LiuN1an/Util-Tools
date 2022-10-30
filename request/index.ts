import axios from "axios";
import { mocker } from "./mock";
import { randomNum } from "./mock/config";

const _MOCK = (process.env.MOKE = "true");

const host = "";

const SESSION_KEY = "zxhnjkasd";

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
  baseURL: `${host}`,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 100000,
});

export const post = async <
  R,
  D = Record<string, any>,
  Q = Record<string, any>
>(
  props: PostProps<D, Q>
) => {
  const {
    url,
    params,
    data,
    template,
    isMultipart = false,
    listener,
  } = props;
  const matches = url.match(templateURL);
  let realURL = url as string;
  if (matches && matches.length > 0) {
    matches.forEach((match) => {
      const output = match.replaceAll(" ", "");
      const variable = output.slice(1, output.length - 1);
      realURL = realURL.replace(match, template[variable]);
    });
  }
  try {
    if (_MOCK) {
      return new Promise<RequestReturn<R>>((resolve) => {
        setTimeout(() => {
          resolve(mocker.getMock(url)(data, template)?.data);
        }, randomNum(0, 2) * 1000);
      });
    } else {
      const response = await axiosInstance({
        method: "POST",
        url: realURL,
        data: data || {},
        params,
        headers: {
          Authorization: `Bearer ${getStorage(SESSION_KEY)}`,
          "Content-Type": isMultipart
            ? "multipart/form-data"
            : "application/json",
        },
        // onUploadProgress: (event: ProgressEvent) => {
        //   if (listener) {
        //     listener(event.loaded / event.total);
        //   }
        // },
      });
      if (response.data?.code === 200 || response.data?.code === 0) {
        return response.data as RequestReturn<R>;
      } else {
        throw response.data?.message;
      }
    }
  } catch (e) {
    throw Error(e);
  }
};

export const get = async <R, Q = Record<string, any>>(
  props: GetProps<Q>
) => {
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
  try {
    if (_MOCK) {
      return new Promise<RequestReturn<R>>((resolve) => {
        setTimeout(() => {
          resolve(mocker.getMock(url)(params, template)?.data);
        }, randomNum(0, 2) * 1000);
      });
    } else {
      const response = await axiosInstance({
        method: "GET",
        url: realURL,
        params,
        headers: {
          Authorization: `Bearer ${getStorage(SESSION_KEY)}`,
        },
      });
      if (response.data?.code === 200) {
        return response.data as RequestReturn<R>;
      } else {
        throw response.data?.message;
      }
    }
  } catch (e) {
    throw Error(e);
  }
};

export const getStorage = (key: string, isSession = false) => {
  if (isSession) {
    return sessionStorage.getItem(key) || localStorage.getItem(key);
  } else {
    return localStorage.getItem(key);
  }
};
