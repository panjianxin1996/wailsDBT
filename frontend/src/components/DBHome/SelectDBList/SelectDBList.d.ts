interface GoMysqlDataBase {
    Database: string
}

interface DataBaseList {
    databases?: Array<GoMysqlDataBase>,
    onSelectEvent? :(index:number)=>void
}

export {
    GoMysqlDataBase,
    DataBaseList
}