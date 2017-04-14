import React, { Component } from 'react';
//import logo from './logo.svg';
import logo from './RedroosterSmall.png';
//import autoBind from 'react-autobind';
//import fs from 'react-native-fs'

import './App.css';
import './led.css';

import StatusForm from './StatusForm.js';
import SettingsForm from './SettingsForm.js';
import OverideForm from './OverideForm.js';

class App extends Component {
  constructor(props) {
  super(props);
  this.state = {value: 'status'};

  this.handleChange = this.handleChange.bind(this);
/*
  var Timer = React.createClass({
    getInitialState: function() {
      return {secondsElapsed: 0};
    },
    tick: function() {
      this.setState({secondsElapsed: this.state.secondsElapsed + 1});
    },
    componentDidMount: function() {
      this.interval = setInterval(this.tick, 1000);
    },
    componentWillUnmount: function() {
      clearInterval(this.interval);
    },
    render: function() {
      return (
        <div>Seconds Elapsed: {this.state.secondsElapsed}</div>
      );
    }
  }); */
}

handleChange(event) {
  console.log('change: ' + event.target.value);
  this.setState({value: event.target.value});
}

//  componentDidMount() {
//    this.interval = setInterval(() => this.setState({ time: Date.now() }), 1000);
//  }
//  componentWillUnmount() {
//    clearInterval(this.interval);
//  }

  render() {
    let activeForm = <div>The Form '{this.state.value}' not yet coded.</div>;
    switch (this.state.value) {
      case 'status':   activeForm = <StatusForm />;   break;
      case 'settings': activeForm = <SettingsForm />;   break;
      case 'overide':  activeForm = <OverideForm />;   break;
      default: console.log(this.state.value, ' has no matching form.');
    }

    return (
      <div className="App">
        <div className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h2>Welcome to The Coop</h2>
        </div>
        <p className="App-intro">
          Select Coop Function
        </p>
        <select value={this.state.value} onChange={this.handleChange}>
          <option value="status">Coop Status</option>
          <option value="settings">Coop Settings</option>
          <option value="overide">Coop Override</option>
        </select>
        <hr />
         {activeForm}
      </div>
    );
  }
}

export default App;
