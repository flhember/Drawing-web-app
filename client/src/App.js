import React from 'react';
import Drawing from './components/Draw';
import './App.css';

import {BrowserRouter as Router, Route } from 'react-router-dom';

const App = () => (
  <Router>
      <div className= 'App'>
        <h1>Drawing Web App</h1>
      </div>
      <Route path="/" exact component={Drawing} />
  </Router>
);

export default App;
