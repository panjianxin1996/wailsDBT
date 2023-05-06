import React, { ReactNode } from "react";
import type { monacoEditor } from "../../Monaco";
import type { ColumnsType } from 'antd/es/table';
import type { NoticeType } from 'antd/es/message/interface'
export namespace DBTable {
    interface Props {
        hintDBData: monacoEditor.Hints; // 编辑器输入提示数据集
        connDBId: string; // 连接的数据库句柄
    }

    interface ShowDBTableRef {
        [x: string]: any;
        state: State,
        CreateTable: (params: DBTable.CreateTabParams)=>void
    }

    interface State {
        tableObjectArray: tableObject[]; // 表格表对象数组
        activeTableIndex: number; // 当前索引自增
        // tableListKeyIndex: number; // 数据库表索引 [!废弃] 2023-4-26
        activeTableKey?: string; // 选中table值
        activeTableData: ActiveTableData; // 选中的内容
        // tableColumns: ColumnsType<TableDataItem>; // 表格头数据 [!废弃] 2023-4-27
        // tableData: TableDataItem[]; // 表格数据 [!废弃] 2023-4-27
        modalView: ModalView; // 弹框信息 
        messageList: MessageList[]; // 消息列表
        customQuerySQL: string;
    }

    /**
     * 表格表对象数组 用于存放数据库中表的属性和内容
     */
    interface tableObject {
        key: string; // tab主要key值，用于判定tab 格式 tab_%number% 唯一
        label: string; 
        dbName: string; // 当前数据库名
        tableName: string; // 当前表名
        newQuerySQL: boolean; // 是否为自定义sql ,如果是则不通过自身组件进行 数据库操作而是用sql语句操作
        tableColumnsSource: TableDataItem[]; // 请求回来的原始表格结构数据
        tableDataSource: TableDataItem[]; // 请求回来的原始表格数据
        tableColumns: ColumnsType<TableDataItem>; // 格式化后表格结构数据用于表格展示
        tableData: TableDataItem[]; // 格式化后表内容用于表格展示
        activeRowIndex: number[], // 选中行索引
        activeRowData: any; // 选中行内容
        tableStructureSQL?: string; // 查询表结构的SQL语句
        QuerySQL?: string; // 查询表内容的SQL语句
        children?: ReactNode; // （[!废弃] 2023-4-26）渲染tab下子节点 
    }

    /**
     * 弹出框
     */
    interface ModalView {
        type: string; // 弹框类型
        showFlag: boolean; // 弹框标识
    }

    /**
     * 消息列表框
     */
    interface MessageList {
        key?: string; // 消息key 唯一
        content: string; // 消息内容
        type: NoticeType; // 消息类型 基于antd message NoticeType = "info" | "success" | "error" | "warning" | "loading"
        duration?: number; // 消息显示时间
    }

    /**
     * [!废弃] 2023-4-26
     */
    interface RightClickMenuBar {
        showMenu: boolean;
        X: number;
        Y: number;
    }

    /**
     * 选中
     */
    interface ActiveTableData {
        dbName?: string; // 库名
        tableName?: string; // 表名
        primaryKeyData?: string[]; // 存储数据表主键信息 可能有多个主键也有可能没有主键 需要操作者进行甄别，如果多个需要进行多个拼接，如果没有则需要进行sql整体判断
    }

    interface TableDataItem {
        [content:string]: string; // 表格数据可能为任意名称键和字符串值
    }

    interface DBReducerAction {
        type: string; // 操作类型
        payload: State | State.activeTableKey | State.tableStack; // 将要更新的数据格式
    }

    /**
     * 创建table时需要传入的数据
     */
    interface CreateTabParams {
        dbName?: string; // 库名
        tableName?: string; // 表名
        newQuerySQL?: boolean; // 自定义SQL Flag
        querySQLStr?: string // 自定义SQL
    }

    /**
     * 新tab所需要的参数
     */
    interface NewTable {
        responseList?: any[];
        dbName?: string;
        tableName?: string;
        newQuerySQL?: boolean;
        tableStructureSQL?: string;
        QuerySQL?: string;
        tabData?: TabData
    }

    interface TabData {
        tableDataSource: TableDataItem[];
        tableColumns: ColumnsType<TableDataItem>;
        tableData: TableDataItem[];
    }
    
}