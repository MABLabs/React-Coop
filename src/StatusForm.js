import React, { Component } from 'react';
import autoBind from 'react-autobind';
import Time from 'react-time'
import SunCalc from 'suncalc'
import Clock from 'react-clock'
import axios from 'axios'
import myData from './data.json';

class StatusForm extends Component {
    constructor(props) {
      super(props);

      autoBind(this);

      this.state = {
        cooptype: 'status',
        tempF: 'Loading...',
        sunrise: 0,
        sunset: 0,
        dooropen: 0,
        doorclose: 0,
        lighton: 0,
        lightoff: 0,
        heaton: 0,
        heatoff: 0,
        heatStatus: 'Off',
        fanon: 0,
        fanoff: 0,
        fanStatus: 'Off',
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

    componentDidMount() {
      axios.get('/api/current_temp/')
      .then((response) => { 
         this.setState({'tempF': response.data}); 

        if (this.state.tempF >= myData.fanOn) 
           this.setState({'fanStatus': 'On'})
        else 
           this.setState({'fanStatus': 'Off'})

        if (this.state.tempF <= myData.heatOn)
           this.setState({'heatStatus': 'On'})
        else
           this.setState({'heatStatus': 'Off'})

      })
      .catch((error)   => { this.setState({'tempF': error.message}); });

      if (this.state.tempF >= myData.fanOn) {
         this.setState({'fanStatus': 'On'})
         console.log('Turn fan On:', this.state.tempF);
      }
      else {
         this.setState({'fanStatus': 'Off'})
         console.log('Turn fan Off:', this.state.tempF);
      }

      if (this.state.tempF <= myData.heatOn)
         this.setState({'heatStatus': 'On'})
      else
         this.setState({'heatStatus': 'Off'})

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

      adjustedTime = rHours + ':' + (('00'+toffset).slice(-2)) + ampm;

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
  //var temp = Temp.readSimpleF();
  //console.log(temp);

//  this.setState({sunrise: (times.sunrise.getHours() + ':' + times.sunrise.getMinutes() + 'AM')});
//  this.setState({sunset:  ((times.sunset.getHours()-12) + ':' + times.sunset.getMinutes() + 'PM')});

//  this.setState({dooropen: (this.adjustTime(times.sunrise.getHours(), times.sunrise.getMinutes(), myData.dooropenOffset, 'AM'))});
//  this.setState({doorClose: (this.adjustTime((times.sunset.getHours()-12), times.sunset.getMinutes(), myData.doorcloseOffset, 'PM'))});

//  this.setState({lighton: (this.adjustTime(times.sunrise.getHours(), times.sunrise.getMinutes(), myData.lightonOffset, 'AM'))});
//  this.setState({lightoff: (this.adjustTime((times.sunset.getHours()-12), times.sunset.getMinutes(), myData.lightoffOffset, 'PM'))});
  this.state.sunrise = times.sunrise.getHours() + ':' + (('00'+times.sunrise.getMinutes()).slice(-2)) + 'AM';
  this.state.sunset = (times.sunset.getHours()-12) + ':' + (('00'+times.sunset.getMinutes()).slice(-2)) + 'PM';

  this.state.dooropen = this.adjustTime(times.sunrise.getHours(), times.sunrise.getMinutes(), myData.dooropenOffset, 'AM');
  this.state.doorClose = this.adjustTime((times.sunset.getHours()-12), times.sunset.getMinutes(), myData.doorcloseOffset, 'PM');
  this.state.lighton = this.adjustTime(times.sunrise.getHours(), times.sunrise.getMinutes(), myData.lightonOffset, 'AM');
  this.state.lightoff = this.adjustTime((times.sunset.getHours()-12), times.sunset.getMinutes(), myData.lightoffOffset, 'PM');

  return <div>
           <h1>Coop Status</h1>
           <p><Time value={now} format="MM/DD/YYYY"/></p><Clock />
             <div onChange={this.handleChange} >
             <div className="App-entry">
             <label>Current Temp:</label><b>{this.state.tempF}&deg;</b><br /><br />
           <div className="App-box">
             <div className="App-display">
             <b>Put Camera Stuff Here</b><br />
             </div>
           </div> 
             <label>Latitude:</label><b>{lat}</b>
             <label>Longitude:</label><b>{long}</b><br /><br />
             <label>Sun Rise Time:</label><b>{this.state.sunrise}</b>
             <label>Sun Set Time:</label><b>{this.state.sunset}</b><br /><br />
             <label>Door Open Time:</label><b>{this.state.dooropen}</b>
             <label>Door Close Time:</label><b>{this.state.doorClose}</b><br /><br />
             <label>Light On:</label><b>{this.state.lighton}</b>
             <label>Light Off:</label><b>{this.state.lightoff}</b><br /><br />
             <label>Heat On:</label><b>{myData.heatOn}&deg;</b>
             <label>Fan On:</label><b>{myData.fanOn}&deg;</b><br />
             <label>Heat Off:</label><b>{myData.heatOff}&deg;</b>
             <label>Fan Off:</label><b>{myData.fanOff}&deg;</b><br />
             <label>Heat Status:</label><b>{this.state.heatStatus}</b>
             <label>Fan Status:</label><b>{this.state.fanStatus}</b>
             </div>
           <button type="button" onClick={this.refreshData}>Refresh Page</button>&nbsp;
           </div>
         </div>
  }
}

export default StatusForm;
