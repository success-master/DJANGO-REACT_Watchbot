import React from "react";
import { connect } from 'react-redux'
import { SendJoinBid } from '../_actions/Bids.action'
import { SetNotificationReadById } from '../_actions/Notifications.action'

import { Container, Grid, Button, Modal, Form, Checkbox } from 'semantic-ui-react'
import { formatMoney } from '../_utilities/price';

import WatchDetails from '../_components/WatchDetails'
import CreditCards from '../_components/CreditCards'


class ModalJoinTrade extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            price: 0,
            pw: '',
            retailerModalPut: { modalOpen: false, checkTermValue: false, checkGdprValue: false },
            dutiesPercent: 0,
            shipping: 0,
            insurance: 0,
            feePercent: 5,
            taxPercent: 22,
            myBidPriceOK: false,
            maxBidPrice: 0,
            newCreditCardData: {
                cc: 0,
                cvv2: 0,
                expyy: 0,
                expmm: 0
            },
            credit_card_token_id: 0,
            warningShadow: false,
        }
    }

    handleIncreasePrice = () => {
        if (this.state.price <= (this.props.referenceDetails.price - 100)) {
            this.setState(prevState => {
                return { price: Number(prevState.price) + 100 }
            })
        }
    }

    handleDecreasePrice = () => {
        if (this.state.price >= 100) {
            this.setState(prevState => {
                return { price: Number(prevState.price) - 100 }
            })
            if ((!this.state.myBidPriceOK) && (this.state.price <= (this.state.maxBidPrice + 100))) {
                this.setState({ myBidPriceOK: true })
            }
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

    warningShadow = () => {
        this.setState({ warningShadow: true })
    }

    handleCloseSubmitted = () => {
        const { newCreditCardData, credit_card_token_id } = this.state;
        let newCCdata = null;
        if (newCreditCardData.cc > 0 &&
            newCreditCardData.cvv2 > 0 &&
            newCreditCardData.expyy > 0 &&
            newCreditCardData.expmm > 0
        ) {
            newCCdata = newCreditCardData;
        }

        if (credit_card_token_id > 0) {
            newCCdata = { credit_card_token_id };
        }
        //console.log(newCCdata, "+++++ newCCdata join +++++++")
        this.props.SendJoinBid(this.props.bid, this.state.price.toString(), this.props.currentPage, this.props.currentPanel, newCCdata)
        if (this.props.fromNotification > 0) {
            this.props.SetNotificationReadById([this.props.fromNotification])
        }
        this.handleCloseModal()
    }

    handleCancel = () => {
        this.setState({ price: 0, pw: '', retailerModalPut: { modalOpen: false, checkTermValue: false, checkGdprValue: false } })
    }

    handleChangePrice = (event) => {
        let price = Number(this.props.referenceDetails.price);
        let ost = ('0000000' + price).slice(-2);
        let basePrice = price - Number(ost);
        (event.target.value <= basePrice) ? this.setState({ myBidPriceOK: true, maxBidPrice: 0 }) : this.setState({ myBidPriceOK: false, maxBidPrice: basePrice });

        this.setState({ price: event.target.value })
    }

    keyPress = (event) => {
        if (event.keyCode == 13) {
            //console.log('value', event.target.value);
            event.target.blur();
        }
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


    handleNewCreditCard = (key, value, obj) => {
        let ccData = this.state.newCreditCardData;
        let newObject = {};
        (typeof obj === 'object' && obj !== null) ?
            (newObject = {
                ...ccData,
                ...obj
            }
            ) : (
                newObject = {
                    ...ccData,
                    [key]: value
                }
            )
        //console.log(newObject, "++++ newObject +++")
        this.setState({ newCreditCardData: newObject })
    }

    handleSetSelectedCreditCard = (id) => {
        //console.log(id, "++++ credit_card_token_id +++")
        this.setState({ credit_card_token_id: id })
    }


    render() {

        const SubmitButton = () => {
            if (process.env.REACT_APP_USER === 'customer' &&
                this.state.retailerModalPut.checkTermValue &&
                this.state.retailerModalPut.checkGdprValue) {
                return <Button className="orange__btn" type='submit' onClick={this.handleCloseSubmitted}>Submit bid</Button>
            }
            if (process.env.REACT_APP_USER === 'retailer') {
                return <Button className="orange__btn" type='submit' onClick={this.handleCloseSubmitted}>Submit bid</Button>
            }
            return <Button className="orange__btn" disabled>{process.env.REACT_APP_USER === 'customer' ? 'Submit bid' : 'Submit bid'}</Button>
        }

        // const wbFee = (Number(this.state.price) / 100) * this.state.feePercent;
        let askedPrice = Number(this.state.price);
        const wbFee = (Number(askedPrice * this.state.feePercent / 100) * 1.22);

        const deposit = ((Number(this.props.referenceDetails.price) / 100) * 20);
        let customerRaiseOk = ((process.env.REACT_APP_USER === 'customer') && (this.props.offer_before_relaunch !== null) && (this.state.price < Number(this.props.offer_before_relaunch))) ? false : true

        /* seller */
        const NetCashIn = () => {
            let myBidPrice = Number(this.state.price);
            // NetCashIn = myBidPrice + VAT - shipping - insurance
            return this.state.myBidPriceOK ?
                formatMoney(myBidPrice + (myBidPrice * this.state.taxPercent / 100) - this.state.shipping - this.state.insurance) :
                '0,00';
        }

        /* buyer */
        const TotalToPay = () => {
            let myBidPrice = Number(this.state.price);
            // TotalToPay = myBidPrice + VAT  + duties + shipping + insurance
            return this.state.myBidPriceOK ?
                formatMoney((myBidPrice + (myBidPrice * this.state.taxPercent / 100) + (myBidPrice * this.state.dutiesPercent / 100) + this.state.shipping + this.state.insurance)) :
                '0,00';
        }

        return (
            <Modal open={this.props.modalOpen} onClose={this.handleCloseModal} className="modal-container join-trade">
                <Modal.Content className={process.env.REACT_APP_USER === 'customer' ? 'bayer' : 'seller'}>
                    <div className="close-modal-btn__container"><div className="close-modal-btn" onClick={() => this.handleCloseModal()}></div></div>
                    <Container className="mainBoard">
                        <Grid columns={16}>
                            <Grid.Row>
                                <Grid.Column mobile={16} tablet={8} computer={8} className="col-left col-watch-details">
                                    <div className="head-wrapper">
                                        <h3>You are joining the {process.env.REACT_APP_USER === 'customer' ? 'PUT' : 'CALL'} {this.props.bid} for:</h3>
                                        <h4 className="model-name">
                                            {this.props.model}
                                            {/* <span>{this.props.selectedOption.id}</span> */}
                                        </h4>
                                        {!this.state.completedBeforeConfirmation ?
                                            (<h4 className="price" style={{paddingTop: '10px'}}>
                                                {formatMoney(this.props.referenceDetails.price)} €<span>list price</span>
                                            </h4>
                                            ) : (``)
                                        }
                                    </div>

                                    <WatchDetails watchDetails={this.props.referenceDetails} show={{}} />
                                </Grid.Column>

                                <Grid.Column mobile={16} tablet={8} computer={8} className="col-right">
                                    <div className="head-wrapper">
                                        <h3>Trade {this.props.bid}</h3>
                                    </div>
                                    <div className="content-wrapper">
                                        <Form onSubmit={this.handleFormRetailerPut}>
                                            <Form.Group className="date-picker-wrapper">
                                                {/*<Form.Field>
                                                <label>Date</label>
                                                </Form.Field>
                                                <Form.Field>
                                                <span className="date-picker-wrapper__date">DD/MM/YYYY</span>
                                                <span className="date-picker-wrapper__time">HH:MM</span>
                                                </Form.Field>*/}
                                            </Form.Group>

                                            <h4 className="price asked-price">
                                                <span>Asked price</span>{formatMoney(this.props.minPrice)} €
                                            </h4>

                                            <Form.Group className="fld__price-wrapper">
                                                <Form.Field>
                                                    <label className="orange">My bid price</label>
                                                </Form.Field>
                                                <Form.Field>
                                                    <input required placeholder='Insert your bid price'
                                                        value={this.state.price > 0 ? this.state.price : ''}
                                                        type='number'
                                                        onKeyDown={this.keyPress}
                                                        onChange={this.handleChangePrice}
                                                        step="100" />
                                                    <Button type="button" onClick={() => this.handleIncreasePrice()}>Inc</Button>
                                                    <Button type="button" onClick={() => this.handleDecreasePrice()}>Dec</Button>

                                                    <div className="fld__msg__warning">
                                                    {(!this.state.price) && (this.state.warningShadow == true) && (<span>Please insert your price</span>)}
                                                        {(this.state.price % 100 !== 0) &&
                                                            (
                                                                <span>All bids must be a multiple of 100</span>
                                                            )
                                                        }
                                                        {(!this.state.myBidPriceOK && this.state.maxBidPrice > 0) &&
                                                            (<span>Maximum price must be equal to or less than {this.props.referenceDetails.price} €</span>)
                                                        }
                                                        {!customerRaiseOk &&
                                                            (<span>Your bid must be higher than or equal to your first offer: {this.props.offer_before_relaunch} €</span>)
                                                        }
                                                    </div>
                                                </Form.Field>
                                            </Form.Group>

                                            {process.env.REACT_APP_USER === 'customer' ? (/* buyer */
                                                <div>
                                                    <div className="modalBkgCosts"><span>+ VAT % *</span><span className="modalBkgValue">+ {formatMoney(this.state.price * this.state.taxPercent / 100)}<i>€</i></span></div>
                                                    <div className="modalBkgCosts"><span>+ Duties *</span><span className="modalBkgValue">+ {formatMoney(this.state.price * this.state.dutiesPercent / 100)}<i>€</i></span></div>
                                                    <div className="modalBkgCosts"><span>+ Shipping *</span><span className="modalBkgValue">+ {formatMoney(this.state.shipping)}<i>€</i></span></div>
                                                    <div className="modalBkgCosts"><span>+ Insurance *</span><span className="modalBkgValue">+ {formatMoney(this.state.insurance)}<i>€</i></span></div>
                                                    <div className="modalBkgTotal orange"><span>TOTAL TO PAY</span><span className="modalBkgValue"><TotalToPay /><i>€</i></span></div>
                                                    <div className="modalBkgCosts"><span>DEPOSIT</span><span className="modalBkgValue">{formatMoney(deposit)}<i>€</i></span></div>
                                                    <div className="modalBkgCosts"><span className="fld__msg__totals">* Estimate (to be calculated upon selection of seller)</span></div>
                                                </div>
                                            ) : (
                                                    /* seller */
                                                    <div>
                                                        <div className="modalBkgCosts"><span>+ VAT % *</span><span className="modalBkgValue">+ {formatMoney(this.state.price * this.state.taxPercent / 100)}<i>€</i></span></div>
                                                        <div className="modalBkgCosts"><span>- Shipping *</span><span className="modalBkgValue">- {formatMoney(this.state.shipping)}<i>€</i></span></div>
                                                        <div className="modalBkgCosts"><span>- Insurance *</span><span className="modalBkgValue">- {formatMoney(this.state.insurance)}<i>€</i></span></div>
                                                        <div className="modalBkgCosts"><span>- WB fee</span><span className="modalBkgValue">- {formatMoney(wbFee)}<i>€</i></span></div>
                                                        <div className="modalBkgTotal orange"><span>NET CASH IN</span><span className="modalBkgValue"><NetCashIn /><i>€</i></span></div>
                                                        {/* <div className="modalBkgCosts"><span>DEPOSIT</span><span className="modalBkgValue">{formatMoney((deposit / 100) * 85)}<i>€</i></span></div> */}
                                                        <div className="modalBkgCosts"><span className="fld__msg__totals">* Estimate (to be calculated upon selection of buyer)</span></div>
                                                    </div>
                                                )}


                                            {process.env.REACT_APP_USER === 'customer' &&
                                                <CreditCards setNewCreditCardData={this.handleNewCreditCard.bind(this)}
                                                    setSelectedCreditCard={this.handleSetSelectedCreditCard.bind(this)}
                                                    show={{ add_new_cc: true }}
                                                    options={{ changeBtnText: 'Confirm or include credit card' }} />
                                            }

                                            {process.env.REACT_APP_USER === 'customer' &&
                                                <Form.Group className="fld__agree">
                                                    <Form.Field>
                                                        <Checkbox label='Terms & Conditions' defaultChecked={this.state.retailerModalPut.checkTermValue} onChange={this.toggleCheckTermValue} />
                                                    </Form.Field>
                                                    <Form.Field>
                                                        <Checkbox label='Allow Deposit on Credit Card' defaultChecked={this.state.retailerModalPut.checkGdprValue} onChange={this.toggleCheckGdprValue} />
                                                    </Form.Field>
                                                </Form.Group>
                                            }
                                            {(process.env.REACT_APP_USER === 'customer' && (this.state.retailerModalPut.checkTermValue != true || this.state.retailerModalPut.checkGdprValue != true)) && (this.state.warningShadow == true) && (
                                                <div className="fld__msg__warning_filled">
                                                    <span>To participate to the trade, you must accept the Terms and Conditions and give your consent for the storage of the necessary data</span>
                                                </div>
                                             )}
                                        </Form>
                                    </div>
                                </Grid.Column>
                            </Grid.Row>
                        </Grid>
                    </Container>


                    <div className="actions" style={{paddingTop: "18px"}}>
                        <div>
                            <Button className="gray-btn" onClick={() => this.handleCloseModal()}>
                                Cancel
                            </Button>
                        </div>

                        {this.state.price > 0 && (this.state.price % 100 === 0) && (this.state.price <= this.props.referenceDetails.price) && customerRaiseOk ? (
                            <SubmitButton />
                        ) : (
                                // <Button className="orange__btn" disabled>
                                //     {process.env.REACT_APP_USER === 'customer' ? 'Submit bid' : 'Submit bid'}
                                // </Button>
                                <Button
                                 className="orange__btn"
                                 onClick={() => this.warningShadow()}
                                 style={{opacity: '0.45'}}
                                 >
                                    {process.env.REACT_APP_USER === 'customer' ? 'Submit bid' : 'Submit bid'}
                                </Button>
                            )
                        }
                    </div>
                </Modal.Content>
            </Modal>

        )
    }
}

const mapStateToProps = store => ({
    currentPage: store.userInfo.currentPage,
    currentPanel: store.userInfo.currentPanel,
    referenceDetails: store.referenceInfo.referenceDetails
})

const mapActionsToProps = {
    SendJoinBid,
    SetNotificationReadById
}

export default connect(mapStateToProps, mapActionsToProps)(ModalJoinTrade)