import { useEffect, useState } from "react";
import { Form } from "./Form";
import { ConfigProps, ValidateProps } from "./types";

export * from "./Form";
export * from "./Field";
export * from "./view";
export * from "./control";

let _id = 0;

export const createForm = (
  config: ConfigProps[],
  validate: ValidateProps[] = []
) => {
  const [form] = useState(new Form(config));

  useEffect(() => {
    if (form) {
      _id += 1;
      window[`form_${_id}`] = form;
      form.addValidate(validate);
    }
  }, [form]);

  return form;
};
