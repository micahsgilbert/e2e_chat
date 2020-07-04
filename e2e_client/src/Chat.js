import React from 'react'
import "./Chat.css"
import moment from "moment"
import NodeRSA from "node-rsa"

const Message = (props) => {
  let c = "message "
  if (props.children.self) {
    c += "self "
  }
  if (props.children.error) {
    c += "error "
  }
  return <div className={c}><span className="text"><span className="time">{moment.unix(props.children.time / 1000).format("YYYY/MM/DD HH:mm:ss")}</span><br />{props.children.message}</span></div>
}

export default class Chat extends React.Component {
  constructor(props) {
    super(props)
    this.state = {messages: [],
    message: "",
    user_pubkeys: {}}
    this.handleChange = this.handleChange.bind(this)
    this.send = this.send.bind(this)
    this.resetKeys = this.resetKeys.bind(this)

    this.props.socket.emit("get_user_pubkeys")
  }    

  componentDidMount() {
    this.props.socket.on("user_pubkeys", pubkeys => {
      this.setState({user_pubkeys: pubkeys})
    })
    this.props.socket.on("message_recv", message => {
      try {
        let key = new NodeRSA(window.localStorage.getItem("privateKey"))
        message.message = Buffer.from(key.decrypt(message.message, "base64"),"base64").toString()
        this.setState({messages: [message, ...this.state.messages]})
      }
      catch {
        message.message = "error decrypting"
        message.error = true
      }
    })
  }
  handleChange(e) {
    this.setState({[e.target.id]: e.target.value})
  }
  send() {
    let message = {}
    for (let user_id in this.state.user_pubkeys) {
      let key = new NodeRSA(this.state.user_pubkeys[user_id])
      message[user_id] = key.encrypt(this.state.message, "base64")
    }
    this.props.socket.emit("message_send", message)
    this.setState({message: ""})
  }
  resetKeys() {
    let r = window.confirm("Reset your RSA keys?")
    if (r) {
      window.localStorage.clear()
      window.location.reload()
    }
  }

  render() {
    return (<div id="chat">
      <div id="message-container">
        {this.state.messages.map(m => <Message key={m.id}>{m}</Message>)}
      </div>
      <div id="message-send">
        <button onClick={this.resetKeys} id="reset-keys">Reset Keys</button>
        <input id="message" value={this.state.message} onChange={this.handleChange} onKeyDown={e => {
          if (e.keyCode === 13) {
            this.send()
          }
        }}></input>
        <button onClick={this.send}>Send</button>
      </div>
    </div>)
  }
}