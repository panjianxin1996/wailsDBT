import React, { ReactNode } from "react";
import type { monacoEditor } from "../../Monaco";
import type { ColumnsType } from 'antd/es/table';
import type { NoticeType } from 'antd/es/message/interface'
export namespace DBTable {
    interface Props {
        hintDBData: monacoEditor.Hints; // 编辑器输入提示数据集
        connDBId: string; // 连接的数据库句柄
    }
    interface State {
        tableStack: TableStack[]; // 表格栈
        activeTableIndex: number; // 当前索引自增
        tableListKeyIndex: number; // 数据库表索引
        activeTableKey?: string; // 选中table值
        activeTableData: ActiveTableData; // 选中的内容
        tableColumns: ColumnsType<TableDataItem>;
        tableData: TableDataItem[];
        modalView: ModalView;
        messageList: MessageList[], // 消息列表
        showRightMenu: boolean;
        rightClickMenuBar: RightClickMenuBar;
    }

    /**
     * 表格栈 用于存放数据库中表的属性和内容
     */
    interface TableStack {
        key: string; // tab主要key值，用于判定tab 格式 tab_%number% 唯一
        label: string; 
        dbName: string; // 当前数据库名
        tableName: string; // 当前表名
        newQuerySQL: boolean; // 是否为自定义sql ,如果是则不通过自身组件进行 数据库操作而是用sql语句操作
        tableColumnsSource: TableDataItem[]; // 请求回来的原始表格结构数据
        tableDataSource: TableDataItem[]; // 请求回来的原始表格数据
        tableColumns: ColumnsType<TableDataItem>; // 格式化后表格结构数据用于表格展示
        tableData: TableDataItem[]; // 格式化后表内容用于表格展示
        activeRowIndex: string[] | number[], // 选中行索引
        activeRowData: any; // 选中行内容
        tableStructureSQL?: string; // 查询表结构的SQL语句
        QuerySQL?: string; // 查询表内容的SQL语句
        children?: ReactNode; // （废弃！）渲染tab下子节点 
    }

    /**
     * 弹出框
     */
    interface ModalView {
        type: string;
        showFlag: boolean;
    }

    /**
     * 消息列表框
     */
    interface MessageList {
        key?: string;
        content: string;
        type: NoticeType;
        duration?: number;
    }

    /**
     * 废弃
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
        dbName?: string;
        tableName?: string;
        primaryKeyName?: string[]; 
    }

    interface TableDataItem {
        [content:string]: string;
    }

    interface DBReducerAction {
        type: string;
        payload: State | State.activeTableKey | State.tableStack;
    }
    
}