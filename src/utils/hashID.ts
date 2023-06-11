// 兼容https和http下的Object To HashID
const generateHashId = async (obj: Object) => {
  try {
    const textEncoder = new TextEncoder();
    const input = JSON.stringify(obj);
    const encodedData = textEncoder.encode(input);
    const hashBuffer = await crypto.subtle.digest("SHA-256", encodedData);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray
      .map((byte) => byte.toString(16).padStart(2, "0"))
      .join("");
    return hashHex;
  } catch {
    return generateHashIdWithHttp(obj);
  }
};

const partOfObject = (obj: Object, keys: string[]) => {
  const result = {};
  keys.forEach((key) => {
    result[key] = obj[key];
  });
  return result;
};

// 可选一个Object中哪些key参与hashId的计算
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

function murmurhash3_32_gc(key, seed) {
  var remainder = key.length % 4;
  var bytes = key.length - remainder;
  var h1 = seed || 1;
  var c1 = 0xcc9e2d51;
  var c2 = 0x1b873593;
  var i = 0;

  while (i < bytes) {
    var k1 =
      (key.charCodeAt(i) & 0xff) |
      ((key.charCodeAt(++i) & 0xff) << 8) |
      ((key.charCodeAt(++i) & 0xff) << 16) |
      ((key.charCodeAt(++i) & 0xff) << 24);
    ++i;

    k1 =
      ((k1 & 0xffff) * c1 +
        (((((k1 >>> 16) * c1) & 0xffff) + (k1 & 0xffff) * c2) << 16)) |
      0;
    k1 = (k1 << 15) | (k1 >>> 17);
    k1 =
      ((k1 & 0xffff) * c2 +
        (((((k1 >>> 16) * c2) & 0xffff) + (k1 & 0xffff) * c1) << 16)) |
      0;

    h1 ^= k1;
    h1 = (h1 << 13) | (h1 >>> 19);
    h1 = (h1 * 5 + 0xe6546b64) | 0;
  }

  k1 = 0;

  switch (remainder) {
    case 3:
      k1 ^= (key.charCodeAt(i + 2) & 0xff) << 16;
    case 2:
      k1 ^= (key.charCodeAt(i + 1) & 0xff) << 8;
    case 1:
      k1 ^= key.charCodeAt(i) & 0xff;
      k1 =
        ((k1 & 0xffff) * c1 + ((((k1 >>> 16) * c1) & 0xffff) << 16)) | 0;
      k1 = (k1 << 15) | (k1 >>> 17);
      k1 =
        ((k1 & 0xffff) * c2 + ((((k1 >>> 16) * c2) & 0xffff) << 16)) | 0;
      h1 ^= k1;
  }

  h1 ^= key.length;

  h1 ^= h1 >>> 16;
  h1 = (h1 * 0x85ebca6b) | 0;
  h1 ^= h1 >>> 13;
  h1 = (h1 * 0xc2b2ae35) | 0;
  h1 ^= h1 >>> 16;

  return h1 >>> 0;
}

const generateHashIdWithHttp = (object) => {
  const input = JSON.stringify(object);

  const unsigned32bitHash = murmurhash3_32_gc(input, Math.random());
  const hashHex = unsigned32bitHash.toString(16).padStart(8, "0");

  return hashHex;
};
