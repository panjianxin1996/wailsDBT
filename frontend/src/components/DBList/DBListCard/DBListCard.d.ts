export interface DBListCardProps {
    cardConfig?: DBListCardProps,
    dbName? :string,
    dbType?: string,
    dbContent? :string,
    username? :string,
    password? :string,
    host? :string,
    port? :number
    type: number,
    createDate?: number,
    onClick?: ()=>void
    onDelClick?: ()=>void
    onConnClick?: ()=>void
}
