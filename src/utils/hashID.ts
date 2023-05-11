const generateHashId = async (obj: Object) => {
  const textEncoder = new TextEncoder();
  const input = JSON.stringify(obj);
  const encodedData = textEncoder.encode(input);
  const hashBuffer = await crypto.subtle.digest("SHA-256", encodedData);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
  return hashHex;
};

const partOfObject = (obj: Object, keys: string[]) => {
  const result = {};
  keys.forEach((key) => {
    result[key] = obj[key];
  });
  return result;
};

export const mapHashIdByObj = async (
  items: Array<Object>,
  keys = Object.keys(items)
) => {
  const promises = items.map((item) =>
    generateHashId(partOfObject(item, keys))
  );
  const hashIds = await Promise.all(promises);
  return items.map((item, index) => ({
    ...item,
    hashId: hashIds[index],
  }));
};
