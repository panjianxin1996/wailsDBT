import React from "react"
import {DataBaseList,GoMysqlDataBase} from './SelectDBList'
// import '../../typings/components.Home.SelectDBList.d.ts'
import {
    DatabaseOutlined,

} from '@ant-design/icons'
import './SelectDBList.scss'

const SelectDBList:React.FC<DataBaseList> = (props:DataBaseList) => {
    const {databases,onSelectEvent} = props
    // console.log(databases)
    return (<ul className="select_db_list" style={{width: '200px'}}>
        {databases?.map((item,index)=>{
            return <li key={item.Database} className="select_db_list_item" onClick={()=>{onSelectEvent && onSelectEvent(index)}}>
                <DatabaseOutlined className="db_icon"/>
                <span>{item.Database}</span>
            </li>
        })}
    </ul>)
}

export default SelectDBList
export type {
    DataBaseList,
    GoMysqlDataBase
}