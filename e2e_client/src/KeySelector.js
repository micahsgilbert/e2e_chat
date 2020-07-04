import React from 'react'
import "./KeySelector.css"

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
    alert("!!! STOP !!!\nYou MUST be on a secure connection!!!\nDO NOT request a new key if you are not on HTTPS, unless you know EXACTLY what you are doing!\n!!! ENSURE YOU ARE ON A SECURE CONNECTION BEFORE PROCEEDING !!!")
    this.props.socket.emit("keypair_request")
    this.props.socket.on("keypair", (k) => {
      window.localStorage.setItem("publicKey", k.public)
      window.localStorage.setItem("privateKey", k.private)
      this.props.onFinish()
    })
    this.setState({phase: "new_key"})
  }
  handleChange(e) {
    this.setState({[e.target.id]: e.target.value})
  }
  submit() {
    window.localStorage.setItem("publicKey", this.state.public_key)
    window.localStorage.setItem("privateKey", this.state.private_key)
    this.props.socket.emit("existing_pubkey", this.state.public_key)
    this.props.onFinish()
  }
  render() {
    if (this.state.phase === "init") {
      return (<div id="key-selector">
      <div className="option" onClick={this.alreadyHaveKey}>
        <h3>I have a key already</h3>
      </div>
      <div className="option" onClick={this.getNewKey}>
        <h3>I need a new key</h3>
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
    } else if (this.state.phase === "new_key") {
      return (<div id="key-selector">
        <h3>Waiting for key...</h3>
      </div>)
    }
  }
}