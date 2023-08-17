import React, { Suspense } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import './Components/Header/Header.css';

import Header from './Components/Header/Header';
import AllRoutes from './routes';


const App = () => {
  return (
    <div className={"App"}>
      <header className={"App-header"}>
        <div className={'header-contents'}>
          <Header />
        </div>
      </header>
      <main className={"App-content"}>
        <Suspense fallback={(<div>Loading</div>)}>
          <AllRoutes />
        </Suspense>
      </main>
    </div>
  );
}

export default App;
