import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from "./App"

import socketIOClient from "socket.io-client"
const ENDPOINT = process.env.SOCKET_ENDPOINT || "http://127.0.0.1:4000"

const socket = socketIOClient(ENDPOINT)

ReactDOM.render(
  <React.StrictMode>
    <App socket={socket}/>
  </React.StrictMode>,
  document.getElementById('root')
);