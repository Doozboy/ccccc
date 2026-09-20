class ThumbnailLoadQueue {
  private queue: Array<() => Promise<void>> = [];
  private isProcessing = false;

  async add(loadFunction: () => Promise<void>): Promise<void> {
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          await loadFunction();
          resolve();
        } catch (error) {
          reject(error);
        }
      });

      if (!this.isProcessing) {
        this.processQueue();
      }
    });
  }

  private async processQueue() {
    if (this.isProcessing || this.queue.length === 0) {
      return;
    }

    this.isProcessing = true;

    while (this.queue.length > 0) {
      const loadFunction = this.queue.shift();
      if (loadFunction) {
        await loadFunction();
      }
    }

    this.isProcessing = false;
  }
}

export const thumbnailLoadQueue = new ThumbnailLoadQueue();
