import React from 'react';
import { connect } from 'react-redux'
import { UpdateLatestReference, LoadReferenceInfo, LoadRefDetails  } from '../_actions/References.action'
import axios from "axios"

import { withRouter } from "react-router-dom"

import Select from 'react-select'
//import { Async } from 'react-select'

import lens from '../_assets/icons/lens.png';

class WatchesSearch extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedOption: '',
      options: (process.env.REACT_APP_GAME ==="false" ? [] : require("../_game/references.js")(''))
    }
  }

  getOptions (searchTerm) {
    return axios.get(process.env.REACT_APP_API_HOST+`reference/?search=${searchTerm}`, { headers: { 'Authorization': 'Token '+localStorage.getItem('wbtk')} })
      .then((response) => {
        return { options: response.data }
      })
  }

  lensRenderer () {
     return (
         <div style={{position: "relative", top: "6px"}}><img src={lens} alt="lens search"/></div>
        );
  }

  updateSearch = (selectedOption) => {
    //console.log(selectedOption)
    this.setState({ selectedOption })
    if(selectedOption === null || selectedOption === '') return false;
    this.props.UpdateLatestReference({ selectedOption })
    this.props.LoadRefDetails(selectedOption.id);
    this.props.LoadReferenceInfo({ refId: selectedOption.id, refPrice: selectedOption.price})
    //this.props.history.push('/reference-info') //remember withRouter in export
  }

  focus = () => {
    console.log(this.selectRef);
    this.selectRef.focus();
  }


  render() {
    const { selectedOption } = this.state
    return (
      <div className="watches-search__container">

          <div className="actBar">
            { process.env.REACT_APP_GAME ==="false" ?
              (
                <Select.Async
                  ref={ ref => { this.selectRef = ref; }}
                  arrowRenderer={this.lensRenderer}
                  className="search-watch"
                  name="form-field-name"
                  placeholder="ADD A WATCH TO YOUR WATCHLIST"
                  //value={selectedOption}
                  onChange={this.updateSearch}
                  autoBlur={true}
                  loadOptions={this.getOptions.bind(this)}
                />
              ):(
                <Select
                  arrowRenderer={this.lensRenderer}
                  className="search-watch"
                  name="form-field-name"
                  placeholder="ADD A WATCH TO YOUR WATCHLIST"
                  //value={selectedOption}
                  onChange={this.updateSearch}
                  autoBlur={true}
                  options={this.state.options}
                />
              )
            }

            </div>




        {this.props.empty ?
        (
          <div className="emptyWatchList">
            <div>
              Your Watch-List is empty
            </div>
            {/* <Button className="buttonEmptyWatchList" onClick={this.focus} >
              ADD WATCHES
            </Button> */}
          </div>
        ) : (<span></span>)
        }
      </div>
    )
  }
}

const mapStateToProps = store => ({
})

const mapActionsToProps = {
  UpdateLatestReference,
  LoadRefDetails,
  LoadReferenceInfo
}

export default withRouter(connect(mapStateToProps, mapActionsToProps)(WatchesSearch))
