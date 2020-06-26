import React from "react";
import { connect } from 'react-redux'
import { Container, Grid, Modal, Button, Form } from 'semantic-ui-react'
import { HideModal } from '../_actions/Modals.action'

import { GetPaymentAmounts, ProceedToPayment, ResetPaymentData } from '../_actions/Bids.action'
import { LoadMyMatchedTrades } from '../_actions/Activities.action'

import { formatMoney } from '../_utilities/price';

import WatchDetails from '../_components/WatchDetails'
import CreditCards from '../_components/CreditCards'


class MatchedTradeModal extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            shipping: 0,
            insurance: 0,
            feePercent: 5,
            taxPercent: 22,
            dutiesPercent: 0,
            reviewBeforePayment: true,
            newCreditCardData: {
                cc: 0,
                cvv2: 0,
                expyy: 0,
                expmm: 0
            },
            credit_card_token_id: 0,
            amount: 0
        }
    }

    componentWillMount() {
        //if(this.props.activProps.rcMatchedTrades.length === 0){
        this.props.LoadMyMatchedTrades();
        //}
        if (process.env.REACT_APP_GAME !== "true") {
            this.props.GetPaymentAmounts(this.props.modalProps.id);
        }
    }

    // componentDidMount(){
    //     if(this.props.activProps.rcMatchedTrades.length === 0){
    //         this.props.LoadMyMatchedTrades();
    //     }
    // }

    getPaymentAmounts() {
        return this.props.GetPaymentAmounts(this.props.modalProps.id)
    }


    handleGoToPaymentMethods = () => {
        this.setState({ reviewBeforePayment: false })
    }


    handleProceedToPayment(payment_method, amount) {
        //payment_method, auction,price,frompage,frompanel, creditCardData
        const { modalProps, currentPage, currentPanel } = this.props;
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
        // console.log(newCCdata, "+++++ newCCdata match trd")
        // console.log(payment_method, " +++++++++++ pay meth");
        // console.log(modalProps.id, " +++++++++++++ auction/id")
        // console.log(amount, " ++++++++++++ amount");
        // console.log(currentPage, " ++++++++++++ frompage")
        // console.log(currentPanel, " ++++++++++++ frompanel")

        this.props.ProceedToPayment(payment_method, modalProps.id, amount, currentPage, currentPanel, newCCdata)
    }


    resetStateHideModal = () => {
        this.setState({ reviewBeforePayment: true })
        this.props.ResetPaymentData()
        this.props.HideModal()
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
        const { modalProps, refDetails, paymentData, activProps, amounts } = this.props;

        if (activProps.results === undefined) {
            return <span>Loading...</span>
        }

        let tradeData = activProps.results.filter(obj => {
            return obj.id === modalProps.id
        });

        //if(activProps !== undefined){
        // tradeData = activProps.rcMatchedTrades.results.filter(obj => {
        //     return obj.id === modalProps.id
        // });
        //}
        const BayerData = (typeof modalProps.buyer === 'undefined') ? tradeData[0].buyer : modalProps.buyer;
        const SellerData = (typeof modalProps.buyer === 'undefined') ? tradeData[0].buyer : modalProps.buyer;

        // const wbFee = (Number(refDetails.price) / 100) * this.state.feePercent;
        let askedPrice = Number(refDetails.price);
        const wbFee = (Number(askedPrice * this.state.feePercent / 100) * 1.22);

        const deposit = ((Number(refDetails.price) / 100) * 20);

        /* seller */
        const NetCashIn = () => {
            let matchedPrice = Number(refDetails.price);
            // NetCashIn = matchedPrice + VAT - shipping - insurance
            return formatMoney(matchedPrice + (matchedPrice * this.state.taxPercent / 100) - this.state.shipping - this.state.insurance);
        }

        /* bayer */
        const TotalToPay = () => {
            let matchedPrice = Number(refDetails.price);
            // TotalToPay = matchedPrice + VAT  + duties + shipping + insurance
            return formatMoney((matchedPrice + (matchedPrice * this.state.taxPercent / 100) + (matchedPrice * this.state.dutiesPercent / 100) + this.state.shipping + this.state.insurance));
        }

        const paymentAmount = TotalToPay();

        const priceToPay = (process.env.REACT_APP_GAME === "true") ? BayerData.matched_price : Object.keys(amounts).length > 0 ? amounts.server_data.price : 0; // price from api /auction/{id}/amounts

        return (
            <Modal open className="modal-container matched-trade__modal-container">
                <Modal.Content className={process.env.REACT_APP_USER === 'customer' ? 'bayer' : 'seller'}>
                    <div className="close-modal-btn__container"><div className="close-modal-btn" onClick={() => this.resetStateHideModal()}></div></div>
                    <Container className="mainBoard">
                        <Grid columns={16}>
                            <Grid.Row>
                                <Grid.Column mobile={16} tablet={8} computer={8} className="col-left col-watch-details">
                                    {this.state.reviewBeforePayment ?
                                        (
                                            <div className="head-wrapper">
                                                <h3 className="model-name">Matched trade {modalProps.id}</h3>
                                                <div className="head-wrapper__block half-width">
                                                    <span>Type of trade</span>
                                                    <span>{tradeData[0].type}</span>
                                                </div>
                                                <div className="head-wrapper__block half-width">
                                                    <span>Status</span>
                                                    <span>{BayerData.payment_status.replace(new RegExp('_', 'gi'), " ")}</span>
                                                </div>
                                                <div className="head-wrapper__block half-width">
                                                    <span>Withdrawal</span>
                                                    <span>---</span>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="head-wrapper">
                                                {Object.keys(paymentData).length === 0 &&
                                                    (<h3>Payment methods</h3>)
                                                }
                                            </div>
                                        )}

                                    {this.state.reviewBeforePayment ?
                                        (<WatchDetails show={{ model_name: true, price: true, btn_show_more: true }} />
                                        ) :

                                        Object.keys(paymentData).length > 0 ?
                                            (<div className="payment-successful__container">
                                                {paymentData.server_status !== 200 &&
                                                    <div>
                                                        <p>Server status: {paymentData.server_status}</p>
                                                        {paymentData.server_data.payment_state &&
                                                            <p>Payment state: {paymentData.server_data.payment_state}</p>}
                                                        {paymentData.server_data.payment_message &&
                                                            <p>{paymentData.server_data.payment_message}</p>}
                                                    </div>
                                                }
                                                {paymentData.server_status === 200 &&
                                                    <p>Your payment was successful</p>
                                                }
                                            </div>
                                            ) : (<div className="payment-methods__container">
                                                <Form>
                                                    <ul>
                                                        <li>
                                                            <h4>Credit card</h4>
                                                            <p>You will be able to confirm or chance your credit card once connected with the payment provider's page</p>
                                                            <CreditCards setNewCreditCardData={this.handleNewCreditCard.bind(this)} setSelectedCreditCard={this.handleSetSelectedCreditCard.bind(this)} show={{ add_new_cc: true }} options={{ changeBtnText: 'Choose or add a credit card' }} />
                                                            <Button className="orange__btn" value="creditCard" onClick={this.handleProceedToPayment.bind(this, 'creditCard', priceToPay)}>
                                                                Proceed with credit card
                                                    </Button>
                                                        </li>
                                                        <li>
                                                            <h4>Wire transfer</h4>
                                                            <p>Placeholder text come sopra. You will be able to confirm or chance your credit card once connected with the payment provider's page</p>
                                                            <Button className="orange__btn" value="wire_transfer" onClick={this.handleProceedToPayment.bind(this, 'wire_transfer', priceToPay)}>Proceed with wire transfer</Button>
                                                        </li>
                                                        <li>
                                                            <h4>Cryptocurrencies</h4>
                                                            <p>Placeholder text come sopra. You will be able to confirm or chance your credit card once connected with the payment provider's page</p>
                                                            <Button className="orange__btn" value="cryptocurrencies" onClick={this.handleProceedToPayment.bind(this, 'cryptocurrencies', priceToPay)}>Proceed with cryptocurrencies</Button>
                                                        </li>
                                                    </ul>
                                                </Form>
                                            </div>)

                                    }
                                </Grid.Column>

                                <Grid.Column mobile={16} tablet={8} computer={8} className="col-right">
                                    {this.state.reviewBeforePayment ?
                                        (<div className="head-wrapper">
                                            <h3>Seller</h3>
                                            <div className="head-wrapper__block">
                                                <span>Seller city and country</span>
                                                <span>{BayerData.buyer_city + ` ` + BayerData.buyer_country}</span>
                                            </div>
                                            <div className="head-wrapper__block">
                                                <span>Seller ID</span>
                                                <span>---------------</span>
                                            </div>
                                        </div>
                                        ) : (
                                            <div className="head-wrapper">
                                                <h3 style={{ marginBottom: '20px', color: '#f68b1f' }}>Trade {modalProps.id}</h3>
                                                <h4>{typeof refDetails.model !== 'undefined' ?
                                                    (refDetails.model.name
                                                    ) : (
                                                        `---`
                                                    )}
                                                </h4>
                                                <div className="head-wrapper__block">
                                                    <span>Reference</span>
                                                    {typeof refDetails.reference !== 'undefined' ?
                                                        (<span>{refDetails.reference}</span>
                                                        ) : (
                                                            <span>---</span>
                                                        )}
                                                </div>
                                                <div className="head-wrapper__block">
                                                    <span>Brand</span>
                                                    {typeof refDetails.model !== 'undefined' ?
                                                        (<span>{refDetails.model.brand.name}</span>
                                                        ) : (
                                                            <span>---</span>
                                                        )}
                                                </div>
                                            </div>
                                        )}
                                    <div className="content-wrapper">
                                        {process.env.REACT_APP_USER === 'customer' ? (/* buyer */
                                            <div className="modalBkgCosts__container">
                                                <div className="modalBkgCosts"><span>matched price</span><span className="modalBkgValue">{formatMoney(refDetails.price)}<i>€</i></span></div>
                                                <div className="modalBkgCosts"><span>+ VAT % *</span><span className="modalBkgValue">+ {formatMoney(refDetails.price * this.state.taxPercent / 100)}<i>€</i></span></div>
                                                <div className="modalBkgCosts"><span>+ Duties *</span><span className="modalBkgValue">+ {formatMoney(refDetails.price * this.state.dutiesPercent / 100)}<i>€</i></span></div>
                                                <div className="modalBkgCosts"><span>+ Shipping *</span><span className="modalBkgValue">+ {formatMoney(this.state.shipping)}<i>€</i></span></div>
                                                <div className="modalBkgCosts"><span>+ Insurance *</span><span className="modalBkgValue">+ {formatMoney(this.state.insurance)}<i>€</i></span></div>
                                                <div className="modalBkgTotal orange"><span>TOTAL TO PAY</span><span className="modalBkgValue">{paymentAmount}<i>€</i></span></div>
                                                <div className="modalBkgCosts"><span>DEPOSIT</span><span className="modalBkgValue">{formatMoney(deposit)}<i>€</i></span></div>
                                            </div>
                                        ) : (
                                                /* seller */
                                                <div className="modalBkgCosts__container">
                                                    <div className="modalBkgCosts"><span>matched price</span><span className="modalBkgValue">{formatMoney(refDetails.price)}<i>€</i></span></div>
                                                    <div className="modalBkgCosts"><span>+ VAT % *</span><span className="modalBkgValue">+ {formatMoney(refDetails.price * this.state.taxPercent / 100)}<i>€</i></span></div>
                                                    <div className="modalBkgCosts"><span>- Shipping *</span><span className="modalBkgValue">- {formatMoney(this.state.shipping)}<i>€</i></span></div>
                                                    <div className="modalBkgCosts"><span>- Insurance *</span><span className="modalBkgValue">- {formatMoney(this.state.insurance)}<i>€</i></span></div>
                                                    <div className="modalBkgCosts"><span>- WB fee</span><span className="modalBkgValue">- {formatMoney(wbFee)}<i>€</i></span></div>
                                                    <div className="modalBkgTotal orange"><span>NET CASH IN</span><span className="modalBkgValue"><NetCashIn /><i>€</i></span></div>
                                                    <div className="modalBkgCosts"><span>DEPOSIT</span><span className="modalBkgValue">{formatMoney((deposit / 100) * 85)}<i>€</i></span></div>
                                                </div>
                                            )}
                                    </div>
                                </Grid.Column>
                            </Grid.Row>
                        </Grid>
                    </Container>
                    <div className="actions">
                        <Button className="dark__btn" onClick={() => this.resetStateHideModal()}>
                            Close
                        </Button>

                        {process.env.REACT_APP_USER === 'customer' && this.state.reviewBeforePayment &&
                            (<Button className="orange__btn" onClick={this.handleGoToPaymentMethods}>
                                Go to payment
                            </Button>)
                        }
                    </div>
                </Modal.Content>
            </Modal>
        )
    }
}

const mapStateToProps = store => ({
    refDetails: store.referenceInfo.referenceDetails,
    paymentData: store.bidInfo.paymentData,
    activProps: store.activitiesList.rcMatchedTrades,
    currentPage: store.userInfo.currentPage,
    currentPanel: store.userInfo.currentPanel,
    amounts: store.bidInfo.amounts
})

const mapActionsToProps = {
    HideModal,
    ProceedToPayment,
    ResetPaymentData,
    LoadMyMatchedTrades,
    GetPaymentAmounts
}

export default connect(mapStateToProps, mapActionsToProps)(MatchedTradeModal)
