/**
 * 
 * @param value 需要格式化的值
 * @returns 
 */
export const formatSQLSpecialChar = (value:string) => {
    return  `${"`"}${value}${"`"}`
    
}

export const formatArraySQLSpecialChar = (list: (string|undefined)[]) => {
    const vals = list.map((item:string | undefined)=>{
        if (item===undefined) {
            return ''
        } else {
            return formatSQLSpecialChar(item)
        }
    })
    console.log(vals)
    return vals.join('.')
}