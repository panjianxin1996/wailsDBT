import React, { useEffect, useState, useReducer, useRef } from 'react'
import {
    LaptopOutlined,
    NotificationOutlined,
    UserOutlined,
    RetweetOutlined,
    TableOutlined,
    InsertRowBelowOutlined,
    FunctionOutlined,
    FieldTimeOutlined,
    SearchOutlined
} from '@ant-design/icons'
import { Layout, Menu, theme, Card, MenuProps, Space, Popover, Button, Input, Row, Col, Avatar } from 'antd'
import {
    GoMysqlTables,
    GoMysqlDataBase,
    DatabaseMenu,
    DataBaseList
} from './Home'
import { SelectDBList, ShowDBTable } from "../../components/Home/index"
import SQLMonacoEditor, { monacoEditor } from "../../components/Monaco/index"
import { useLocation } from 'react-router-dom'
import { GoOperateDB } from "../../../wailsjs/go/main/App"


import "./index.scss"

const { Header, Content, Footer, Sider } = Layout;

function Home() {
    /**
     *  设置默认主题
     */
    const {
        token: { colorBgContainer },
    } = theme.useToken();
    /**
     * 获取路由传输参数
     */
    const location: any = useLocation()
    // console.log(location.state)
    const { connId, createDate, dbName, dbType, host, password, port, type, username } = location.state
    //  数据库列表
    const [databases, setDatabases] = useState<GoMysqlDataBase[]>()
    // 当前数据库索引
    const [activeDBIndex, setActiveDBIndex] = useState<number>(-1)
    // 选中当前表
    const [activeDBtable, setActiveDBtable] = useState<string>("")
    // 打开选择框
    const [openPopover, setOpenPopover] = useState<boolean>(false)
    // 数据库菜单栏
    const [databaseMenu, setDatabaseMenu] = useState<DatabaseMenu[]>([
        { key: 'menu_0', label: '表', icon: <TableOutlined />, children: [] },
        { key: 'menu_1', label: '视图', icon: <InsertRowBelowOutlined />, children: [] },
        { key: 'menu_2', label: '函数', icon: <FunctionOutlined />, children: [] },
        { key: 'menu_3', label: '事件', icon: <FieldTimeOutlined />, children: [] },
    ])
    // 数据库表
    const [databaseTables, setDatabaseTables] = useState<GoMysqlTables[]>()
    // 文本框
    const [text, setText] = useState('')
    // 用useReducer处理数据库信息
    const [allDBState, setAllDBstate] = useState<monacoEditor.Hints>({})
    // 
    let ShowDBTableRef: any = useRef(null)

    function dataReducer() {
        let dbState: monacoEditor.Hints = {}
        // console.log("执行")
        GoOperateDB(connId, JSON.stringify({ type: 0 })).then((allDBList) => {
            let tmpDBList = allDBList ? JSON.parse(allDBList) : []
            tmpDBList.forEach((db: GoMysqlDataBase) => {
                let currentDB = db.Database
                GoOperateDB(connId, JSON.stringify({ type: 1, currentDB })).then(tables => {
                    let tableList = tables ? JSON.parse(tables) : []
                    dbState[currentDB] = tableList.map((table: GoMysqlTables) => table[`Tables_in_${currentDB}`])
                    // 性能优化 只能当进行的所有操作完成时才进行state更新以及渲染
                    if (Object.keys(dbState).length === tmpDBList.length) {
                        setAllDBstate({ ...dbState })
                    }

                })
            })
        })
        // 测试注入数据库&表
        // setMyDBstate({"test":["table1","table2","table3","tabl4"],"mysql":["da","daxa","user"]})

    }

    /**
     * 首次进入获取所有数据库列表
     */
    useEffect(() => {
        getAllDataBase()
        dataReducer()
    }, [])

    /**
     * 监听选择activeDBIndex 更新数据库列表数据
     */
    useEffect(() => {
        onSelectDBListEvent(activeDBIndex)
    }, [activeDBIndex])

    /**
     * 获取所有数据库列表数据，利用wails
     */
    function getAllDataBase() {
        // 获取所有数据库
        GoOperateDB(connId, JSON.stringify({ type: 0 })).then(res => {
            setDatabases(JSON.parse(res))
            setActiveDBIndex(0)
        })
    }

    /**
     * SelectDBList组件选择事件
     * @param index 设置选择索引
     */
    function onSelectDBListEvent(index: number) {
        setActiveDBIndex(index)
        setOpenPopover(false)
        getCurrentDBTables(databases && databases[activeDBIndex].Database)
    }

    function handleOpenChange() {
        setOpenPopover(true)
    }

    /**
     * 这是一个获取当前选中数据库的所有表的请求，通过wails 传输参数并操作数据库
     * @param currentDB 当前数据库名称
     * @returns null
     */
    function getCurrentDBTables(currentDB: string | undefined) {
        if (currentDB === undefined) {
            return
        }
        // 获取数据库里的表
        GoOperateDB(connId, JSON.stringify({ type: 1, currentDB })).then(res => {
            let result = res ? JSON.parse(res) : []
            let tables = result.map((item: GoMysqlTables, index: number) => {
                // console.log(item[`Tables_in_${currentDB}`])
                return { key: currentDB + '/' + item[`Tables_in_${currentDB}`], label: item[`Tables_in_${currentDB}`], icon: <TableOutlined /> }
            })
            let newDatabaseMenu = databaseMenu.map((item, i) => {
                if (i === 0) {
                    return { ...item, children: tables }
                }
                return item
            })
            setDatabaseMenu(newDatabaseMenu)
        })
    }
    /**
     * 
     */
    function onMenuSelect(item: any) {
        // console.log(item)
        setActiveDBtable(item.key)
        const [dbName, tableName] = item.key.split('/')
        ShowDBTableRef.current && ShowDBTableRef.current.CreateTable(dbName, tableName)
    }

    return (
        <Layout className='main_box'>
            <Content className='content_box'>
                <Layout style={{ background: colorBgContainer }}>
                    {/* 左侧菜单栏 */}
                    <Sider className='sider_box' style={{ background: colorBgContainer, padding: '0 10px' }} width={250}>
                        <h1 className='content_title'>{host}:{port}</h1>
                        <Popover
                            open={openPopover}
                            onOpenChange={handleOpenChange}
                            style={{ width: '100px' }}
                            placement="bottom"
                            content={<SelectDBList databases={databases} onSelectEvent={onSelectDBListEvent} />}
                            trigger="click"
                        >
                            <div className='card_box flex_col flex_just_center'>
                                <div className='select_card'>
                                    <p className='select_card_via'>{dbName}</p>
                                    <span className='select_card_text'>{databases && databases[activeDBIndex].Database}</span>
                                    <RetweetOutlined />
                                </div>
                            </div>
                        </Popover>
                        <Menu
                            className='sider_menu_box'
                            mode="inline"
                            // onSelect={onMenuSelect}
                            onClick={onMenuSelect}
                            // style={{ height: "500px",overflow: 'scroll' }}
                            items={databaseMenu}
                        />
                    </Sider>
                    {/* 右主框 */}
                    <Content className='right_content' style={{ minHeight: 280 }}>
                        {/* <Button onClick={handleClick}>触发useReducer</Button> */}
                        <div className='content_search_box flex_col flex_just_center'>
                            <Input prefix={<SearchOutlined className='search_input_icon' />} bordered={false} placeholder='查询你所需要的数据' />
                        </div>
                        <div className='content_main'>
                            {/* <SQLMonacoEditor
                                value={text}
                                hintData={allDBState}
                            /> */}
                            {/* <button onClick={test}>test</button> */}
                            <ShowDBTable ref={ShowDBTableRef} connDBId={connId} hintDBData={allDBState} />

                        </div>
                    </Content>
                </Layout>
            </Content>
        </Layout>
    )
}

export default Home