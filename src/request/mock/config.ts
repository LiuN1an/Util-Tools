import { Random, mock } from "mockjs";

export const randomNum = (minNum: number, maxNum: number): number => {
  return parseInt(
    String(Math.random() * (maxNum - minNum + 1) + minNum),
    10
  );
};

export interface MockConfigItem {
  name: string;
  mock: (props: any, template?: any) => Record<string, any>;
}

export const MockConfig: MockConfigItem[] = [
  {
    name: "user/login",
    mock: () => {
      return {
        data: "登陆成功",
      };
    },
  },
  {
    name: "user/sendsms",
    mock: () => {
      return {
        data: "发送短信成功",
      };
    },
  },
  {
    name: "admin/active/list",
    mock: ({ page_size, page_index }) => {
      return {
        code: 200,
        message: "success",
        data: {
          total: 200,
          pageSize: page_size,
          currentPage: page_index,
          records: new Array(randomNum(10, 100))
            .fill(undefined)
            .map((_, index) => {
              const size = mock("@integer(30, 100)");
              return {
                id: index + 1,
                create_uid: index + 1,
                name: "@name",
                num: "@integer(30, 100)",
                type: 1,
                goods_id: "@id",
                img_url: Random.image(
                  `${size}x${size}`,
                  mock("@color"),
                  mock("@title")
                ),
                start_time: "@datetime",
                end_time: "@datetime",
                pre_sale_at: "@datetime",
                pre_sale_end_at: "@datetime",
                open_sale_at: "@datetime",
                "alive|0-2": 0,
                "status|0-2": 0,
                create_at: "@datetime",
              };
            }),
        },
      };
    },
  },
  {
    name: "admin/active/setalive",
    mock: ({ alive }) => {
      return {
        code: 200,
        data: alive === 1 ? "上架成功" : "下架成功",
      };
    },
  },
  {
    name: "admin/active/{activeId}/prize",
    mock: (_, { activeId }) => {
      return {
        data: "抽奖完成",
      };
    },
  },
  {
    name: "admin/active/{activeId}/prizesms",
    mock: (_, { activeId }) => {
      return {
        data: "发送短信成功",
      };
    },
  },
  {
    name: "active/create",
    mock: ({
      name,
      num,
      type,
      goods_id,
      img_url,
      start_time,
      end_time,
      pre_sale_at,
      pre_sale_end_at,
      open_sale_at,
    }) => {
      return {
        code: 200,
        message: "success",
        data: {
          name,
          num,
          type,
          goods_id,
          img_url,
          start_time,
          end_time,
          pre_sale_at,
          pre_sale_end_at,
          open_sale_at,
        },
      };
    },
  },
  {
    name: "active/update",
    mock: ({
      name,
      num,
      type,
      goods_id,
      img_url,
      start_time,
      end_time,
      pre_sale_at,
      pre_sale_end_at,
      open_sale_at,
    }) => {
      return {
        code: 200,
        message: "success",
        data: {
          name,
          num,
          type,
          goods_id,
          img_url,
          start_time,
          end_time,
          pre_sale_at,
          pre_sale_end_at,
          open_sale_at,
        },
      };
    },
  },
  {
    name: "file/upload",
    mock: () => {
      return {
        code: 200,
        message: "success",
        data: {
          url: "https://png.pngtree.com/png-clipart/20210518/ourlarge/pngtree-world-food-safety-day-fruit-vegetable-decoration-png-image_3304465.jpg",
        },
      };
    },
  },
];
