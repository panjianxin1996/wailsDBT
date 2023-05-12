export namespace DBHome {
    interface GoMysqlTables {
        [name:string]: string
    }
    interface GoMysqlDataBase {
        Database: string
    }
    interface DatabaseMenu {
        key: string,
        icon?: any,
        label: string,
        children?: DatabaseMenu[]
    }
    interface DataBaseList {
        databases?: Array<GoMysqlDataBase>,
        onSelectEvent?: (index: number) => void
    }
}