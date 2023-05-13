import React, { useEffect, useState, useReducer, useRef } from 'react'
import {
    DatabaseOutlined,
    RetweetOutlined,
    TableOutlined,
    InsertRowBelowOutlined,
    FunctionOutlined,
    FieldTimeOutlined,
    SearchOutlined
} from '@ant-design/icons'
import { Layout, Menu, theme, Card, MenuProps, Space, Popover, Button, Input, Row, Col, Avatar, Tour } from 'antd'
import type { TourProps } from 'antd';
import type { DBHome } from './DBHome'
import { DBTable, SelectDBList, ShowDBTable } from "../../components/DBHome/index"
import SQLMonacoEditor, { monacoEditor } from "../../components/Monaco/index"
import { useLocation } from 'react-router-dom'
// import { GoOperateDB } from "../../../wailsjs/go/main/App"


import "./index.scss"
import { dbOperationTypes, operationTypes, RequestGo, requestGoCommon } from '../../utils'

const { Header, Content, Footer, Sider } = Layout;

function DBHomePage() {
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
    const { connectId, createDate, dbName, dbType, host, password, port, type, username } = location.state
    //  数据库列表
    const [databases, setDatabases] = useState<DBHome.GoMysqlDataBase[]>()
    // 当前数据库索引
    const [activeDBIndex, setActiveDBIndex] = useState<number>(-1)
    // 选中当前表
    const [activeDBtable, setActiveDBtable] = useState<string>("")
    // 打开选择框
    const [openPopover, setOpenPopover] = useState<boolean>(false)
    // 数据库菜单栏
    const [databaseMenu, setDatabaseMenu] = useState<DBHome.DatabaseMenu[]>([
        { key: 'menu_0', label: '表', icon: <TableOutlined />, children: [] },
        { key: 'menu_1', label: '视图', icon: <InsertRowBelowOutlined />, children: [] },
        { key: 'menu_2', label: '函数', icon: <FunctionOutlined />, children: [] },
        { key: 'menu_3', label: '事件', icon: <FieldTimeOutlined />, children: [] },
    ])
    // 数据库表
    const [databaseTables, setDatabaseTables] = useState<DBHome.GoMysqlTables[]>()
    // 文本框
    const [text, setText] = useState('')
    // 打开引导
    const [openTour,setOpenTour] = useState(false)
    const [stepsData,setStepsData] = useState<TourProps['steps']>([])
    // 用useReducer处理数据库信息
    const [allDBState, setAllDBstate] = useState<monacoEditor.Hints>({})
    // 
    let ShowDBTableRef = useRef<DBTable.ShowDBTableRef>(null)

    const tourRef1 = useRef(null)
    const tourRef2 = useRef(null)
    const tourRef3 = useRef(null)

    const steps: TourProps['steps'] = [
        {
            target: ()=>tourRef1.current,
            title: '',
            description: 'Put your files here.',
        },
    ]

    /**
     * 获取到所有的数据库和数据库中的表集合传递给monacoEditor组件用于输入提示
     * 首先调用获取所有数据库的接口，并遍历数据库名再次请求获取库下的所有表的接口得到一个集合传递给monaco编辑器
     */
    function getAllDBDataCollect () {
        let dbState: monacoEditor.Hints = {}
        let reqData: RequestGo.RequestGoData[] = [{
            operType: operationTypes.DB_OPERATION,
            connDBId: connectId,
            data: {
                type: dbOperationTypes.GET_ALL_DATABASES
            }
        }]
        requestGoCommon(reqData).then(responseList => {
            const [backData] = responseList;
            let tmpDBList = backData.dataList;
            tmpDBList.forEach((db: DBHome.GoMysqlDataBase) => {
                let currentDB = db.Database
                let reqTableData: RequestGo.RequestGoData[] = [{
                    operType: operationTypes.DB_OPERATION,
                    connDBId: connectId,
                    data: {
                        type: dbOperationTypes.GET_CURRENT_TABLES,
                        currentDB
                    }
                }]
                requestGoCommon(reqTableData).then(responseTableList => {
                    const [backTableData] = responseTableList;
                    let tableList = backTableData.dataList;
                    dbState[currentDB] = tableList.map((table: DBHome.GoMysqlTables) => table[`Tables_in_${currentDB}`])
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
        getAllDBDataCollect()
    }, [])

    /**
     * 监听选择activeDBIndex 更新数据库列表数据
     */
    useEffect(() => {
        updateAllDBData()
    }, [activeDBIndex])

    /**
     * 获取所有数据库列表数据，利用wails
     */
    function getAllDataBase() {
        // 获取所有数据库
        let reqData: RequestGo.RequestGoData[] = [{
            operType: operationTypes.DB_OPERATION,
            connDBId: connectId,
            data: {
                type: dbOperationTypes.GET_ALL_DATABASES
            }
        }]
        requestGoCommon(reqData).then(responseList => {
            const [backData] = responseList;
            setDatabases(backData.dataList);
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
        
    }

    /**
     * 更新数据库列表以及视图列表
     */
    async function updateAllDBData () {
        const currentDB = databases && databases[activeDBIndex].Database
        const menu01 = await getCurrentDBBaseTables(currentDB)
        const menu02 = await getCurrentDBViews(currentDB)
        const newDatabaseMenu = databaseMenu.map(item=>{
            if (item.key === menu01.key) {
                return {
                    ...item,
                    children: menu01.children
                }
            } else if (item.key === menu02.key){
                return {
                    ...item,
                    children: menu02.children
                }
            } else {
                return item
            }
        })
        // console.log(newDatabaseMenu)
        setDatabaseMenu(newDatabaseMenu)
        // updateMenuList(readyUpdateQuee)
    }

    /**
     * 打开或关闭弹框
     * @param newOpen 开启或关闭flag
     */
    function handleOpenChange(newOpen: boolean) {
        setOpenPopover(newOpen)
    }

    /**
     * 暴露更新菜单列表数据 需要在修改表名的时候去更新
     */
    function RealoadData(tableKey?: string):void {
        if (!tableKey) {
            onSelectDBListEvent(activeDBIndex) // 重新选中数据库
            return;
        } 
        onSelectDBListEvent(activeDBIndex) // 重新选中数据库
        const [dbName, tableName] = tableKey.split('/') // 获取更新后的数据库以及表名称
        ShowDBTableRef.current?.UpdateTable({ dbName, tableName })
    }

    /**
     * 这是一个获取当前选中数据库的所有表的请求，通过wails 传输参数并操作数据库
     * @param currentDB 当前数据库名称
     * @returns null
     */
    async function getCurrentDBBaseTables(currentDB: string | undefined) {
        if (currentDB === undefined) {
            return {}
        }
        // 获取数据库里的表
        let reqData: RequestGo.RequestGoData[] = [{
            operType: operationTypes.DB_OPERATION,
            connDBId: connectId,
            data: {
                type: dbOperationTypes.GET_CURRENT_BASE_TABLES,
                currentDB
            }
        }]
        const responseList = await requestGoCommon(reqData)
        const [backData] = responseList;
        let resultList = backData.dataList
        let tables = resultList.map((item: DBHome.GoMysqlTables, index: number) => {
            const tableKey = currentDB + '/' + item[`TABLE_NAME`]
            return { key: tableKey, label: item[`TABLE_NAME`], icon: <TableOutlined /> }
        })
        return {key: "menu_0", children: tables}
    }

    /**
     * 获取当前视图的列表
     * @param currentDB 当前数据库句柄
     * @returns void
     */
    async function getCurrentDBViews (currentDB: string | undefined) {
        if (currentDB === undefined) {
            return {}
        }
        // 获取数据库里的视图
        let reqData: RequestGo.RequestGoData[] = [{
            operType: operationTypes.DB_OPERATION,
            connDBId: connectId,
            data: {
                type: dbOperationTypes.GET_CURRENT_VIEWS,
                currentDB
            }
        }]
        const responseList = await requestGoCommon(reqData)
        const [backData] = responseList;
        let resultList = backData.dataList;
        let tables = resultList.map((item: DBHome.GoMysqlTables, index: number) => {
            const tableKey = currentDB + '/' + item[`TABLE_NAME`]
            return { key: tableKey, label: item[`TABLE_NAME`], icon: <InsertRowBelowOutlined /> }
        })
        return {key: "menu_1", children: tables}
    }

    /**
     * 点击左侧菜单栏子元素时
     */
    function onMenuSelect(item: any) {
        console.log(item)
        setActiveDBtable(item.key)
        const [dbName, tableName] = item.key.split('/')
        ShowDBTableRef.current?.CreateTable({ dbName, tableName, isView: item.keyPath.includes("menu_1") })
    }

    /**
     * 根据用户输入的sql进行查询（目前可以执行任意sql，增删改查，所以具有一定的危险性！）
     * @param querySQLStr 用户输入的自定义sql
     */
    function onSearchEvent(querySQLStr: string) {
        ShowDBTableRef.current?.CreateTable({ newQuerySQL: true, querySQLStr })
    }

    function openTourEvent (i:number,stepsData: TourProps['steps']) {
        if (!stepsData) {
            return
        }
        switch(i){
            case 0:
                stepsData[0].target = (()=>tourRef1.current);
            break
            case 1:
                stepsData[0].target = (()=>tourRef2.current);
            break
            case 2:
                stepsData[0].target = (()=>tourRef2.current);
            break
            case 3:
                stepsData[0].target = (()=>tourRef3.current);
            break
            case 4:
                // stepsData[0].target = (()=>ShowDBTableRef.current?.CreateTableBtn);
            break
        }
        setStepsData(stepsData);
        setOpenTour(true);
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
                            <div className='card_box flex_col flex_just_center' ref={tourRef1}>
                                <div className='select_card'>
                                    <p className='select_card_via'>
                                        <DatabaseOutlined style={{ fontSize: "24px" }} />
                                    </p>
                                    <span className='select_card_text'>{databases && databases[activeDBIndex].Database}</span>
                                    <RetweetOutlined />
                                </div>
                            </div>
                        </Popover>
                        <div ref={tourRef2}>
                            <Menu
                                
                                className='sider_menu_box'
                                mode="inline"
                                // onSelect={onMenuSelect}
                                onClick={onMenuSelect}
                                // style={{ height: "500px",overflow: 'scroll' }}
                                items={databaseMenu}
                            />
                        </div>
                        
                    </Sider>
                    {/* 右主框 */}
                    <Content className='right_content' style={{ minHeight: 280 }}>
                        <div className='content_search_box flex_col flex_just_center' ref={tourRef3}>
                            <Input.Search
                                prefix={<SearchOutlined className='search_input_icon' />}
                                bordered={false} placeholder='您可以输入SQL语句或者创建一个空白的查询框。'
                                enterButton="创建查询"
                                onSearch={onSearchEvent}
                            />
                        </div>
                        <div className='content_main'>
                            {/* <SQLMonacoEditor
                                value={text}
                                hintData={allDBState}
                            /> */}
                            <ShowDBTable RealoadData={RealoadData} ref={ShowDBTableRef} databases={databases} openTourEvent={(i,steps)=>openTourEvent(i,steps)} connDBId={connectId} hintDBData={allDBState} />
                        </div>
                        {/* <Button onClick={()=>console.log(databaseMenu)}>1111</Button> */}
                    </Content>
                </Layout>
            </Content>
            {/* <Button onClick={()=>{setOpenTour(true)}}>click</Button> */}
            <Tour open={openTour} onClose={() => setOpenTour(false)} steps={stepsData} />
        </Layout>
    )
}

export default DBHomePage