import type { Command } from "./Command.js";
import {
  EDITOR_BACKGROUND_COLOR_WHEN_ACTIVE,
  EDITOR_OPACITY,
  EDITOR_Z_INDEX,
  HEADER_H,
  ROWHDR_W,
} from "./constants.js";
import { EditCellTextCommand } from "./EditCellTextCommand.js";
import type { Grid } from "./Grid.js";
import type { EditingCellTypeOrNull } from "./types.js";

export class CellEditor {



  private editingCell: EditingCellTypeOrNull;

  constructor(
    private grid: Grid,
  ) {


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

    this.grid.getEditorInput().style.display = "block";
    this.updateEditorPosition();

    this.grid.getEditorInput().style.background = EDITOR_BACKGROUND_COLOR_WHEN_ACTIVE;
    this.grid.getEditorInput().style.zIndex = EDITOR_Z_INDEX.toString();

    const rawValue = this.grid.getDataStore().getValue(row, col);

    this.grid.getEditorInput().value = rawValue;
    this.grid.getEditorInput().focus();
    this.grid.render();
  }

  public finishEditing(): void {
    if (!this.editingCell) return;

    const { row, col } = this.editingCell;

    const oldCellValue = this.grid.getDataStore().getValue(row, col);
    const newCellValue = this.grid.getEditorInput().value;

    if (oldCellValue !== newCellValue) {
      const command: Command = new EditCellTextCommand(
        this.grid.getEditorInput(),
        this.grid.getDataStore(),
        oldCellValue,
        newCellValue,
        row,
        col,
        () => this.grid.render(),
      );
      this.grid.getUndoRedoManager().pushCommand(command);
      this.grid.getDataStore().setValue(row, col, this.grid.getEditorInput().value);
    }

    this.grid.getEditorInput().style.display = "none";
    this.editingCell = null;
    this.grid.render();
  }

  public cancelEditing(): void {
    this.grid.getEditorInput().style.display = "none";
    this.editingCell = null;
    this.grid.render();
  }

  public updateEditorPosition(): void {
    if (!this.editingCell) {
      this.grid.getEditorInput().style.display = "none";
      return
    };

    const { row, col } = this.editingCell;

    // absolute position withing grid scrolling container
    // position the input box exactly on top of the cell
    // position within the grid (exclude the scroll offset to get the position within the grid)
    // input field moves along with the cell when scrolling
    const tx = this.grid.getColManager().getOffset(col) + ROWHDR_W - this.grid.getScrollX();
    const ty = this.grid.getRowManager().getOffset(row) + HEADER_H - this.grid.getScrollY();

    const w = this.grid.getColManager().getSize(col);
    const h = this.grid.getRowManager().getSize(row);

    this.grid.getEditorInput().style.left = tx + "px";
    this.grid.getEditorInput().style.top = ty + "px";
    this.grid.getEditorInput().style.width = w + "px";
    this.grid.getEditorInput().style.height = h + "px";
    this.grid.getEditorInput().focus();

    // hide if it is in header area
    if (tx < ROWHDR_W || ty < HEADER_H) {
      this.grid.getEditorInput().style.opacity = "0";
      this.grid.getEditorInput().style.pointerEvents = "none";
    }
    else {
      this.grid.getEditorInput().style.opacity = EDITOR_OPACITY.toString();
      this.grid.getEditorInput().style.pointerEvents = "auto";
    }
  }
}
