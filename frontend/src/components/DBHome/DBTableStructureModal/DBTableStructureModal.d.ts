import type { DBTable } from "../DBTable"
export namespace DBTabStructure {
    interface Props {
        showModalFlag: boolean;
        structureData: any;
        connDBId: string;
        structureInfo: DBTable.ActiveTableData;
    }
    interface DBTabStructureRef {
        ToggleModalEvent:()=>void
    }
}