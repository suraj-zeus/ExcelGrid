import { CellEditor } from "./CellEditor.js";
import {
  DEFAULT_COL_WIDTH,
  DEFAULT_ROW_HEIGHT,
  HEADER_H,
  ROWHDR_W,
} from "./constants.js";
import { DataStore } from "./Datastore.js";
import { DimensionManager } from "./DimensionManager.js";
import { EventManager } from "./EventManager.js";
import { FormulaEngine } from "./FormulaEngine.js";
import { GridRenderer } from "./GridRenderer.js";
import { KeyboardEventHandler } from "./KeyboardEventHandler.js";
import { MouseEventHandler } from "./MouseEventHandler.js";
import { ResizeManager } from "./ResizeManager.js";
import { Selection } from "./Selection.js";
import { StatusBarManager } from "./StatusBarManager.js";
import { UndoRedoManager } from "./UndoRedoManager.js";
import { WindowEventHandler } from "./WindowEventHandler.js";

export class Grid {
  // HTML elements used to render the grid
  private canvas: HTMLCanvasElement;
  private scrollBox: HTMLDivElement;
  private spacer: HTMLDivElement;

  // HTML input element used for editing cell values
  private editorInput: HTMLInputElement;

  // total no. of rows and columns in the grid
  private totalRows: number;
  private totalCols: number;

  // current scroll position of the grid
  private scrollX: number;
  private scrollY: number;

  // grid renderer
  private renderer: GridRenderer;

  // selection manager (manages selected cell, row, column, or range)
  private selection: Selection;

  // dimension managers for rows and columns (manages size and offset of each row/column)
  private rowManager: DimensionManager;
  private colManager: DimensionManager;

  // data store (manages the data in the grid)
  private dataStore: DataStore;

  // for undo/redo
  private undoRedoManager: UndoRedoManager;

  // formula engine
  private formulaEngine: FormulaEngine;

  // event manager (handles mouse and keyboard events)
  private eventManager: EventManager;

  // resize manager (handles resizing of rows and columns)
  private resizeManager: ResizeManager;

  // cell editor (handles editing of cell values)
  private cellEditor: CellEditor;

  // status bar manager (handles updating the status bar)
  private statusBarManager: StatusBarManager;

  private undoBtn: HTMLButtonElement;
  private redoBtn: HTMLButtonElement;


  constructor(
    canvas: HTMLCanvasElement,
    scrollBox: HTMLDivElement,
    spacer: HTMLDivElement,
    editorInput: HTMLInputElement,
    totalRows: number,
    totalCols: number,
    undoBtn: HTMLButtonElement,
    redoBtn: HTMLButtonElement,
  ) {
    this.canvas = canvas;
    this.scrollBox = scrollBox;
    this.spacer = spacer;
    this.editorInput = editorInput;

    this.totalRows = totalRows;
    this.totalCols = totalCols;

    this.scrollX = 0;
    this.scrollY = 0;

    this.undoBtn = undoBtn;
    this.redoBtn = redoBtn;

    // instance of core managers and engines
    this.rowManager = new DimensionManager(this.totalRows, DEFAULT_ROW_HEIGHT);
    this.colManager = new DimensionManager(this.totalCols, DEFAULT_COL_WIDTH);
    this.dataStore = new DataStore();
    this.selection = new Selection();
    this.undoRedoManager = new UndoRedoManager();
    this.formulaEngine = new FormulaEngine(this.dataStore);

    // renderer for the grid
    this.renderer = new GridRenderer(canvas, this);

    this.cellEditor = new CellEditor(
      this
    );

    this.resizeManager = new ResizeManager(
      this
    );


    this.eventManager = new EventManager(
      this,
      new MouseEventHandler(this),
      new KeyboardEventHandler(this),
      new WindowEventHandler(this),
    );

    this.statusBarManager = new StatusBarManager(
      this
    );


    this.setupSpacer();
    this.resizeCanvas();
    this.eventManager.bindEvents();
    this.render();
  }

  // getters and setters for private members
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

  public getFormulaEngine(): FormulaEngine {
    return this.formulaEngine;
  }

  public getDataStore(): DataStore {
    return this.dataStore;
  }

  public getFormulaEnginer() : FormulaEngine {
    return this.formulaEngine;
  }

  public getEditorInput(): HTMLInputElement {
    return this.editorInput;
  }

  public getUndoRedoManager(): UndoRedoManager {
    return this.undoRedoManager;
  }

  public setScroll(x: number, y: number): void {

    this.scrollX = x;
    this.scrollY = y;

  }

  public getScrollBox(): HTMLDivElement {
    return this.scrollBox;
  }

  public getResizeManager(): ResizeManager {
    return this.resizeManager;
  }

  public getCellEditor(): CellEditor {
    return this.cellEditor;
  }

  public getUndoButton(): HTMLButtonElement {
    return this.undoBtn;
  }

  public getRedoButton(): HTMLButtonElement {
    return this.redoBtn;
  }


  public getCanvas(): HTMLCanvasElement {
    return this.canvas;
  }

  // core methods for grid
  public render() {
    this.renderer.render();
    this.statusBarManager.updateStatusBar();
    this.cellEditor.updateEditorPosition();
  }

  public resizeCanvas() {
    this.canvas.width = this.scrollBox.clientWidth;
    this.canvas.height = this.scrollBox.clientHeight;
  }

  // makes the spacer div the full size of the grid
  public setupSpacer() {
    this.spacer.style.width = this.colManager.getTotalSize() + ROWHDR_W + "px";
    this.spacer.style.height = this.rowManager.getTotalSize() + HEADER_H + "px";
  }
}
