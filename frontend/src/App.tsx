import { createContext, useContext, useReducer, useState } from 'react';
import { Greet } from "../wailsjs/go/main/App";
import router from './router';
import { useRoutes,useNavigate } from 'react-router-dom';
import { Button, ConfigProvider, FloatButton, Input } from 'antd';
import { ToolOutlined, LinkOutlined, HomeOutlined } from '@ant-design/icons';
import zhCN from 'antd/es/locale/zh_CN';
import AppContext,{AppCtx} from './AppContext';
// import {WindowMinimise} from "../wailsjs/runtime";

function App() {
    const navigate = useNavigate();
    const AppData = useContext(AppContext)
    const [state, dispatch] = useReducer(appReducer, AppData.state);
    // console.log(AppData)

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

    function jump(url: string | undefined, params?: any) {
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
            {/* <FloatButton icon={<HomeOutlined />} onClick={() => jump('/home')} />
            <FloatButton icon={<LinkOutlined />} onClick={() => jump('/dblist')} /> */}
        </FloatButton.Group>
        <AppContext.Provider value={{ state, dispatch }}>
            {useRoutes(router)}
        </AppContext.Provider>
        
    </ConfigProvider>
}

export default App
