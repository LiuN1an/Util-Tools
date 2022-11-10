import Mock from "mockjs";
import { MockConfig, MockConfigItem } from "./config";

class Mocker {
  private _store: Map<string, MockConfigItem["mock"]> = new Map();

  constructor() {}

  public getMock(name: string) {
    const func = this._store.get(name);
    return (props: any, template?: any) => {
      return Mock.mock(func?.(props, template) || {});
    };
  }

  public setMock(name: string, mock: MockConfigItem["mock"]) {
    this._store.set(name, mock);
  }
}

export const mocker = new Mocker();

MockConfig.forEach((config) => {
  mocker.setMock(config.name, config.mock);
});
