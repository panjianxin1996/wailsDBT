import { Avatar, Button, Col, Form, Input, Modal, Row, Space, Table, Tabs, Tag, message, notification } from 'antd'
import React, { forwardRef, useEffect, useImperativeHandle, useReducer, useRef } from 'react'
import {
    EditOutlined,
    PlusCircleOutlined,
    MinusCircleOutlined,
    RedoOutlined,
    CloseOutlined

} from '@ant-design/icons'
import SQLMonacoEditor from "../../../components/Monaco/index"
import { requestGoCommon, operationTypes, dbOperationTypes, RequestGo } from '../../../utils/index'
import plantImg from '../../../assets/images/plant.png'
import './index.scss'
import type { DBTable } from "./DBTable"

const ShowDBTable = forwardRef((props: DBTable.Props, ref: any) => {
    const { connDBId, hintDBData } = props

    const tableKeyword = 'tab_'

    const initalState: DBTable.State = {
        tableStack: [],
        activeTableIndex: 0,
        tableListKeyIndex: 0,
        activeTableKey: '',
        activeTableData: {},
        tableColumns: [],
        tableData: [],
        modalView: {
            type: '',
            showFlag: false
        },
        messageList: [],
        rightClickMenuBar: {
            showMenu: false,
            X: 0,
            Y: 0
        },
        showRightMenu: false,
    }

    const [state, setState] = useReducer(dbReducer, initalState)
    const [activeRowForm] = Form.useForm();
    const [messageApi, messageContextHolder] = message.useMessage();
    const [notificationApi, notificationContextHolder] = notification.useNotification();

    useImperativeHandle(
        ref,
        () => ({ createTable, state })
    )

    /**
     * 暴露创建tab的方法
     * @param dbName 数据库名
     * @param tableName 表名
     * @param newQuerySQL 是否自定义sql语句flag boolean
     * @param querySQLStr 自定义sql语句
     * @returns 
     */
    function createTable(dbName: string, tableName: string, newQuerySQL: boolean = false, querySQLStr: string) {
        if (!dbName || !tableName) {
            return
        }
        let checkIndex: number = state.tableStack.findIndex((item: any) => {
            return (item.dbName === dbName && item.tableName === tableName)
        })
        checkIndex === -1 ? initTable(dbName, tableName, newQuerySQL, querySQLStr) : onTabChange(state.tableStack[checkIndex].key)


    }

    /**
     * 初始化tab 并添加到栈中
     * @param dbName 
     * @param tableName 
     * @param newQuerySQL 
     * @param querySQLStr 
     */
    function initTable(dbName: string, tableName: string, newQuerySQL: boolean, querySQLStr: string) {
        const tableStructureSQL = `DESCRIBE ${dbName}.${tableName}`
        const QuerySQL = `SELECT * FROM ${dbName}.${tableName}`
        let reqData: RequestGo.RequestGoData[] = [
            {
                operType: operationTypes.DB_OPERATION,
                connDBId,
                data: {
                    type: dbOperationTypes.CUSTOM_SQL,
                    customSQL: tableStructureSQL
                }
            },
            {
                operType: operationTypes.DB_OPERATION,
                connDBId,
                data: {
                    type: dbOperationTypes.CUSTOM_SQL,
                    customSQL: QuerySQL
                }
            },
        ]
        // 通过Promise.all 进行多接口请求并渲染表格头部、内容、tab的数据
        requestGoCommon(reqData).then(responseList => {
            // 指定默认选中为当前创建的标签
            let activeTableKey: string = tableKeyword + (state.activeTableIndex).toString()
            // 结构接口返回数据
            const [tableColumnsSource, tableDataSource] = responseList
            console.log(tableColumnsSource, tableDataSource)
            // 处理表格头部格式
            const tableColumns = tableColumnsSource.map((item: any) => {
                return {
                    title: item.Field,
                    dataIndex: item.Field,
                    key: item.Field,
                    width: 200,
                    textWrap: 'word-break',
                    ellipsis: true,
                    onCell: () => { // 处理最大文本长度，超出隐藏
                        return {
                            style: {
                                maxWidth: 200,
                                overflow: 'hidden',
                                whiteSpace: 'nowrap',
                                textOverflow: 'ellipsis',
                                cursor: 'pointer'
                            }
                        }
                    }
                }
            })
            let tmpTableListKeyIndex = 0
            // 给table数据设置key值
            const tableData = tableDataSource.map((item: any, index: number) => {
                tmpTableListKeyIndex = index
                return { ...item, key: index }
            })

            let newTab = {
                key: activeTableKey,
                activeRowIndex: [],
                activeRowData: [],
                newQuerySQL,
                tableStructureSQL,
                QuerySQL,
                tableColumnsSource,
                tableDataSource,
                tableColumns,
                tableData,
                label: tableName,
                dbName,
                tableName,
                // children: 
            }

            let primaryKeyName = tableColumnsSource.filter((item: DBTable.TableDataItem) => { return item.Key === 'PRI' })

            setState({
                type: 'updateMutiData',
                payload: {
                    // 更新表格栈数据
                    tableStack: [
                        ...state.tableStack,
                        newTab
                    ],
                    // 更新表格索引
                    activeTableIndex: state.activeTableIndex + 1,
                    // 更新表格数据索引
                    tableListKeyIndex: tmpTableListKeyIndex + 1,
                    // // 更新选中表格索引
                    activeTableKey,
                    // 更新当前表格头部内容
                    // tableColumns,
                    // 更新当前表格内容
                    // tableData,
                    activeTableData: {
                        dbName,
                        tableName,
                        primaryKeyName
                    }
                }
            })

        })

    }

    /**
     * useReducer dispath
     * @param state 
     * @param action 
     * @returns DBTable.State
     */
    function dbReducer(state: DBTable.State, action: DBTable.DBReducerAction): DBTable.State {
        switch (action.type) {
            case "updateMutiData":
                return {
                    ...state,
                    tableColumns: action.payload.tableColumns,
                    tableData: action.payload.tableData,
                    tableStack: action.payload.tableStack,
                    activeTableIndex: action.payload.activeTableIndex,
                    activeTableKey: action.payload.activeTableKey,
                    activeTableData: action.payload.activeTableData,
                    tableListKeyIndex: action.payload.tableListKeyIndex
                }
            case "switchActiveTableKey":
                return {
                    ...state,
                    activeTableKey: action.payload.activeTableKey
                }
            case "deleteTableStack":
                return {
                    ...state,
                    tableStack: action.payload.tableStack
                }
            case "updateActiveData":
                return {
                    ...state,
                    activeTableData: action.payload.activeTableData
                }
            case "changeShowRightMenu":
                return {
                    ...state,
                    rightClickMenuBar: action.payload.rightClickMenuBar
                }
            case "changeModalView":
                return {
                    ...state,
                    modalView: action.payload.modalView
                }
            case "updateTableData":
                return {
                    ...state,
                    tableStack: action.payload.tableStack
                }
            case "updateTableListKeyIndex":
                return {
                    ...state,
                    tableListKeyIndex: action.payload.tableListKeyIndex
                }
            case "updateMessageList":
                return {
                    ...state,
                    messageList: action.payload.messageList
                }
            default:
                return state
        }
    }

    /**
     * tabs切换
     * @param tabKey 
     */
    function onTabChange(tabKey: string) {
        // 更新选中tab名
        setState({
            type: 'switchActiveTableKey',
            payload: {
                activeTableKey: tabKey
            }
        })
        // console.log(state.tableStack.find((item: any) => { return item.key === tabKey }))
        let primaryKeyName = state.tableStack.find((item: any) => { return item.key === tabKey })?.tableColumnsSource.filter(item => { return item.Key === 'PRI' })
        // 更新选中数据库名和表格名
        setState({
            type: 'updateActiveData',
            payload: {
                activeTableData: {
                    dbName: state.tableStack.find((item: any) => { return item.key === tabKey })?.dbName,
                    tableName: state.tableStack.find((item: any) => { return item.key === tabKey })?.tableName,
                    primaryKeyName
                }
            }
        })
    }

    /**
     * 操作tabs 目前只要操作删除
     * @param targetKey 
     * @param action 
     */
    function onTabEdit(targetKey: any, action: any) {
        const newTableStack = state.tableStack.filter((item: DBTable.TableStack) => {
            return item.key !== targetKey
        })
        switch (action) {
            case "remove":
                setState({
                    type: 'deleteTableStack',
                    payload: {
                        tableStack: newTableStack
                    }
                })
                state.tableStack.length > 0 && onTabChange(state.tableStack[0].key)
                break
        }
        // console.log(targetKey,action)
    }

    /**
     * 获取当前选中tab框的handle
     * @returns 
     */
    function getActiveTabHandle(): DBTable.TableStack | undefined {
        return state.tableStack.find(item => {
            return item.key === state.activeTableKey
        })
    }

    /**
     * 选中表格当前行操作
     * @param rowIds 
     */
    function activeCurrentRow(rowIds: React.Key[], rowData: DBTable.TableDataItem) {
        let activeRowData = rowData
        // console.log(activeRowData)
        let newTableStack = state.tableStack.map(item => {
            if (item.key === state.activeTableKey) {
                return {
                    ...item,
                    activeRowIndex: rowIds,
                    activeRowData
                }
            } else {
                return item;
            }
        })
        setState({
            type: 'deleteTableStack',
            payload: {
                tableStack: newTableStack
            }
        })
    }

    function activeCurrentRowHandle() {
        let tabHandle = getActiveTabHandle()
        console.log(tabHandle?.tableData.find(item => {
            return item.key === tabHandle?.activeRowIndex[0]
        }))
        return tabHandle?.tableData.find(item => {
            return item.key === tabHandle?.activeRowIndex[0]
        }) || {}
    }

    function editRecordBtnEvent() {
        if (getActiveTabHandle()?.activeRowIndex.length === 0) {
            notificationApi.warning({
                message: `请选择一行需要修改的记录`,
                // description:
                //   '您可以在表中选择一行需要修改的记录',
                placement: 'bottomRight',
            });
            return
        }
        activeRowForm.setFieldsValue(getActiveTabHandle()?.activeRowData)
        setState({
            type: 'changeModalView',
            payload: {
                modalView: { type: 'edit', showFlag: true }
            }
        })
    }

    function addRecordBtnEvent() {
        activeRowForm.resetFields()
        setState({
            type: 'changeModalView',
            payload: {
                modalView: { type: 'add', showFlag: true }
            }
        })
    }

    /**
     * 更新表里数据
     * @param updateRow 
     */
    function updateTableData(updateRow: any) {
        // console.log(getActiveTabHandle())
        const { activeRowIndex, tableDataSource, tableData } = getActiveTabHandle() || {}
        let tableCurrentRowIndex: number = (activeRowIndex && activeRowIndex.length === 1) ? (activeRowIndex[0] as number) : -1
        let tmpTableDataSource = tableDataSource?.map((item, index) => {
            if (index === tableCurrentRowIndex) {
                return updateRow
            } else {
                return item
            }
        })
        let tmpTableData = tableData?.map((item, index) => {
            if (index === tableCurrentRowIndex) {
                return { ...updateRow, key: item.key }
            } else {
                return item
            }
        })
        let tmpTableStack = state.tableStack.map(item => {
            if (item.key === state.activeTableKey) {
                return {
                    ...item,
                    tableDataSource: tmpTableDataSource,
                    tableData: tmpTableData,
                    activeRowData: updateRow // 给选中的数据进行更新
                }
            } else {
                return item
            }

        })
        setState({
            type: 'updateTableData',
            payload: {
                tableStack: tmpTableStack
            }
        })
        // console.log(tmpTableDataSource,tmpTableData)
    }

    function addTableData(dbData: { formData?: any; insertId: any; dbName: any; tableName: any; PRILIST: any }) {
        const { tableDataSource, tableData } = getActiveTabHandle() || {}
        /**
         * 没有插入id意思是数据库表中没有主键或者主键没有设置自增 这里就需要判断为静默插入成功 并直接将前端数据插入表中
         */
        if (dbData.insertId === 0) {
            let tmpTableDataSource = tableDataSource?.concat(dbData.formData)
            let tmpTableData = tableData?.concat({ key: state.tableListKeyIndex, ...dbData.formData })
            let tmpTableStack = state.tableStack.map(item => {
                if (item.key === state.activeTableKey) {
                    return {
                        ...item,
                        tableDataSource: tmpTableDataSource,
                        tableData: tmpTableData,
                        // activeRowData: formData 新增不需要设置更新选中行数据
                    }
                } else {
                    return item
                }
    
            })
            setState({
                type: 'updateTableData',
                payload: {
                    tableStack: tmpTableStack
                }
            })
        } else {
            /**
             * 需要重新请求数据库内容 因为有可能主键等内容没有输入 数据库会按照默认值自动生成 此处并不知道默认值为什么所以需要重新请求数据库获取新增一行的内容
             */
            const QuerySQL = `SELECT * FROM ${dbData.dbName}.${dbData.tableName} WHERE ${dbData.PRILIST.join(' AND ')}`
            console.log(QuerySQL)
            let reqData: RequestGo.RequestGoData[] = [
                {
                    operType: operationTypes.DB_OPERATION,
                    connDBId,
                    data: {
                        type: dbOperationTypes.CUSTOM_SQL,
                        customSQL: QuerySQL
                    }
                },
            ]
            requestGoCommon(reqData).then(responseList => {
                const [insertRowList] = responseList
                const insertRowData = insertRowList[0]
                let tmpTableDataSource = tableDataSource?.concat(insertRowData)
                let tmpTableData = tableData?.concat({ key: state.tableListKeyIndex, ...insertRowData })
                // 更新栈中激活选中表的数据
                let tmpTableStack = state.tableStack.map(item => {
                    if (item.key === state.activeTableKey) {
                        return {
                            ...item,
                            tableDataSource: tmpTableDataSource,
                            tableData: tmpTableData
                            // activeRowData: insertRowData 新增不需要设置更新选中行数据
                        }
                    } else {
                        return item
                    }

                })
                setState({
                    type: 'updateTableData',
                    payload: {
                        tableStack: tmpTableStack
                    }
                })
                setState({
                    type: 'updateTableListKeyIndex',
                    payload: {
                        tableListKeyIndex: state.tableListKeyIndex + 1
                    }
                })
            })
        }


    }

    /**
     * 弹框修改确认事件
     * @param value 表单里面的数据
     */
    function onFormFinish(formData: any) {
        if (state.modalView.type === 'edit') {
            updateRowRequest(formData)
        } else {
            addRowRequest(formData)
        }
    }

    /**
     * 更新一行数据
     * @param formData 
     */
    function updateRowRequest(formData: any) {
        // 获取操作的数据库和表
        const dbName = state.activeTableData.dbName
        const tableName = state.activeTableData.tableName
        // 获取主键和旧主键数据
        // const PRI = state.activeTableData.primaryKeyName
        // const PRIValue = PRI && getActiveTabHandle()?.activeRowData[PRI]
        // 获取主键名和主键内容拼接
        const PRILIST = state.activeTableData.primaryKeyName?.map((item:any)=>{
            return `${item.Field}='${getActiveTabHandle()?.activeRowData[item.Field]}'`
        })

        const updateArray = Object.keys(formData).map(item => `${item}='${formData[item]}'`)
        const updateSQL = `UPDATE ${dbName}.${tableName} SET ${updateArray.join(',')} WHERE ${PRILIST?.join(' AND ')}`
        console.log(updateSQL)

        let reqData: RequestGo.RequestGoData[] = [{
            operType: operationTypes.DB_OPERATION,
            connDBId,
            data: {
                type: dbOperationTypes.EXEC_SQL,
                execSQL: updateSQL
            }
        }]

        requestGoCommon(reqData).then(responseList => {
            const [backData] = responseList
            console.log(backData)
            if (backData.code === 1) {
                addMessage({
                    type: 'success',
                    content: `记录修改成功！影响行数${backData.affectCount}`,
                })
                // 更新表格
                updateTableData(formData)
            } else {
                addMessage({
                    type: 'error',
                    duration: 0,
                    content: backData.errorMsg
                })
            }
        })
    }

    /**
     * 新增一行数据 发起数据库操作
     * @param formData 
     */
    function addRowRequest(formData: any) {
        // 获取操作的数据库和表
        const dbName = state.activeTableData.dbName
        const tableName = state.activeTableData.tableName
        // 获取主键和旧主键数据
        // const PRI = state.activeTableData.primaryKeyName
        // const PRIValue = PRI && getActiveTabHandle()?.activeRowData[PRI]
        // 获取主键名和主键内容拼接
        const PRILIST = state.activeTableData.primaryKeyName?.map((item:any)=>{
            return `${item.Field}='${getActiveTabHandle()?.activeRowData[item.Field]}'`
        })
        console.log(PRILIST)

        console.log(formData)
        // console.log(Object.keys(formData))
        const tableKeys = Object.keys(formData).join(',')
        const tableRowData = Object.values(formData).map(item => {
            return item === undefined ? 'null' : `'${item}'`
        }).join(',')
        console.log(Object.values(formData))

        const insertSQL = `INSERT INTO ${dbName}.${tableName} (${tableKeys}) VALUES (${tableRowData});`
        console.log(insertSQL)
        let reqData: RequestGo.RequestGoData[] = [{
            operType: operationTypes.DB_OPERATION,
            connDBId,
            data: {
                type: dbOperationTypes.EXEC_SQL,
                execSQL: insertSQL
            }
        }]
        requestGoCommon(reqData).then(responseList => {
            const [backData] = responseList
            console.log(backData)
            if (backData.code === 1) {
                addMessage({
                    type: 'success',
                    content: `记录修改成功！影响行数${backData.affectCount}`,
                })
                console.log(backData)
                // 更新表格
                // addTableData({ formData, insertId: backData.insertId, dbName, tableName, PRILIST:backData.insertId })
                setState({ type: 'changeModalView', payload: { modalView: { ...state.modalView, showFlag: false } } })
            } else {
                addMessage({
                    type: 'error',
                    duration: 0,
                    content: backData.errorMsg
                })
            }
        })
    }

    /**
     * 新增消息到消息列表中并弹出消息框
     * @param addMessageData 
     */
    function addMessage(addMessageData: DBTable.MessageList) {
        const { type, content, duration = 3 } = addMessageData
        const key = "messageItem_" + state.messageList.length.toString()
        const newMessage = { key, type, content, duration }
        messageApi.open({
            key,
            type,
            duration,
            content: type === 'error' ? <span><span style={{ marginRight: '15px' }}>{content}</span><CloseOutlined onClick={() => { messageApi.destroy(key) }} /></span> : content
        });
        setState({
            type: "updateMessageList",
            payload: {
                messageList: [...state.messageList, newMessage]
            }
        })
    }

    return state.tableStack.length > 0 ?
        // 数据表页面
        <div className='db_table'>
            {/* 消息框框 */}
            {messageContextHolder}
            {/* 提示框 */}
            {notificationContextHolder}
            <Modal
                title={state.modalView.type === 'edit' ? "修改记录" : "新增记录"}
                footer={false}
                // style={{height: "500px",overflow: "auto" }}
                open={state.modalView?.showFlag}
                onCancel={() => setState({ type: 'changeModalView', payload: { modalView: { ...state.modalView, showFlag: false } } })}
            >
                <div style={{ height: '400px', overflow: "auto" }}>

                    <Form
                        form={activeRowForm}
                        // layout="vertical"
                        name="form_in_modal"
                        labelCol={{ span: 8 }}
                        wrapperCol={{ span: 15 }}
                        onFinish={onFormFinish}
                    // initialValues={getActiveTabHandle()?.activeRowData}
                    >
                        {/* <p>{JSON.stringify(getActiveTabHandle()?.activeRowData)}</p> */}
                        {
                            // getActiveTabHandle()?.activeRowData.map((item: any, index: number) => {
                            //     // console.log(item);
                            //     return <Form.Item
                            //         name={item.label}
                            //         label={item.label}
                            //         key={"form_item_" + index.toString()}
                            //     // rules={[{ required: true, message: 'Please input the title of collection!' }]}
                            //     >
                            //         <Input value={item.value}/>
                            //         {/* <span>{item.value}</span> */}
                            //     </Form.Item>
                            // })

                            getActiveTabHandle()?.tableColumns.map((item: any, index: number) => {
                                // console.log(item);
                                return <Form.Item
                                    name={item.title}
                                    label={item.title}
                                    key={"form_item_" + index.toString()}
                                // rules={[{ required: true, message: 'Please input the title of collection!' }]}
                                >
                                    {/* <Input/> */}
                                    <Input.TextArea
                                        autoSize={{ minRows: 1, maxRows: 4 }}
                                    />
                                    {/* <span>{activeCurrentRowHandle()[item.title]}</span> */}
                                </Form.Item>
                            })
                        }
                        {/* <Form.Item> */}
                        <Button shape="round" block={true} type="primary" htmlType="submit">{state.modalView.type === 'edit' ? '修改' : '新增'}</Button>
                        {/* </Form.Item> */}
                    </Form>
                </div>

            </Modal>
            <Row className='tab_header' align='middle'>
                <Col span={16}>
                    <Row align='middle'>
                        <Col>
                            <Avatar className='table_avatar' src={<img src={plantImg} alt='表格' />} shape="square" size={50} />
                        </Col>
                        <Col>
                            <p className='header_title'>
                                <Tag className='title_db_name' color="#108ee9">{state.activeTableData?.dbName}</Tag>
                                {/* <span className='title_db_name'>{state.activeData?.dbName}</span> */}
                                <span className='title_table_name'>{state.activeTableData?.tableName}</span>
                            </p>
                        </Col>
                    </Row>
                </Col>
                <Col span={8}>
                    {/* <Button onClick={addTable}>新建查询</Button> */}
                    <Button>编辑表结构</Button>
                </Col>
            </Row>
            <Tabs
                className='tab_box'
                hideAdd
                type="editable-card"
                onChange={onTabChange}
                activeKey={state.activeTableKey}
                onEdit={onTabEdit}
                items={state.tableStack} />
            <div>
                {
                    getActiveTabHandle()?.newQuerySQL && <div className='sql_editor'>
                        <SQLMonacoEditor
                            editorReadOnly={true}
                            value={getActiveTabHandle()?.QuerySQL}
                            hintData={hintDBData}
                        />
                    </div>
                }
                <Table
                    key={state.activeTableKey}
                    pagination={{
                        pageSize: 100
                    }}
                    rowSelection={{
                        hideSelectAll: true,
                        type: 'radio',
                        fixed: true,
                        selectedRowKeys: getActiveTabHandle()?.activeRowIndex,
                        onChange: (keys, row) => {
                            activeCurrentRow(keys, row[0])
                        },
                        // onSelect: (record, selected, selectedRows, nativeEvent) =>{console.log(record, selected, selectedRows, nativeEvent)}
                    }}
                    onRow={(record) => {
                        return {
                            onClick: (event) => {
                                activeCurrentRow([record.key], record)
                            },
                            //   onDoubleClick: (event) => {},
                            // onContextMenu: (event) => {
                            //     event.preventDefault()
                            //     console.log('onContextMenu', event)
                            //     setState({ type: 'changeShowRightMenu', payload: { rightClickMenuBar: { showMenu: true, X: event.pageX, Y: event.pageY } } })
                            // },
                            //   onMouseEnter: (event) => {}, // 鼠标移入行
                            //   onMouseLeave: (event) => {},
                        };
                    }}
                    scroll={{ x: 'max-content', y: 300 }}
                    size="small"
                    bordered
                    columns={getActiveTabHandle()?.tableColumns}
                    dataSource={getActiveTabHandle()?.tableData} />
            </div>

            {/* <p>{JSON.stringify(state.tableStack?.find(item=>{return item.key === state.activeTableKey})?.activeRowIndex)}</p> */}
            <div className='table_footer'>
                <div className='operation_box'>
                    <Space wrap>
                        <Button type="primary" shape="round" icon={<EditOutlined />} size='small' onClick={editRecordBtnEvent}>修改记录</Button>
                        <Button type="primary" shape="round" icon={<PlusCircleOutlined />} size='small' onClick={addRecordBtnEvent}>新增记录</Button>
                        <Button type="primary" shape="round" icon={<MinusCircleOutlined />} size='small'>删除记录</Button>
                        <Button type="primary" shape="round" icon={<RedoOutlined />} size='small'>刷新</Button>
                    </Space>
                </div>
                <div className='query_SQL_box'>{getActiveTabHandle()?.QuerySQL}</div>
            </div>
        </div>
        :
        // 欢迎界面
        <div style={{ padding: "20px" }}>
            <Row style={{ padding: "20px 0" }}>
                <Col span={16}>
                    <Avatar className='table_avatar' src={<img src={plantImg} alt='欢迎！' />} shape="square" size={50} />

                    <span>欢迎您的使用</span>
                </Col>
                <Col span={8}>
                    {/* <Button onClick={addTable}>新建查询</Button> */}
                </Col>
            </Row>
            <p>你可以通过选中左侧菜单来进行操作你的数据库。</p>
        </div>
})
export default ShowDBTable

// 导出DBTable的定义信息
export type {
    DBTable
}