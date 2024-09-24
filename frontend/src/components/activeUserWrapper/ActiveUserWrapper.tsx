import React, { useEffect, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { setSocketStates } from '../../features/socketIOSlices/socketIo';
import { Dispatch } from 'redux';
import socketConnection from '../../utils/socketConnection';
import { Navigate, Outlet } from 'react-router-dom';

const ActiveUserWrapper = () => {

    const currentLoggedInUser = useSelector((state: any) => state?.currentUser?.currentLoggedInUser)


    console.log(currentLoggedInUser, 'currentLoggedInUser');



    const socketIo = useMemo(() => socketConnection(currentLoggedInUser?.email), []);

    const dispatch: Dispatch = useDispatch();


    dispatch(setSocketStates({ prop: 'socket', value: socketIo }));


    const currentLoggedInUserLocalStorage = localStorage.getItem("persist:mulipartychatroom");

    return currentLoggedInUser && currentLoggedInUserLocalStorage ? <Outlet /> : <Navigate to="/user/v1/login" />




}

export default ActiveUserWrapper