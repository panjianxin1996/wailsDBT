export namespace AppCtx {
    /**
     * Context 数据集
     * @name dbList:dbListItem[]; 用于管理全局连接的数据 可能存在三种状态
     */
    interface AppData {
        /**
         * 用于管理全局连接的数据 可能存在三种状态
         * @example 1.如果已经存在连接并且连接激活，则直接连接
         * 2.如果连接失活，则重新连接并将新句柄更新
         * 3.如果不存在的新链接直接连接并添加新句柄
         */ 
        dbList: dbListItem[]; 
    }

    /**
     * 数据库连接详情
     * @name listKey:string; 连接的key值
     * @name connectId:string; 连接句柄
     * @name connectToken:string; 为了安全的连接token [tips|2023.5.9]{目前所有连接并未每个连接进行token校验}
     */
    interface dbListItem {
        listKey: string;
        connectId: string;
        connectToken?: string;
    }

    /**
     * reducer dispatch的操作
     * @name type:string; 操作类型
     * @name newDBList:dbListItem[]; 操作的数据
     */
    interface ActionData {
        type: string;
        newDBList: dbListItem[];
    }
}