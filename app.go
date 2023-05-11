package main

import (
	"context"
	"database/sql"
	"encoding/json"

	"fmt"

	"dbmt/dataBase"
)

// App struct
type App struct {
	ctx   context.Context
	dbMap map[string]*sql.DB
	mapId int
}

// NewApp creates a new App application struct
func NewApp() *App {
	return &App{}
}

// startup is called when the app starts. The context is saved
// so we can call the runtime methods
func (a *App) startup(ctx context.Context) {
	a.ctx = ctx
	a.dbMap = make(map[string]*sql.DB)
	a.mapId = 1
}

// Greet returns a greeting for the given name
func (a *App) Greet(name string) string {
	return fmt.Sprintf("Hello %s, It's show time!", name)
}

func (a *App) GoConnectDB(configJson string) string {
	backJSON := make(map[string]interface{})
	dbIdStr := fmt.Sprintf("db_%d", a.mapId)
	handleDB, err := dataBase.Conn(configJson)
	if err != nil {
		backJSON["code"] = 1
		backJSON["errorMsg"] = err.Error()
		backJSON["dataList"] = nil
		bytes, _ := json.Marshal(backJSON)
		return string(bytes)
	}
	a.dbMap[dbIdStr] = handleDB
	a.mapId++
	backJSON["code"] = 1
	backJSON["errorMsg"] = nil
	backJSON["dataList"] = dbIdStr
	bytes, _ := json.Marshal(backJSON)
	return string(bytes)
}

func (a *App) GoPingDB(dbId string) string {
	backJSON := make(map[string]interface{})
	if a.dbMap[dbId] == nil {
		backJSON["code"] = -1
		backJSON["errorMsg"] = "Not Connect handle."
		backJSON["dataList"] = nil
		// return false
	} else {
		connectFlag, err := dataBase.Ping(a.dbMap[dbId])
		backJSON["code"] = connectFlag
		backJSON["errorMsg"] = err
		backJSON["dataList"] = nil

	}
	bytes, _ := json.Marshal(backJSON)
	return string(bytes)
}

func (a *App) GoOperateDB(dbId string, operateDataJson string) interface{} {
	if a.dbMap[dbId] == nil {
		return false
	}
	return dataBase.Operation(a.dbMap[dbId], operateDataJson)
}
