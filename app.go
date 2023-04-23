package main

import (
	"context"
	"database/sql"

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
	dbIdStr := fmt.Sprintf("db_%d", a.mapId)
	handleDB := dataBase.Conn(configJson)
	a.dbMap[dbIdStr] = handleDB
	a.mapId++
	return dbIdStr
}

func (a *App) GoPingDB(dbId string) bool {
	if a.dbMap[dbId] == nil {
		return false
	}
	return dataBase.Ping(a.dbMap[dbId])
}

func (a *App) GoOperateDB(dbId string, operateDataJson string) interface{} {
	if a.dbMap[dbId] == nil {
		return false
	}
	return dataBase.Operation(a.dbMap[dbId], operateDataJson)
}
