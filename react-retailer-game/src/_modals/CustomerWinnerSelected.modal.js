import React from "react";
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom';
import { Container, Grid, Modal, Button, Form } from 'semantic-ui-react'
import { HideModal } from '../_actions/Modals.action'

import { ProceedToPayment, ResetPaymentData } from '../_actions/Bids.action'

import { formatMoney } from '../_utilities/price';

import WatchDetails from '../_components/WatchDetails'


class ModalCustomerWinnerSelected extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            shipping: 0,
            insurance: 0,
            feePercent: 5,
            taxPercent: 22,
            dutiesPercent: 0,
            reviewBeforePayment: true,
            modalOpen: false
        }
    }

    handleOpen = () => this.setState(prevState => {
        if (prevState.modalOpen === true) {
            this.props.history.push('/');
        }
        return { modalOpen: !prevState.modalOpen };
    });

    componentWillReceiveProps(nextProps) {
        if (nextProps.modalOpen !== this.state.modalOpen) {
            this.handleOpen();
        }
    }

    // componentDidMount() {
    // }

    handleGoToPaymentMethods = () => {
        this.setState({ reviewBeforePayment: false })
    }

    handleProceedToPayment = (e) => {
        this.props.ProceedToPayment(e.target.value)
    }

    resetStateHideModal = () => {
        this.setState({ reviewBeforePayment: true })
        this.props.ResetPaymentData()
        this.handleOpen();
        //this.props.HideModal()
    }


    render() {
        const price = this.props.winnerPrice ? Number(this.props.winnerPrice) : 0;
        const listPrice = this.props.refDetails.price;

        const { refDetails, paymentData } = this.props;

        const deposit = ((Number(listPrice) / 100) * 20);

        /* buyer */
        const TotalToPay = () => {
            let matchedPrice = Number(price);
            // TotalToPay = matchedPrice + VAT  + duties + shipping + insurance
            return formatMoney((matchedPrice + (matchedPrice * this.state.taxPercent / 100) + (matchedPrice * this.state.dutiesPercent / 100) + this.state.shipping + this.state.insurance));
        }

        return (
            <Modal open={this.state.modalOpen} className="modal-container matched-trade__modal-container">
                <Modal.Content className={process.env.REACT_APP_USER === 'customer' ? 'bayer' : 'seller'}>
                    <div className="close-modal-btn__container"><div className="close-modal-btn" onClick={() => this.resetStateHideModal()}></div></div>
                    <Container className="mainBoard">
                        <Grid columns={16}>
                            <Grid.Row>
                                <Grid.Column mobile={16} tablet={8} computer={8} className="col-left col-watch-details">
                                    {this.state.reviewBeforePayment ?
                                        (
                                            <div className="head-wrapper">
                                                <h3 className="model-name">Matched trade {this.props.bidId}</h3>
                                                <div className="head-wrapper__block half-width">
                                                    <span>Type of trade</span>
                                                    <span>Put</span>
                                                </div>
                                                <div className="head-wrapper__block half-width">
                                                    <span>Status</span>
                                                    <span>To be payed</span>
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
                                        (<WatchDetails show={{ model_name: true, price: true }} />
                                        ) :

                                        Object.keys(paymentData).length > 0 ?
                                            (<div className="payment-successful__container">
                                                <p>{paymentData.payment_message}</p>
                                            </div>
                                            ) : (<div className="payment-methods__container">
                                                <Form>
                                                    <ul>
                                                        <li>
                                                            <h4>Credit card</h4>
                                                            <p>You will be able to confirm or chance your credit card once connected with the payment provider's page</p>
                                                            <Button className="orange__btn" value="credit_card" onClick={this.handleProceedToPayment}>Proceed with credit card</Button>
                                                        </li>
                                                        <li>
                                                            <h4>Wire transfer</h4>
                                                            <p>Placeholder text come sopra. You will be able to confirm or chance your credit card once connected with the payment provider's page</p>
                                                            <Button className="orange__btn" value="wire_transfer" onClick={this.handleProceedToPayment}>Proceed with wire transfer</Button>
                                                        </li>
                                                        <li>
                                                            <h4>Cryptocurrencies</h4>
                                                            <p>Placeholder text come sopra. You will be able to confirm or chance your credit card once connected with the payment provider's page</p>
                                                            <Button className="orange__btn" value="cryptocurrencies" onClick={this.handleProceedToPayment}>Proceed with cryptocurrencies</Button>
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
                                                <span>{this.props.winner.user_city + ` ` + this.props.winner.user_country}</span>
                                            </div>
                                            <div className="head-wrapper__block">
                                                <span>Seller ID</span>
                                                <span>---------------</span>
                                            </div>
                                        </div>
                                        ) : (
                                            <div className="head-wrapper">
                                                <h3 style={{ marginBottom: '20px', color: '#f68b1f' }}>Trade {this.props.bidId}</h3>
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
                                                <div className="modalBkgCosts"><span>matched price</span><span className="modalBkgValue">{formatMoney(this.props.winnerPrice)}<i>€</i></span></div>
                                                <div className="modalBkgCosts"><span>+ VAT % *</span><span className="modalBkgValue">+ {formatMoney(this.props.winnerPrice * this.state.taxPercent / 100)}<i>€</i></span></div>
                                                <div className="modalBkgCosts"><span>+ Duties *</span><span className="modalBkgValue">+ {formatMoney(this.props.winnerPrice * this.state.dutiesPercent / 100)}<i>€</i></span></div>
                                                <div className="modalBkgCosts"><span>+ Shipping *</span><span className="modalBkgValue">+ {formatMoney(this.state.shipping)}<i>€</i></span></div>
                                                <div className="modalBkgCosts"><span>+ Insurance *</span><span className="modalBkgValue">+ {formatMoney(this.state.insurance)}<i>€</i></span></div>
                                                <div className="modalBkgTotal orange"><span>TOTAL TO PAY</span><span className="modalBkgValue"><TotalToPay /><i>€</i></span></div>
                                                <div className="modalBkgCosts"><span>DEPOSIT</span><span className="modalBkgValue">{formatMoney(deposit)}<i>€</i></span></div>
                                            </div>
                                        ) : (
                                                /* seller */
                                                <div className="modalBkgCosts__container">

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
    paymentData: store.bidInfo.paymentData
})

const mapActionsToProps = {
    HideModal,
    ProceedToPayment,
    ResetPaymentData
}

//export default connect(mapStateToProps, mapActionsToProps)(ModalCustomerWinnerSelected)

export default withRouter(connect(mapStateToProps, mapActionsToProps)(ModalCustomerWinnerSelected));
