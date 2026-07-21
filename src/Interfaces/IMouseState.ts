import type { MouseEventHandler } from "../MouseEventHandler.js";



export interface IMouseState {
    mouseDown(e : MouseEvent, mouseEventHandler : MouseEventHandler) : boolean;
    mouseUp(e : MouseEvent, mouseEventHandler : MouseEventHandler) : boolean ;
    mouseMove(e : MouseEvent, mouseEventHandler : MouseEventHandler) : boolean;
    DbClick(e : MouseEvent, mouseEventHandler : MouseEventHandler) : boolean ;
}