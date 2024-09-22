import React, { useEffect, useMemo } from 'react'
import { useDispatch } from 'react-redux';
import { setSocketStates } from '../../features/socketIOSlices/socketIo';
import { Dispatch } from 'redux';
import socketConnection from '../../utils/socketConnection';
import { Navigate, Outlet } from 'react-router-dom';

const ActiveUserWrapper = () => {
 

    const socketIo = useMemo(() => socketConnection(), []);

    const dispatch: Dispatch = useDispatch();


    dispatch(setSocketStates({ prop: 'socket', value: socketIo }));


    return <Outlet /> 


}

export default ActiveUserWrapper