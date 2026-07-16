import type { MouseEventHandler } from "../MouseEventHandler.js";



export interface IMouseState {
    mouseDown(e : MouseEvent, mouseEventHandler : MouseEventHandler) : void;
    mouseUp(e : MouseEvent, mouseEventHandler : MouseEventHandler) : void ;
    mouseMove(e : MouseEvent, mouseEventHandler : MouseEventHandler) : void;
    DbClick(e : MouseEvent, mouseEventHandler : MouseEventHandler) : void ;
}