import { Button, Checkbox, Form, Input, Modal, Popconfirm, Select, Space, Table, Tooltip, Typography } from 'antd';
import React, { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import {
    CheckOutlined,
    CloseOutlined,
    RollbackOutlined,
    SaveOutlined

} from '@ant-design/icons'
import type { DBTabStructure } from './DBTableStructureModal';
import { useForm } from 'antd/es/form/Form';
import { requestGoCommon, operationTypes, dbOperationTypes, RequestGo,formatSQLSpecialChar } from '../../../utils/index'
import './index.scss';
const DBTableStructureModal = forwardRef<DBTabStructure.DBTabStructureRef, DBTabStructure.Props>((props, ref) => {
    // console.log(props)
    const { structureData, structureInfo, connDBId, UpdateTableStructureData, AddMessage } = props;
    const {dbName,tableName} = structureInfo;
    const tableNameSQLStr = `${formatSQLSpecialChar(dbName!)}.${formatSQLSpecialChar(tableName!)}`;
    const [showModal, setShowModal] = useState<boolean>(false);
    const [editIndex, setEditIndex] = useState<number>(-1);
    const [editRowData, setEditRowData] = useState<any>({});
    // const [createRowFlag, setCreateRowFlag] = useState(false);
    const structureColumns = [
        {
            title: '字段名',
            dataIndex: "Field",
            key: "Field",
            render: (text: any, record: any, index: number) => {
                // console.log(editIndex, index)
                // console.log(text,record,index)
                return (
                    // <Form.Item name={['table', index, "Field"]}>
                        // {
                            editIndex !== index ? <span>{text}</span> : <Input readOnly={editIndex !== index} placeholder="" value={editRowData['Field']} onChange={(e) => onChangeEvent(index, "Field", e.target.value)} />
                        // }

                    // </Form.Item>
                )
            }
        },
        {
            title: '类型',
            dataIndex: "Type",
            key: "Type",
            render: (text: any, record: any, index: number) => {
                return (
                    // <Form.Item name={['table', index, "Type"]}>
                    //     {
                            editIndex !== index ? <span>{text}</span> : <Input readOnly={editIndex !== index} placeholder="" value={editRowData['Type']} onChange={(e) => onChangeEvent(index, "Type", e.target.value)} />
                    //     }
                    // </Form.Item>
                )
            }
        },
        {
            title: '不为空',
            dataIndex: "Null",
            key: "Null",
            render: (text: any, record: any, index: number) => {
                return (
                    // <Form.Item name={['table', index, "Null"]}>
                        <Checkbox disabled={editIndex !== index} onChange={() => onChangeEvent(index, "Null", editRowData['Null'] === "NO" ? "YES" : "NO")} checked={(editIndex !== index ? text : editRowData['Null']) === "NO"}></Checkbox>
                        
                    // </Form.Item>
                )
            }
        },
        {
            title: '主键',
            dataIndex: "Key",
            key: "Key",
            render: (text: any, record: any, index: number) => {
                return (
                    // <Form.Item name={['table', index, "Key"]}>
                        <Checkbox disabled={editIndex !== index} onChange={() => onChangeEvent(index, "Key", editRowData['Key'] === "PRI" ? "" : "PRI")} checked={(editIndex !== index ? text : editRowData['Key']) === "PRI"}>🔑</Checkbox>
                    // </Form.Item>
                )
            }
        },
        {
            title: '额外',
            dataIndex: "Extra",
            key: "Extra",
            render: (text: any, record: any, index: number) => {
                return (
                    // <Form.Item name={['table', index, "Extra"]}>
                        <Checkbox disabled={editIndex !== index} onChange={() => onChangeEvent(index, "Extra", editRowData['Extra'] === "auto_increment" ? "" : "auto_increment")} checked={(editIndex !== index ? text : editRowData['Extra']) === "auto_increment"}>自增</Checkbox>
                       
                    // </Form.Item>
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
    const [structureForm] = useForm();
    useImperativeHandle(ref, () => ({
        ToggleModalEvent,
    }))


    // console.log(readyStructureData)

    useEffect(() => {
        setReadyStructureData(structureData)
        structureForm.setFieldsValue({
            table: structureData
        })
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

    function ToggleModalEvent(): void {
        // 每次进入需要重新设置表单里面的数据
        structureForm.setFieldsValue({
            table: structureData
        })
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
        structureForm.setFieldsValue({
            table: readyStructureData
        });
    }

    function onEditConfirm(): void {
        // console.log("编辑！")
        // const { dbName, tableName, } = structureInfo
        // console.log(readyStructureData[editIndex], editRowData)
        // const updateSQL = `ALTER TABLE ${dbName}.${tableName} RENAME COLUMN ${readyStructureData[editIndex].Field} TO ${editRowData.Field}`
        // change语句：ALTER TABLE 表名 CHANGE 字段名 新字段名 新字段属性
        const updateSQL = `ALTER TABLE ${tableNameSQLStr} CHANGE ${formatSQLSpecialChar(readyStructureData[editIndex].Field)} ${formatSQLSpecialChar(editRowData.Field)} ${editRowData.Type} ${editRowData.Key === 'PRI' ? 'PRIMARY KEY' : ''} ${editRowData.Null === 'NO' ? 'NOT NULL' : 'NULL'} ${editRowData.Extra}`
        // console.log(updateSQL)

        let reqData: RequestGo.RequestGoData[] = [{
            operType: operationTypes.DB_OPERATION,
            connDBId,
            data: {
                type: dbOperationTypes.EXEC_SQL,
                execSQL: updateSQL
            }
        }]

        requestGoCommon(reqData).then(responseList => {
            // console.log(responseList)
            const [backData] = responseList;
            if (backData.code === 1) { // 执行成功触发父组件事件重新获取表结构
                // UpdateTableStructureData
                UpdateTableStructureData();
                AddMessage({
                    type: 'success',
                    duration: 1,
                    content: `修改字段成功`,
                })
            } else {
                AddMessage({
                    type: 'error',
                    duration: 0,
                    content: backData.errorMsg,
                })
            }
        })
    }

    function onDelConfirm(): void {
        // console.log('删除')
        // const { dbName, tableName, } = structureInfo
        console.log(readyStructureData[editIndex], editRowData)
        const updateSQL = `ALTER TABLE ${tableNameSQLStr} DROP COLUMN ${formatSQLSpecialChar(readyStructureData[editIndex].Field)}`
        // console.log(updateSQL)

        let reqData: RequestGo.RequestGoData[] = [{
            operType: operationTypes.DB_OPERATION,
            connDBId,
            data: {
                type: dbOperationTypes.EXEC_SQL,
                execSQL: updateSQL
            }
        }]

        requestGoCommon(reqData).then(responseList => {
            // console.log(responseList)
            const [backData] = responseList;
            if (backData.code === 1) { // 执行成功触发父组件事件重新获取表结构
                // UpdateTableStructureData
                setEditIndex(-1);
                UpdateTableStructureData();
                AddMessage({
                    type: 'success',
                    duration: 1,
                    content: `删除字段成功`,
                })
            } else {
                AddMessage({
                    type: 'error',
                    duration: 0,
                    content: backData.errorMsg,
                })
            }
        })
    }

    // function onChangeInputEvent (e) {

    // }

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

    function newCreateRowEvent() {
        // setCreateRowFlag(true);

        let newStructureData = [...readyStructureData, { Default: "", Extra: '', Field: '', Key: '', Null: 'YES', Type: '',__new__: true }]
        setReadyStructureData(newStructureData);
        setEditRowData({ Default: "", Extra: '', Field: '', Key: '', Null: 'YES', Type: '',__new__: true })
        structureForm.setFieldsValue({
            table: newStructureData
        })
        setEditIndex(readyStructureData.length);
    }

    function createTabColEvent () {
        console.log(editRowData)
        // const { dbName, tableName, } = structureInfo
        console.log(readyStructureData[editIndex], editRowData)
        // const updateSQL = `ALTER TABLE ${dbName}.${tableName} RENAME COLUMN ${readyStructureData[editIndex].Field} TO ${editRowData.Field}`
        // change语句：ALTER TABLE 表名 CHANGE 字段名 新字段名 新字段属性
        const updateSQL = `ALTER TABLE ${tableNameSQLStr} ADD ${formatSQLSpecialChar(editRowData.Field)} ${editRowData.Type} ${editRowData.Key === 'PRI' ? 'PRIMARY KEY' : ''} ${editRowData.Null === 'NO' ? 'NOT NULL' : 'NULL'} ${editRowData.Extra}`
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
            // console.log(responseList)
            const [backData] = responseList;
            if (backData.code === 1) { // 执行成功触发父组件事件重新获取表结构
                // UpdateTableStructureData
                UpdateTableStructureData();
                AddMessage({
                    type: 'success',
                    duration: 1,
                    content: `新增字段成功`,
                })
                setEditIndex(-1);
            } else {
                AddMessage({
                    type: 'error',
                    duration: 0,
                    content: backData.errorMsg,
                })
            }
        })
    }

    /**
     * 逻辑上的删除，并不需要修改数据库数据
     */
    function delNewTabColEvent () {
        console.log(readyStructureData)
        const newReadyStructureData = readyStructureData.filter((item:any)=>{return !item.__new__})
        setReadyStructureData(newReadyStructureData)
        structureForm.setFieldsValue({
            table: newReadyStructureData
        })
    }

    function onFinishEvent(values: any): void {
        console.log(values)
        console.log(editRowData)
    }

    return <Modal width="1000px" title='表结构' open={showModal} onCancel={ToggleModalEvent} footer={false}>
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
            <p>{JSON.stringify(readyStructureData)}</p>
            <p>{JSON.stringify(editRowData)}</p>
            {/* <Form.Item label=" " colon={false}>
                <Button type="primary" htmlType="submit">提交</Button>
            </Form.Item> */}
        {/* </Form> */}
    </Modal>
})

export default DBTableStructureModal

export type {
    DBTabStructure
}