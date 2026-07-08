import { Command } from "./Command.js";
import type { DataStore } from "./Datastore.js";


export class EditCellTextCommand extends Command {

    private editorInput : HTMLInputElement;
    private dataStore : DataStore;
    private oldValue : string;
    private newValue : string;
    private row : number;
    private col : number;
    private render : () => void;

    constructor(
        editorInput : HTMLInputElement,
        dataStore : DataStore,
        oldValue : string,
        newValue : string,
        row : number,
        col : number,
        render : () => void
    ) {
        super();
        this.editorInput = editorInput;
        this.dataStore = dataStore;
        this.oldValue = oldValue;
        this.newValue = newValue;
        this.row = row;
        this.col = col;
        this.render = render;
    }

    public undo() : void {
        this.dataStore.setValue(this.row, this.col, this.oldValue);
        this.render();
    }

    public redo() : void {
        this.dataStore.setValue(this.row, this.col, this.newValue);
        this.render();
    }
}