import React, { useEffect, useReducer, useState } from 'react'
import { Col, Row, Input, Button, Table, Modal, Form } from 'antd'
import { ColumnsType } from 'antd/es/table'
import { useForm } from 'antd/es/form/Form'
const shopArr = [
    { id: 1, name: '好物', code: '213w12d1' },
    { id: 2, name: '得物', code: '3f123f123' },
    { id: 3, name: '有物', code: '54g353' },
    { id: 4, name: '美物', code: 'h45h6454' },
]

interface ReducerAction {
    type: string;
    payload: number| string;
}

const ShopList: React.FC = () => {
    const [state,setState] = useReducer(stateReducer, {name: 'text',age: 18, sex: 1, dataObj: {}})
    const [searchTxt, SetSearchTxt] = useState<string>('')
    const [tableList, setTableList] = useState<any>(shopArr)
    const [showModal,setShowModal] = useState<boolean>(false)
    const [searchList,setSearchList] = useState<any>([])
    const [form] = useForm()

    function stateReducer (state:any, action: ReducerAction) {
        console.log('被执行了！')
        switch (action.type) {
            case "setName":
                return {...state,name: action.payload}
            case "setDataObj":
                return {...state,dataObj: action.payload}
            default:
                return state
        }
    }

    const tableColums:ColumnsType<any> = [
        {
            title: '名字',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: '订单类型',
            dataIndex: 'code',
            key: 'code',
        },
        {
            title: '操作',
            dataIndex: '',
            key: '',
            render: (text,record,index) => <Button onClick={()=>{delCurrentData(index)}}>删除</Button>
        }
    ]

    function addGoodShowModal () {
        setShowModal(true)
    }

    function delCurrentData (delIndex:number) {
        // console.log(i)
        setTableList(tableList.filter((item: any,i: any)=>{
            return delIndex!=i
        }))
    }

    function finishedInputEvent (val:any) {
        setTableList([...tableList,{id: 1,name: val.name,code:val.code}])
        console.log(val)
        // form.getFieldsValue([],()=>{})
    }

    function closeModal () {
        setShowModal(false)
    }

    function onSearchEvent (val:string) {
        // console.log(val)
        setSearchList(tableList.filter((item:any)=>{
            // console.log(item.code)
            return item.code.toLowerCase().indexOf(val.trim())!==-1
        }))
    }

    function onChangeName (e: React.ChangeEvent<HTMLInputElement>) {
        const {value: inputValue} = e.target;
        // console.log(inputValue)
        setState({
            type: 'setName',
            payload: inputValue
        })
    }

    function clickEvent () {
        let tmpObj:any = {}
        setTimeout(()=>{
            ['data','data2','data2','data2','data2','data2','data2'].forEach(item=>{
                tmpObj[item] = []
                setTimeout(()=>{
                    tmpObj[item] = [1,2,3,4]
                    setState({
                        type: 'setDataObj',
                        payload: tmpObj
                    })
                },100)
            })
        },100)
        
        
    }

    useEffect(()=>{
        // setState({
        //     type: 'setName',
        //     payload: 'new Text'
        // })
    },[])

    return <>
            <Input onChange={onChangeName}></Input><Button onClick={clickEvent}></Button>
            <h1>{state.name}</h1>
            <h1>{JSON.stringify(state.dataObj)}</h1>
            <Row>
                <Col span={8}>
                    <Input.Search placeholder='请输入查询条件' onSearch={onSearchEvent} enterButton></Input.Search>
                </Col>
                <Col span={8}>
                    <Button onClick={addGoodShowModal}>添加</Button>
                </Col>
            </Row>
            <Table columns={tableColums} dataSource={searchList.length > 0 ? searchList : tableList}></Table>
            <Modal title="新增" open={showModal} onCancel={closeModal} footer={false}>
                <Form form={form} onFinish={finishedInputEvent}>
                    <Form.Item name="name" label="请输入新增名称">
                        <Input placeholder='请输入名称'></Input>
                    </Form.Item>
                    <Form.Item name="code" label="请输入新增类型">
                        <Input placeholder='请输入类型'></Input>
                    </Form.Item>
                    <Form.Item>
                        <Button htmlType='submit'>确定</Button>
                    </Form.Item>
                </Form>
            </Modal>
        

    </>
}
export default ShopList