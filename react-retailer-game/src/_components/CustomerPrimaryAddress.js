import React from 'react';

import { connect } from 'react-redux'

import { Button, Checkbox } from 'semantic-ui-react'

class PrimaryAddress extends React.Component {



  render() {
      return (
        <div className={"address-list__address-container " + this.props.index}>
          {this.props.edit === true ?
            (
            <div className="address-list__address-form">
              <div className="paneAccount50">
                <input placeholder='Country/Region' name='country' value={this.props.country} type='text' onChange={(e) => this.props.handleChangePrimaryAddress(e)} />
              </div>
              <div className="paneAccount50">
                <input placeholder='Address' name='address' value={this.props.address} type='text' onChange={(e) => this.props.handleChangePrimaryAddress(e)} />
              </div>
              <div className="paneAccount50">
                <input placeholder='Zip' name='zip_code' value={this.props.zip_code} type='text' onChange={(e) => this.props.handleChangePrimaryAddress(e)} />
              </div>
              <div className="paneAccount50">
                <input placeholder='City' name='city' value={this.props.city} type='text' onChange={(e) => this.props.handleChangePrimaryAddress(e)} />
              </div>
              <div className="paneAccount50">
                <input placeholder='State' name='state' value={this.props.state} type='text' onChange={(e) => this.props.handleChangePrimaryAddress(e)} />
              </div>
            </div>
            ) : (
              <div className="address-list__address">
                {this.props.address}, {this.props.zip_code}, {this.props.city}, {this.props.state}, {this.props.country}
              </div>
            )}
            <div className="address-list__btn-change">
                <Button className="panel-btn join-btn" onClick={() => this.props.onPrimaryEditAddress()}>
                  {this.props.edit === false ? 'Change' : 'Hide'}
                </Button>
            </div>
        </div>

      )

  }
}

const mapStateToProps = store => ({
})

const mapActionsToProps = {
}

export default connect(mapStateToProps, mapActionsToProps)(PrimaryAddress)
