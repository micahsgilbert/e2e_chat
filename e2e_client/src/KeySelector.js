import React from 'react'
import "./KeySelector.css"
import NodeRSA from 'node-rsa'

export default class KeySelector extends React.Component {
  constructor(props) {
    super(props)
    this.state = {phase: "init", public_key: "", private_key: ""}
    this.alreadyHaveKey = this.alreadyHaveKey.bind(this)
    this.getNewKey = this.getNewKey.bind(this)
    this.handleChange = this.handleChange.bind(this)
    this.submit = this.submit.bind(this)
  }
  alreadyHaveKey() {
    this.setState({phase: "have_key"})
  }
  getNewKey() {
    this.setState({phase: "generating"})
    let k = new NodeRSA()
    k.generateKeyPair()
    let pub = k.exportKey("public")
    let priv = k.exportKey("private")
    window.localStorage.setItem("publicKey", pub)
    window.localStorage.setItem("privateKey", priv)
    this.props.socket.emit("pubkey_submit", pub)
    this.props.onFinish()
  }
  handleChange(e) {
    this.setState({[e.target.id]: e.target.value})
  }
  submit() {
    window.localStorage.setItem("publicKey", this.state.public_key)
    window.localStorage.setItem("privateKey", this.state.private_key)
    this.props.socket.emit("pubkey_submit", this.state.public_key)
    this.props.onFinish()
  }
  render() {
    if (this.state.phase === "init") {
      return (<div id="key-selector">
      <div className="option" onClick={this.alreadyHaveKey}>
        <h3>I have a key already</h3>
      </div>
      <div className="option" onClick={this.getNewKey}>
        <h3>Generate New Key</h3>
      </div>
    </div>)
    } else if (this.state.phase === "have_key") {
      return (<div id="key-selector">
        <h4>Public Key</h4>
        <textarea id="public_key" value={this.state.public_key} onChange={this.handleChange}></textarea>
        <br />
        <h4>Private Key (this is never sent over the network)</h4>
        <textarea id="private_key" value={this.state.private_key} onChange={this.handleChange}></textarea>
        <br />
        <button onClick={this.submit}>Submit</button>
      </div>)
    } else if (this.state.phase === "generating") {
      return (<div id="key-selector">
        <h3>Waiting for key...</h3>
      </div>)
    }
  }
}