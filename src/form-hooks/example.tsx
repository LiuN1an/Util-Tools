import { useForm } from "./index";
import React from "react";

type ValueProps = { name: string };
export const FormExample = (props: { initValue: any }) => {
  const { initValue } = props;
  const {
    value,
    errors,
    onChange,
    replace,
    resetError,
    onAdd,
    onRemove,
    onRemoveAndInsert,
    clean,
  } = useForm<
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
    whenChanged() {
      // 当初次改变时
    },
  });

  const setValue = debounce(
    (field: keyof ValueProps, value: any, index: number) => {
      onChange(({ item }) => {
        item.value[field] = value;
      }, index);
    },
    300
  );

  return (
    <div className={errors("name") && "error"}>
      {value.map((item, index) => {
        return (
          <input
            ref={(ele) => {
              if (ele) {
                item.ref = { current: ele };
              }
            }}
            value={item.value.name}
            onChange={(event) => {
              onChange(({ item }) => {
                item.value.name = event.target.value;
              }, index);
            }}
          />
        );
      })}
    </div>
  );
};
