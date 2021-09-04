import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import './Toast.css';
import {withModule} from 'react-hoc-di';
import ToastModule from './Module/ToastModule';

/**
 * A globally accessible Toast Pop-Up useful for short-lived notifications.
 *
 * Retrieve a `toastRelay` through `props.module` and call `show` on it. See `show` parameters.
 *
 * pass `null` to `toastRelay` to hide toast.
 *
 */
const Toast = props => {
  const {module, children} = props;
  const {toastRelay} = module;

  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [blocking, setBlocking] = useState(false);
  const [isAtTop, setIsAtTop] = useState(false);

  const showDelayTimeoutRef = useRef(null);
  const durationTimeoutRef = useRef(null);

  /**
   * Hide the toast.
   *
   * @param atleastTime The toast continues showing until at least this much time has passed.
   */
  const hide = useCallback(() => {
    setOpen(false);
  }, []);

  const showOnDelay = useCallback((message, blocking, isAtTop, durationMs) => {
    setOpen(true);
    setMessage(message);
    setBlocking(blocking);
    setIsAtTop(isAtTop);

    if (durationMs) {
      durationTimeoutRef.current = setTimeout(hide, durationMs);
    }
  }, [hide]);

  /**
   * Shows a message as a toast notification.
   *
   * @param message The message to show.
   * @param blocking Whether user interaction should be blocked when the toast is showing.
   * @param durationMs How long should the toast last. If null, then until `show(null)` is called.
   * @param delayMs Amount of time to delay before showing toast
   * @param isAtTop Should it show at the top?
   */
  const show = useCallback((
    message,
    blocking = false,
    durationMs = null,
    stacks = true,
    delayMs = 0,
    isAtTop = false) => {

    if (!message) {
      hide();
      return;
    }

    if (durationTimeoutRef.current) {
      clearTimeout(durationTimeoutRef.current);
    }

    if (showDelayTimeoutRef.current) {
      clearTimeout(showDelayTimeoutRef.current);
    }

    showDelayTimeoutRef.current = setTimeout(() => showOnDelay(message, blocking, isAtTop, durationMs), delayMs);
  }, [hide, showOnDelay, showDelayTimeoutRef]);

  useEffect(() => {
    toastRelay._subscribe(show);
    return () => {
      toastRelay._clear();
    }
  }, [toastRelay, show]);

  useEffect(() => {
    return () => {
      if (durationTimeoutRef.current) {
        clearTimeout(durationTimeoutRef.current);
        durationTimeoutRef.current = null;
      }
      if (showDelayTimeoutRef.current) {
        clearTimeout(showDelayTimeoutRef.current);
        showDelayTimeoutRef.current = null;
      }
    }
  }, [showDelayTimeoutRef]);

  const blockingDisplay = useMemo(() => {
    return blocking ? 'block' : 'none';
  }, [blocking]);

  const mainStyle = useMemo(() => {
    const style = {};
    if (isAtTop) {
      style.top = '4px';
    }
    return style;
  }, [isAtTop]);

  const content = useMemo(() => {
    if (!open) {
      return null;
    }

    return (
      <div
        id='ToastOuter'>
        <div
          id='ToastOverlay'
          style={{display: blockingDisplay}}
          onClick={evt => evt.stopPropagation()}
          onTouchStart={evt => evt.stopPropagation()}
        />
        <div id='Toast' style={mainStyle}>{message}</div>
      </div>
    );
  }, [open, message, blockingDisplay, mainStyle]);

  return (
    <>
      {children}
      {content}
    </>
  );
}

export default withModule(Toast, ToastModule);
