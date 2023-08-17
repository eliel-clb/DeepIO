import React from "react";
import { Route, Routes } from "react-router-dom";
import PrivateRoute from "./PrivateRoute";
import Home from './Components/Home';
import Login from './Components/Login/Login';
import Register from './Components/Register/Register';
import Profile from './Components/Profile/Profile';
import Queue from './Components/Queue/Queue';
import History from './Components/History/History';
import Predict from './Components/Predict/Predict';

export default function AllRoutes() {

    return (
        <div>

            <Routes>
                <Route path="/" exact element={<Home />} />
                <Route path="/register" element={<Register />} />
                <Route path="/predict" element={<Predict />} />
                <Route element={<PrivateRoute />}>
                    <Route path="/history" element={<History />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/queue" element={<Queue />} />
                </Route>
                <Route path="/login" element={<Login />} />
            </Routes>

        </div>
    )
}