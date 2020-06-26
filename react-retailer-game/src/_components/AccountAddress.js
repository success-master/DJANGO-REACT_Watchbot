import React from 'react';

import { connect } from 'react-redux'

import { Button, Checkbox } from 'semantic-ui-react'

class AccountAddress extends React.Component {



  render() {
      return (
        <div className={"address-list__address-container " + this.props.index}>
          {this.props.activeAddress ===  this.props.index ?
            (
            <div className="address-list__address-form">
              <div className="paneAccount50">
                <input placeholder='Country/Region' name='country' value={this.props.country} type='text' onChange={(e) => this.props.handleChangeAddress(e,this.props.index)} />
              </div>
              <div className="paneAccount50">
                <input placeholder='Address' name='address' value={this.props.address} type='text' onChange={(e) => this.props.handleChangeAddress(e,this.props.index)} />
              </div>
              <div className="paneAccount50">
                <input placeholder='Zip' name='zip_code' value={this.props.zip_code} type='text' onChange={(e) => this.props.handleChangeAddress(e,this.props.index)} />
              </div>
              <div className="paneAccount50">
                <input placeholder='City' name='city' value={this.props.city} type='text' onChange={(e) => this.props.handleChangeAddress(e,this.props.index)} />
              </div>
              <div className="paneAccount50">
                <input placeholder='State' name='state' value={this.props.state} type='text' onChange={(e) => this.props.handleChangeAddress(e,this.props.index)} />
              </div>
            </div>
            ) : (
              <div className="address-list__address">
                {this.props.address}, {this.props.zip_code}, {this.props.city}, {this.props.state}, {this.props.country}
              </div>
            )}
            <div className="address-list__btn-change">
                <Button className="panel-btn join-btn" onClick={() => {this.props.onShowFormEditAddress(this.props.index)}}>
                  {this.props.activeAddress === -1 ? 'Change' : (this.props.addNewAddress) ? 'Remove' : 'Hide'}
                </Button>
            </div>
          <div className="address-list__preferred-address">
            <Checkbox className="prefAddress" label='Billing' checked={this.props.preferred_billing_addr}  onChange={(e) => this.props.handleChangeDefaultAddress(e,this.props.index,'billing')}/>
            <Checkbox className="prefAddress" label='Shipping' checked={this.props.preferred_shipping_addr}  onChange={(e) => this.props.handleChangeDefaultAddress(e,this.props.index,'shipping')}/>
          </div>
        </div>

      )

  }
}

const mapStateToProps = store => ({
})

const mapActionsToProps = {
}

export default connect(mapStateToProps, mapActionsToProps)(AccountAddress)
