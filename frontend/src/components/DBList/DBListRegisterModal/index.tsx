import React from "react"
import { Col, Modal, Row, Image, Form, Select, Space, Input, InputNumber, Button } from 'antd'
import { ProjectTwoTone} from '@ant-design/icons'
import {DBListCardProps} from '../DBListCard'
import addDBCover from '../../../assets/images/add_db_cover.png'
import './DBListRegisterModal.scss'


const DBListRegisterModal: React.FC<{modalWindowFlag: boolean,onOpenWindow: Function,onAddDataBase: Function}> = (props) => {
    const {modalWindowFlag,onOpenWindow,onAddDataBase} = props
    const [form] = Form.useForm();

    function onFinish(data:any) {
        console.log(data)
        // let sendData = {
        //     username: data.username,
        //     password: data.password,
        //     host: data.address.host,
        //     port: data.address.port
        // }
        let sendData:DBListCardProps = {
            dbName: data.dbName,
            dbContent: data.dbContent,
            dbType: data.dbType,
            username: data.username,
            password: data.password,
            host: data.address.host,
            port: data.address.port,
            type: 0,
            createDate: new Date().getTime()
        }
        onAddDataBase(sendData).then(()=>{
            onOpenWindow(false)
        })
        // addDataBase(sendData).then
        // GoConnectDB(JSON.stringify(sendData)).then(dbId=>{
        //     setModalWindow(false)
        //     setConnDB(dbId)
        // })
    }

    function onFinishFailed() {

    }
    return <Modal
        // title="Modal 1000px width"
        className="modal_box"
        centered
        open={modalWindowFlag}
        // onOk={() => setOpen(false)}
        onCancel={() => onOpenWindow(false)}
        width={1000}
        footer={false}
    >
        <Row>
            <Col span={15}>
                <div className='modal_img_box flex_col flex_just_center'>
                    <Image
                        preview={false}
                        width={500}
                        height={375}
                        src={addDBCover}
                    />
                </div>
            </Col>
            <Col span={9}>
                <div className="modal_form">
                    <p className="logo_box">
                        <ProjectTwoTone />
                        <span className="logo_txt">DBMT</span>
                    </p>
                    <p className="tips_txt">我们需要你即将连接的数据库的基本信息。</p>
                    <Form
                        form={form}
                        name="basic"
                        layout="vertical"
                        requiredMark='optional'
                        labelCol={{ span: 0 }}
                        wrapperCol={{ span: 24 }}
                        style={{ maxWidth: 500 }}
                        initialValues={{ remember: true }}
                        onFinish={onFinish}
                        onFinishFailed={onFinishFailed}
                        autoComplete="off"
                    >
                        <Form.Item
                            name='dbType'
                            rules={[{ required: true, message: '请选择数据库类型' }]}
                            initialValue="mysql"
                        >
                            <Select
                                size="large"
                                // style={{ width: 120 }}
                                // disabled
                                options={[{ value: 'mariadb', label: 'mariadb' }, { value: 'mysql', label: 'mysql' }]}
                            />
                        </Form.Item>
                        <Form.Item
                            name="dbName"
                            rules={[{ required: true, message: '请输入连接名称', max: 12 }]}
                        >
                            <Input placeholder="连接名" size="large" maxLength={12} />
                        </Form.Item>
                        <Form.Item
                        >
                            <Space.Compact >
                                <Form.Item
                                    name={['address', 'host']}
                                    noStyle
                                    rules={[{ required: true, message: '请输入主机地址' }]}
                                >
                                    <Input style={{ width: '70%' }} placeholder="主机ip地址/域名" size="large" />
                                </Form.Item>
                                <Form.Item
                                    name={['address', 'port']}
                                    noStyle
                                    initialValue={3306}
                                    rules={[{ required: true, message: '请输入端口号' }]}
                                >
                                    <InputNumber style={{ width: '30%' }} placeholder="端口号" size="large" />
                                </Form.Item>
                            </Space.Compact >
                        </Form.Item>
                        <Form.Item
                            name="username"
                            rules={[{ required: true, message: '请输入用户名' }]}
                        >
                            <Input placeholder="用户名" size="large" />
                        </Form.Item>
                        {/* <Form.Item
                        label=""
                        name="username"
                        rules={[{ required: true, message: 'Please input your username!' }]}
                    >
                        <Input />
                    </Form.Item> */}

                        <Form.Item
                            name="password"
                            rules={[{ required: true, message: '请输入密码' }]}
                        >
                            <Input.Password placeholder="密码" size="large" />
                        </Form.Item>

                        <Form.Item>
                            <Button type="primary" htmlType="submit" size='large' style={{ width: "100%", borderRadius: '30px' }}>
                                确定
                            </Button>
                        </Form.Item>
                        <p className="tips_txt">我可能不太清楚连接数据库的信息有哪些？</p>
                    </Form>

                </div>
            </Col>
        </Row>

    </Modal>
}

export default DBListRegisterModal