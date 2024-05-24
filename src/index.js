import React from 'react';
import { BrowserRouter } from "react-router-dom";
import { App } from "./App";
import ReactDOM from 'react-dom';


ReactDOM.createRoot(document.getElementById('root')).render(
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );