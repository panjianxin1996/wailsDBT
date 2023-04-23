import React from 'react'
import { RouteObject,Navigate  } from 'react-router-dom'
import Home from '../pages/Home'
import DBList from '../pages/DBList'
import SQLMonacoEditor from '../components/Monaco'
import Demo from '../pages/ShopDemo'

const Routes: RouteObject[] = [
    {
        path: '/',
        element: <Navigate to='/dblist' replace />
    },
    {
        path: '/home',
        element: <Home />,
        
    },
    {
        path: '/dblist',
        element: <DBList />
    },
    {
        path: '/shopDemo',
        element: <Demo />
    }
]

export default Routes