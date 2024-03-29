export namespace monacoEditor {
    interface Props {
        width?: string,
        height?: string,
        language?: string,
        value?: string,
        hintData?: Hints,
        editorReadOnly?: boolean;
        onChange:(value:string)=>void
    }

    interface Hints {
        [name:string]: string[]
    }
    
}