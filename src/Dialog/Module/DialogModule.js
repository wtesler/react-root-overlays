import OverlayRelay from "../../Relay/OverlayRelay";

const DialogModule = (rootModule) => {
  const module = {
    dialogRelay: new OverlayRelay(),
  };

  return [
    module,
    () => {}
  ]
}

export default DialogModule;
