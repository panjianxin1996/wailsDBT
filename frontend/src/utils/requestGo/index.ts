import { GoConnectDB, GoPingDB,GoOperateDB } from "../../../wailsjs/go/main/App"
import { RequestGo } from "./requestGo"
import {operationTypes,dbOperationTypes} from './requestGoTypes'

const requestGoCommon = async function (reqDataList: RequestGo.RequestGoData[]) {
    let requestStack: any[] = []
    reqDataList.forEach(item=>{
        switch (item.operType) {
            case operationTypes.DB_PING:
                requestStack.push(item.connDBId && GoPingDB(item.connDBId))
            case operationTypes.DB_OPERATION:
                requestStack.push(item.connDBId && GoOperateDB(item.connDBId, JSON.stringify({...item.data})))
        }
    
    })
    let backList = await Promise.all(requestStack)

    return backList.map(item=>{return JSON.parse(item)})
}

export default requestGoCommon
export {
    operationTypes,
    dbOperationTypes
}
export type { RequestGo }
