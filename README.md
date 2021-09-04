## react-root-overlays
Useful fullscreen react components such as Toast, FullscreenDialog, and Tooltip.

Wrap your website high up with `RootOverlays` component. It may look like:
```
        <RootOverlays>
          <BrowserRouter>

          </BrowserRouter>
        </RootOverlays>
```

This package uses `react-hoc-di` to pass relays through to all children.
The relays are: `toastRelay`, `dialogRelay`, and `tooltipRelay`.
They are accessed like `props.module.toastRelay`.

Call `show` on the relays to make the respective components appear.

Call `show(null)` on the relay to hide the respective component.

Each component has unique `show` parameters.

###Toast
```
  /**
   * @param message The message to show.
   * @param blocking Whether user interaction should be blocked when the toast is showing.
   * @param durationMs How long should the toast last. If null, then until `show(null)` is called.
   * @param delayMs Amount of time to delay before showing toast
   * @param isAtTop Should it show at the top?
   */
```

###Fullscreen Dialog
```
  /**
   * @param ele The react component to insert into the dialog. Can be null.
   * @param cancellable Whether it can be cancelled. Can be null.
   * @param className to apply to outer dialog. Can be null.
   */
```

###Tooltip
```
  /**
   * @param message The message to show.
   * @param element The react element which this tooltip should be aligned to.
   * @param blocking Whether user interaction should be blocked when the tooltip is showing.
   * @param durationMs How long should the tooltip last. If null, then until `show(null)` is called.
   * @param delayMs Amount of time to delay before showing tooltip
   * @param closable Is there a close button on the tooltip?
   * @param overrideSide A string like 'bottom' to force the tooltip to a certain side.
   */
```

### For Developer

Remember to npm run build before deploying.