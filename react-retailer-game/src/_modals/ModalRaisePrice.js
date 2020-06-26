import React from "react"
import { connect } from 'react-redux'
import { SendRaisePrice, ResetGraphDataSecondCall, ResetChosenBidders } from '../_actions/Bids.action'
import { HideModal } from '../_actions/Modals.action'

import { Button, Modal, Form, Container, Grid } from 'semantic-ui-react'
import { formatMoney } from "../_utilities/price";

import WatchDetails from '../_components/WatchDetails'

class ModalRaisePrice extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      price: 0,
      dutiesPercent: 0,
      shipping: 0,
      insurance: 0,
      feePercent: 5,
      taxPercent: 22,
    }
  }

  handleIncreasePrice = () => {

    this.setState(prevState => {
      return { price: Number(prevState.price) + 100 }
    })
  }

  handleDecreasePrice = () => {
    if (this.state.price >= 100) {
      this.setState(prevState => {
        return { price: Number(prevState.price) - 100 }
      })
    }
  }

  handleCloseModal = () => {
    this.setState({
      price: 0,
      dutiesPercent: 0,
      shipping: 0,
      insurance: 0,
      feePercent: 5,
      taxPercent: 22,
    })
    this.props.SendRaisePrice(this.props.modalProps.bidId, this.props.modalProps.price) //confirm first call price
    this.props.HideModal()
  }

  handleCloseSubmitted = () => {
    console.log(this.props.modalProps.chosenOffers, this.state.price)
    let raise_price = (this.state.price !== this.props.modalProps.price && this.state.price > 0) ? this.state.price : null
    //this.props.SendFirstCallSelection(this.props.modalProps.bidId, this.props.modalProps.chosenOffers, raise_price, this.props.modalProps.chosenBidders)
    //this.props.ResetGraphDataSecondCall(this.props.modalProps.chosenOffers.length)
    //this.props.ResetChosenBidders()
    this.props.SendRaisePrice(this.props.modalProps.bidId, raise_price)
    this.props.HideModal()
  }

  handleChangePrice = (event) => {
    this.setState({ price: event.target.value })
  }

  keyPress = (event) => {
    if (event.keyCode == 13) {
      //console.log('value', event.target.value);
      event.target.blur();
    }
  }


  handleFormRetailerPut = (e) => {
    e.preventDefault()
    //this.setState({ pw: '', retailerModalPut: { modalOpen: false, checkTermValue: false, checkGdprValue: false }})
  }

  onChangeDate = date => this.setState({ date });

  render() {
    // const wbFee = (Number(this.props.modalProps.reference.price) / 100) * this.state.feePercent;
    let askedPrice = Number(this.state.price);
    const wbFee = (Number(askedPrice * this.state.feePercent / 100) * 1.22);

    const deposit = ((Number(this.props.modalProps.reference.price) / 100) * 20);

    /* seller */
    const NetCashIn = () => {
      let askedPrice = Number(this.state.price);
      // NetCashIn = askedPrice + VAT - shipping - insurance
      return askedPrice > 0 ?
        formatMoney(askedPrice + (askedPrice * this.state.taxPercent / 100) - this.state.shipping - this.state.insurance) :
        '0,00';
    }

    /* bayer */
    const TotalToPay = () => {
      let askedPrice = Number(this.state.price);
      // TotalToPay = askedPrice + VAT  + duties + shipping + insurance
      return askedPrice > 0 ?
        formatMoney((askedPrice + (askedPrice * this.state.taxPercent / 100) + (askedPrice * this.state.dutiesPercent / 100) + this.state.shipping + this.state.insurance)) :
        '0,00';
    }

    return (
      <Modal open onClose={this.props.HideModal} className="modal-container join-trade">
        <Modal.Content className={process.env.REACT_APP_USER === 'customer' ? 'bayer' : 'seller'}>
          <div className="close-modal-btn__container">
            <div className="close-modal-btn" onClick={() => this.handleCloseModal()} />
          </div>
          <Container className="mainBoard">
            <Grid columns={16}>
              <Grid.Row>
                <Grid.Column mobile={16} tablet={8} computer={8} className="col-left col-watch-details">
                  <div className="head-wrapper">
                    <h3>You are Relaunching the trade # {this.props.modalProps.bidId}</h3>
                    <h3>Please confirm or change asked price.</h3>
                  </div>

                  <WatchDetails watchDetails={this.props.refProps.referenceDetails} show={{ model_name: true, price: true, btn_show_more: true }} />
                </Grid.Column>

                <Grid.Column mobile={16} tablet={8} computer={8} className="col-right">
                  <div className="head-wrapper">
                    <h3>Trade {this.props.modalProps.bidId}</h3>
                  </div>
                  <div className="content-wrapper">
                    <Form onSubmit={this.handleFormRetailerPut}>
                      <h4 className="price asked-price">
                        <span>Asked price 1st round</span>
                        {formatMoney(this.props.modalProps.price)} €
                      </h4>

                      <Form.Group className="fld__price-wrapper" style={{ flexDirection: 'row' }}>
                        <Form.Field style={{ flex: '1 0 30%' }}>
                          <label className="orange">Asked price 2nd round</label>
                        </Form.Field>
                        <Form.Field>
                          <input required placeholder='Insert your asked price'
                            value={this.state.price > 0 ? this.state.price : ''}
                            type='number'
                            onKeyDown={this.keyPress}
                            onChange={this.handleChangePrice}
                            step="100" />
                          <Button type="button" onClick={() => this.handleIncreasePrice()}>Inc</Button>
                          <Button type="button" onClick={() => this.handleDecreasePrice()}>Dec</Button>

                          <div className="fld__msg__warning">
                            {(!this.state.price) && (<span>Please insert your price</span>)}
                            {(this.state.price % 100 !== 0) &&
                              (
                                <span>All bids must be a multiple of 100</span>
                              )
                            }

                            {(process.env.REACT_APP_USER === 'customer' && this.state.price > 0 && this.state.price <= Number(this.props.modalProps.price)) &&
                              (
                                <span>Your bid must be higher than the one requested in the first round</span>
                              )
                            }

                            {(process.env.REACT_APP_USER === 'customer' && this.state.price > Number(this.props.refProps.referenceDetails.price)) &&
                              (
                                <span>Your bid must be lower than or equal to the list price</span>
                              )
                            }

                            {(process.env.REACT_APP_USER === 'retailer' && this.state.price > 0 && this.state.price > Number(this.props.modalProps.price)) &&
                              (
                                <span>Your bid must not exceed that requested in the first round</span>
                              )
                            }
                          </div>
                        </Form.Field>
                      </Form.Group>

                      {process.env.REACT_APP_USER === 'customer' ? (/* buyer */
                        <div>
                          <div className="modalBkgCosts"><span>+ VAT % *</span><span className="modalBkgValue">+ {formatMoney(this.state.price * this.state.taxPercent / 100)}<i>€</i></span></div>
                          <div className="modalBkgCosts"><span>+ Duties *</span><span className="modalBkgValue">+ {formatMoney(this.state.dutiesPercent)}<i>€</i></span></div>
                          <div className="modalBkgCosts"><span>+ Shipping *</span><span className="modalBkgValue">+ {formatMoney(this.state.shipping)}<i>€</i></span></div>
                          <div className="modalBkgCosts"><span>+ Insurance *</span><span className="modalBkgValue">+ {formatMoney(this.state.insurance)}<i>€</i></span></div>
                          <div className="modalBkgTotal orange"><span>TOTAL TO PAY</span><span className="modalBkgValue"><TotalToPay /><i>€</i></span></div>
                          <div className="modalBkgCosts"><span>DEPOSIT</span><span className="modalBkgValue">{formatMoney(deposit)}<i>€</i></span></div>
                          <div className="modalBkgCosts"><span className="fld__msg__totals">* Estimate (to be calculated upon selection of seller)</span></div>
                        </div>
                      ) : (
                          /* seller */
                          <div>
                            <div className="modalBkgCosts"><span>+VAT % *</span><span className="modalBkgValue">+ {formatMoney(this.state.price * this.state.taxPercent / 100)}<i>€</i></span></div>
                            <div className="modalBkgCosts"><span>- Shipping *</span><span className="modalBkgValue">- {formatMoney(this.state.shipping)}<i>€</i></span></div>
                            <div className="modalBkgCosts"><span>- Insurance *</span><span className="modalBkgValue">- {formatMoney(this.state.insurance)}<i>€</i></span></div>
                            <div className="modalBkgCosts"><span>- WB fee</span><span className="modalBkgValue">- {formatMoney(wbFee)}<i>€</i></span></div>
                            <div className="modalBkgTotal orange"><span>NET CASH IN</span><span className="modalBkgValue"><NetCashIn /><i>€</i></span></div>
                            <div className="modalBkgCosts"><span>DEPOSIT</span><span className="modalBkgValue">{formatMoney((deposit / 100) * 85)}<i>€</i></span></div>
                            <div className="modalBkgCosts"><span className="fld__msg__totals">* Estimate (to be calculated upon selection of buyer)</span></div>
                          </div>
                        )}
                    </Form>
                  </div>
                </Grid.Column>
              </Grid.Row>
            </Grid>
          </Container>


          <div className="actions">
            {/*
            <div>
              <Button className="gray-btn" onClick={() => this.handleCloseModal()}>
                Cancel
              </Button>
            </div>
            */}

            <Button className="orange__btn" disabled={this.state.price <= 0 || this.state.price % 100 !== 0 || (process.env.REACT_APP_USER === 'customer' && this.state.price > Number(this.props.refProps.referenceDetails.price)) || (process.env.REACT_APP_USER === 'retailer' && this.state.price > Number(this.props.modalProps.price))} onClick={this.handleCloseSubmitted}>
              Submit relaunch
              </Button>
          </div>
        </Modal.Content>
      </Modal>
    )
  }
}

const mapStateToProps = store => ({
  refProps: store.referenceInfo
})

const mapActionsToProps = {
  HideModal,
  //SendFirstCallSelection,
  SendRaisePrice,
  ResetGraphDataSecondCall, ResetChosenBidders,
}


export default connect(mapStateToProps, mapActionsToProps)(ModalRaisePrice)
