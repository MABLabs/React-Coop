import React, { Component } from 'react';
import autoBind from 'react-autobind';
import Time from 'react-time'
import SunCalc from 'suncalc'
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

    checkValid() {
            var sPat = /^[A-Za-z ]*$/;
            var siPat = /^[A-Za-z0-9//]*$/;
            var iPat = /^\d+$/;

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

render() {

  let now = new Date()

  var red = {color: 'rgb(255,0,0)', fontSize: '1.6em'};
  var valid = this.checkValid();
  var vs = (name) => (valid[name].length === 0) ? <span></span>: <span style={red} title={valid[name]}>*</span>;

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
             Heat Status: <br /><br />
             Fan Status:
             <div class="container">
               <div class="led-box">
                 <div class="led-green"></div>
               </div>
             </div>
             </div>
             <hr />
           </div>
         </div>
  }
}

export default StatusForm;
