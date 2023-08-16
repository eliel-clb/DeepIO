import React, {Suspense} from 'react';
import { Route, Routes, BrowserRouter as Router } from 'react-router-dom';

import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

import Header from './Components/Header/Header';
import Home from './Components/Home';
import Login from './Components/Login/Login';
import Register from './Components/Register/Register';
import Profile from './Components/Profile/Profile';
import Queue from './Components/Queue/Queue';
import History from './Components/History/History';
import Predict from './Components/Predict/Predict';

const App = () => {
    return (
      <Router>
        <div className="App">
          <header className="App-header">
            <div className='header-contents'>
              <Header />
            </div>
          </header>
          <main className="App-content">
            <Suspense fallback={(<div>Loading</div>)}>
              <Routes>
                <Route path="/" exact element={<Home/>} />
                <Route path="/register" element={<Register/>} />
                <Route path="/profile" element={<Profile/>} />
                <Route path="/queue" element={<Queue/>} />
                <Route path="/predict" element={<Predict/>} />
                <Route path="/history" element={<History/>} />
                <Route path="/login" element={<Login/>} />
              </Routes>
            </Suspense>
          </main>
        </div>
      </Router>
    );
  }

export default App;
