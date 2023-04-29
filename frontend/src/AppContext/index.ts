import React, { createContext } from "react"
import type {AppCtx} from './AppContext'

const AppData:AppCtx.AppData = {
    dbList: []
}
const AppContext = createContext<{state: AppCtx.AppData,dispatch: React.Dispatch<AppCtx.ActionData>}>({state: AppData,dispatch: ()=>{}});

export default AppContext;

export type {
    AppCtx
}