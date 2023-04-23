enum operationTypes {
    DB_PING = 0,
    DB_OPERATION
}
enum dbOperationTypes {
    GET_ALL_DATABASES = 0,
    GET_CURRENT_TABLES,
    CUSTOM_SQL,
    EXEC_SQL
}

export {
    operationTypes,
    dbOperationTypes
}