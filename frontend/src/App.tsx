import { createContext, useContext, useReducer, useState } from 'react';
import { Greet } from "../wailsjs/go/main/App";
import router from './router';
import { useRoutes,useNavigate } from 'react-router-dom';
import { Button, ConfigProvider, FloatButton, Input } from 'antd';
import { ToolOutlined, LinkOutlined, HomeOutlined } from '@ant-design/icons';
import zhCN from 'antd/es/locale/zh_CN';
import AppContext,{AppCtx} from './AppContext'; // 引入react context
// import {WindowMinimise} from "../wailsjs/runtime";

function App() {
    const navigate = useNavigate();
    const AppData = useContext(AppContext); // 使用react context
    const [state, dispatch] = useReducer(appReducer, AppData.state); // 将useContext与useReducer进行绑定使用
    // console.log(AppData)

    /**
     * 对context进行数据处理，暴露出dispatch方法给其下任意组件使用
     * @param preState 原数据
     * @param action 操作
     * @returns AppCtx.AppData
     */
    function appReducer (preState:AppCtx.AppData,action:AppCtx.ActionData):AppCtx.AppData {
        switch (action.type) {
            case 'updateAppData':
                return {
                    ...preState,
                    dbList: action.newDBList
                }
            default:
                return preState
        }
    }

    /**
     * 跳转至其他页面，并设置参数
     * @param url 跳转页面地址，详情router/index.tsx
     * @param params 路由传参
     * @returns void
     */
    function jump(url: string | undefined, params?: any):void {
        if (!url) return
        navigate(url, {state: {...params}})
    }

    return <ConfigProvider
        theme={{
            token: {
                colorPrimary: '#1890ff',
            },
        }}
        locale={zhCN} // 设置全局为中文
    >
        {/* 调试环境，路由跳转 */}
        <FloatButton.Group
            trigger="click"
            type="primary"
            style={{ right: 20 }}
            icon={<ToolOutlined />}
        >
            {
                router.map((item,index)=>{
                    return <FloatButton key={item.path} icon={<HomeOutlined />} onClick={() => jump(item.path)} />
                })
            }
        </FloatButton.Group>
        {/* context Provider绑定数据和操作方法 */}
        <AppContext.Provider value={{ state, dispatch }}>
            {useRoutes(router)}
        </AppContext.Provider>
        
    </ConfigProvider>
}

export default App
