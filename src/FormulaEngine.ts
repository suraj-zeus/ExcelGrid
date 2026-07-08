import type { DataStore } from "./Datastore.js";

export class FormulaEngine {
  private dataStore: DataStore;

  constructor(dataStore: DataStore) {
    this.dataStore = dataStore;
  }

  // ex : 0 -> A, 1 -> B, 25 -> Z
  public columnIndexToLetter(colIndex: number): string {
    let letters = "";
    let n = colIndex + 1;

    while (n > 0) {
      let rem = (n - 1) % 26;
      letters = String.fromCharCode(65 + rem) + letters;
      n = Math.floor((n - 1) / 26);
    }
    return letters;
  }

  // ex : A -> 0, B -> 1, Z -> 25
  public columnLetterToIndex(colLetter: string): number {
    let indRes = 0;
    for (let i = 0; i < colLetter.length; i++) {
      indRes *= 26;
      indRes += colLetter.charCodeAt(i) - 65 + 1;
    }

    return indRes - 1;
  }

  // ex : A1 -> { row: 0, col: 0 }, B2 -> { row: 1, col: 1 }
  public indexToCellRef(rowInd: number, colInd: number): string {
    const colLetter: string = this.columnIndexToLetter(colInd);
    const rowNumber: number = rowInd + 1;
    return colLetter + rowNumber.toString();
  }

  public getCellNumericValue(cellRef: string, visited: Set<string>): number | null {

    if (visited.has(cellRef)) {
      throw new Error("Circular Reference");
    }

    const match = cellRef.match(/^([A-Z]+)([1-9]\d*)$/);

    if (!match) return null;

    const colLetter = match[1];
    const colIndex = this.columnLetterToIndex(colLetter!);
    const rowIndex = parseInt(match[2]!, 10) - 1;

    // add current cellRef to visited
    visited.add(cellRef);

    const rawValue = this.dataStore.getValue(rowIndex, colIndex);
    const evaluatedValue = this.evaluate(rawValue, visited);

    // remove the current cellRef from visited
    visited.delete(cellRef);


    if (evaluatedValue === "#REF!") {
      throw new Error("Circular Reference");
    }
    if (evaluatedValue === "#ERR") {
      throw new Error("Formula Error");
    }


    const numValue =
      typeof evaluatedValue === "number"
        ? evaluatedValue
        : parseFloat(evaluatedValue);
    return isNaN(numValue) ? null : numValue;
  }

  public expandRange(rangeStr: string): string[] {
    let [start, end] = rangeStr.split(":");
    
    if (!start) return [];

    const startMatch = start.match(/^([A-Z]+)(\d+)$/);

    if(!end) {
      end = start;
    }

    const endMatch = end.match(/^([A-Z]+)(\d+)$/);
    
    if (!startMatch || !endMatch) return [];
    
    const startCol = this.columnLetterToIndex(startMatch[1]!);
    const endCol = this.columnLetterToIndex(endMatch[1]!);
    const startRow = parseInt(startMatch[2]!, 10) - 1;
    const endRow = parseInt(endMatch[2]!, 10) - 1;
    
    const refs = [];
    for (
      let r = Math.min(startRow, endRow);
      r <= Math.max(startRow, endRow);
      r++
    ) {
      for (
        let c = Math.min(startCol, endCol);
        c <= Math.max(startCol, endCol);
        c++
      ) {
        refs.push(this.indexToCellRef(r, c));
      }
    }
    return refs;
  }

  // ex : =A1+B2 -> 30, =A1*B2 -> 200, =A1-B2 -> -10, =A1/B2 -> 0.5
  public evaluate(
    value: string | null,
    visited: Set<string> = new Set(),
  ): number | string {
    if (typeof value !== "string" || !value.startsWith("=")) {
      return value ?? "";
    }

    let expression = value.slice(1).toUpperCase();

    try {
      // handle SUM(range) first, e.g. SUM(A1:A5)
      // whole gives -> SUM(A1:A5), rangeStr gives -> A1:A5
      expression = expression.replace(
        /SUM\(([A-Z0-9:]+)\)/g,
        (whole, rangeStr) => {
          const refs: string[] = this.expandRange(rangeStr);

          // ignore non-numeric values in the range
          const total = refs.reduce(
            (sum, ref) => sum + (this.getCellNumericValue(ref, visited) ?? 0),
            0,
          );

          return total.toString();
        },
      );

      // handle remaining cell references, e.g. A1, B2, etc while ignoring non-numeric values
      expression = expression.replace(/[A-Z]+\d+/g, (ref) =>
        (this.getCellNumericValue(ref, visited) ?? 0).toString(),
      );
    } catch (e) {
      if (e instanceof Error && e.message === "Circular Reference") {
        return "#REF!";
      }
      return "#ERR";
    }

    // safety check: only numbers/operators/parentheses are allowed before we evaluate the expression
    if (!/^[0-9+\-*/().\s]+$/.test(expression)) {
      return "#ERR";
    }

    try {
      const result = Function('"use strict"; return (' + expression + ")")();
      return isNaN(result) ? "#ERR" : result.toString();
    } catch (e) {
      return "#ERR";
    }
  }
}
