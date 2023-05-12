import { GoConnectDB, GoPingDB,GoOperateDB } from "../../../wailsjs/go/main/App"
import { RequestGo } from "./requestGo"
import {operationTypes,dbOperationTypes} from './requestGoTypes'

/**
 * 
 * @param reqDataList 请求的参数以数组的形式，包含操作信息以及操作内容
 * @returns Promise.all list
 * @example 
 * let reqData: RequestGo.RequestGoData[] = [
        {
            operType: operationTypes.DB_CONNECT,
            data: //...connectData
        }
    ]
    requestGoCommon(reqData).then(responseList => {
        // do something
    })
 */
const requestGoCommon = async function (reqDataList: RequestGo.RequestGoData[]) {
    let requestStack: any[] = []
    reqDataList.forEach(item=>{
        switch (item.operType) {
            /**
             * 连接数据库通过data里面的配置参数连接
             * @param data 连接的参数
             */
            case operationTypes.DB_CONNECT:
                requestStack.push(GoConnectDB(JSON.stringify({...item.data})))
                break
            /**
             * ping与数据库的连接状态 判断是否失活
             * @param connDBId 连接的句柄
             */
            case operationTypes.DB_PING:
                requestStack.push(item.connDBId && GoPingDB(item.connDBId))
                break
            /**
             * 操作数据库操作 尽可能的在执行该操作时通过ping方法判断连接是否失活
             * @param connDBId 连接句柄
             * @param data 操作数据库的命令参数
             */
            case operationTypes.DB_OPERATION:
                console.log(item.data)
                requestStack.push(item.connDBId && GoOperateDB(item.connDBId, JSON.stringify({...item.data})))
                break
        }
    
    })
    let backList = await Promise.all(requestStack)
    // console.log(backList)
    return backList.map(item=>{return JSON.parse(item)})
}

export default requestGoCommon
export {
    operationTypes,
    dbOperationTypes
}
export type { RequestGo }
