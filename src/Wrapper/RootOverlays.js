import Toast from "../Toast/Toast";
import Tooltip from "../Tooltip/Tooltip";
import FullscreenDialog from "../Dialog/FullscreenDialog";

/**
 * Wraps children in all the useful root overlays.
 *
 * Ensures root overlays are wrapped in proper order.
 */
const RootOverlays = ({children}) => {
  return (
    <Toast>
      <Tooltip>
        <FullscreenDialog>
          {children}
        </FullscreenDialog>
      </Tooltip>
    </Toast>
  );
}

export default RootOverlays;
