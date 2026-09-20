class VideoAutoplayQueue {
  private queue: Array<() => Promise<void>> = [];
  private isProcessing = false;
  private delay = 300;
  private loadQueue: Array<() => Promise<void>> = [];
  private isLoadProcessing = false;
  private loadDelay = 50;

  add(playFunction: () => Promise<void>) {
    this.queue.push(playFunction);
    if (!this.isProcessing) {
      this.process();
    }
  }

  addLoad(loadFunction: () => Promise<void>) {
    this.loadQueue.push(loadFunction);
    if (!this.isLoadProcessing) {
      this.processLoad();
    }
  }

  private async process() {
    this.isProcessing = true;

    while (this.queue.length > 0) {
      const playFunction = this.queue.shift();
      if (playFunction) {
        try {
          await playFunction();
        } catch (error) {
          console.error('Error in autoplay queue:', error);
        }
        await new Promise(resolve => setTimeout(resolve, this.delay));
      }
    }

    this.isProcessing = false;
  }

  private async processLoad() {
    this.isLoadProcessing = true;

    while (this.loadQueue.length > 0) {
      const loadFunction = this.loadQueue.shift();
      if (loadFunction) {
        try {
          await loadFunction();
        } catch (error) {
          console.error('Error in load queue:', error);
        }
        await new Promise(resolve => setTimeout(resolve, this.loadDelay));
      }
    }

    this.isLoadProcessing = false;
  }

  setDelay(ms: number) {
    this.delay = ms;
  }

  setLoadDelay(ms: number) {
    this.loadDelay = ms;
  }
}

export const videoAutoplayQueue = new VideoAutoplayQueue();
