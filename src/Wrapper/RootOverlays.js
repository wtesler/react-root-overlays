import React from 'react';
import Toast from "../Toast/Toast";
import Tooltip from "../Tooltip/Tooltip";
import FullscreenDialog from "../Dialog/FullscreenDialog";
import {withModule} from "react-hoc-di";

/**
 * Wraps children in all the useful root overlays.
 *
 * Ensures root overlays are wrapped in proper order.
 */
const RootOverlays = ({children, module}) => {
  const {toastRelay, tooltipRelay, dialogRelay} = module;
  let element = children;
  if (!dialogRelay) {
    element = (<FullscreenDialog> {element} </FullscreenDialog>);
  }
  if (!tooltipRelay) {
    element = (<Tooltip> {element} </Tooltip>);
  }
  if (!toastRelay) {
    element = (<Toast> {element} </Toast>);
  }
  return element;
}

export default withModule(RootOverlays);
