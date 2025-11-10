type MessageHandler = (message: string) => void;

class StockfishService {
  private worker: Worker | null = null;
  private isReady = false;
  private messageQueue: MessageHandler[] = [];
  private difficulty = 10;
  private timeoutMs = 30000; 

  private normalizeIncoming(raw: any) {
    return typeof raw === 'string' ? raw : raw?.data ?? '';
  }

  private handleIncoming = (raw: any) => {
    const message = this.normalizeIncoming(raw);
    console.log('Stockfish:', message);
    
    if (message === 'uciok') {
      this.isReady = true;
      this.sendCommand('ucinewgame');
    }
    
    // Process queued callbacks
    if (this.messageQueue.length > 0) {
      const cb = this.messageQueue.shift();
      if (cb) cb(message);
    }
  };

  private handleWorkerError = (err: ErrorEvent) => {
    console.error('🔴 Stockfish Worker CRASHED:', err.message);
    this.terminate(); // Clean up the crashed worker
    this.isReady = false;
    // NOTE: We don't automatically re-init here to avoid infinite loops,
    // but the next call to getBestMove/init will trigger a restart.
  };

  private resetWorker() {
    this.terminate();
    return this.init();
  }

  async init(): Promise<void> {
    if (this.isReady && this.worker) return Promise.resolve();
    if (this.worker) this.terminate(); 

    // CRITICAL FIX: Tell Emscripten where to find WASM files. 
    (window as any).Module = (window as any).Module || {};
    (window as any).Module.locateFile = (path: string) => `/${path}`;

    try {
      console.log('🚀 Initializing new Worker("/stockfish.js")...');
      this.worker = new Worker('/stockfish.js');
      this.worker.onmessage = (e: MessageEvent) => this.handleIncoming(e.data);
      this.worker.onerror = this.handleWorkerError;

      return await new Promise<void>((resolve, reject) => {
        const timer = setTimeout(() => reject(new Error('Stockfish worker init timeout')), this.timeoutMs);

        const checkUciOk = (m: string) => {
          if (m === 'uciok') {
            clearTimeout(timer);
            this.isReady = true;
            console.log('✅ Stockfish Worker ready');
            resolve();
          } else {
                this.waitForMessage(checkUciOk);
            }
        };

        this.waitForMessage(checkUciOk);
        setTimeout(() => this.sendCommand('uci'), 100);
      });
    } catch (workerErr) {
      console.error('❌ new Worker("/stockfish.js") failed:', workerErr);
      this.terminate();
      throw new Error('Stockfish initialization failed. Check console for details.');
    }
  }

  sendCommand(cmd: string) {
    if (!cmd) return;
    if (this.worker) {
      try {
        console.log('→', cmd);
        this.worker.postMessage(cmd);
      } catch (e) {
        console.warn('Failed to postMessage to worker, may be terminated.', e);
        this.terminate(); // Assume failure if postMessage throws
      }
    } else {
      console.warn('No worker available to send command:', cmd);
    }
  }

  waitForMessage(cb: MessageHandler) {
    this.messageQueue.push(cb);
  }

  async getBestMove(fen: string, depth = 10): Promise<string | null> {
    if (!this.worker || !this.isReady) {
        console.warn('Worker not ready, attempting reset...');
        try {
            await this.resetWorker();
        } catch (e) {
            console.error('Failed to reset worker.', e);
            return null;
        }
    }

    return new Promise((resolve) => {
      const timeout = setTimeout(() => {
            console.warn('⚠️ Get Best Move timeout. Forcing stop.');
            this.sendCommand('stop'); 
            resolve(null)
        }, 15000);

      const handler = (m: string) => {
        if (m.startsWith('bestmove')) {
          clearTimeout(timeout);
          const parts = m.split(' ');
          const bm = parts[1] ?? null;
          resolve(bm && bm !== '(none)' ? bm : null);
        } else {
          this.waitForMessage(handler);
        }
      };

      this.sendCommand('ucinewgame');
      this.sendCommand(`position fen ${fen}`);
      this.sendCommand(`go depth ${depth}`);
      this.waitForMessage(handler);
    });
  }

  async evaluatePosition(fen: string, depth = 12): Promise<number> {
    if (!this.worker || !this.isReady) {
        console.warn('Worker not ready, skipping evaluation.');
        return 0;
    }
    
    return new Promise((resolve) => {
      let evalScore = 0;
      const timeout = setTimeout(() => {
            this.sendCommand('stop');
            resolve(evalScore);
        }, 10000);

      const handler = (m: string) => {
        // Update evaluation based on info messages
        if (m.includes('score cp')) {
          const match = m.match(/score cp (-?\d+)/);
          if (match) evalScore = parseInt(match[1], 10) / 100;
        } else if (m.includes('score mate')) {
          const match = m.match(/score mate (-?\d+)/);
          if (match) {
            const mate = parseInt(match[1], 10);
            evalScore = mate > 0 ? 100 : -100;
          }
        }

        if (m.startsWith('bestmove')) {
          clearTimeout(timeout);
          resolve(evalScore);
        } else {
          this.waitForMessage(handler);
        }
      };

      this.sendCommand(`position fen ${fen}`);
      this.sendCommand(`go depth ${depth}`);
      this.waitForMessage(handler);
    });
  }

  setDifficulty(level: number) {
    this.difficulty = Math.max(1, Math.min(20, level));
    if (this.isReady) {
      this.sendCommand(`setoption name Skill Level value ${this.difficulty}`);
      if (this.difficulty < 15) {
        const err = 100 - (this.difficulty * 4);
        this.sendCommand(`setoption name Skill Level Maximum Error value ${err}`);
      }
    }
    console.log(`🎯 Difficulty set to ${this.difficulty}`);
    return this.difficulty;
  }

  terminate() {
    try {
      if (this.worker) {
        this.worker.terminate();
        this.worker = null;
      }
      this.isReady = false;
      this.messageQueue = [];
    } catch (e) {
      console.warn('Error terminating Stockfish', e);
    }
  }
}

export const stockfish = new StockfishService();
export default stockfish;
