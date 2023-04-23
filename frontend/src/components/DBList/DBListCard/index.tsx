import React, { useState } from 'react'
import { 
    CalendarOutlined,
    PlusOutlined,
    UngroupOutlined,
    LinkOutlined,
    DeleteOutlined,
    ToolOutlined,
    ConsoleSqlOutlined,
    TagTwoTone,
    EllipsisOutlined,
    CloseCircleOutlined,
    LockOutlined,
    UnlockOutlined
} from '@ant-design/icons';

import {DBListCardProps} from './DBListCard'
import { Button, Card, Space, Tag, Tooltip } from 'antd';
import './DBListCard.scss'
const DBListCard: React.FC<DBListCardProps> = (props: DBListCardProps) => {
    const { type, cardConfig, onClick, onDelClick,onConnClick } = props
    const [showBox,setShowBox] = useState(false)
    const [showInfo, setShowInfo] = useState(false)

    function formatDate (date:number) {
        let currentDate = new Date();
        let createDate = new Date(date);
    }

    function connectDBEvent (cardConfig: DBListCardProps) {
        console.log()
    }

    return <>
        {type === 0 ? <Card bordered={false} className="content_item_card">
            {
                showBox && <div className='popup_box flex_row'>
                    <Space wrap>
                        {
                            showInfo ? <Tooltip title='隐藏数据信息'>
                            <Button icon={<LockOutlined/>} size='large' type='primary' onClick={()=>setShowInfo(false)}></Button>
                        </Tooltip> : <Tooltip title='显示数据信息'>
                            <Button icon={<UnlockOutlined />} size='large' type='primary' onClick={()=>setShowInfo(true)}></Button>
                        </Tooltip>
                        }
                        
                    
                        <Tooltip title='重新配置'>
                            <Button icon={<ToolOutlined />} size='large' type='primary'></Button>
                        </Tooltip>
                        <Tooltip title='删除'>
                            <Button icon={<DeleteOutlined />} size='large' onClick={onDelClick}></Button>
                        </Tooltip>
                        
                    </Space>
                    <p className='close_btn'>
                        <CloseCircleOutlined onClick={()=>setShowBox(false)}/>
                    </p>
                    
                </div>
            }
            <div className='db_card flex_col flex_just_between'>
                <div className='card_title flex_row flex_just_between'>
                    <h1 className='flex_row flex_just_center'>
                        <span style={{color: '#1890ff'}}>{<ConsoleSqlOutlined />}</span>
                        <span style={{display: 'inline-block',marginLeft: '15px',width: '150px',overflow: 'hidden'}}>{cardConfig?.dbName}</span>
                    </h1>
                    <Space wrap>
                        <Tooltip title='连接'>
                            <Button icon={<LinkOutlined />} size='small' type='primary' onClick={onConnClick}></Button>
                        </Tooltip>
                        <Tooltip title='更多'>
                            <Button icon={<EllipsisOutlined />} size='small' type='primary' onClick={()=>setShowBox(true)}></Button>
                        </Tooltip>
                        
                    </Space>
                </div>
                <div className='card_content'>
                    {/* <p>{cardConfig?.dbContent}</p> */}
                    <p className='card_content_line'>
                        <span className='content_label' color="#55acee">地址</span>
                        <Tag color="geekblue">{cardConfig?.host}</Tag>
                        <Tag color="blue">{cardConfig?.port}</Tag>
                    </p>
                    <p className='card_content_line'>
                        <span className='content_label' color="#55acee">用户名</span>
                        <Tag color="geekblue">{showInfo ? cardConfig?.username : '******'}</Tag>
                    </p>
                    <p className='card_content_line'>
                        <span className='content_label' color="#55acee">登录密码</span>
                        <Tag color="geekblue">{showInfo ? cardConfig?.password: '******'}</Tag>
                    </p>
                </div>
                <div className='card_bottom'>
                    <div className='flex_row card_bottom'>
                        <UngroupOutlined />
                        <p className='bottom_txt'>{cardConfig?.dbType}</p>
                    </div>
                    <div className='flex_row card_bottom flex_just_between'>
                        <div className='flex_row'>
                            <CalendarOutlined />
                            <p className='bottom_txt'>{cardConfig?.createDate != undefined ? new Date(cardConfig?.createDate).toLocaleString() : ''}</p>
                        </div>
                        <div>
                            <TagTwoTone />
                        </div>
                    </div>
                </div>

            </div>
        </Card> : (type === 1 ? <Card bordered={false} className="content_item_card flex_col flex_just_center flex_align_center" onClick={onClick}>
            <p className='add_card_icon'><PlusOutlined /></p>
            <p className='add_card_txt'>新增数据库连接</p>
        </Card> : <span className='blank_card'></span>)}
    </>
}
export default DBListCard;
export type {
    DBListCardProps
}