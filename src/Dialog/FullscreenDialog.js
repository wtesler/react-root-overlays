import React, {useCallback, useEffect, useMemo, useState} from 'react';
import './FullscreenDialog.css';
import {withModule} from "react-hoc-di";
import DialogModule from "./Module/DialogModule";

/**
 * Displays a fullscreen dialog with customizable inner content.
 *
 * Make this appear by emitting [element, isCancellable, className] through the dialogSubject.
 */
const FullScreenDialog = props => {
  const {module, children} = props;
  const {dialogRelay} = module;

  const [element, setElement] = useState(null);
  const [isCancellable, setIsCancellable] = useState(true);
  const [className, setClassName] = useState('');

  /**
   * @param ele The react component to insert into the dialog. Can be null.
   * @param cancellable Whether it can be cancelled. Can be null.
   * @param className to apply to outer dialog. Can be null.
   */
  const show = useCallback((ele, cancellable, className) => {
    setElement(ele);
    setIsCancellable(cancellable);
    setClassName(className);
  }, []);

  useEffect(() => {
    dialogRelay._subscribe(show);
    return () => {
      dialogRelay._clear();
    }
  }, [dialogRelay, show]);

  const onBackgroundClicked = useCallback((event) => {
    if (!isCancellable) {
      return;
    }
    setElement(null);
    event.stopPropagation();
  }, [isCancellable]);

  const onCloseClicked = useCallback((event) => {
    if (!isCancellable) {
      return;
    }
    setElement(null);
    event.stopPropagation();
  }, [isCancellable]);

  const onInnerClick = useCallback((event) => {
    event.stopPropagation();
  }, []);

  const closeElement = useMemo(() => {
    if (isCancellable) {
      return (
        <div id="FullscreenDialogClose" onClick={onCloseClicked}>
          {'×'}
        </div>
      );
    } else {
      return null;
    }
  }
, [onCloseClicked, isCancellable]);

const content = useMemo(() =>
  {
    if (!element) {
      return null;
    }

    return (
      <div
        id="FullscreenDialogOuter"
        className={className ? className : ''}
        onClick={onBackgroundClicked}
      >
        <div id="FullscreenDialogInner" onClick={onInnerClick}>
          {element}
          {closeElement}
        </div>
      </div>
    );
  }
, [element, closeElement, className, onBackgroundClicked, onInnerClick]);

return (
  <>
    {children}
    {content}
  </>
);
};

export default withModule(FullScreenDialog, DialogModule);
