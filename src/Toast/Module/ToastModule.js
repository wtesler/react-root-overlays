import OverlayRelay from "../../Relay/OverlayRelay";

const ToastModule = (rootModule) => {
  const module = {
    toastRelay: new OverlayRelay(),
  };

  return [
    module,
    () => {}
  ]
}

export default ToastModule;
