import { Button, Checkbox, Form, Input, Modal, Popconfirm, Select, Space, Table, Tooltip, Typography } from 'antd';
import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import {
    CheckOutlined,
    CloseOutlined,
    RollbackOutlined,
    SaveOutlined

} from '@ant-design/icons'
import type { DBTabCreateTable } from './DBTableCreateTableModal';
import { useForm } from 'antd/es/form/Form';
import { requestGoCommon, operationTypes, dbOperationTypes, RequestGo, formatSQLSpecialChar } from '../../../../utils/index'
import {
    GoMysqlDataBase,
} from '../../../DBHome'
import './index.scss';
const DBTableCreateTableModal = forwardRef<DBTabCreateTable.DBTabCreateTableRef, DBTabCreateTable.Props>((props, ref) => {
    const { structureData, connDBId, AddMessage,RealoadData,databases } = props;
    // console.log(databases)
    // const { dbName, tableName } = structureInfo;
    const [activeDBName, setActiveDBName] = useState<string>();
    // const tableNameSQLStr = `${formatSQLSpecialChar(dbName!)}.${formatSQLSpecialChar(tableName!)}`;
    const [showModal, setShowModal] = useState<boolean>(false);
    const [editIndex, setEditIndex] = useState<number>(-1);
    const [editRowData, setEditRowData] = useState<any>({});
    const structureColumns = [
        {
            title: '字段名',
            dataIndex: "Field",
            key: "Field",
            render: (text: any, record: any, index: number) => {
                return (
                    editIndex !== index ? <span>{text}</span> : <Input readOnly={editIndex !== index} placeholder="" value={editRowData['Field']} onChange={(e) => onChangeEvent(index, "Field", e.target.value)} />
                )
            }
        },
        {
            title: '类型',
            dataIndex: "Type",
            key: "Type",
            render: (text: any, record: any, index: number) => {
                return (
                    editIndex !== index ? <span>{text}</span> : <Input readOnly={editIndex !== index} placeholder="" value={editRowData['Type']} onChange={(e) => onChangeEvent(index, "Type", e.target.value)} />
                )
            }
        },
        {
            title: '不为空',
            dataIndex: "Null",
            key: "Null",
            render: (text: any, record: any, index: number) => {
                return (
                    <Checkbox disabled={editIndex !== index} onChange={() => onChangeEvent(index, "Null", editRowData['Null'] === "NO" ? "YES" : "NO")} checked={(editIndex !== index ? text : editRowData['Null']) === "NO"}></Checkbox>
                )
            }
        },
        {
            title: '主键',
            dataIndex: "Key",
            key: "Key",
            render: (text: any, record: any, index: number) => {
                return (
                    <Checkbox disabled={editIndex !== index} onChange={() => onChangeEvent(index, "Key", editRowData['Key'] === "PRI" ? "" : "PRI")} checked={(editIndex !== index ? text : editRowData['Key']) === "PRI"}>🔑</Checkbox>
                )
            }
        },
        {
            title: '额外',
            dataIndex: "Extra",
            key: "Extra",
            render: (text: any, record: any, index: number) => {
                return (
                    <Checkbox disabled={editIndex !== index} onChange={() => onChangeEvent(index, "Extra", editRowData['Extra'] === "auto_increment" ? "" : "auto_increment")} checked={(editIndex !== index ? text : editRowData['Extra']) === "auto_increment"}>自增</Checkbox>
                )
            }
        },
        {
            title: '操作',
            dataIndex: "operation",
            // key: "Extra",
            render: (text: any, record: any, index: number) => {
                return (
                    editIndex === index ? (editRowData['__new__'] ? <Space>
                        <Tooltip title="保存" color="#108ee9">
                            <Button size="small" type="primary" shape='circle' onClick={createTabColEvent}><SaveOutlined /></Button>
                        </Tooltip>
                        <Tooltip title="删除" color="volcano">
                            <Button size="small" type="default" shape='circle' onClick={delNewTabColEvent}><CloseOutlined /></Button>
                        </Tooltip>
                    </Space>
                        : <Space size="middle">
                            <Popconfirm
                                title="修改此列信息"
                                description="该操作会修改该列的信息，你确定吗？"
                                onConfirm={onEditConfirm}
                                placement='bottom'
                            // onCancel={cancel}
                            >
                                <Tooltip title="修改此列信息" color="#108ee9">
                                    <Button size="small" type="primary" shape='circle'><CheckOutlined /></Button>
                                </Tooltip>
                            </Popconfirm>
                            <Popconfirm
                                title="删除该列"
                                description="该操作彻底删除该列，有可能造成数据、程序异常，你确定吗？"
                                onConfirm={onDelConfirm}
                                placement='bottom'
                            // onCancel={cancel}

                            >
                                <Tooltip title="删除该列" color="volcano">
                                    <Button size="small" type='default' shape='circle' danger><CloseOutlined /></Button>
                                </Tooltip>
                            </Popconfirm>
                            <Tooltip title="取消编辑" color="gray">
                                <Button size="small" type='default' shape='circle' onClick={() => { cancelEditEvent() }}><RollbackOutlined /></Button>
                            </Tooltip>
                        </Space>) : <Space>
                        <Button size="small" type='default' onClick={() => { activeEditEvent(index) }}>编辑</Button>
                    </Space>
                )
            }
        },
    ];
    const [readyStructureData, setReadyStructureData] = useState(structureData)
    // const [structureForm] = useForm();
    // const selectInput =useRef(null);
    const tabNameInput =useRef(null);
    useImperativeHandle(ref, () => ({
        ToggleModalEvent,
    }))


    // console.log(readyStructureData)

    useEffect(() => {
        setReadyStructureData(structureData)
        // structureForm.setFieldsValue({
        //     table: structureData
        // })
    }, [structureData])

    // useEffect(()=>{
    //     console.log(JSON.stringify(readyStructureData))
    //     structureForm.setFieldsValue({
    //         table: readyStructureData
    //     })
    //     // structureData.map((item:any)=>{
    //     //     return {
    //     //         title: item.Field,
    //     //         dataIndex: item.Field,
    //     //         key: item.Field,
    //     //         render: (text: any, record: any, index: number) => {
    //     //             return (
    //     //                 <Form.Item name={['table', item.Field]}>
    //     //                     <Input placeholder="" />
    //     //                 </Form.Item>
    //     //             )
    //     //         }
    //     //     }
    //     // })
    //     // setStructureColumns()
    // },[readyStructureData])

    /**
     * 暴露出对当前组件展示或隐藏的方法，用于显示或隐藏当前组件
     */
    function ToggleModalEvent(): void {
        // 每次进入需要重新设置表单里面的数据
        // structureForm.setFieldsValue({
        //     table: structureData
        // })
        setEditIndex(-1)
        setShowModal(!showModal)
    }

    /**
     * 开启编辑操作
     * @params index 编辑的行索引
     */
    function activeEditEvent(index: number): void {
        setEditIndex(index);
        setEditRowData(readyStructureData[index]);
    }

    /**
     * 取消编辑
     * 取消编辑的时候需要进行两个操作
     * 1.设置选中行为-1
     * 2.重置表单内未初始数据（因为没有做更改）
     */
    function cancelEditEvent(): void {
        // console.log('触发')
        setEditIndex(-1);
        // 取消修改后，需要重置原始表单数据
        // structureForm.setFieldsValue({
        //     table: readyStructureData
        // });
    }

    /**
     * 修改二次确认后的提交
     */
    function onEditConfirm(): void {
        const newReadyStructureData = readyStructureData.map((item:any,index:number)=>{
            if (index === editIndex) {
                const {__new__,...otherItem} = editRowData //去除掉__new__
                return otherItem
            } else {
                return item
            }
            
        })
        setReadyStructureData(newReadyStructureData);
        setEditIndex(-1);
    }

    /**
     * 删除二次确认后的提交
     */
    function onDelConfirm(): void {
        const newReadyStructureData = readyStructureData.filter((item: any,index:number) => { return index!==editIndex })
        setReadyStructureData(newReadyStructureData)
    }

    // function onChangeInputEvent (e) {

    // }

    /**
     * 修改选中需要修改行的数据 对应选中行数据editRowData
     * @param index 索引：未使用
     * @param key 键：对应的需要修改的键名
     * @param value 值：对应需要修改的值数据
     */
    function onChangeEvent(index: number, key: string, value: any): void {
        // console.log(key,value)
        let tmpItem = { ...editRowData }
        tmpItem[key] = value
        setEditRowData({
            ...tmpItem
        })
        // const newStructureData = readyStructureData.map((item:any,i:number)=>{
        //     if (index === i) {

        //         return tmpItem
        //     } else {
        //         return item
        //     }

        // })
        // console.log(newStructureData)
        // structureForm.setFieldsValue({table: newStructureData})
        // console.log(structureForm.getFieldValue('table'))
        // structureForm.setFieldValue('table',[{"Default":"","Extra":"auto_increment","Field":"test_id","Key":"PRI","Null":"YES","Type":"int(10) unsigned zerofill"},{"Default":"","Extra":"","Field":"t2_id","Key":"PRI","Null":"NO","Type":"int"},{"Default":"","Extra":"","Field":"name","Key":"","Null":"YES","Type":"varchar(255)"}])
    }

    /**
     * 在视图表中创建一行新数据用于给表中创建一行新列
     */
    function newCreateRowEvent() {
        // setCreateRowFlag(true);

        let newStructureData = [...readyStructureData, { Default: "", Extra: '', Field: '', Key: '', Null: 'YES', Type: '', __new__: true }]
        setReadyStructureData(newStructureData);
        setEditRowData({ Default: "", Extra: '', Field: '', Key: '', Null: 'YES', Type: '', __new__: true })
        // structureForm.setFieldsValue({
        //     table: newStructureData
        // })
        setEditIndex(readyStructureData.length);
    }

    /**
     * 创建表中一行新列
     */
    function createTabColEvent() {
        const newReadyStructureData = readyStructureData.map((item:any,index:number)=>{
            if (index === editIndex) {
                const {__new__,...otherItem} = editRowData //去除掉__new__
                return otherItem
            } else {
                return item
            }
            
        })
        setReadyStructureData(newReadyStructureData);
        setEditIndex(-1);
    }

    /**
     * 逻辑上的删除，并不需要修改数据库数据
     */
    function delNewTabColEvent() {
        const newReadyStructureData = readyStructureData.filter((item: any) => { return !item.__new__ })
        setReadyStructureData(newReadyStructureData)
        // structureForm.setFieldsValue({
        //     table: newReadyStructureData
        // })
    }

    // function onFinishEvent(values: any): void {
    //     console.log(values)
    //     console.log(editRowData)
    // }

    function selectDBEvent (value:string) {
        setActiveDBName(value)
    }

    /**
     * 更新表名组件
     * @returns React.ReactNode
     */
    function editTabNameNode():React.ReactNode {
        const selectList = databases?.map((item:GoMysqlDataBase)=>{
            return {value: item.Database,label: item.Database}
        })
        return <Space wrap>
            <span>数据库</span>
            <Select
            showSearch
            // ref={selectInput}
            // defaultValue="lucy"
            style={{ width: 120 }}
            onChange={selectDBEvent}
            options={selectList}
            filterOption={(input, option) =>
                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
            }
            />
            <span>表名</span>
            <Input ref={tabNameInput}></Input>
            {/* <Button type="primary" size="small" onClick={() => {editTabNameEvent()}}>确认</Button> */}
        </Space>
    }

    function addNewTableEvent ():void {
        console.log(readyStructureData)
        console.log(activeDBName)
        console.log((tabNameInput.current as any).input.value)
        const tableName = (tabNameInput.current as any).input.value
        if (!activeDBName || !tableName) {
            AddMessage({
                type: "warning",
                duration: 1,
                content: '请选择要添加表的数据库以及录入表名！',
            })
            return;
        }
        const dbAndTabName = `${formatSQLSpecialChar(activeDBName!)}.${formatSQLSpecialChar(tableName)}`
        const PRIList:string[] = []
        const fieldColList = readyStructureData.map((item:any)=>{
            if (item["Key"] === "PRI") PRIList.push(formatSQLSpecialChar(item["Field"]))
            return `${formatSQLSpecialChar(item["Field"])} ${item["Type"]} ${item['Null']==='YES'?'NULL':'NOT NULL'} ${item['Extra']==='auto_increment'?'auto_increment':''}`
        })
        const PRIStr = PRIList.length > 0 ? `,PRIMARY KEY (${PRIList.join(',')})`:''
        const createTableSQL = `CREATE TABLE ${dbAndTabName} (${fieldColList.join(',')} ${PRIStr})`
        console.log(createTableSQL)
        let reqData: RequestGo.RequestGoData[] = [{
            operType: operationTypes.DB_OPERATION,
            connDBId,
            data: {
                type: dbOperationTypes.EXEC_SQL,
                execSQL: createTableSQL
            }
        }]

        requestGoCommon(reqData).then(responseList => {
            // console.log(responseList)
            const [backData] = responseList
            if (backData.code === 1) {
                RealoadData()
                AddMessage({
                    type: 'success',
                    duration: 1,
                    content: '添加新表成功',
                })
                ToggleModalEvent()
            } else {
                AddMessage({
                    type: 'error',
                    duration: 0,
                    content: '添加新表失败了，请稍候重试:'+backData.errorMsg,
                })
            }
            
        })
    }

    return <Modal width="1000px" title={editTabNameNode()} open={showModal} onCancel={ToggleModalEvent} footer={false}>
        {/* <Form
            form={structureForm}
            onFinish={onFinishEvent}
            layout="vertical"
            style={{ height: '500px', overflow: 'auto' }}
        >
            <Form.Item name="table" valuePropName='dataSource'> */}
        <Table
            className='structure_table'
            columns={structureColumns}
            dataSource={readyStructureData}
            bordered
            pagination={false}
            footer={() => <p><Button block onClick={newCreateRowEvent}>新增一行新列</Button></p>} />
        {/* </Form.Item> */}
        {/* <p>{JSON.stringify(readyStructureData)}</p>
        <p>{JSON.stringify(editRowData)}</p> */}
        {/* <Form.Item label=" " colon={false}>
                <Button type="primary" htmlType="submit">提交</Button>
            </Form.Item> */}
        {/* </Form> */}
        <div className='btn_box'>
            <Button block type="primary" onClick={addNewTableEvent}>新增新表</Button>
        </div>        
    </Modal>
})

export default DBTableCreateTableModal

export type {
    DBTabCreateTable
}