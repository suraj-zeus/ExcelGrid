import type { EmployeeType } from "./types.js";
import employees from "../employees.json" with {type : 'json'};




export class DataStore {
    private values: Record<string, string>;

    constructor() {
        this.values = {};
        this.setInitialData();
    }

    public getValue(row: number, col: number) {
        return this.values[row + '_' + col] || '';
    }

    public setValue(row: number, col: number, value: string) {
        this.values[row + '_' + col] = value;
    }

    public setInitialData() : void {
        const employeesData : EmployeeType[] = this.getDefaultEmployeesData();

        if(employeesData.length == 0) return;

        const recordSize : number = employeesData.length;

        for(let row = 0; row < recordSize; row++) {
            let col : number = 0;
            const emp : Object = employeesData[row] as Object;

            for(const [_ , value] of Object.entries(emp)) {
                this.setValue(row, col, value);
                col += 1;
            }
        }

    }

    private getDefaultEmployeesData(): EmployeeType[] {

        return employees as EmployeeType[];
    }


}