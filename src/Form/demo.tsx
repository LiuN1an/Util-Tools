import React, { useEffect, useState } from "react";
import {
  Form,
  FormView,
  input,
  select,
  timeRange,
  collapse,
  createForm,
  checkbox,
} from "@nspace-components";
import { Button } from "antd";

export const FormEngine = () => {
  const form = createForm(
    [
      input({
        key: "input1",
        label: "123123",
        horizontal: true,
      }),
      input({ key: "input2", label: "12314", horizontal: true }),
      input({
        key: "input3",
        label: "12314",
        horizontal: true,
        require: true,
      }),
      checkbox({
        key: "checkbox1",
        label: "box",
        options: [
          {
            label: "App端",
            value: "app",
          },
          {
            label: "H5",
            value: "h5",
          },
        ],
        horizontal: true,
        defaultValue: ["app", "h5"],
      }),
      select({
        key: "select1",
        label: "我是选择",
        defaultValue: "s2",
        horizontal: true,
        options: [
          {
            label: "选择1",
            value: "s1",
          },
          {
            label: "选择2",
            value: "s2",
          },
          {
            label: "选择3",
            value: "s3",
          },
        ],
      }),
      timeRange({
        key: "timeRange",
        label: "时间范围",
        horizontal: true,
      }),
      collapse({
        key: "ok",
        label: "报名",
        children: [
          timeRange({
            key: "timeRange1",
            label: "时间范围",
          }),
          input({ key: "input4", label: "sdasd", require: true }),
        ],
      }),
    ],
    [
      {
        driveKey: "select1",
        validate: async (value) => {
          if (value !== "s1") {
            return "选择错误";
          }
          return "";
        },
      },
      {
        driveKey: "ok.input4",
        validate: async (value) => {
          if (value !== "123") {
            return "不等于123";
          }
          return "";
        },
      },
    ]
  );

  const [result, setResult] = useState("");

  useEffect(() => {
    form.onChange(async (form: Form) => {
      console.log("value change ", form);
    });
    form.onSubmit(async (v) => {
      console.log("after submiut: ", v);
    });
  }, [form]);

  return (
    <>
      <div className="w-full flex justify-center items-center flex-col">
        <div className="w-1/2">
          <FormView form={form} />
        </div>
        <Button
          type="primary"
          size="large"
          onClick={async () => {
            const r = await form.submit();
            setResult(JSON.stringify(r));
          }}
        >
          提交
        </Button>
        {result ? <div>{result}</div> : <></>}
      </div>
    </>
  );
};
