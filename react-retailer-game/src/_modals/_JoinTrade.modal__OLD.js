import React from "react";
import { connect } from 'react-redux'
import { SendJoinBid } from '../_actions/Bids.action'
import { SetNotificationReadById } from '../_actions/Notifications.action'

import { Button, Modal, Form, Checkbox, Icon } from 'semantic-ui-react'

let joinTradeHeader = (process.env.REACT_APP_USER === 'customer' ? 'SUBMIT A PURCHASE REQUEST FOR' : 'SUBMIT AN OFFER FOR')


class ModalJoinTrade extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      price: 0,
      pw: '',
      retailerModalPut: { modalOpen: false, checkTermValue: false, checkGdprValue: false },
      duties: 0,
      shipping: 0,
      insurance: 0,
      feePercent: 5,
      taxPercent: 22
    }
  }

  handleOpen = () => this.setState(prevState => ({
    retailerModalPut: {
      ...prevState.retailerModalPut,
      modalOpen: true
    }
  }))

  handleCloseModal = () => {
    this.setState({ price: 0, pw: '', retailerModalPut: { modalOpen: false, checkTermValue: false, checkGdprValue: false } })
    this.props.modalClose()
  }

  handleCloseSubmitted = () => {
    this.props.SendJoinBid(this.props.bid, this.state.price.toString(), this.props.currentPage, this.props.currentPanel)
    if (this.props.fromNotification > 0) {
      this.props.SetNotificationReadById([this.props.fromNotification])
    }
    this.handleCloseModal()
  }

  handleCancel = () => {
    this.setState({ price: 0, pw: '', retailerModalPut: { modalOpen: false, checkTermValue: false, checkGdprValue: false } })
  }

  handleChangePrice = (event) => {
    this.setState({ price: event.target.value })
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


  render() {
    let maximumPrice = Number(this.props.minPrice)
    if (this.props.raise_price != null) {
      maximumPrice = Math.max(Number(this.props.minPrice), Number(this.props.raise_price))
    }
    return (
      <Modal size='tiny' open={this.props.modalOpen} onClose={this.handleCloseModal}>

        <Modal.Content>
          <h3>{joinTradeHeader}:</h3>
          <Modal.Description>
            {this.props.label}<br />
            Trade Id: {this.props.bid}<br />
            <div className="modalColor2">SUGGESTED PRICE: €{this.props.minPrice}</div>
            <br />
            <p>At {this.props.fromNotification} vero eos et accusamus et iusto dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non provident</p>

          </Modal.Description>
          <hr style={{ color: "#d1d2d3" }} />
          <Form onSubmit={this.handleFormRetailerPut}>
            <Form.Field>
              <label>Your Price - maximum should be {this.props.minPrice}
                {this.props.raise_price != null ?
                  (<div>New Price suggested from Trade Op: {this.props.raise_price}<br /></div>)
                  :
                  (<span></span>)
                }
              </label>

              <div className='field'><div style={{ position: "relative" }}><div style={{ position: "absolute", left: "5px", padding: ".67857143em 0.5em", color: "#000" }}>€</div></div>

                <input style={{ paddingLeft: "25px" }} required placeholder='Price' value={this.state.price > 0 ? this.state.price : ''} type='number' onChange={this.handleChangePrice} />
              </div>
              {(this.state.price % 100 !== 0) &&
                (
                  <div style={{ color: "#ff6600" }}>All bids must be a multiple of 100</div>
                )
              }
            </Form.Field>
            {process.env.REACT_APP_USER === 'customer' ? (
              <div>
                <div className="modalBkgCosts">VAT %: <span className="modalBkgValue">€{this.state.price * this.state.taxPercent / 100}</span></div>
                <div className="modalBkgCosts">Duties: <span className="modalBkgValue">€{this.state.duties}</span></div>
                <div className="modalBkgCosts">Shipping: <span className="modalBkgValue">€{this.state.shipping}</span></div>
                <div className="modalBkgCosts">Insurance: <span className="modalBkgValue">€{this.state.insurance}</span></div>
                <div className="modalBkgTotal">TOTAL TO PAY: <span className="modalBkgValue">€{Number(this.state.price) + Number(this.state.price * this.state.taxPercent / 100) + Number(this.state.duties) + Number(this.state.shipping) + Number(this.state.insurance)}</span></div>

                <div className="modalBkgDeposit">Your credit card will be charged <span className="modalBkgValue">€{(Number(this.state.price) + Number(this.state.price * this.state.taxPercent / 100) + Number(this.state.duties) + Number(this.state.shipping) + Number(this.state.insurance)) / 20}</span> (5%) as deposit to launch a call.</div>
              </div>
            ) : (
                <div>
                  <div className="modalBkgCosts">Watchbot fee 5%: <span className="modalBkgValue">€{this.state.price * this.state.feePercent / 100}</span></div>
                  <div className="modalBkgCosts">VAT %: <span className="modalBkgValue">€{this.state.price * this.state.taxPercent / 100}</span></div>
                  <div className="modalBkgCosts">Duties: <span className="modalBkgValue">€{this.state.duties}</span></div>
                  <div className="modalBkgCosts">Shipping: <span className="modalBkgValue">€{this.state.shipping}</span></div>
                  <div className="modalBkgCosts">Insurance: <span className="modalBkgValue">€{this.state.insurance}</span></div>
                  <div className="modalBkgTotal">TOTAL TO CASH IN: <span className="modalBkgValue">€{Number(this.state.price) + Number(this.state.price * this.state.taxPercent / 100) + Number(this.state.duties) + Number(this.state.shipping) + Number(this.state.insurance) - Number(this.state.price * this.state.feePercent / 100)}</span></div>

                  <div className="modalBkgDeposit">Deposit (5%): <span className="modalBkgValue">€{(Number(this.state.price) + Number(this.state.price * this.state.taxPercent / 100) + Number(this.state.duties) + Number(this.state.shipping) + Number(this.state.insurance)) / 20}</span></div>
                </div>
              )}
            <br />
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
            {(this.state.retailerModalPut.checkTermValue && this.state.retailerModalPut.checkGdprValue) && this.state.price > 0 && this.state.price < (Number(this.props.minPrice) - Number(this.props.minPrice) / 6.6666) && this.state.pw &&
              <div className="modalColor2">
                <b>Warning! You are bidding lower by over 15% . The request will be accepted, but acceptance by the seller is not guaranteed</b>
              </div>
            }


          </Form>

        </Modal.Content>
        <Modal.Actions>
          <Button color='white' onClick={() => this.handleCloseModal()} >
            <Icon name='checkmark' /> Cancel
            </Button>
          {this.state.retailerModalPut.checkTermValue && this.state.retailerModalPut.checkGdprValue && this.state.price > 0 && (this.state.price % 100 === 0) && this.state.price <= maximumPrice && this.state.pw ? (
            <Button color='white' type='submit' inverted onClick={this.handleCloseSubmitted}>Submit</Button>
          ) : (
              <Button type='submit' disabled inverted>Submit</Button>
            )

          }



        </Modal.Actions>
      </Modal>

    )
  }
}

const mapStateToProps = store => ({
  currentPage: store.userInfo.currentPage,
  currentPanel: store.userInfo.currentPanel
})

const mapActionsToProps = {
  SendJoinBid,
  SetNotificationReadById
}

export default connect(mapStateToProps, mapActionsToProps)(ModalJoinTrade)
