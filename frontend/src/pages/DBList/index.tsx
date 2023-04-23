import { Card, Input, Layout, Menu, MenuProps, Modal, Image, Row, Col, Form, Checkbox, Button, InputNumber, Select, Space, Spin } from "antd"
import { ProjectTwoTone, SearchOutlined, EditOutlined } from '@ant-design/icons';
import React, { useEffect, useState } from "react"
import './index.scss'
import { DBListCard, DBListRegisterModal,DBListCardProps } from '../../components/DBList'
import { useNavigate } from "react-router-dom";
// import { navigate } from "../../utils/index";

import { GoConnectDB, GoPingDB } from "../../../wailsjs/go/main/App";

const { Header, Content, Footer, Sider } = Layout;



const ConnectDB: React.FC = () => {
    let storageData = localStorage.getItem('my_db_list')
    let storageDBList = !storageData ? [] : JSON.parse(storageData)

    const navigate = useNavigate();
    const [modalWindow, setModalWindow] = useState<boolean>(false);
    const [dbList, setDBList] = useState<DBListCardProps[]>(storageDBList);
    const [spinning,setSpinning] = useState<boolean>(false)
    const [spinningTips,setSpinningTips] = useState<string>('')

    const [connDB, setConnDB] = useState('')



    function renderBlankCard(currentCount: number) { // 计算出一行四个空余多少自动补全，以防弹性布局最后一排样式问题
        let count = currentCount % 4 != 0 ? parseInt((currentCount / 4 + 1).toString()) * 4 - currentCount : 0
        let backEles = new Array(count).fill([]).map((item, i) => {
            return <DBListCard type={3} key={'blank_' + i} />
        })
        return backEles
    }

    async function addDataBase(dbConifg: DBListCardProps) { // 新增数据库
        // { dbname, dbcontent, username,password,host,port, type: 0 }
        let changeDBList = [{ ...dbConifg }, ...dbList]
        console.log(changeDBList)
        setDBList(changeDBList)
        localStorage.setItem('my_db_list', JSON.stringify(changeDBList))
    }

    function delDataBase(delIndex: number) { // 删除数据库
        let changeDBList = dbList.filter((item, i) => { return i != delIndex })
        setDBList(changeDBList)
        localStorage.setItem('my_db_list', JSON.stringify(changeDBList))
    }

    useEffect(() => {
        // console.log(dbList)
    }, [dbList])



    return (<Spin tip={spinningTips} spinning={spinning}>
        <Layout>
            <div className="db_list_header flex_row flex_just_between flex_align_center">
                <div className="header_left_box flex_row flex_align_center">

                    <p className="logo_box">
                        <ProjectTwoTone />
                        <span className="logo_txt">DBMT</span>
                    </p>
                    <div className="header_input_box">
                        <Input
                            prefix={<SearchOutlined style={{ color: '#95a8b2', fontSize: '16px' }} />}
                            suffix={<EditOutlined style={{ color: '#95a8b2', fontSize: '16px' }} />}
                            className="header_input"
                            bordered={false}
                            placeholder="搜索连接的数据库"></Input>
                    </div>

                </div>
                <div className="header_right_box">
                    <p>user</p>
                    <Button onClick={() => { console.log(connDB); GoPingDB(connDB).then((res: boolean) => { console.log(res) }) }}>ping数据库</Button>
                </div>

            </div>
            <Content className='content_box'>
                <DBListRegisterModal
                    modalWindowFlag={modalWindow}
                    onOpenWindow={(flag: boolean) => { setModalWindow(flag) }}
                    onAddDataBase={(dbConifg: DBListCardProps) => { addDataBase(dbConifg) }} />
                <div className="content_header flex_row flex_align_center">
                    <h1>数据库列表</h1>
                </div>
                <div className="content_main flex_row flex_align_center">
                    {
                        dbList.map((item, index) => {
                            return <DBListCard
                                key={"dblistcard_" + index}
                                cardConfig={item}
                                // dbcontent={item.dbcontent}
                                // username={item.username}
                                type={item.type}
                                onClick={() => { navigate('/') }}
                                onDelClick={() => { delDataBase(index) }}
                                onConnClick={() => {
                                    setSpinning(true)
                                    setSpinningTips('正在连接中。。。')
                                    GoConnectDB(JSON.stringify(item)).then((connId: string) => {
                                        setConnDB(connId)
                                        // console.log(connId)
                                        // setSpinning(false)
                                        GoPingDB(connId).then((connFlag:boolean)=>{
                                            // console.log(connFlag)
                                            if (connFlag) {
                                                // setSpinningTips('连接成功！')
                                                setTimeout(()=>{
                                                    navigate('/home',{state: {connId,...item}})
                                                    setSpinning(false)
                                                },1500)
                                            }
                                        })
                                        
                                    })
                                }}
                            />
                        })
                    }
                    {/* 新增数据库 */}
                    <DBListCard
                        type={1}
                        onClick={() => { setModalWindow(true) }}
                    />
                    {
                        // 渲染空白区域
                        renderBlankCard(dbList.length + 1)
                    }
                </div>
            </Content>
        </Layout></Spin>)
}

export default ConnectDB