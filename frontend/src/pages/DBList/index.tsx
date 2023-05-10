import { Input, Layout, Spin } from "antd"
import { ProjectTwoTone, SearchOutlined, EditOutlined } from '@ant-design/icons';
import React, { useContext, useEffect, useRef, useState } from "react"
import './index.scss'
import { DBListCard, DBListRegisterModal, DBListCardProps,DBListRegister } from '../../components/DBList'
import { useNavigate } from "react-router-dom";
// import type {DBList} from './DBList'
import AppContext from '../../AppContext'
// import { navigate } from "../../utils/index";

import { GoConnectDB, GoPingDB } from "../../../wailsjs/go/main/App";
import requestGoCommon,{RequestGo,operationTypes,dbOperationTypes} from '../../utils/requestGo'

const { Content } = Layout;



const ConnectDB: React.FC = () => {
    // 获取存储连接的数据库配置信息到localStorage中
    let storageData = localStorage.getItem('my_db_list')
    let storageDBList = !storageData ? [] : JSON.parse(storageData)

    const navigate = useNavigate();
    // const [modalWindow, setModalWindow] = useState<boolean>(false);
    const [dbList, setDBList] = useState<DBListCardProps[]>(storageDBList);
    const [spinning, setSpinning] = useState<boolean>(false);
    const [spinningTips, setSpinningTips] = useState<string>('');

    // const [connDBList, setConnDBList] = useState<DBList.connDBInfo[]>([]);
    // 通过context存储全部登录的数据库信息
    const context = useContext(AppContext);
    const registerRef = useRef<DBListRegister.DBListRegisterRef>(null)
    // console.log(context)


    /**
     * 计算出一行四个空余多少自动补全，以防弹性布局最后一排样式问题
     * @param currentCount 
     * @returns JSX.Element[]
     */
    function renderBlankCard(currentCount: number): JSX.Element[] {
        let count = currentCount % 4 != 0 ? parseInt((currentCount / 4 + 1).toString()) * 4 - currentCount : 0
        let backEles = new Array(count).fill([]).map((item, i) => {
            return <DBListCard type={3} key={'blank_' + i} />
        })
        return backEles
    }

    /**
     * 新增数据库连接配置
     * @param dbConifg DBListCardProps
     * @returns Promise<void>
     */
    async function AddDataBase(dbConifg: DBListCardProps): Promise<void> {
        // { dbname, dbcontent, username,password,host,port, type: 0 }
        let changeDBList = [{ ...dbConifg }, ...dbList]
        console.log(changeDBList)
        setDBList(changeDBList)
        localStorage.setItem('my_db_list', JSON.stringify(changeDBList))
    }

    /**
     * 删除数据库连接配置
     * @param delIndex 删除id
     * @returns void
     */
    function delDataBase(delIndex: number): void {
        let changeDBList = dbList.filter((item, i) => { return i != delIndex })
        setDBList(changeDBList)
        localStorage.setItem('my_db_list', JSON.stringify(changeDBList))
    }

    function onConnClickEvent (cardItem: DBListCardProps, listKey: string) {
        const connDBList = context.state.dbList;
        // console.log(key)
        // console.log(connDBList)
        setSpinning(true)
        setSpinningTips('正在连接中。。。')
        const checkHasConnIndex = connDBList.findIndex((connDBItem)=>{return connDBItem.listKey === listKey})
        // 不存在连接句柄，创建连接
        if (checkHasConnIndex === -1) { 
            // console.log('添加进入连接')
            connectDBRequest(cardItem, listKey, 'add')
        } else {
            let connectId = connDBList[checkHasConnIndex].connectId
            GoPingDB(connectId).then((connFlag: boolean) => {
                // console.log(connFlag)
                // 存在连接句柄并没有失效，直接进入
                if (connFlag) { 
                    // console.log('存在进入连接')
                    setTimeout(() => {
                        navigate('/dbhome', { state: { connectId, ...cardItem } })
                        setSpinning(false)
                    }, 1500)
                // 存在句柄，但是连接已经失效了，需要重新连接
                } else { 
                    // console.log('存在更新连接')
                    connectDBRequest(cardItem, listKey, 'update')
                }
            })
        }
    }

    function connectDBRequest (cardItem: DBListCardProps,listKey: string,type: string) {
        const connDBList = context.state.dbList;
        let reqData: RequestGo.RequestGoData[] = [
            {
                operType: operationTypes.DB_CONNECT,
                data: cardItem
            }
        ]
        requestGoCommon(reqData).then(responseList => {
            console.log(responseList)
            const [backData] = responseList
            const connectId = backData.dataList
            console.log(backData)
        // GoConnectDB(JSON.stringify(cardItem)).then((connectId: string) => {
            // console.log(connectId)
            if (type === 'add') {
                context.dispatch({
                    type: 'updateAppData',
                    newDBList: [...connDBList,{listKey,connectId: connectId}]
                })
                // setConnDBList([...connDBList,{cardKey,connHandle: connectId}])
            } else {
                let newConnDBList = connDBList.filter((item)=>item.listKey !== listKey).concat({listKey,connectId})
                // let newConnDBList = connDBList.filter((item)=>item.cardKey !== cardKey).concat({cardKey,connHandle: connectId})
                context.dispatch({
                    type: 'updateAppData',
                    newDBList: newConnDBList
                })
                // setConnDBList(newConnDBList)
            }
            GoPingDB(connectId).then((connFlag: boolean) => {
                // console.log(connFlag)
                if (connFlag) {
                    // setSpinningTips('连接成功！')
                    setTimeout(() => {
                        navigate('/dbhome', { state: { connectId, ...cardItem } })
                        setSpinning(false)
                    }, 1500)
                } else {
                    setSpinningTips('连接失败，没有连接到服务！')
                    setTimeout(() => {
                        setSpinning(false)
                    },1500)
                }
            })

        })
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
                    {/* <Button onClick={() => { console.log(connDB); GoPingDB(connDB).then((res: boolean) => { console.log(res) }) }}>ping数据库</Button> */}
                </div>

            </div>
            <Content className='content_box'>
                {/* 注册弹框 */}
                <DBListRegisterModal
                    ref={registerRef}
                    // modalWindowFlag={modalWindow}
                    // onOpenWindow={() => { registerRef.current?.ToggleShowModal() }}
                    onAddDataBase={AddDataBase} />
                <div className="content_header flex_row flex_align_center">
                    <h1>数据库列表</h1>
                </div>
                <div className="content_main flex_row flex_align_center">
                    {
                        dbList.map((item, index) => {
                            let DBListCardKey = "dblistcard_" + index.toString()
                            return <DBListCard
                                key={DBListCardKey}
                                cardConfig={item}
                                // dbcontent={item.dbcontent}
                                // username={item.username}
                                type={item.type}
                                onClick={() => { navigate('/') }}
                                onDelClick={() => { delDataBase(index) }}
                                onConnClick={() => onConnClickEvent(item,DBListCardKey)}
                            />
                        })
                    }
                    {/* 新增数据库 */}
                    <DBListCard
                        type={1}
                        onClick={() => { registerRef.current?.ToggleShowModal() }}
                    />
                    {
                        // 渲染空白区域
                        renderBlankCard(dbList.length + 1)
                    }
                    {/* <p>{JSON.stringify(connDBList)}{JSON.stringify(context.state.dbList)}</p> */}
                </div>
            </Content>
        </Layout></Spin>)
}

export default ConnectDB