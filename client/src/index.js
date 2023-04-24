import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import "./index.scss";
import "./app.scss";
import App from "./App";
import * as serviceWorker from "./serviceWorker";
import { createRoot } from "react-dom/client";

const container = document.getElementById("root");
const root = createRoot(container); // createRoot(container!) if you use TypeScript
root.render(<App tab="home" />);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
