import "./App.css";

import React, { useEffect } from 'react'
import MultiPartyConversation from "./pages/MultiPartyConversation";
import Home from "./pages/Home";
import Header from "./components/Header";
import { Routes, Route } from "react-router-dom";
import SignUp from "./pages/SignUp";
import LogIn from "./pages/LogIn";
import AdminPanel from "./pages/AdminPanel";
import ProtectedRoutesWrapper from "./components/ProtectedRoutesWrapper/ProtectedRoutesWrapper";
import ActiveUserWrapper from "./components/activeUserWrapper/ActiveUserWrapper";

const App = () => {



  return (
    <div>

      <Routes>


        <Route element={<ProtectedRoutesWrapper />}>

          <Route element={<ActiveUserWrapper />}>

            <Route element={<Header />} >

              <Route index path="/" element={<Home />} />

            </Route>


            <Route path="/room/v1/:roomId" element={<MultiPartyConversation />} />

            <Route path="/admin/v1/:roomId" element={<AdminPanel />} />


          </Route>


        </Route>


        <Route path="/user/v1/signup" element={<SignUp />} />

        <Route path="/user/v1/login" element={<LogIn />} />

      </Routes>

    </div >
  )
}

export default App