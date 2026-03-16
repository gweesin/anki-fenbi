import { NetworkObserver } from '../types'

class NetworkInterceptor {
  private observers: Array<NetworkObserver> = [];

  constructor() {
    this.overrideFetch();
    this.overrideXHR();
  }

  addObserver(observer: NetworkObserver) {
    this.observers.push(observer);
  }

  removeObserver(observer: NetworkObserver) {
    const index = this.observers.indexOf(observer);
    if (index > -1) {
      this.observers.splice(index, 1);
    }
  }

  private notifyObservers(data: any) {
    this.observers.forEach(observer => {
      if (observer.filter(data)) {
        observer.handler(data);
      }
    });
  }

  private overrideFetch() {
    const { fetch: originalFetch } = window;
    window.fetch = async (...args: any[]): Promise<Response> => {
      // @ts-ignore
      const response = await originalFetch(...args);
      this.notifyObservers(response);

      return response;
    };
  }

  private overrideXHR() {
    const XHR = XMLHttpRequest.prototype;
    const originalOpen = XHR.open;
    const originalSend = XHR.send;

    XHR.open = function(this: any, method: string, url: string | URL, ...rest: any[]) {
      return originalOpen.apply(this, [method, url, ...rest] as any);
    };

    const _this = this;
    XHR.send = function(this: any, body?: Document | XMLHttpRequestBodyInit | null) {
      this.addEventListener('load', () => {
        _this.notifyObservers({url: this.url, data: this.responseText});
      });
      return originalSend.apply(this, [body] as any);
    };
  }
}

export default new NetworkInterceptor()
