/* eslint-disable @typescript-eslint/no-explicit-any */
const eventBus = {
  on(event: string, callback: Function) {
    window.addEventListener(event, (e: any) => callback(e.detail));
  },
  dispatch(event: string, data: any) {
    window.dispatchEvent(new CustomEvent(event, { detail: data }));
  },
  remove(event: string, callback: any) {
    window.removeEventListener(event, callback);
  },
};

export default eventBus;
