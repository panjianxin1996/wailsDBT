export namespace DBListRegister{
    interface Props {
        // modalWindowFlag: boolean,
        // onOpenWindow: Function,
        onAddDataBase: Promise
    }
    interface DBListRegisterRef {
        ToggleShowModal:()=>void
    }
}