import type { CellEditor } from "./CellEditor.js";
import type { DataStore } from "./Datastore.js";
import type { FormulaEngine } from "./FormulaEngine.js";
import type { Selection } from "./Selection.js";
import type { BoundType } from "./types.js";

export class StatusBarManager {
  private selection: Selection;
  private dataStore: DataStore;
  private formulaEngine: FormulaEngine;
  private cellEditor: CellEditor;

  // html elements for status bar
  private selectionRangeSpan: HTMLElement | null;
  private currentInputField: HTMLElement | null;
  private statCount: HTMLElement | null;
  private statSum: HTMLElement | null;
  private statAvg: HTMLElement | null;
  private statMin: HTMLElement | null;
  private statMax: HTMLElement | null;

  constructor(
    selection: Selection,
    dataStore: DataStore,
    formulaEngine: FormulaEngine,
    cellEditor: CellEditor
  ) {
    this.selection = selection;
    this.dataStore = dataStore;
    this.formulaEngine = formulaEngine;
    this.cellEditor = cellEditor;

    this.selectionRangeSpan = document.getElementById("selectionRangeSpan");
    this.currentInputField = document.getElementById("currentInputField");
    this.statCount = document.getElementById("statCount");
    this.statSum = document.getElementById("statSum");
    this.statAvg = document.getElementById("statAvg");
    this.statMin = document.getElementById("statMin");
    this.statMax = document.getElementById("statMax");
  }

  public updateStatusBar() {
    const bounds: BoundType = this.selection.getBounds();

    // update selection range
    this.updateSelectionRange(bounds);

    // current input field value
    this.updateCurrentInputField();

    // update statistics
    this.updateStatistics(bounds);
  }

  private updateSelectionRange(bounds: BoundType): void {
    if (!this.selectionRangeSpan) return;

    // convert bounds to cell references (ex : A1, B2)
    const startRef = this.formulaEngine.indexToCellRef(bounds.top, bounds.left);
    const endRef = this.formulaEngine.indexToCellRef(
      bounds.bottom,
      bounds.right,
    );

    this.selectionRangeSpan.textContent = `Current Selection Range  ${startRef} : ${endRef}`;
  }


  private updateCurrentInputField(): void {
    const editingCell = this.cellEditor.getEditingCell();

    if (!this.currentInputField) return;

    if (!editingCell) {
      this.currentInputField.textContent = "";
      return;
    }

    const { row, col } = editingCell;
    const cellRef = this.formulaEngine.indexToCellRef(row, col);

    this.currentInputField.textContent = `Input Field At : ${cellRef}`;
  }

  private updateStatistics(bounds: BoundType): void {
    let count = 0;
    let sum = 0;
    let min = Infinity;
    let max = -Infinity;
    let avg = 0;

    for (let r = bounds.top; r <= bounds.bottom; r++) {
      for (let c = bounds.left; c <= bounds.right; c++) {
        const rawValue = this.dataStore.getValue(r, c);
        const evalVal = this.formulaEngine.evaluate(rawValue);

        // Parse it as a number
        const num = typeof evalVal === "number" ? evalVal : parseFloat(evalVal);

        // ignore non-numeric values
        if (!isNaN(num)) {
          count++;
          sum += num;
          min = Math.min(min, num);
          max = Math.max(max, num);
        }
      }
    }

    avg = count > 0 ? sum / count : 0;

    if (this.statCount) this.statCount.textContent = `Count : ${count}`;
    if (this.statSum) this.statSum.textContent = `Sum : ${sum}`;
    if (this.statAvg) this.statAvg.textContent = `Average : ${avg}`;
    if (this.statMin)
      this.statMin.textContent = min === Infinity ? "" : `Min : ${min}`;
    if (this.statMax)
      this.statMax.textContent = max === -Infinity ? "" : `Max : ${max}`;
  }
}
