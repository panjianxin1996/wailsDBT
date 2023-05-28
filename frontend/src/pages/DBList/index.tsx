import { Button, Dropdown, Input, Layout, MenuProps, Select, Space, Spin } from "antd";
import { ProjectTwoTone, SearchOutlined, EditOutlined, UserOutlined, SettingOutlined } from '@ant-design/icons';
import React, { useContext, useEffect, useRef, useState } from "react";
import { DBListCard, DBListRegisterModal, DBListCardProps, DBListRegister } from '../../components/DBList';
import { useNavigate } from "react-router-dom";
import AppContext from '../../AppContext';
import requestGoCommon, { RequestGo, operationTypes, dbOperationTypes } from '../../utils/requestGo';
import './index.scss';

const { Content } = Layout;
let cardKey = 0;

const ConnectDB: React.FC = () => {
    // 获取存储连接的数据库配置信息到localStorage中
    let storageData = localStorage.getItem('my_db_list')
    let storageDBList = !storageData ? [] : JSON.parse(storageData)

    const navigate = useNavigate();
    // const [modalWindow, setModalWindow] = useState<boolean>(false);
    const [dbList, setDBList] = useState<DBListCardProps[]>(storageDBList);
    const [spinning, setSpinning] = useState<boolean>(false);
    const [spinningTips, setSpinningTips] = useState<string>('');
    const [dbListSelectOption, setDBListSelectOption] = useState<any>([]);

    // const [connDBList, setConnDBList] = useState<DBList.connDBInfo[]>([]);
    // 通过context存储全部登录的数据库信息
    const context = useContext(AppContext);
    const registerRef = useRef<DBListRegister.DBListRegisterRef>(null)
    const items: MenuProps['items'] = [
        {
            label: '关于我们',
            key: 'drop-down-menu-1',
            icon: <UserOutlined />,
        },
    ];
    const menuProps = {
        items,
        onClick: handleMenuClick,
    }
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
        let changeDBList = [...dbList,{ ...dbConifg }]
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

    /**
     * 点击连接按钮
     * @param cardItem 连接所需参数
     * @param listKey 触发事件card的索引
     */
    function onConnClickEvent(cardItem: DBListCardProps, listKey: string) {
        // alert(JSON.stringify(cardItem))
        // alert(JSON.stringify(listKey))
        const connDBList = context.state.dbList;
        setSpinning(true)
        setSpinningTips('正在连接中。。。')
        console.log(connDBList)
        const checkHasConnIndex = connDBList.findIndex((connDBItem) => { return connDBItem.listKey === listKey })
        // 不存在连接句柄，创建连接
        if (checkHasConnIndex === -1) {
            console.log("不存在连接句柄，创建连接")
            connectDBRequest(cardItem, listKey, 'add')
        } else {
            let connectId = connDBList[checkHasConnIndex].connectId
            pingDBRequest(connectId, () => {
                // 存在连接，并且并未失活，直接复用进入连接
                console.log("存在连接，并且并未失活，直接复用进入连接")
                setTimeout(() => {
                    navigate('/dbhome', { state: { connectId, ...cardItem } })
                    setSpinning(false)
                }, 1500)
            }, () => {
                console.log("存在连接，已经失活，更新并创建新连接")
                // 存在连接，已经失活，更新并创建新连接
                connectDBRequest(cardItem, listKey, 'update')
            })
        }
    }

    /**
     * 对数据库连接的校验，判断是否断开连接、失活、成功连接
     * @param connDBId 连接句柄
     * @param successFun 连接成功的回调函数
     * @param failFun 连接失败的回调函数
     * @example 
     * pingDBRequest("test_1",()=>{
     *      console.log("连接成功了")
     * },()=>{
     *      console.log("连接失败了")
     * })
     */
    function pingDBRequest(connDBId: string, successFun?: Function, failFun?: Function) {
        let reqData: RequestGo.RequestGoData[] = [
            {
                operType: operationTypes.DB_PING,
                connDBId,
                data: {}
            }
        ]
        requestGoCommon(reqData).then(responseList => {
            const [backData] = responseList
            if (backData.code === 1) successFun && successFun(); else failFun && failFun();
        })
    }

    /**
     * 创建与数据库的连接
     * @param cardItem 连接的参数
     * @param listKey 连接的card key值
     * @param type 连接的类型：add-不存在的连接，创建新连接，update-存在的连接，但是已经失活，更新该连接
     */
    function connectDBRequest(cardItem: DBListCardProps, listKey: string, type: string) {
        const connDBList = context.state.dbList;
        let reqData: RequestGo.RequestGoData[] = [
            {
                operType: operationTypes.DB_CONNECT,
                data: cardItem
            }
        ]
        requestGoCommon(reqData).then(responseList => {
            const [backData] = responseList
            const connectId = backData.dataList
            if (type === 'add') {
                context.dispatch({
                    type: 'updateAppData',
                    newDBList: [...connDBList, { listKey, connectId: connectId }]
                })
            } else {
                let newConnDBList = connDBList.filter((item) => item.listKey !== listKey).concat({ listKey, connectId })
                context.dispatch({
                    type: 'updateAppData',
                    newDBList: newConnDBList
                })
            }
            pingDBRequest(connectId, () => {
                setTimeout(() => {
                    navigate('/dbhome', { state: { connectId, ...cardItem } })
                    setSpinning(false)
                }, 1500)
            }, () => {
                setSpinningTips('连接失败，没有连接到服务！')
                setTimeout(() => {
                    setSpinning(false)
                }, 1500)
            })
        })
    }

    useEffect(() => {
        // console.log(dbList)
        const newDBListSelectOption = dbList.map(item => {
            // console.log(item)
            return {
                value: <div>{item.dbName}<Button>连接</Button></div>,
                lable: item.dbName,
            }
        })
        setDBListSelectOption(newDBListSelectOption)
    }, [dbList])

    function handleButtonClick() {
        console.log('触发1')
    }

    function handleMenuClick(e: any) {
        console.log('触发2', e)
    }

    function onSelectSearchEvent(e: any) {
        console.log(e)
    }



    return (<Spin tip={spinningTips} spinning={spinning}>
        <Layout>
            <div className="db_list_header flex_row flex_just_between flex_align_center">
                <div className="header_left_box flex_row flex_align_center">

                    <p className="logo_box">
                        <ProjectTwoTone />
                        <span className="logo_txt">DBMT</span>
                    </p>
                    <div className="header_input_box">
                        <Select
                            showSearch
                            placeholder="请输入需要查询的数据库名"
                            optionFilterProp="children"
                            className="header_input"
                            bordered={false}
                            onChange={onSelectSearchEvent}
                            // onSearch={onSelectSearchEvent}
                            // filterOption={(input, option) =>
                            //     (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                            // }
                            // options={dbListSelectOption}
                            optionLabelProp="value"
                        >
                            {
                                dbList.map((item:any,index:number) => {
                                    return <Select.Option value={item.dbName} label={item.dbName} key={"select-option-"+index}>
                                        <Space>
                                            <span aria-label={item.dbName}>{item.dbName}</span>
                                            <Button>连接</Button>
                                        </Space>
                                    </Select.Option>
                                })
                            }
                            
                        </Select>
                        {/* <Input
                            prefix={<SearchOutlined style={{ color: '#95a8b2', fontSize: '16px' }} />}
                            suffix={<EditOutlined style={{ color: '#95a8b2', fontSize: '16px' }} />}
                            className="header_input"
                            bordered={false}
                            placeholder="搜索连接的数据库"></Input> */}
                    </div>

                </div>
                <div className="header_right_box">
                    <Dropdown.Button menu={menuProps} onClick={handleButtonClick}><SettingOutlined /></Dropdown.Button>
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
                            // cardKey++;
                            return <DBListCard
                                key={DBListCardKey}
                                cardConfig={item}
                                // dbcontent={item.dbcontent}
                                // username={item.username}
                                type={item.type}
                                onClick={() => { navigate('/') }}
                                onDelClick={() => { delDataBase(index) }}
                                onConnClick={() => onConnClickEvent(item, DBListCardKey)}
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