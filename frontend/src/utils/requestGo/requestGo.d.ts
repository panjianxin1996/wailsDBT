import {operationTypes,dbOperationTypes} from './requestGoTypes'
namespace RequestGo {

    interface RequestGoData {
        operType: operationTypes;
        data: reqData;
        connDBId?: string;
    }

    interface reqData {
        /**
         * 连接数据库所需的参数
         */
        username?: string;
        password?: string;
        host?: string;
        port?: number;
        /**
         * 操作数据库所需参数
         */
        type?: dbOperationTypes;
        currentDB?: string;
        customSQL?: string;
        execSQL?: string;
    }
}

export {
    RequestGo,
    operationTypes,
    dbOperationTypes
}
