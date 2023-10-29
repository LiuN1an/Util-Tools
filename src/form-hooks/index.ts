import debounce from "lodash.debounce";
import { useState, useCallback } from "react";
import cloneDeep from "lodash.clonedeep";

export const generateId = () =>
  Math.random().toString(10).slice(2) + Date.now().toString();

type FormType<T, P> = {
  value: T[];
  extraValue?: P;
  defaultValue?: T;
  validate?: (props: {
    items: ItemType<T, P>[];
    current: ItemType<T, P>;
    index: number;
  }) => Promise<ItemType<T, P>>;
  whenChanged?: () => void;
};

export type ItemType<T, P> = {
  id: string;
  value: T;
  index: number;
  errorFields: Record<string, any>;
} & P;

export const useForm = <T, P extends Record<string, any>>(
  props: FormType<T, P>
) => {
  const {
    value,
    defaultValue = {},
    extraValue = {},
    validate,
    whenChanged,
  } = props;
  const [newValue, setValue] = useState<ItemType<T, P>[]>(
    Array.isArray(value) && value.length
      ? value.map(
          (item, index) =>
            ({
              id: generateId(),
              value: item,
              index,
              errorFields: {},
              ...extraValue,
            } as unknown as ItemType<T, P>)
        )
      : ([
          {
            id: generateId(),
            value: defaultValue,
            index: 0,
            errorFields: {},
            ...extraValue,
          },
        ] as ItemType<T, P>[])
  );

  const replace = useCallback(
    (newValue: T[]) => {
      setValue(
        newValue.map(
          (item, index) =>
            ({
              id: generateId(),
              value: item,
              index,
              errorFields: {},
              ...extraValue,
            } as unknown as ItemType<T, P>)
        )
      );
      whenChanged?.();
    },
    [setValue, whenChanged]
  );

  const resetError = useCallback((field: string, index = 0) => {
    setValue((items) => {
      delete items[index].errorFields[field];
      return [...items];
    });
  }, []);

  const internalValidate = useCallback(
    async (items?: ItemType<T, P>[]) => {
      if (validate) {
        const contents = items || newValue;
        const result = [] as ItemType<T, P>[];
        for (const [index, v] of contents.entries()) {
          const afterValidateItem = await validate({
            items: contents,
            current: { ...v },
            index,
          });
          result.push({ ...afterValidateItem });
        }
        setValue(result);
        return result.every(
          (item) =>
            Object.keys(item.errorFields).length === 0 ||
            Object.values(item.errorFields).every((v) => !v)
        );
      } else {
        return true;
      }
    },
    [newValue, validate, setValue]
  );

  const errors = useCallback(
    (field: string, index = 0) => {
      return newValue[index].errorFields[field];
    },
    [newValue]
  );

  const onChange = useCallback(
    (
      fn: (props: { item: ItemType<T, P>; items: ItemType<T, P>[] }) => void,
      index = 0
    ) => {
      setValue((v) => {
        const cloneValue = cloneDeep(v[index].value); // some browsers are not compatible
        const { value, ...rest } = v[index];
        const passed = { ...rest, value: cloneValue } as ItemType<T, P>;
        fn({ item: passed, items: v });
        v[index] = passed;
        return [...v];
      });
      whenChanged?.();
    },
    [setValue]
  );

  const onAdd = useCallback(
    (value: T, extras?: P) => {
      setValue((v) => {
        v.push({
          id: generateId(),
          index: v.length,
          errorFields: {},
          value: value,
          ...(extras || ({} as P)),
        });
        return [...v];
      });
      whenChanged?.();
    },
    [setValue]
  );

  const onRemove = useCallback(
    (index = 0) => {
      setValue((v) => {
        v.splice(index, 1);
        return [...v];
      });
      whenChanged?.();
    },
    [setValue]
  );

  const onRemoveAndInsert = useCallback(
    (source: number, destination: number) => {
      if (
        destination !== undefined &&
        source !== undefined &&
        destination !== source
      ) {
        const items = newValue;
        const insertOne = items.splice(source, 1);
        items.splice(destination, 0, insertOne[0]);
        setValue([...items]);
        whenChanged?.();
        return items;
      }
    },
    [newValue]
  );

  const clean = useCallback((defaultOne?: any) => {
    setValue(
      defaultOne
        ? [
            {
              id: generateId(),
              value: defaultOne,
              index: 0,
              errorFields: {},
              ...extraValue,
            } as any,
          ]
        : []
    );
  }, []);

  const debounceSetValue = debounce(
    (field: unknown, value: unknown, index = 0) => {
      onChange(({ item }) => {
        (item.value as any)[field as any] = value;
      }, index);
    },
    300,
    {
      trailing: true,
    }
  );

  return {
    validate: internalValidate,
    errors,
    resetError,
    value: newValue,
    replace,
    onChange,
    debounceSetValue,
    onRemove,
    onAdd,
    onRemoveAndInsert,
    clean,
  };
};