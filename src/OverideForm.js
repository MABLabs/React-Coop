import React, { Component } from 'react';
import autoBind from 'react-autobind';
import Switch from 'react-flexible-switch';
import Toggle from 'react-toggle';
import axios from 'axios';

//import sleep from 'sleep';

/*const lightsChange = (active) => {
  var url = ""
  if (active) {
     console.log("Lights On");
     url = `/api/light_on/`;
  } else {
     url = `/api/light_off/`;
     console.log("Lights Off");
  }

  axios.get(url);
  this.setState({ value: active })
}
*/

class OverideForm extends Component {
    constructor(props) {
      super(props);

      this.state = {
          value: false
      }

      autoBind(this);

      this.state = {
        prop: 0
      };

}

checkValid() {
//        var sPat = /^[A-Za-z ]*$/;
//        var siPat = /^[A-Za-z0-9//]*$/;
//        var iPat = /^\d+$/;

        var valid = {};
//            valid.experiment     = iPat.test(this.state.experiment) ? '' : 'bad experiment - number only';
//            valid.btest       = iPat.test(this.state.btest) ? '' : 'bad test - number only';
//            valid.bfirst       = iPat.test(this.state.bfirst) ? '' : 'bad first cage - number only';
//            valid.blast       = iPat.test(this.state.blast) ? '' : 'bad last cage - number only';
//            valid.piname =  sPat.test(this.state.piname) ? '' : 'bad PI name - no numbers allowed';
//            valid.piext     = iPat.test(this.state.piext) ? '' : 'bad PI extension - number only';
//            valid.scode      = siPat.test(this.state.scode) ? '' : 'bad strain code - no spaces allowed';

        return valid;
}

handleChange(event) {
      event.preventDefault();

      var stateChange = {};
      stateChange[event.target.name] = event.target.value;
      stateChange.newInfo = true;

      this.setState(stateChange);
}

lightsChange (active) {
  var url = ""
  if (active) {
     console.log("Lights On");
     url = `/api/lights_on/`;
  } else {
     url = `/api/lights_off/`;
     console.log("Lights Off");
  }

  axios.get(url);
  this.setState({ value: active })
}

doorChange (active) {
  var url = ""
  console.log("Active = ", active);
  if (active) {
     url = `/api/door_on/`;
     axios.get(url);
     console.log("Door On");
//     sleep.sleep(30);
     url = `/api/door_off/`;
     axios.get(url);
     console.log("door Off");
  } else {
     url = `/api/door_on/`;
     axios.get(url);
     console.log("Door On");
//     sleep.sleep(30);
     url = `/api/door_off/`;
     axios.get(url);
     console.log("door Off");
  }

  this.setState({ value: active })
}

heatChange (active) {
  var url = ""
  if (active) {
     console.log("Heat On");
     url = `/api/heat_on/`;
  } else {
     url = `/api/heat_off/`;
     console.log("heat Off");
  }

  axios.get(url);
  this.setState({ value: active })
}

fanChange (active) {
  var url = ""
  if (active) {
     console.log("Fan On");
     url = `/api/fan_on/`;
  } else {
     url = `/api/fan_off/`;
     console.log("Fan Off");
  }

  axios.get(url);
  this.setState({ value: active })
}

render() {

var red = {color: 'rgb(255,0,0)', fontSize: '1.6em'};
var valid = this.checkValid();
var vs = (name) => (valid[name].length === 0) ? <span></span>: <span style={red} title={valid[name]}>*</span>;

return <div>
         <h1>Coop Override</h1>
{/*         <div onChange={this.handleChange} > */}
           <div className="App-entry">
             <b>Activate Light</b><Switch onChange={this.lightsChange} labels={{ on: 'On', off: 'Off' }} /><br />
             <b>Activate Door</b><Switch onChange={this.doorChange} labels={{ on: 'On', off: 'Off' }} /><br />
             <b>Activate Fan</b><Switch onChange={this.fanChange} labels={{ on: 'On', off: 'Off' }} /><br />
             <b>Activate Heat</b><Switch onChange={this.heatChange} labels={{ on: 'On', off: 'Off' }} /><br />
           <hr />
           </div>
{/*         </div> */}
       </div>
  }
}

export default OverideForm;
