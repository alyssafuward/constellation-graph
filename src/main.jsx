import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import LayoutEditor from "./LayoutEditor.jsx";
import ListView from "./ListView.jsx";
import "./App.css";

const params = new URLSearchParams(window.location.search);
// internal tool, not linked anywhere — reach it via ?layout-editor in the URL
const isLayoutEditor = params.has("layout-editor");
// accessible alternative to the graph, linked from the main app's header
const isListView = params.has("list");

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    {isLayoutEditor ? <LayoutEditor /> : isListView ? <ListView /> : <App />}
  </React.StrictMode>
);
