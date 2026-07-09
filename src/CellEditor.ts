import type { Command } from "./Command.js";
import {
  EDITOR_BACKGROUND_COLOR_WHEN_ACTIVE,
  EDITOR_OPACITY,
  EDITOR_Z_INDEX,
  HEADER_H,
  ROWHDR_W,
} from "./constants.js";
import type { DataStore } from "./Datastore.js";
import type { DimensionManager } from "./DimensionManager.js";
import { EditCellTextCommand } from "./EditCellTextCommand.js";
import type { EditingCellTypeOrNull } from "./types.js";
import type { UndoRedoManager } from "./UndoRedoManager.js";

export class CellEditor {
  private editorInput: HTMLInputElement;
  private dataStore: DataStore;
  private rowManager: DimensionManager;
  private colManager: DimensionManager;
  private undoRedoManager: UndoRedoManager;
  private getScrollX: () => number;
  private getScrollY: () => number;
  private render: () => void;

  private editingCell: EditingCellTypeOrNull;

  constructor(
    editorInput: HTMLInputElement,
    dataStore: DataStore,
    rowManager: DimensionManager,
    colManager: DimensionManager,
    undoRedoManager: UndoRedoManager,
    getScrollX: () => number,
    getScrollY: () => number,
    render: () => void,
  ) {
    this.editorInput = editorInput;
    this.dataStore = dataStore;
    this.rowManager = rowManager;
    this.colManager = colManager;
    this.undoRedoManager = undoRedoManager;
    this.getScrollX = getScrollX;
    this.getScrollY = getScrollY;
    this.render = render;

    this.editingCell = null;
  }

  public getEditingCell(): EditingCellTypeOrNull {
    return this.editingCell;
  }

  public setEditingCell(editingCell: EditingCellTypeOrNull): void {
    this.editingCell = editingCell;
  }

  public isEditing(): boolean {
    return this.editingCell !== null;
  }

  public startEditing(row: number, col: number): void {
    this.editingCell = { row, col };

    this.editorInput.style.display = "block";
    this.updateEditorPosition();

    this.editorInput.style.background = EDITOR_BACKGROUND_COLOR_WHEN_ACTIVE;
    this.editorInput.style.zIndex = EDITOR_Z_INDEX.toString();

    const rawValue = this.dataStore.getValue(row, col);

    this.editorInput.value = rawValue;
    this.editorInput.focus();
    this.render();
  }

  public finishEditing(): void {
    if (!this.editingCell) return;

    const { row, col } = this.editingCell;

    const oldCellValue = this.dataStore.getValue(row, col);
    const newCellValue = this.editorInput.value;

    if (oldCellValue !== newCellValue) {
      const command: Command = new EditCellTextCommand(
        this.editorInput,
        this.dataStore,
        oldCellValue,
        newCellValue,
        row,
        col,
        () => this.render(),
      );
      this.undoRedoManager.pushCommand(command);
      this.dataStore.setValue(row, col, this.editorInput.value);
    }

    this.editorInput.style.display = "none";
    this.editingCell = null;
    this.render();
  }

  public cancelEditing(): void {
    this.editorInput.style.display = "none";
    this.editingCell = null;
    this.render();
  }

  public updateEditorPosition(): void {
    if (!this.editingCell) {
      this.editorInput.style.display = "none";
      return
    };

    const { row, col } = this.editingCell;

    // absolute position withing grid scrolling container
    // position the input box exactly on top of the cell
    // position within the grid (exclude the scroll offset to get the position within the grid)
    // input field moves along with the cell when scrolling
    const tx = this.colManager.getOffset(col) + ROWHDR_W - this.getScrollX();
    const ty = this.rowManager.getOffset(row) + HEADER_H - this.getScrollY();

    const w = this.colManager.getSize(col);
    const h = this.rowManager.getSize(row);

    this.editorInput.style.left = tx + "px";  
    this.editorInput.style.top = ty + "px";
    this.editorInput.style.width = w + "px";
    this.editorInput.style.height = h + "px";
    this.editorInput.focus();

    // hide if it is in header area
    if(tx < ROWHDR_W || ty < HEADER_H) {
      this.editorInput.style.opacity = "0";
      this.editorInput.style.pointerEvents = "none";
    }
    else {
      this.editorInput.style.opacity = EDITOR_OPACITY.toString();
      this.editorInput.style.pointerEvents = "auto";
    }
  }
}
