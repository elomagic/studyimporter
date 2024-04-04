export interface QueuedPromise<T = any> {
  promise: () => Promise<T>;
  resolve: (value: T) => void;
  reject: (reason?: any) => void;
}

export default class PromiseQueue {
  private queue: QueuedPromise[] = [];

  private working = false;

  public enqueue<T = void>(promise: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push({
        promise,
        resolve,
        reject,
      });
      this.dequeue();
    });
  }

  private dequeue(): boolean {
    if (this.working) {
      return false;
    }

    const item = this.queue.shift();
    if (!item) {
      return false;
    }

    this.working = true;
    item
      .promise()
      .then((value) => {
        item.resolve(value);
        return value;
      })
      .finally(() => {
        this.working = false;
        this.dequeue();
      })
      .catch((err) => {
        item.reject(err);
      });

    return true;
  }
}
