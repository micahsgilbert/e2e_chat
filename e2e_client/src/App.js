import React from "react"
import "./App.css"
import KeySelector from "./KeySelector"
import Chat from "./Chat"

export default class App extends React.Component {
  constructor(props) {
    super(props)
    if (window.localStorage.getItem("publicKey") && window.localStorage.getItem("privateKey")) {
      this.state = {phase: "chat"}
      this.props.socket.emit("existing_pubkey", window.localStorage.getItem("publicKey"))
    } else {
      this.state = {phase: "key_selection"}
    }
    this.finish = this.finish.bind(this)
  }
  finish() {
    this.setState({phase: "chat"})
  }
  render() {
    if (this.state.phase === "key_selection") {
      return (<div>
        <KeySelector socket={this.props.socket} onFinish={this.finish}/>
      </div>)
    } else if (this.state.phase === "chat") {
      return (<div>
        <Chat socket={this.props.socket}/>
      </div>)
    }
  }
}