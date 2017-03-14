import React, { Component } from 'react';
import autoBind from 'react-autobind';

class OverideForm extends Component {
    constructor(props) {
      super(props);

      autoBind(this);

      this.state = {
        cooptype: 'overide',
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

var red = {color: 'rgb(255,0,0)', fontSize: '1.6em'};
var valid = this.checkValid();
var vs = (name) => (valid[name].length === 0) ? <span></span>: <span style={red} title={valid[name]}>*</span>;

return <div>
         <h1>Coop Override</h1>
         <div onChange={this.handleChange} >
           <div className="App-entry">
             <h1>I am here in Override</h1>
           </div>
           <hr />
         </div>
       </div>
  }
}

export default OverideForm;
