import React, { Component } from 'react';
import autoBind from 'react-autobind';
import Time from 'react-time'
import SunCalc from 'suncalc'
import myData from './data.json';

import './led.css';

class StatusForm extends Component {
    constructor(props) {
      super(props);

      autoBind(this);

      this.state = {
        cooptype: 'status',
        sunrise: 0,
        sunset: 0,
        dooropen: 0,
        doorclose: 0,
        lighton: 0,
        lightoff: 0,
        heaton: 0,
        heatoff: 0,
        fanon: 0,
        fanoff: 0,
        newInfo: false
      };
    }

    handleChange(event) {
          event.preventDefault();

          var stateChange = {};
          stateChange[event.target.name] = event.target.value;
          stateChange.newInfo = true;

          this.setState(stateChange);
    }

    storeData() {
      var data = {
        dooropenOffset: 10,
        doorcloseOffset: 20,
        lightonOffset: 30,
        lightoffOffset: 40
      }

//      var obj = JSON.stringify(data, null, 4);
//      RNFS.writeFile('./data.json', obj, function(err){
//          if(err)console.log(err);
//          else console.log("success");
//         });
    }

render() {

  this.storeData();
  let now = new Date()

  var times = SunCalc.getTimes(new Date(), 34.75, -92.29);
  this.state.sunrise = times.sunrise.getHours() + ':' + times.sunrise.getMinutes() + 'AM';
  this.state.sunset = (times.sunset.getHours()-12) + ':' + times.sunset.getMinutes() + 'PM';
  this.state.dooropen = this.state.sunrise;
  this.state.doorclose = this.state.sunset;
  this.state.lighton = this.state.sunrise;
  this.state.lightoff = this.state.sunset;

  return <div>
           <h1>Coop Status</h1>
           <p>Current time <Time value={now} format="YYYY/MM/DD HH:mm" /></p>
             <div onChange={this.handleChange} >
             <div className="App-entry">
             <label>Sun Rise Time:</label>{this.state.sunrise}
             <label>Sun Set Time:</label>{this.state.sunset}<br /><br />
             <label>Door Open Time:</label>{this.state.dooropen}
             <label>Door Close Time:</label>{this.state.doorclose}<br /><br />
             <label>Light On:</label>{this.state.lighton}
             <label>Light Off:</label>{this.state.lightoff}<br /><br />
             <label>Heat Status:</label>Off<br /><br />
             <label>Fan Status:</label>Off
             </div>
           </div>
         </div>
  }
}

export default StatusForm;
