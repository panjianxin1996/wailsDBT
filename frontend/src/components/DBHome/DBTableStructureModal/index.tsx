import { Modal } from 'antd'
import React, { forwardRef, useImperativeHandle, useState } from 'react'
import type { DBTabStructure } from './DBTableStructureModal'
const DBTableStructureModal =  forwardRef<DBTabStructure.DBTabStructureRef,DBTabStructure.Props>((props,ref)=> {
    // console.log(props)
    const {showModalFlag,} = props
    const [showModal,setShowModal] = useState<boolean>(false)
    useImperativeHandle(ref,()=>({
        ToggleModalEvent,
    }))

    function ToggleModalEvent ():void {
        setShowModal(!showModal)
    }
    return <Modal open={showModal} onCancel={ToggleModalEvent}>
        <h1>test</h1>
    </Modal>
})

export default DBTableStructureModal

export type {
    DBTabStructure
}