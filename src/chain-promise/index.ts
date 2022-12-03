type TasksFn = (() => void) | (() => Promise<void>);

export class What {
  public queue: TasksFn[] = [];

  constructor() {}

  public push(fn: TasksFn) {
    this.queue.push(fn);
  }

  public sleep(timeout: number) {
    this.push(async () => {
      let promise = new Promise((resolve) => {
        setTimeout(resolve, timeout);
      });
      return promise;
    });
    return this;
  }

  public eat() {
    this.push(() => {});
    return this;
  }

  public async exec() {
    for (const task of this.queue) {
      await task();
    }
  }
}

const what = new What();
what.eat().sleep(5).eat().sleep(5).sleep(5);
what.exec();

export class What2 {
  public queue = Promise.resolve();

  constructor() {}

  public sleep(timeout: number) {
    this.queue = this.queue.then(
      () =>
        new Promise((resolve) => {
          setTimeout(resolve, timeout);
        })
    );
    return this;
  }

  public eat() {
    this.queue = this.queue.then(() => {
      // do something
    });
    return this;
  }
}

const what2 = new What2();
what2.eat().sleep(5).eat().eat().sleep(20).sleep(20).eat();
