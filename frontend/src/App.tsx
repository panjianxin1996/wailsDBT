import { useState } from 'react';
import { Greet } from "../wailsjs/go/main/App";
import router from './router';
import { useRoutes,useNavigate } from 'react-router-dom';
import { Button, ConfigProvider, FloatButton, Input } from 'antd';
import { ToolOutlined, LinkOutlined, HomeOutlined } from '@ant-design/icons';
import zhCN from 'antd/es/locale/zh_CN'
// import {WindowMinimise} from "../wailsjs/runtime";

function App() {
    const [resultText, setResultText] = useState("Please enter your name below 👇");
    const [name, setName] = useState('');
    const navigate = useNavigate();
    const updateName = (e: any) => setName(e.target.value);
    const updateResultText = (result: string) => setResultText(result);

    function greet() {
        Greet(name).then(updateResultText);
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
        locale={zhCN}
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
        {useRoutes(router)}
    </ConfigProvider>
}

export default App
