import "./App.css";

import React, { useEffect, useMemo } from 'react'
import MultiPartyConversation from "./pages/MultiPartyConversation";
import Home from "./pages/Home";
import Header from "./components/Header";
import { Routes, Route } from "react-router-dom";
import SignUp from "./pages/SignUp";
import LogIn from "./pages/LogIn";
import { Dispatch } from "redux";
import { useDispatch } from "react-redux";
import { setSocketStates } from "./features/socketIOSlices/socketIo";
import socketConnection from "./utils/socketConnection";
import AdminPanel from "./pages/AdminPanel";
import ProtectedRoutesWrapper from "./components/ProtectedRoutesWrapper/ProtectedRoutesWrapper";

const App = () => {


  const socketIo = useMemo(() => socketConnection(), []);

  const dispatch: Dispatch = useDispatch();

  dispatch(setSocketStates({ prop: 'socket', value: socketIo }));


  return (
    <div>

      <Routes>


        <Route element={<ProtectedRoutesWrapper />}>


          <Route element={<Header />} >

            <Route index path="/" element={<Home />} />

          </Route>

          <Route path="/room/v1/:roomId" element={<MultiPartyConversation />} />

          <Route path="/admin/v1/:roomId" element={<AdminPanel />} />

        </Route>


        <Route path="/user/v1/signup" element={<SignUp />} />

        <Route path="/user/v1/login" element={<LogIn />} />

      </Routes>

    </div>
  )
}

export default App