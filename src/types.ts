


export type BoundType = {top : number, bottom : number, left : number, right : number};
export type EditingCellType =  { row : number, col : number };

export type EditingCellTypeOrNull = EditingCellType | null;



export type EmployeeType = {
    id : number, 
    firstName : string,
    lastName : string,
    age : number,
    salary : number
};

export type CellType = "row" | "col";