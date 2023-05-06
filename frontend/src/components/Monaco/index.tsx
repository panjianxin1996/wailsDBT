import React, { useEffect, useState } from 'react'
import MonacoEditor, { loader } from "@monaco-editor/react";

import * as monaco from "monaco-editor";
import editorWorker from "monaco-editor/esm/vs/editor/editor.worker?worker"
import jsonWorker from "monaco-editor/esm/vs/language/json/json.worker?worker"
import cssWorker from "monaco-editor/esm/vs/language/css/css.worker?worker"
import htmlWorker from "monaco-editor/esm/vs/language/html/html.worker?worker"
import tsWorker from "monaco-editor/esm/vs/language/typescript/ts.worker?worker"
import { keywords } from './sqlKeywords'; // 注入关键字以便monaco editor可以进行代码提示和联想

import type {monacoEditor} from './monacoEditor'

// 初始化monaco editor并注入基础编辑器内容
self.MonacoEnvironment = {
    getWorker(_, label) {
        if (label === "json") {
            return new jsonWorker()
        }
        if (label === "css" || label === "scss" || label === "less") {
            return new cssWorker()
        }
        if (label === "html" || label === "handlebars" || label === "razor") {
            return new htmlWorker()
        }
        if (label === "typescript" || label === "javascript") {
            return new tsWorker()
        }
        return new editorWorker()
    }
}

// 注入语法提示的重要代码！！！！
// monaco.languages.registerCompletionItemProvider('sql', {
//     triggerCharacters: ['.', ...keywords],
//     provideCompletionItems(model, position, context, token) {
//         let suggestions: any = [];
//         const { lineNumber, column } = position;
//         const textBeforePointer = model.getValueInRange({
//             startLineNumber: lineNumber,
//             startColumn: 0,
//             endLineNumber: lineNumber,
//             endColumn: column,
//         })
//         const tokens = textBeforePointer.trim().split(/\s+/)
//         const lastToken = tokens[tokens.length - 1] // 获取最后一段非空字符串
//         if (lastToken.endsWith('.')) { // 出现.之后进行关键字提示 这里一般是指表后面的内容
//             const tokenNoDot = lastToken.slice(0, lastToken.length - 1)
//             if (Object.keys(hintData).includes(tokenNoDot)) {
//                 suggestions = [...getTableSuggest(tokenNoDot)]
//             }
//         } else if (lastToken === '.') {
//             suggestions = []
//         } else {
//             suggestions = [...getDBSuggest(), ...getSQLSuggest()]
//         }
//         console.log(suggestions)
//         return {
//             suggestions,
//         }
//     },
// })

loader.config({ monaco });
loader.init().then(/* ... */);

const SQLMonacoEditor: React.FC<monacoEditor.Props> = (props: monacoEditor.Props) => {

    const { width, height, value, language, hintData = {},editorReadOnly = false,onChange } = props

    const [editorValue, setEditorValue] = useState<string>(value ? value : '')

    // const monacoRef = useMonaco()
    // const editorRef:MutableRefObject<any> = useRef()
    let providerRef: monaco.IDisposable

    /**
     * 注入 monaco-editor sql关键字提示
     * @returns 
     */
    function getSQLSuggest() {
        return keywords.map((key) => ({
            label: key,
            detail: 'MYSQL关键字',
            documentation: '',
            kind: monaco.languages.CompletionItemKind.Enum,
            insertText: key,
        }))
    }

    /**
     * 注入 monaco-editor 数据库关键字提示
     * @returns 
     */
    function getDBSuggest(hintData: monacoEditor.Hints) {
        return Object.keys(hintData).map((key) => ({
            label: key,
            kind: monaco.languages.CompletionItemKind.Field,
            insertText: key,
        }))
    }

    /**
     * 注入 monaco-editor 数据库中表关键字提示
     * @returns 
     */
    function getTableSuggest(hintData: monacoEditor.Hints, dbName: any) {
        const tableNames = hintData[dbName]
        if (!tableNames) {
            return []
        }
        return tableNames.map((name: any) => ({
            label: name,
            kind: monaco.languages.CompletionItemKind.Field,
            insertText: name,
        }))
    }

    /**
     *  注册sql语法提示 并返回用于组件销毁前调用销毁registerCompletionItemProvider
     * @returns monaco.IDisposable
     */
    function registerSQLHint() {
        return monaco.languages.registerCompletionItemProvider('sql', {
            triggerCharacters: ['.', ...keywords],
            provideCompletionItems(model, position, context, token) {
                let suggestions: any = [];
                const { lineNumber, column } = position;
                const textBeforePointer = model.getValueInRange({
                    startLineNumber: lineNumber,
                    startColumn: 0,
                    endLineNumber: lineNumber,
                    endColumn: column,
                })
                const tokens = textBeforePointer.trim().split(/\s+/)
                const lastToken = tokens[tokens.length - 1] // 获取最后一段非空字符串
                if (lastToken.endsWith('.')) { // 出现.之后进行关键字提示 这里一般是指表后面的内容
                    const tokenNoDot = lastToken.slice(0, lastToken.length - 1)
                    if (Object.keys(hintData).includes(tokenNoDot)) {
                        suggestions = [...getTableSuggest(hintData, tokenNoDot)]
                    }
                } else if (lastToken === '.') {
                    suggestions = []
                } else {
                    suggestions = [...getDBSuggest(hintData), ...getSQLSuggest()]
                }
                return {
                    suggestions,
                }
            },
        })
    }

    useEffect(() => {
        providerRef = registerSQLHint() // 注入sql提示
        return () => {
            providerRef.dispose() // 注销sql提示
        }
    }, [hintData])

    useEffect(() => {
        value && setEditorValue(value)
    }, [value])

    return <MonacoEditor
        width={width ? width : "100%"}
        height={height ? height : "100%"}
        value={editorValue}
        defaultLanguage={language ? language : 'sql'}
        theme='light'
        onChange={(value) => { value && setEditorValue(value);onChange(value!) }}
        options={{
            readOnly: editorReadOnly,
            minimap: { enabled: false } //关闭右边小地图
        }}
    />
}
export default SQLMonacoEditor
export type {
    monacoEditor
}