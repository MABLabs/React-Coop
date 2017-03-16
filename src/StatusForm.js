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

    submitData() {
    }

    adjustTime(rHours, rMinutes, offset, ampm)
    {
      var adjustedTime = '';

      var toffset = rMinutes + offset;
      if (toffset < 0) {
        rHours--;
        toffset = 60 + toffset;
      }

      if (toffset > 59) {
        rHours++;
        toffset = toffset - 60;
      }

      adjustedTime = rHours + ':' + toffset + ampm;

      return adjustedTime;
    }

    refreshData() {
      window.location.reload();
   }

render() {

  let now = new Date()

  var lat = parseFloat((myData.latitude).toFixed(4));
  var long = parseFloat((myData.longitude).toFixed(4));

  //var addRise = this.state.sunrise.add(myData.dooropenOffset);

  var times = SunCalc.getTimes(new Date(), myData.latitude, myData.longitude);
  this.state.sunrise = times.sunrise.getHours() + ':' + times.sunrise.getMinutes() + 'AM';
  this.state.sunset = (times.sunset.getHours()-12) + ':' + times.sunset.getMinutes() + 'PM';
//  this.state.dooropen = times.sunrise.getHours() + ':' + (times.sunrise.getMinutes() + myData.dooropenOffset) + 'AM';
  this.state.dooropen = this.adjustTime(times.sunrise.getHours(), times.sunrise.getMinutes(), myData.dooropenOffset, 'AM');
  this.state.doorClose = this.adjustTime((times.sunset.getHours()-12), times.sunset.getMinutes(), myData.doorcloseOffset, 'PM');
  this.state.lighton = this.adjustTime(times.sunrise.getHours(), times.sunrise.getMinutes(), myData.lightonOffset, 'AM');
  this.state.lightoff = this.adjustTime((times.sunset.getHours()-12), times.sunset.getMinutes(), myData.lightoffOffset, 'PM');

  return <div>
           <h1>Coop Status</h1>
           <p>Current time <Time value={now} format="YYYY/MM/DD HH:mm" /></p>
             <div onChange={this.handleChange} >
             <div className="App-entry">
             <label>Latitude:</label><b>{lat}</b>
             <label>Longitude:</label><b>{long}</b><br /><br />
             <label>Sun Rise Time:</label><b>{this.state.sunrise}</b>
             <label>Sun Set Time:</label><b>{this.state.sunset}</b><br /><br />
             <label>Door Open Time:</label><b>{this.state.dooropen}</b>
             <label>Door Close Time:</label><b>{this.state.doorClose}</b><br /><br />
             <label>Light On:</label><b>{this.state.lighton}</b>
             <label>Light Off:</label><b>{this.state.lightoff}</b><br /><br />
             <label>Heat Status:</label><b>Off</b><br /><br />
             <label>Fan Status:</label><b>Off</b>
             </div>
           <button type="button" onClick={this.refreshData}>Refresh Page</button>&nbsp;
           </div>
         </div>
  }
}

export default StatusForm;
