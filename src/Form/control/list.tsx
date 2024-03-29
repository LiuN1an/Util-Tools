import { Input, Select, DatePicker, Checkbox } from "antd";
import moment from "moment";
import React from "react";
import { ConfigProps } from "../types";

type BaseControlProps = {
  key?: string;
  label?: string;
  children?: BaseControlProps[];
  defaultValue?: unknown;

  [addonKey: string]: any;
};

export const input = (props: BaseControlProps) => {
  const { key, label, error, ...other } = props;
  return {
    key,
    label,
    content: ({ value, setValue, field, error }) => {
      return (
        <Input
          placeholder={"请输入"}
          value={value as string}
          onChange={(e) => {
            setValue(e.target.value);
          }}
          status={error ? "error" : ""}
          onFocus={() => {
            field.resetError();
          }}
        />
      );
    },
    ...other,
  } as ConfigProps;
};

export const select = (
  props: BaseControlProps & {
    options: { value: string; label: string }[];
  }
) => {
  const { key, label, options, ...other } = props;

  return {
    key,
    label,
    content: ({ value, setValue, error, field }) => {
      return (
        <Select
          style={{ width: "100%" }}
          value={value}
          onChange={(v) => {
            setValue(v);
          }}
          options={options}
          status={error ? "error" : ""}
          onFocus={() => {
            field.resetError();
          }}
        />
      );
    },
    ...other,
  } as ConfigProps;
};

const format = "YYYY-MM-DD HH:mm:ss";
const { RangePicker } = DatePicker;

export const timeRange = (props: BaseControlProps): ConfigProps => {
  const { key, label, ...other } = props;
  return {
    key,
    label,
    ...other,
    content: ({ value, setValue }) => {
      return (
        <RangePicker
          style={{ width: "100%" }}
          defaultValue={[
            value?.start_time ? moment(value?.start_time, format) : null,
            value?.end_time ? moment(value?.end_time, format) : null,
          ]}
          showTime={{ format }}
          format={format}
          onChange={(_, [start_time, end_time]) => {
            setValue({
              start_time,
              end_time,
            });
          }}
        />
      );
    },
  } as ConfigProps;
};

export const checkbox = (
  props: BaseControlProps & {
    options: { label: string; value: string }[];
  }
): ConfigProps => {
  const { key, label, options, ...other } = props;
  return {
    key,
    label,
    ...other,
    content: ({ value, setValue }) => {
      return (
        <Checkbox.Group
          options={options}
          defaultValue={value}
          onChange={(e) => {
            setValue(e);
          }}
        />
      );
    },
  } as ConfigProps;
};

export const collapse = (props: BaseControlProps) => {
  const { key, label, children, ...other } = props;
  return {
    key,
    label,
    ...other,
    fieldType: "collapse",
    children: children,
  } as ConfigProps;
};
