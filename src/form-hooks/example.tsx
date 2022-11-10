import { useForm } from "./index";
import React from "react";

export const FormExample = (props: { initValue: any }) => {
  const { initValue } = props;
  const { value, errors, onChange } = useForm<
    { name: string },
    {
      loading: boolean;
      ref: React.MutableRefObject<HTMLInputElement | null>;
    }
  >({
    value: [initValue],
    extraValue: {
      loading: false,
      ref: null,
    },
    validate: async ({ items, current, index }) => {
      const value = current.value;
      if (!value.name) {
        current.errorFields.name = "name is empty";
      }
      return current;
    },
  });
  return (
    <div className={errors("name") && "error"}>
      <input
        ref={(ele) => {
          if (ele) {
            value[0].ref = { current: ele };
          }
        }}
        value={value[0].value.name}
        onChange={(event) => {
          onChange(({ item }) => {
            item.value.name = event.target.value;
          });
        }}
      />
    </div>
  );
};
