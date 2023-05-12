enum operationTypes {
    DB_PING = 0,
    DB_CONNECT,
    DB_OPERATION
}
enum dbOperationTypes {
    GET_ALL_DATABASES = 0,
    GET_CURRENT_TABLES,
    GET_CURRENT_BASE_TABLES,
    GET_CURRENT_VIEWS,
    CUSTOM_SQL,
    EXEC_SQL
}

export {
    operationTypes,
    dbOperationTypes
}