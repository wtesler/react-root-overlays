export default class OverlayRelay {
  show() {
    this.onShowRequest(...arguments);
  }

  _subscribe(onShowRequest) {
    this.onShowRequest = onShowRequest;
  }

  _clear() {
    this.onShowRequest = null;
  }
}
