import React from "react"
import { connect } from 'react-redux'
import { SendCreateBid } from '../_actions/Bids.action'

import { Button, Header, Modal, Form, Checkbox, Icon } from 'semantic-ui-react'
import DateTimePicker from 'react-datetime-picker';

//let launchTradeBtnName = (process.env.REACT_APP_USER === 'customer' ? 'call' : 'put')
//let launchTradeHeader = (process.env.REACT_APP_USER === 'customer' ? 'YOU ARE PROPOSING FOR BUYING' : 'YOU ARE PROPOSING FOR THE SALE OF')

class CreateScheduledTrade extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      pw: '',
      retailerModalPut: { modalOpen: false, checkTermValue: false, checkGdprValue: false },
      date: new Date(),
      priceRequired: 0,
      shipping: 0,
      insurance: 0,
      feePercent: 5,
      taxPercent: 22,
      selectedFile: null
    }
  }


  handleOpen = () => this.setState(prevState => ({
    retailerModalPut: {
      ...prevState.retailerModalPut,
      modalOpen: true
    }
  }))

  handleClose = () => this.setState(prevState => ({
    retailerModalPut: {
      ...prevState.retailerModalPut,
      modalOpen: false
    }
  }))

  handleCloseSubmitted = () => {
    console.log("close")
    this.props.SendCreateBid(this.props.reference.id, this.state.date, this.state.selectedFile)

    this.props.modalClose()
    this.handleClose()
  }

  handleCancel = () => {
    this.setState({ pw: '', retailerModalPut: { modalOpen: false, checkTermValue: false, checkGdprValue: false } })
  }

  handleChangePrice = (event) => {
    this.setState({ priceRequired: event.target.value })
  }

  fileChangedHandler = (event) => {
    this.setState({ selectedFile: event.target.files[0] })
  }

  handleChangePw = (event) => {
    this.setState({ pw: event.target.value })
  }

  toggleCheckTermValue = () => this.setState(prevState => ({
    retailerModalPut: {
      ...prevState.retailerModalPut,
      checkTermValue: !this.state.retailerModalPut.checkTermValue
    }
  }))

  toggleCheckGdprValue = () => this.setState(prevState => ({
    retailerModalPut: {
      ...prevState.retailerModalPut,
      checkGdprValue: !this.state.retailerModalPut.checkGdprValue
    }
  }))

  handleFormRetailerPut = (e) => {
    e.preventDefault()
    console.log(this.state.pw)
    console.log(this.state.retailerModalPut.checkTermValue) //in alt console.log(this.terms.state.checked) con ref={(input) => this.terms = input}
    console.log(this.state.retailerModalPut.checkGdprValue)

    this.setState({ pw: '', retailerModalPut: { modalOpen: false, checkTermValue: false, checkGdprValue: false } })
  }

  onChangeDate = date => this.setState({ date })

  render() {
    if (this.state.priceRequired > 0 && this.state.retailerModalPut.checkTermValue && this.state.retailerModalPut.checkGdprValue && this.state.pw) {
      this.props.onFormCompiledOk()
    } else {
      this.props.onFormNotCompiledOk()
    }
    return (
      <div>
        {this.props.reference.label}<br /> RefId: {this.props.reference.id}
        <div className="modalColor2">SUGGESTED PRICE: €{this.props.reference.price}</div>

        <hr style={{ color: "#d1d2d3" }} />
        <Form onSubmit={this.handleFormRetailerPut}>
          <Form.Field>
            <label>Your proposal:</label>

            <div className='field'><div style={{ position: "relative" }}><div style={{ position: "absolute", left: "5px", padding: ".67857143em 0.5em", color: "#000" }}>€</div></div>

              <input style={{ paddingLeft: "25px" }} required placeholder='Price' value={this.state.priceRequired > 0 ? this.state.price : ''} type='number' onChange={this.handleChangePrice} />
            </div>
          </Form.Field>
          <div className="modalBkgCosts">Watchbot fee 5%: <span className="modalBkgValue">€{this.state.priceRequired * this.state.feePercent / 100}</span></div>
          <div className="modalBkgCosts">VAT 22%: <span className="modalBkgValue">€{this.state.priceRequired * this.state.taxPercent / 100}</span></div>
          <div className="modalBkgCosts">Shipping: <span className="modalBkgValue">€{this.state.shipping}</span></div>
          <div className="modalBkgCosts">Insurance: <span className="modalBkgValue">€{this.state.insurance}</span></div>
          <div className="modalBkgTotal">TOTAL: <span className="modalBkgValue">€{Number(this.state.priceRequired) + this.state.priceRequired * this.state.feePercent / 100 + this.state.priceRequired * this.state.taxPercent / 100 + this.state.shipping + this.state.insurance}</span></div>
          <br />
          <Form.Field>
            <label>Trade Start Time (mm/dd/yy - hh:mm am/pm)</label>
            <DateTimePicker
              onChange={this.onChangeDate}
              value={this.state.date}
            />
          </Form.Field>
          {process.env.REACT_APP_USER === 'retailer' &&
            <Form.Field>
              <label>Upload a picture</label>
              <input type="file" onChange={this.fileChangedHandler} />
            </Form.Field>
          }
          <Form.Field>
            <input className="modalPw" required placeholder='Password' value={this.state.pw} type='password' onChange={this.handleChangePw} />
          </Form.Field>
          <Form.Field>
            <Checkbox label='I agree to the Terms and Conditions' defaultChecked={this.state.retailerModalPut.checkTermValue} onChange={this.toggleCheckTermValue} />
            <Checkbox style={{ marginLeft: "10px" }} label='Consent data storing' defaultChecked={this.state.retailerModalPut.checkGdprValue} onChange={this.toggleCheckGdprValue} />
          </Form.Field>
          {(!this.state.retailerModalPut.checkTermValue || !this.state.retailerModalPut.checkGdprValue) &&
            <div>
              <i>To participate to the trade, you must accept the Terms and Conditions and give your consent for the storage of the necessary data</i>
            </div>
          }


        </Form>


      </div>
    )
  }
}

const mapStateToProps = store => ({
})

const mapActionsToProps = {
  SendCreateBid

}


export default connect(mapStateToProps, mapActionsToProps)(CreateScheduledTrade)
