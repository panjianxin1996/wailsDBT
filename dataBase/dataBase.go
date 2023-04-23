package dataBase

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"time"

	_ "github.com/go-sql-driver/mysql"
)

type DataBaseConfig struct {
	Username string `json:"username"`
	Password string `json:"password"`
	Host     string `json:"host"`
	Port     int    `json:"port"`
}

type OperateData struct {
	Type      EnumType `json:"type"`      // 操作数据库类型
	CurrentDB string   `json:"currentDB"` // 当前数据库
	CustomSQL string   `json:"customSQL"` // 自定义sql语句
	ExecSQL   string   `json:"execSQL"`   // 增删改sql语句
}

type EnumType int

const (
	GET_ALL_DATABASES EnumType = iota
	GET_CURRENT_TABLES
	CUSTOM_SQL
	EXEC_SQL
)

// 连接数据库
func Conn(configJson string) *sql.DB {
	dbConfig := DataBaseConfig{}
	tmpStr := []byte(configJson)
	if err := json.Unmarshal(tmpStr, &dbConfig); err != nil {
		panic(err)
	}
	connectConfig := fmt.Sprintf("%s:%s@tcp(%s:%d)/?charset=utf8&multiStatements=true", dbConfig.Username, dbConfig.Password, dbConfig.Host, dbConfig.Port)
	fmt.Println(connectConfig)
	db, err := sql.Open("mysql", connectConfig)
	if err != nil {
		panic(err)
	}
	// Set time out is 30s.
	db.SetConnMaxLifetime(time.Minute * 5)
	db.SetMaxOpenConns(10)
	db.SetMaxIdleConns(10)
	return db
}

// ping数据库
func Ping(db *sql.DB) bool {
	if err := db.Ping(); err != nil {
		return false
	} else {
		return true
	}
}

// 操作数据库
func Operation(db *sql.DB, operateDataJson string) interface{} {
	operateData := OperateData{}
	tmpStr := []byte(operateDataJson)
	if err := json.Unmarshal(tmpStr, &operateData); err != nil {
		panic(err)
	}
	switch operateData.Type {
	case GET_ALL_DATABASES: // 获取所有数据库
		return getAllDataBase(db)
	case GET_CURRENT_TABLES:
		return getCurrentTables(db, operateData.CurrentDB)
	case CUSTOM_SQL:
		return getTableData(db, operateData.CustomSQL)
	case EXEC_SQL:
		return getExecData(db, operateData.ExecSQL)
	default:
		return true
	}
}

// 通用查询
func queryData(db *sql.DB, querySQL string) string {
	rows, err := db.Query(querySQL)
	if err != nil {
		fmt.Println("Err:", err)
	}
	cols, _ := rows.Columns()
	rowsList := make([]interface{}, len(cols))      // 全部数据的列表
	resultList := make([]map[string]interface{}, 0) // 设置可增长的全部数据

	for i, _ := range cols {
		var ii interface{}
		rowsList[i] = &ii
	}

	for rows.Next() {
		err := rows.Scan(rowsList...)
		if err != nil {
			fmt.Println("Err:", err)
		}
		rowData := make(map[string]interface{}) // 单条数据的键值对
		for index, data := range rowsList {
			tmpData := *data.(*interface{}) // 取出interface里面的数据
			// fmt.Println(tmpData)
			if tmpData != nil {
				// fmt.Printf("%T", tmpData)
				rowData[cols[index]] = string(tmpData.([]byte)) // 单条数据内容赋值
			} else {
				rowData[cols[index]] = "" // 如果没有数据则设置为空
			}

		}
		resultList = append(resultList, rowData) // 插入单条数据到总列表中
	}

	defer rows.Close()
	bytes, _ := json.Marshal(resultList)
	return string(bytes)
}

// 通用操作
func execData(db *sql.DB, querySQL string) string {
	backJSON := make(map[string]interface{})
	ret, err := db.Exec(querySQL)
	if err != nil {
		backJSON["code"] = -1
		backJSON["errorMsg"] = err.Error()
	} else {
		backJSON["code"] = 1
		insertId, _ := ret.LastInsertId()

		backJSON["insertId"] = insertId
		affectCount, _ := ret.RowsAffected()

		backJSON["affectCount"] = affectCount
	}

	bytes, _ := json.Marshal(backJSON)
	return string(bytes)
}

func getAllDataBase(db *sql.DB) string {
	// db.Query()
	return queryData(db, "SHOW DATABASES")
}

func getCurrentTables(db *sql.DB, currentDB string) string {
	return queryData(db, "SHOW TABLES FROM "+currentDB)
}

func getTableData(db *sql.DB, customSQL string) string {
	return queryData(db, customSQL)
}

func getExecData(db *sql.DB, execSQL string) string {
	return execData(db, execSQL)
}