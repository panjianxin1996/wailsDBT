export namespace AppCtx {
    interface AppData {
        dbList: dbListItem[]
    }

    interface dbListItem {
        listKey: string;
        connectId: string;
        connectToken?: string;
    }

    interface ActionData {
        type: string;
        newDBList: dbListItem[]
    }
}