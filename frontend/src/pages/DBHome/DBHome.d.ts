declare interface GoMysqlTables {
    [name:string]: string
}
declare interface GoMysqlDataBase {
    Database: string
}
declare interface DatabaseMenu {
    key: string,
    icon?: any,
    label: string,
    children?: DatabaseMenu[]
}
declare interface DataBaseList {
    databases?: Array<GoMysqlDataBase>,
    onSelectEvent?: (index: number) => void
}

export {
    GoMysqlTables,
    GoMysqlDataBase,
    DatabaseMenu,
    DataBaseList

}