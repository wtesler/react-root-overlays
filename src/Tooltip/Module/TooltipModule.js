import OverlayRelay from "../../Relay/OverlayRelay";

const TooltipModule = (rootModule) => {
  const module = {
    tooltipRelay: new OverlayRelay(),
  };

  return [
    module,
    () => {}
  ]
}

export default TooltipModule;
