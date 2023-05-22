import React, { forwardRef, useImperativeHandle, useState } from 'react';
import type {DBIntroduction} from './DBIntroduction'
import './index.scss'
import { Avatar, Button, Col, Row, Typography } from 'antd';
// import plantImg from '../../../../assets/images/plant.png';
import plantImg from '@/assets/images/plant.png';
import introImg from '@/assets/images/introduction_cover3.png';
const { Title, Paragraph, Text, Link } = Typography;
const DBIntro = forwardRef<DBIntroduction.DBIntroductionRef,DBIntroduction.Props>((props,ref)=>{
    const {ToggleModalEvent,openTourEvent} = props
    const introLinkList = [
        {
            name: '选择指定数据库',
            steps: [
                {
                    target: null,
                    title: '点击可以切换数据库',
                    description: '您可以通过选择框进行数据库的切换，实时更新数据表和视图',
                },
            ]
        },
        {
            name: '选择数据库下的数据表',
            steps: [
                {
                    target: null,
                    title: '点击可以展示当前数据库下的表',
                    description: '您可以展开获取到当前数据库下的所有BASE TABLE或SYSTEM VIEW',
                },
            ]
        },
        {  
            name: '选择数据库下的视图',
            steps: [
                {
                    target: null,
                    title: '点击可以展示当前数据库下的视图',
                    description: '您可以展开获取到当前数据库下的所有VIEW视图',
                },
            ]
        },
        {
            name: '创建一个自定义SQL',
            steps: [
                {
                    target: null,
                    title: '通过输入SQL语句可以创建一个新的SQL查询',
                    description: '您可以进行sql语句查询，当然你也可以通过一些执行语句进行数据库操作，但是我们将不会为您展示执行更新数据库后的内容，你需要慎重录入SQL。',
                },
            ]
        },
        {
            name: '创建一张新数据表',
            steps: [
                {
                    target: null,
                    title: '你可以创建一张新表',
                    description: '你可以通过该弹框新建一张新的数据表，您需要选择创建的基数据库以及录入数据库表名和字段以及类型等',
                },
            ]
        },
    ]

    useImperativeHandle(ref,()=>({}))

    function OnOpenTourEvent (i:number) {
        openTourEvent(i,introLinkList[i].steps)
    }

    return <div className='introduction_main_box'>
        <Row className='head_row'>
            <Col span={18}>
                <Avatar className='table_avatar' src={<img src={plantImg} alt='欢迎！' />} shape="square" size={50} />
                <span className='head_txt'>欢迎您的使用</span>
            </Col>
            <Col span={6}>
                <div className='header_btn'>
                    <Button type="primary" onClick={() => { ToggleModalEvent && ToggleModalEvent() }}>创建新表</Button>
                </div>
            </Col>
        </Row>
        <Typography>
            <img className='intro_img' src={introImg} alt="introduction" />
            <Title>介绍</Title>
            <Paragraph>
                <ul>
                    {
                        introLinkList.map((item,index)=>{
                            return <li key={"intro-link-"+index}>
                                <Button type="link" onClick={()=>OnOpenTourEvent(index)}>{item.name}</Button>
                            </li>
                        })
                    }
                </ul>
                <Text>你可以通过选中左侧菜单来进行操作你的数据库。</Text>
            </Paragraph>
            <Title>可能遇到的问题</Title>
            <Paragraph>
                <h4>Q：为什么我可以对视图进行操作？</h4>
                <blockquote>
                    <Text>A：对于一般关系型数据库来说，视图 (view) 只是基于表 (table) 上的虚拟表 (virtual table)。视图的定义会引用其所关联的基础表，从而使得从视图中读取数据时，实际上是从与视图关联的基础表中获取数据，因此可以保证视图中的数据最终与基础表同步。</Text>
                    <Text>例如，当您在视图中执行 INSERT 操作时，实际上是在与该视图关联的基础表中插入了一行数据。 当您在视图中执行 UPDATE 或 DELETE 操作时，实际上也是在与该视图关联的基础表中更新或删除了相应的行。</Text>
                    <Text>而当您看到视图产生的变化时，并不是因为视图本身发生了变化，而是因为您对视图进行操作所引发的基础表的变化（因为视图本身并没有自己的物理存储，所以无法对视图进行物理修改）。</Text>
                    <Text>需要注意的是，在MySQL中，大部分情况下视图是只读的，不能直接对视图进行修改。如果需要修改视图的数据，则需要修改与视图相关的基础表数据。视图通常只能用于读操作，方便我们查询和过滤数据。</Text>
                </blockquote>
                <h4>Q：对于我这个SQL语句应该是没有问题的，为什么无法查询出数据？<Text code>SELECT * FROM `myTableName`</Text>;</h4>
                <blockquote>
                    A：不同于你的执行环境，DBMT可能并不知道你所需要查询的数据表在哪个数据库中，虽然我们已经可能在数据库栏选择了，但是我们还可能查询其他数据库下的数据表。你应该这么做<Text code copyable={{ tooltips: false }}>SELECT * FROM `myDBName`.`myTableName`</Text>
                </blockquote>
            </Paragraph>
        </Typography>
        
    </div>
})

export default DBIntro;
export type {
    DBIntroduction
}