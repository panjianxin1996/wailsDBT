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
        tableObjectArray: [],
        activeTableIndex: 0,
        // tableListKeyIndex: 0,
        activeTableKey: '',
        activeTableData: {},
        // tableColumns: [],
        // tableData: [],
        modalView: {
            type: '',
            showFlag: false
        },
        messageList: [],
    }

    const [state, setState] = useReducer(dbReducer, initalState);
    const [activeRowForm] = Form.useForm();
    const [messageApi, messageContextHolder] = message.useMessage();
    const [notificationApi, notificationContextHolder] = notification.useNotification();

    useImperativeHandle(
        ref,
        () => ({ CreateTable, state })
    )

    /**
     * 暴露创建tab的方法
     * @param dbName 数据库名
     * @param tableName 表名
     * @param newQuerySQL 是否自定义sql语句flag boolean
     * @param querySQLStr 自定义sql语句
     * @returns void
     */
    function CreateTable(dbName: string, tableName: string, newQuerySQL: boolean = false, querySQLStr: string):void {
        if (!dbName || !tableName) {
            return
        }
        let checkIndex: number = state.tableObjectArray.findIndex((item: any) => {
            return (item.dbName === dbName && item.tableName === tableName)
        })
        checkIndex === -1 ? initTable(dbName, tableName, newQuerySQL, querySQLStr) : onTabChange(state.tableObjectArray[checkIndex].key)


    }

    /**
     * 初始化tab 并添加到表对象数组中
     * @param dbName 库名
     * @param tableName 表名
     * @param newQuerySQL 是否为自定义sql标识 type:boolean
     * @param querySQLStr 查询的语句
     * @returns void
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
            // 给table数据设置key值
            const tableData = tableDataSource.map((item: any, index: number) => {
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

            const primaryKeyData = tableColumnsSource.filter((item: DBTable.TableDataItem) => item.Key === 'PRI')

            setState({
                type: 'updateMutiData',
                payload: {
                    // 更新表格表对象数组数据
                    tableObjectArray: [
                        ...state.tableObjectArray,
                        newTab
                    ],
                    // 更新表格索引
                    activeTableIndex: state.activeTableIndex + 1,
                    // // 更新选中表格索引
                    activeTableKey,
                    // 更新当前表格头部内容 [!废弃] 2023-4-27
                    // tableColumns,
                    // 更新当前表格内容 [!废弃] 2023-4-27
                    // tableData,
                    activeTableData: {
                        dbName,
                        tableName,
                        primaryKeyData
                    }
                }
            })

        })

    }

    /**
     * 更新表对象数组内指定选中key的表数据 使用直接通过querySQL重新查询数据并更新到指定key的表对象数组中
     * @param needUpdateKey 需要更新的表表对象数组
     * @returns void
     */
    function updateStackTableData(needUpdateKey: string) :void {
        // 查询出制定key的表对象数组中数据
        let updateStackKeyHandle = state.tableObjectArray.find(item => {
            return item.key === needUpdateKey
        })
        // 创建指令请求对象
        let reqData: RequestGo.RequestGoData[] = [
            {
                operType: operationTypes.DB_OPERATION,
                connDBId,
                data: {
                    type: dbOperationTypes.CUSTOM_SQL,
                    customSQL: updateStackKeyHandle?.QuerySQL
                }
            },
        ]
        requestGoCommon(reqData).then(responseList => {
            const [ tableResData ] = responseList
            // 给数据指定key值
            const tableData = tableResData.map((item: any, index: number) => {
                return { ...item, key: index }
            })
            // 修改合并数据
            const renewtableObjectArray = state.tableObjectArray.map(item=>{
                if (item.key === needUpdateKey) {
                    return {
                        ...item,
                        tableDataSource: tableResData,
                        tableData
                    }
                } else {
                    return item;
                }
            })
            // 更新数据
            setState({
                type: 'updateTableData',
                payload: {
                    tableObjectArray: renewtableObjectArray
                }
            })
        })
    }

    /**
     * useReducer dispath集合 主要涉及state里面内容的操作，包括增删改
     * @param state 源数据
     * @param action 操作以及数据
     * @returns DBTable.State
     */
    function dbReducer(state: DBTable.State, action: DBTable.DBReducerAction): DBTable.State {
        switch (action.type) {
            case "updateMutiData": // 更新多个数据 即在创建表标签栏时需要初始化、插入、修改多个数据
                return {
                    ...state,
                    // tableColumns: action.payload.tableColumns,[!废弃] 2023-4-27
                    // tableData: action.payload.tableData,[!废弃] 2023-4-27
                    tableObjectArray: action.payload.tableObjectArray,
                    activeTableIndex: action.payload.activeTableIndex,
                    activeTableKey: action.payload.activeTableKey,
                    activeTableData: action.payload.activeTableData
                }
            case "switchActiveTableKey": // 更新选中tab的key值，切换等事件中需要使用
                return {
                    ...state,
                    activeTableKey: action.payload.activeTableKey
                }
            case "deletetableObjectArray": // 删除站
                return {
                    ...state,
                    tableObjectArray: action.payload.tableObjectArray
                }
            case "updateActiveData":
                return {
                    ...state,
                    activeTableData: action.payload.activeTableData
                }
            case "changeModalView":
                return {
                    ...state,
                    modalView: action.payload.modalView
                }
            case "updateTableData": // 更新tab表对象数组中的数据
                return {
                    ...state,
                    tableObjectArray: action.payload.tableObjectArray
                }
            // case "updateTableListKeyIndex":
            //     return {
            //         ...state,
            //         tableListKeyIndex: action.payload.tableListKeyIndex
            //     }
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
     * tabs切换事件，切换之后需要修改切换key和选中tab的数据，例如库名、表名、表主键集
     * @param tabKey 
     * @returns void
     */
    function onTabChange(tabKey: string):void {
        // 更新选中tab名
        setState({
            type: 'switchActiveTableKey',
            payload: {
                activeTableKey: tabKey
            }
        })
        // console.log(state.tableObjectArray.find((item: any) => { return item.key === tabKey }))
        let primaryKeyData = state.tableObjectArray.find((item: any) => { return item.key === tabKey })?.tableColumnsSource.filter(item => { return item.Key === 'PRI' })
        // 更新选中数据库名和表格名
        setState({
            type: 'updateActiveData',
            payload: {
                activeTableData: {
                    dbName: state.tableObjectArray.find((item: any) => { return item.key === tabKey })?.dbName,
                    tableName: state.tableObjectArray.find((item: any) => { return item.key === tabKey })?.tableName,
                    primaryKeyData
                }
            }
        })
    }

    /**
     * 操作tabs事件,目前只有操作删除
     * @param targetKey 
     * @param action 
     * @returns void
     */
    function onTabEdit(targetKey: any, action: any):void {
        const newtableObjectArray = state.tableObjectArray.filter((item: DBTable.tableObject) => {
            return item.key !== targetKey
        })
        switch (action) {
            case "remove":
                setState({
                    type: 'deletetableObjectArray',
                    payload: {
                        tableObjectArray: newtableObjectArray
                    }
                })
                state.tableObjectArray.length > 0 && onTabChange(state.tableObjectArray[0].key)
                break
        }
        // console.log(targetKey,action)
    }

    /**
     * 获取当前选中tab框的handle
     * @returns DBTable.tableObjectArray
     */
    function getActiveTabHandle(): DBTable.tableObject | undefined {
        return state.tableObjectArray.find(item => {
            return item.key === state.activeTableKey
        })
    }

    /**
     * 选中表格当前行操作
     * @param rowIds 
     * @returns void
     */
    function activeCurrentRow(rowIds: React.Key[], rowData: DBTable.TableDataItem):void {
        let activeRowData = rowData
        // console.log(activeRowData)
        let newtableObjectArray = state.tableObjectArray.map(item => {
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
            type: 'deletetableObjectArray',
            payload: {
                tableObjectArray: newtableObjectArray
            }
        })
    }

    // [!废弃] 2023-4-26
    function activeCurrentRowHandle() {
        let tabHandle = getActiveTabHandle()
        console.log(tabHandle?.tableData.find(item => {
            return item.key === tabHandle?.activeRowIndex[0]
        }))
        return tabHandle?.tableData.find(item => {
            return item.key === tabHandle?.activeRowIndex[0]
        }) || {}
    }

    /**
     * 编辑一行按钮事件
     * @returns void
     */
    function editRecordBtnEvent():void {
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
        toggleModalViewEvent('edit')
    }

    /**
     * 添加一行按钮事件
     */
    function addRecordBtnEvent() {
        activeRowForm.resetFields()
        toggleModalViewEvent('add')
    }

    /**
     * 可显示或隐式关闭modal框
     */
    function toggleModalViewEvent (type?: string) {
        let modalView = {
            type: type? type: state.modalView.type,
            showFlag: !state.modalView.showFlag
        }
        setState({ type: 'changeModalView', payload: { modalView } })
    }

    /**
     * 刷新当前数据表内容
     */
    function reloadCurrentTableBtnEvent () {
        updateStackTableData(state.activeTableKey as string)
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
        let tmptableObjectArray = state.tableObjectArray.map(item => {
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
                tableObjectArray: tmptableObjectArray
            }
        })
        // console.log(tmpTableDataSource,tmpTableData)
    }

    // [!废弃] 2023-4-26
    // function addTableData(dbData: { formData?: any; insertId: any; dbName: any; tableName: any; PRILIST: any }) {
    //     const { tableDataSource, tableData } = getActiveTabHandle() || {}
    //     /**
    //      * 没有插入id意思是数据库表中没有主键或者主键没有设置自增 这里就需要判断为静默插入成功 并直接将前端数据插入表中
    //      */
    //     if (dbData.insertId === 0) {
    //         let tmpTableDataSource = tableDataSource?.concat(dbData.formData)
    //         let tmpTableData = tableData?.concat({ key: state.tableListKeyIndex, ...dbData.formData })
    //         let tmptableObjectArray = state.tableObjectArray.map(item => {
    //             if (item.key === state.activeTableKey) {
    //                 return {
    //                     ...item,
    //                     tableDataSource: tmpTableDataSource,
    //                     tableData: tmpTableData,
    //                     // activeRowData: formData 新增不需要设置更新选中行数据
    //                 }
    //             } else {
    //                 return item
    //             }
    
    //         })
    //         setState({
    //             type: 'updateTableData',
    //             payload: {
    //                 tableObjectArray: tmptableObjectArray
    //             }
    //         })
    //     } else {
    //         /**
    //          * 需要重新请求数据库内容 因为有可能主键等内容没有输入 数据库会按照默认值自动生成 此处并不知道默认值为什么所以需要重新请求数据库获取新增一行的内容
    //          */
    //         const QuerySQL = `SELECT * FROM ${dbData.dbName}.${dbData.tableName} WHERE ${dbData.PRILIST.join(' AND ')}`
    //         console.log(QuerySQL)
    //         let reqData: RequestGo.RequestGoData[] = [
    //             {
    //                 operType: operationTypes.DB_OPERATION,
    //                 connDBId,
    //                 data: {
    //                     type: dbOperationTypes.CUSTOM_SQL,
    //                     customSQL: QuerySQL
    //                 }
    //             },
    //         ]
    //         requestGoCommon(reqData).then(responseList => {
    //             const [insertRowList] = responseList
    //             const insertRowData = insertRowList[0]
    //             let tmpTableDataSource = tableDataSource?.concat(insertRowData)
    //             let tmpTableData = tableData?.concat({ key: state.tableListKeyIndex, ...insertRowData })
    //             // 更新表对象数组中激活选中表的数据
    //             let tmptableObjectArray = state.tableObjectArray.map(item => {
    //                 if (item.key === state.activeTableKey) {
    //                     return {
    //                         ...item,
    //                         tableDataSource: tmpTableDataSource,
    //                         tableData: tmpTableData
    //                         // activeRowData: insertRowData 新增不需要设置更新选中行数据
    //                     }
    //                 } else {
    //                     return item
    //                 }

    //             })
    //             setState({
    //                 type: 'updateTableData',
    //                 payload: {
    //                     tableObjectArray: tmptableObjectArray
    //                 }
    //             })
    //             setState({
    //                 type: 'updateTableListKeyIndex',
    //                 payload: {
    //                     tableListKeyIndex: state.tableListKeyIndex + 1
    //                 }
    //             })
    //         })
    //     }


    // }

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
        // 获取主键名和主键内容拼接 多主键问题
        const PRILIST = state.activeTableData.primaryKeyData?.map((item:any)=>{
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
            // console.log(backData)
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
        const PRILIST = state.activeTableData.primaryKeyData?.map((item:any)=>{
            return `${item.Field}='${getActiveTabHandle()?.activeRowData[item.Field]}'`
        })
        // console.log(PRILIST)
        // console.log(formData)
        // console.log(Object.keys(formData))
        const tableKeys = Object.keys(formData).join(',')
        const tableRowData = Object.values(formData).map(item => {
            return item === undefined ? 'null' : `'${item}'`
        }).join(',')
        // console.log(Object.values(formData))
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
            // console.log(backData)
            if (backData.code === 1) {
                addMessage({
                    type: 'success',
                    content: `记录修改成功！影响行数${backData.affectCount}`,
                })
                console.log(backData)
                updateStackTableData(state.activeTableKey as string)
                // 更新表格
                // addTableData({ formData, insertId: backData.insertId, dbName, tableName, PRILIST:backData.insertId })
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
     * 封装管理新增消息到消息列表中并弹出消息框
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

    return state.tableObjectArray.length > 0 ?
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
                onCancel={() => {toggleModalViewEvent()}}
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
                        {
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
                        <Button shape="round" block={true} type="primary" htmlType="submit">{state.modalView.type === 'edit' ? '修改' : '新增'}</Button>
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
            {/* 表标签页 */}
            <Tabs
                className='tab_box'
                hideAdd
                type="editable-card"
                onChange={onTabChange}
                activeKey={state.activeTableKey}
                onEdit={onTabEdit}
                items={state.tableObjectArray} />
            {/* 表格和输入框 当为自定义输入内容时才展示输入框 */}
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
                        pageSize: 100 // 设置表最多展示100行
                    }}
                    rowSelection={{ // 展示表前选择框
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
                            onClick: (event) => { // 给每一行的数据进行绑定去修改选中内容 方便进行数据操作
                                activeCurrentRow([record.key], record)
                            },
                            //  onDoubleClick: (event) => {},
                            //  onContextMenu: (event) => {},
                            //  onMouseEnter: (event) => {}, // 鼠标移入行
                            //  onMouseLeave: (event) => {},
                        };
                    }}
                    scroll={{ x: 'max-content', y: 300 }}
                    size="small"
                    bordered
                    columns={getActiveTabHandle()?.tableColumns}
                    dataSource={getActiveTabHandle()?.tableData} />
            </div>
            {/* 底部操作栏 */}
            <div className='table_footer'>
                <div className='operation_box'>
                    <Space wrap>
                        <Button type="primary" shape="round" icon={<EditOutlined />} size='small' onClick={editRecordBtnEvent}>修改记录</Button>
                        <Button type="primary" shape="round" icon={<PlusCircleOutlined />} size='small' onClick={addRecordBtnEvent}>新增记录</Button>
                        <Button type="primary" shape="round" icon={<MinusCircleOutlined />} size='small'>删除记录</Button>
                        <Button type="primary" shape="round" icon={<RedoOutlined />} size='small' onClick={reloadCurrentTableBtnEvent}>刷新</Button>
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