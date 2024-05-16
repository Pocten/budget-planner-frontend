import React from 'react';
import { createRoot } from 'react-dom/client'; // Import createRoot
import { BrowserRouter } from "react-router-dom";
import { App } from "./App";

const container = document.getElementById("root"); // Get the root element
const root = createRoot(container); // Create a root

root.render( <
    BrowserRouter >
    <
    App / >
    <
    /BrowserRouter>
);