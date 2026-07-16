import { HEADER_H, ROWHDR_W } from "./constants.js";
import type { Grid } from "./Grid.js";
import type { IMouseState } from "./Interfaces/IMouseState.js";
import { CellSelectionMouseState } from "./MouseStates/CellSelectionMouseState.js";



export class MouseEventHandler {


    // is mouse being dragged after selecting a cell (header or body cell)
    private isDragging: boolean;
    private currentMouseState : IMouseState;

    constructor(public grid: Grid) {
        this.isDragging = false;

        this.currentMouseState = new CellSelectionMouseState(this.grid);
    }


    public changeState(newState : IMouseState) {
        this.currentMouseState = newState;
    }


    public setIsDragging(isDragging : boolean) {
        this.isDragging = isDragging;
    }

    public getIsDragging() : boolean {
        return this.isDragging;
    }



    // get row number at y
    public getRowAtY(y: number): number {
        return this.grid.getRowManager().getIndexAtOffset(
            Math.max(0, y - HEADER_H + this.grid.getScrollY()),
        );
    }

    // get column number at x
    public getColAtX(x: number) {
        return this.grid.getColManager().getIndexAtOffset(
            Math.max(0, x - ROWHDR_W + this.grid.getScrollX()),
        );
    }


    public handleMouseDown(e: MouseEvent): void {
        // coordinates of click
        const x = e.offsetX, y = e.offsetY;

        if (this.grid.getResizeManager().handleMouseDown(x, y)) {
            return;
        };

        // clicked on column header
        // select all rows in that column
        if (y < HEADER_H && x > ROWHDR_W) {
            const col = this.getColAtX(x);
            this.grid.getSelection().selectColumn(col, this.grid.getRowManager().getCount());
            this.grid.render();
            return;
        }

        // clicked on row header -> select whole row
        if (x < ROWHDR_W && y > HEADER_H) {
            const row = this.getRowAtY(y);
            this.grid.getSelection().selectRow(row, this.grid.getColManager().getCount());
            this.grid.render();
            return;
        }

        // clicked on a normal cell -> start a range selection (single cell if no drag happens)
        if (x > ROWHDR_W && y > HEADER_H) {
            const row = this.getRowAtY(y);
            const col = this.getColAtX(x);
            this.grid.getSelection().selectCell(row, col);
            this.isDragging = true;
            this.grid.render();
        }
    }

    public handleMouseMove(e: MouseEvent): void {
        // coordinates of moving mouse
        const x = e.offsetX,
            y = e.offsetY;

        if (this.grid.getResizeManager().handleMouseMove(x, y)) {
            return;
        }

        // change the cursor type
        if (!this.isDragging) {
            if (this.grid.getResizeManager().getColumnBorderIndexAt(x, y) !== null) {
                this.grid.getCanvas().style.cursor = "col-resize";
            } else if (this.grid.getResizeManager().getRowBorderIndexAt(x, y) !== null) {
                this.grid.getCanvas().style.cursor = "row-resize";
            } else {
                this.grid.getCanvas().style.cursor = "default";
            }
        }

        // if mouse is not being dragged, then no need to extend the selection range
        // also ignore the header area selection while dragging
        if (!this.isDragging || x < ROWHDR_W || y < HEADER_H) return;

        // otherwise, extend the selection range
        const row = this.getRowAtY(y);
        const col = this.getColAtX(x);
        this.grid.getSelection().extendTo(row, col);
        this.grid.render();
    }

    public handleMouseUp(e: MouseEvent): void {
        // make dragging false
        this.isDragging = false;

        this.grid.getResizeManager().handleMouseUp();
    }

    public handleDoubleClick(e: MouseEvent): void {
        // coordinates of double click
        const x = e.offsetX, y = e.offsetY;
        if (x < ROWHDR_W || y < HEADER_H) return;

        const row = this.getRowAtY(y);
        const col = this.getColAtX(x);

        this.grid.getCellEditor().startEditing(row, col);
        this.grid.render();
    }



    public bindEvents(): void {
        // // mouse down -> start selection (cell, row, column, or range)
        // this.grid.getCanvas().addEventListener("pointerdown", (e) => this.handleMouseDown(e));

        // // mouse move -> extend range selection while dragging
        // this.grid.getCanvas().addEventListener("pointermove", (e) => this.handleMouseMove(e));

        // // mouse up -> stop dragging
        // window.addEventListener("pointerup", (e) => this.handleMouseUp(e));

        // // double click -> start editing the cell
        // this.grid.getCanvas().addEventListener("dblclick", (e) => this.handleDoubleClick(e));






         // mouse down -> start selection (cell, row, column, or range)
        this.grid.getCanvas().addEventListener("pointerdown", (e) => this.currentMouseState.mouseDown(e, this));

        // mouse move -> extend range selection while dragging
        this.grid.getCanvas().addEventListener("pointermove", (e) => this.currentMouseState.mouseMove(e, this));

        // mouse up -> stop dragging
        window.addEventListener("pointerup", (e) => this.currentMouseState.mouseUp(e, this));

        // double click -> start editing the cell
        this.grid.getCanvas().addEventListener("dblclick", (e) => this.currentMouseState.DbClick(e, this));



        

        // undo/ redo handlers
        this.grid.getUndoButton().addEventListener("click", () => {
            this.grid.getUndoRedoManager().undo();
        });

        this.grid.getRedoButton().addEventListener("click", () => {
            this.grid.getUndoRedoManager().redo();
        });
    }



}