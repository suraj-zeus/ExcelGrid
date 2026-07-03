import { DEFAULT_COL_WIDTH, DEFAULT_ROW_HEIGHT, HEADER_H, ROWHDR_W } from "./constants.js";
import { DataStore } from "./Datastore.js";
import { DimensionManager } from "./DimensionManager.js";
import { GridRenderer } from "./GridRenderer.js";
import { Selection } from "./Selection.js";
import type { EditingCellType } from "./types.js";






export class Grid {

    private canvas: HTMLCanvasElement;
    private scrollBox: HTMLDivElement;
    private spacer: HTMLDivElement;
    private editorInput: HTMLInputElement;
    private totalRows: number;
    private totalCols: number;
    private scrollX: number;
    private scrollY: number;
    private isDragging: boolean;
    private editingCell : EditingCellType;

    private renderer: GridRenderer;
    private selection : Selection;

    private rowManager: DimensionManager;
    private colManager: DimensionManager;
    private dataStore : DataStore;





    constructor(canvas: HTMLCanvasElement, scrollBox: HTMLDivElement, spacer: HTMLDivElement, editorInput: HTMLInputElement, totalRows: number, totalCols: number) {
        this.canvas = canvas;
        this.scrollBox = scrollBox;
        this.spacer = spacer;
        this.editorInput = editorInput;

        this.rowManager = new DimensionManager(totalRows, DEFAULT_ROW_HEIGHT);
        this.colManager = new DimensionManager(totalCols, DEFAULT_COL_WIDTH);
        this.dataStore = new DataStore();
        this.selection = new Selection();
        this.renderer = new GridRenderer(canvas, this);

        this.scrollX = 0;
        this.scrollY = 0;
        this.isDragging = false;   // true while mouse is held down for range-select
        this.editingCell = {row : -1, col : -1};   // { row, col } when editing, else {-1, -1}

        this.totalRows = totalRows;
        this.totalCols = totalCols;


        this.setupSpacer();
        this.resizeCanvas();
        this.bindEvents();
        this.render();
    }


    public getRowManager(): DimensionManager {
        return this.rowManager;
    }

    public getColManager(): DimensionManager {
        return this.colManager;
    }

    public getScrollX(): number {
        return this.scrollX;
    }

    public getScrollY(): number {
        return this.scrollY;
    }

    public getSelection(): Selection {
        return this.selection;
    }

    public getDataStore() : DataStore {
      return this.dataStore;
    }

    






    public render() {
        this.renderer.render();
    }

    resizeCanvas() {
      this.canvas.width = this.scrollBox.clientWidth;
      this.canvas.height = this.scrollBox.clientHeight;
    }


      // makes the spacer div the full size of the grid
      setupSpacer() {
        this.spacer.style.width = (this.colManager.getTotalSize() + ROWHDR_W) + 'px';
        this.spacer.style.height = (this.rowManager.getTotalSize() + HEADER_H) + 'px';
      }


      // get row number at y
      private getRowAtY(y : number) : number{
        return this.rowManager.getIndexAtOffset(Math.max(0, y - HEADER_H + this.scrollY));
      }

      // get column number at x
      private getColAtX(x : number) {
        return this.colManager.getIndexAtOffset(Math.max(0, x - ROWHDR_W + this.scrollX));
      }

      private bindEvents() : void{

        // scrolling
        this.scrollBox.addEventListener('scroll', () => {
          this.scrollX = this.scrollBox.scrollLeft;
          this.scrollY = this.scrollBox.scrollTop;
          this.render();
        });

        // window resize
        window.addEventListener('resize', () => {
          this.resizeCanvas();
          this.render();
        });

        // mouse down -> start selection (cell, row, column, or range)
        this.canvas.addEventListener('mousedown', (e) => this.handleMouseDown(e));

        // mouse move -> extend range selection while dragging
        this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));

        // mouse up -> stop dragging
        window.addEventListener('mouseup', () => { this.isDragging = false; });

        // double click -> start editing the cell
        this.canvas.addEventListener('dblclick', (e) => this.handleDoubleClick(e));

        // editor box events
        this.editorInput.addEventListener('keydown', (e) => {
          if (e.key === 'Enter') this.finishEditing();
          if (e.key === 'Escape') this.cancelEditing();
        });
        this.editorInput.addEventListener('blur', () => this.finishEditing());
      }

      private handleMouseDown(e : MouseEvent) : void{
        // coordinates of click
        const x = e.offsetX, y = e.offsetY;

        // clicked on column header 
        // select all rows in that column
        if (y < HEADER_H && x > ROWHDR_W) {

          // TODO : if mouse event is around border points
        
          const col = this.getColAtX(x);
          this.selection.selectColumn(col, this.rowManager.getCount());
          this.render();
          return;
        }

        // clicked on row header -> select whole row
        if (x < ROWHDR_W && y > HEADER_H) {
          const row = this.getRowAtY(y);
          this.selection.selectRow(row, this.colManager.getCount());
          this.render();
          return;
        }

        // clicked on a normal cell -> start a range selection (single cell if no drag happens)
        if (x > ROWHDR_W && y > HEADER_H) {
          const row = this.getRowAtY(y);
          const col = this.getColAtX(x);
          this.selection.selectCell(row, col);
          this.isDragging = true;
          this.render();
        }
      }

      private handleMouseMove(e : MouseEvent) : void {
        if (!this.isDragging) return;

        // coordinates of moving mouse
        const x = e.offsetX, y = e.offsetY;

        if (x < ROWHDR_W || y < HEADER_H) return; // ignore header area while dragging

        const row = this.getRowAtY(y);
        const col = this.getColAtX(x);
        this.selection.extendTo(row, col);
        this.render();
      }

      private handleDoubleClick(e : MouseEvent) : void {
        // coordinates of double click
        const x = e.offsetX, y = e.offsetY;
        if (x < ROWHDR_W || y < HEADER_H) return;

        const row = this.getRowAtY(y);
        const col = this.getColAtX(x);
        this.startEditing(row, col);
      }

      private startEditing(row : number, col: number) : void {
        this.editingCell = { row, col };

        // position the input box exactly on top of the cell
        const tx = this.colManager.getOffset(col) - this.scrollX + ROWHDR_W;
        const ty = this.rowManager.getOffset(row) - this.scrollY + HEADER_H;
        const w = this.colManager.getSize(col);
        const h = this.rowManager.getSize(row);

        this.editorInput.style.left = tx + 'px';
        this.editorInput.style.top = ty + 'px';
        this.editorInput.style.width = w + 'px';
        this.editorInput.style.height = h + 'px';
        this.editorInput.style.display = 'block';

        this.editorInput.value = this.dataStore.getValue(row, col);

        this.editorInput.focus();
      }

      private finishEditing() : void {
        if (this.editingCell.col == -1 || this.editingCell.row == -1) return;

        const { row, col } = this.editingCell;

        this.dataStore.setValue(row, col, this.editorInput.value);

        this.editorInput.style.display = 'none';
        this.editingCell = {row : -1, col : -1};
        this.render();
      }

      private cancelEditing() : void  {
        this.editorInput.style.display = 'none';
        this.editingCell = {row : -1, col : -1};
      }
}
