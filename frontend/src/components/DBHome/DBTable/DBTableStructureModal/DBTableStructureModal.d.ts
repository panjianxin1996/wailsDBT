import type { DBTable } from ".."
export namespace DBTabStructure {
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
         * 当前表结构信息
         */
        structureInfo: DBTable.ActiveTableData;
        /**
         * 暴露父组件方法给子组件使用
         * 更新表结构的数据包括主键数据
         * @returns 
         */
        UpdateTableStructureData: ()=>void;
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
        RealoadData:(tableKey: string)=>void;
    }

    interface DBTabStructureRef {
        /**
         * 子组件暴露给父组件的方法
         * 打开或关闭当前弹框
         * @returns 
         */
        ToggleModalEvent:()=>void
    }
}