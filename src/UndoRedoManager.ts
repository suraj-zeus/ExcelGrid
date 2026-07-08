import type { Command } from "./Command.js";


export class UndoRedoManager {
    private undoStack : Command[];
    private redoStack : Command[];

    constructor() {
        this.undoStack = [];
        this.redoStack = [];
    }


    public pushCommand(newCommand : Command) : void {
        this.undoStack.push(newCommand);
        this.redoStack = [];  
    }

    public undo() : void {
        if(this.undoStack.length == 0) return;
        
        const command : Command = this.undoStack.pop() as Command;
        command.undo();
        this.redoStack.push(command);
    }

    public redo() : void {
        if(this.redoStack.length == 0) return;

        const command : Command = this.redoStack.pop() as Command;
        command.redo();
        this.undoStack.push(command);
    }
}