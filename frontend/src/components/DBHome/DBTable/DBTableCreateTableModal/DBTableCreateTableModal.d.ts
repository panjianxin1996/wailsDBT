import type { DBTable } from ".."
import {
    GoMysqlDataBase,
} from '../../../DBHome'
export namespace DBTabCreateTable {
    interface Props {
        /**
         * [!弃用] 2023-05-06
         */
        // showModalFlag: boolean;
        /**
         * 表结构数据
         */
        structureData: any;
        /**
         * 数据库连接句柄
         */
        connDBId: string;
        /**
         * 暴露父组件给子组件使用
         * 新增消息，一般用以提示用户错误或成功提示
         * @param msg 
         * @returns 
         */
        AddMessage:(msg:DBTable.MessageList)=>void;
        /**
         * 暴露给子组件刷新数据库下的表 源方法：DBHome
         * @returns 
         */
        RealoadData:(tableKey?: string)=>void;
        /**
         * 数据库列表
         */
        databases: GoMysqlDataBase[] | undefined;
    }

    interface DBTabCreateTableRef {
        /**
         * 子组件暴露给父组件的方法
         * 打开或关闭当前弹框
         * @returns 
         */
        ToggleModalEvent:()=>void
    }
}