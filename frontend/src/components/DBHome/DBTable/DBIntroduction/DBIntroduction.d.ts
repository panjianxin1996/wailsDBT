import type { TourProps } from 'antd';
export namespace DBIntroduction {
    interface DBIntroductionRef {

    }

    interface Props {
        /**
         * 传递DBTable创建数据表的方法
         */
        ToggleModalEvent: (()=>void)| undefined;
        /**
         * 传递给顶层组件DBTable，启动引导页
         * @param stepsData 引导数据
         * @returns 
         */
        openTourEvent: (i:number,stepsData:TourProps['steps'])=>void
    }
}