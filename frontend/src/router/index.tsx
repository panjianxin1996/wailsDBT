import React from 'react'
import { RouteObject,Navigate  } from 'react-router-dom'
import DBHome from '../pages/DBHome'
import DBList from '../pages/DBList'
import Demo from '../pages/ShopDemo'

const Routes: RouteObject[] = [
    {
        path: '/',
        element: <Navigate to='/dblist' replace />
    },
    {
        path: '/dbhome',
        element: <DBHome />,
        
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