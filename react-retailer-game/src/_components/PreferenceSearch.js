import React from 'react';
import { connect } from 'react-redux'
import { UpdateLatestReference } from '../_actions/References.action'
import { SetPanelRightOpen } from '../_actions/Settings.action'
import axios from "axios"

import { withRouter } from "react-router-dom"

import Select from 'react-select'
import { Async } from 'react-select'

import { Container, Grid } from 'semantic-ui-react'
import lens from '../_assets/icons/lens.png';

class WatchesSearch extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedOption: '',
      options: []
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
         <div style={{position: "relative", top: "6px"}}><img src={lens} alt="search-lens" /></div>
        );
  }

  updateSearch = (selectedOption) => {
    this.setState({ selectedOption })
    this.props.UpdateLatestReference({ selectedOption })
    this.props.SetPanelRightOpen(false)
    this.props.history.push('/reference-info') //remember withRouter in export
  }

  render() {
    const { selectedOption } = this.state

    return (
      <Container className="prefSearchContainer">
        <Grid columns={16}>
          <Grid.Column mobile={16} tablet={16} computer={16}>
            <div className="prefBar">
            <Select.Async
              ref={ ref => { this.selectRef = ref; }}
              arrowRenderer={this.lensRenderer}
              className="search-preferences"
              name="form-field-name"
              placeholder="SEARCH"
              value={selectedOption}
              onChange={this.updateSearch}
              loadOptions={this.getOptions.bind(this)}
            />
            </div>

          </Grid.Column>


        </Grid>
      </Container>
    )
  }
}

const mapStateToProps = store => ({
})

const mapActionsToProps = {
  UpdateLatestReference,
  SetPanelRightOpen
}

export default withRouter(connect(mapStateToProps, mapActionsToProps)(WatchesSearch))
