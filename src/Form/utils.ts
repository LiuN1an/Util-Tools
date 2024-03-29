import { BasicValue, FlatFormValue } from "./types";

/**
 * {
      "a.b.c.e": 1,
      "a.b.d.c": 2,
      b: 1,
      e: 4,
      "f.g.b": 5,
      "f.g.a": 6,
    }
     =>
    {
    "a": {
        "b": {
            "c": {
                "e": 1
            },
            "d": {
                "c": 2
            }
        }
    },
    "b": 1,
    "e": 4,
    "f": {
        "g": {
            "b": 5,
            "a": 6
        }
    }
}
 */
export const unflatten = (flat: FlatFormValue) => {
  if (!flat) return flat;
  const result: Record<string, any> = {};

  const destruct = (
    keys: string[],
    endValue: BasicValue,
    outTarget: Record<string, any>
  ) => {
    const [firstKey, ...rest] = keys;

    if (rest.length === 0) {
      outTarget[firstKey] = endValue;
    } else {
      !outTarget[firstKey] && (outTarget[firstKey] = {});
      destruct(rest, endValue, outTarget[firstKey]);
    }
  };

  for (const key of Object.keys(flat)) {
    const keyArr = key.split(".");
    if (keyArr.length === 0)
      throw Error("Unknown reason lead to key error");
    destruct(keyArr, flat[key], result);
  }
  return result;
};
