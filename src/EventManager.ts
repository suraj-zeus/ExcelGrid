
import type { Grid } from "./Grid.js";
import type { KeyboardEventHandler } from "./KeyboardEventHandler.js";
import type { MouseEventHandler } from "./MouseEventHandler.js";

import type { WindowEventHandler } from "./WindowEventHandler.js";

export class EventManager {

  constructor(
    private grid: Grid,
    private mouseEventHandler: MouseEventHandler,
    private keyboardEventHandler: KeyboardEventHandler,
    private windowEventHandler: WindowEventHandler,
  ) {

  }



  public bindEvents(): void {
    this.mouseEventHandler.bindEvents();
    this.keyboardEventHandler.bindEvents();
    this.windowEventHandler.bindEvents();
  }







}
