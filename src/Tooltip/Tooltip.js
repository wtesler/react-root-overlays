import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import './Tooltip.css';
import {withModule} from 'react-hoc-di';
import TooltipModule from './Module/TooltipModule';

const ARROW_SIZE_PIXELS = 8;
const MAX_WIDTH = 350;
const SIDE_MARGIN = 8;

/**
 * A globally accessible Tooltip Pop-Up useful for position-relevant notifications.
 *
 * Show with `show` and hide with `hide`.
 *
 * It is retrieved using `withModule` and accessed as `props.module.tooltip`.
 */
const Tooltip = props => {
  const {module, children} = props;
  const {tooltipRelay} = module;

  const [showing, setShowing] = useState(false);
  const [element, setElement] = useState(false); // The element which the tooltip is placed next to.
  const [message, setMessage] = useState('');
  const [blocking, setBlocking] = useState(false);
  const [closeable, setCloseable] = useState(false);
  const [bodyOuterStyle, setBodyOuterStyle] = useState({});
  const [bodyStyle, setBodyStyle] = useState({});
  const [arrowStyle, setArrowStyle] = useState({});
  const [arrowClass, setArrowClass] = useState('');
  const [overrideSide, setOverrideSide] = useState(null);

  const animationFrameRef = useRef(null);
  const showDelayTimeoutRef = useRef(null);
  const hideTimeoutRef = useRef(null);
  const showDurationRef = useRef(null);

  const tooltipBodyElementRef = useRef(null);

  /**
   * Create and return an object which contains relevant layout info of the given element.
   */
  const _getElementLayoutInfo = useCallback((element) => {
    const rect = element.getBoundingClientRect();
    const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

    return {
      top: rect.top + scrollTop,
      right: document.body.clientWidth - (rect.left + scrollLeft + rect.width),
      bottom: document.body.clientHeight - (rect.top + scrollTop + rect.height),
      left: rect.left + scrollLeft,
      width: rect.width,
      height: rect.height
    };
  }, []);

  const _setLayoutState = useCallback((element) => {
    const tooltipBodyElement = tooltipBodyElementRef.current;
    if (!tooltipBodyElement) {
      return;
    }

    const bodyOuterStyle = {};
    const bodyStyle = {};
    const arrowStyle = {};

    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;

    const positionInfo = _getElementLayoutInfo(element);
    const tooltipInfo = _getElementLayoutInfo(tooltipBodyElement);

    const isLeft = positionInfo.left + positionInfo.width / 2 < screenWidth / 2;

    let isTop;
    if (overrideSide === 'top') {
      isTop = true;
    } else if (overrideSide === 'bottom') {
      isTop = false;
    } else {
      isTop = positionInfo.top + positionInfo.height / 2 < screenHeight / 2;
    }

    const arrowPosition = positionInfo.width / 2 - ARROW_SIZE_PIXELS;

    let closeSideMargin = isLeft ? positionInfo.left : positionInfo.right;
    closeSideMargin = Math.min(closeSideMargin, tooltipInfo.width / 2);

    // Adjust the body margin to center in the element (minus the arrow margin).
    const applyOffset = margin => (margin ? margin : 0) + positionInfo.width / 2 - 15;

    if (isLeft) {
      if (positionInfo.left + MAX_WIDTH > screenWidth) {
        bodyStyle.marginLeft = -closeSideMargin + SIDE_MARGIN;
        bodyStyle.marginRight = SIDE_MARGIN;
      }
      bodyStyle.marginLeft = applyOffset(bodyStyle.marginLeft);
      bodyOuterStyle.left = positionInfo.left;
      arrowStyle.left = arrowPosition;
    } else {
      if (positionInfo.right + MAX_WIDTH > screenWidth) {
        bodyStyle.marginRight = -closeSideMargin + SIDE_MARGIN;
        bodyStyle.marginLeft = SIDE_MARGIN;
      }
      bodyStyle.marginRight = applyOffset(bodyStyle.marginRight);
      bodyOuterStyle.right = positionInfo.right;
      arrowStyle.right = arrowPosition;
    }

    const elementPosition = (isTop ? positionInfo.top : positionInfo.bottom) + positionInfo.height;
    const elementPositionWithMargin = elementPosition + 5;

    if (isTop) {
      bodyOuterStyle.top = elementPositionWithMargin;
    } else {
      bodyOuterStyle.bottom = elementPositionWithMargin;
      bodyOuterStyle.flexDirection = 'column-reverse';
    }

    setBodyOuterStyle(bodyOuterStyle);
    setBodyStyle(bodyStyle);
    setArrowStyle(arrowStyle);
    setArrowClass(isTop ? 'TooltipArrowTop' : 'TooltipArrowBottom');
  }, [_getElementLayoutInfo, overrideSide, tooltipBodyElementRef]);

  const _onResize = useCallback(() => {
    if (element) {
      _setLayoutState(element);
    }
  }, [_setLayoutState, element]);

  useEffect(() => {
    window.addEventListener('resize', _onResize);
    return () => {
      window.removeEventListener('resize', _onResize);
    }
  }, [_onResize]);

  const clear = useCallback(() => {
    const clear = (timeoutRef) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    }
    clear(animationFrameRef);
    clear(showDelayTimeoutRef);
    clear(hideTimeoutRef);
    clear(showDurationRef);

    if (animationFrameRef.current) {
      window.cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
  }, [animationFrameRef, showDelayTimeoutRef, hideTimeoutRef, showDurationRef]);

  const hide = useCallback(() => {
    clear();
    setShowing(false);
  }, [clear]);

  const _showOnDelay = useCallback((message, element, blocking, closable, durationMs, overrideSide) => {
    setShowing(true);
    setMessage(message);
    setElement(element);
    setBlocking(blocking);
    setCloseable(closable);
    setOverrideSide(overrideSide);

    if (durationMs) {
      showDurationRef.current = setTimeout(hide, durationMs);
    }

    animationFrameRef.current = window.requestAnimationFrame(() => {
      _setLayoutState(element);
    });

  }, [hide, showDurationRef, _setLayoutState, animationFrameRef]);

  /**
   * Shows a message as a tooltip notification.
   *
   * @param message The message to show.
   * @param element The react element which this tooltip should be aligned to.
   * @param blocking Whether user interaction should be blocked when the tooltip is showing.
   * @param durationMs How long should the tooltip last. If null, then until `show(null)` is called.
   * @param delayMs Amount of time to delay before showing tooltip
   * @param closable Is there a close button on the tooltip?
   * @param overrideSide A string like 'bottom' to force the tooltip to a certain side.
   */
  const show = useCallback((
    message,
    element,
    blocking = false,
    durationMs = null,
    delayMs = 0,
    closeable = true,
    overrideSide = null
  ) => {
    if (!message) {
      hide();
      return;
    }

    clear();

    showDelayTimeoutRef.current = setTimeout(() => _showOnDelay(
      message,
      element,
      blocking,
      closeable,
      durationMs,
      overrideSide
    ), delayMs);

  }, [clear, _showOnDelay, hide, showDelayTimeoutRef]);

  useEffect(() => {
    tooltipRelay._subscribe(show);
    return () => {
      tooltipRelay._clear();
    }
  }, [tooltipRelay, show]);

  const _onCloseClick = useCallback(() => {
    hide();
  }, [hide]);

  const blockingDisplay = useMemo(() => {
    return blocking ? 'block' : 'none';
  }, [blocking]);

  const closeElement = useMemo(() => {
    if (!closeable) {
      return null;
    }
    return (
      <div id='TooltipClose' onClick={_onCloseClick}>
        {'×'}
      </div>
    );
  }, [closeable, _onCloseClick]);

  const content = useMemo(() => {
    if (!showing) {
      return null;
    }

    return (
      <div id='TooltipOuter'>
        <div
          id='TooltipOverlay'
          style={{display: blockingDisplay}}
          onClick={e => e.stopPropagation()}
          onTouchStart={e => e.stopPropagation()}
        />
        <div id='TooltipBodyOuter' style={bodyOuterStyle}>
          <div id='TooltipArrowOuter'>
            <div
              id='TooltipArrow'
              className={arrowClass}
              style={arrowStyle}
            />
          </div>
          <div
            id='TooltipBody'
            style={bodyStyle}
            ref={tooltipBodyElementRef}
          >
            {closeElement}
            <div id='TooltipText'>{message}</div>
          </div>
        </div>
      </div>
    );
  }, [showing, message, blockingDisplay, bodyOuterStyle, bodyStyle, closeElement, arrowClass, arrowStyle]);

  return (
    <>
      {children}
      {content}
    </>
  );
}

export default withModule(Tooltip, TooltipModule);
