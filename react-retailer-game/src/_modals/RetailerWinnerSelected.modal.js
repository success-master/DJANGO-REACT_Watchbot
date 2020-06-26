import React from "react";
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom';

import { Button, Modal, Container, Grid } from 'semantic-ui-react'
import { formatMoney } from "../_utilities/price";
import WatchDetails from '../_components/WatchDetails'

class ModalRetailerWinnerSelected extends React.Component {
  constructor(props) {
    super(props);
    this.state = { modalOpen: false };
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

  render() {
    const price = this.props.winnerPrice ? Number(this.props.winnerPrice) : 0;
    const listPrice = this.props.refProps.referenceDetails.price;
    const wbFee = (price * 5 / 100) * 1.22;

    const data = {
      vat: 22,
      insurance: 0,
      shipping: 0,
      wbFee,
      //netPrice: price - wbFee,
      deposit: listPrice * 20 / 100,
    };

    /* seller */
    const NetCashIn = () => {
      let askedPrice = Number(price);
      // NetCashIn = myBidPrice + VAT - shipping - insurance
      return askedPrice > 0 ?
        formatMoney(askedPrice + (askedPrice * data.vat / 100) - data.shipping - data.insurance) :
        '0,00';
    }

    /* buyer
    const TotalToPay = () =>{
      let askedPrice = Number(price);
      // TotalToPay = askedPrice + VAT  + duties + shipping + insurance
      return askedPrice > 0 ?
        formatMoney((askedPrice + (askedPrice * this.state.taxPercent / 100) + (askedPrice * this.state.dutiesPercent / 100) + this.state.shipping + this.state.insurance)) :
        '0,00';
    }
    */


    return (
      <Modal open={this.state.modalOpen} onClose={this.handleOpen} className="modal-container join-trade">
        <Modal.Content className={process.env.REACT_APP_USER === 'customer' ? 'bayer' : 'seller'}>
          <div className="close-modal-btn__container">
            <div className="close-modal-btn" onClick={this.handleOpen} />
          </div>
          <Container className="mainBoard">
            <Grid columns={16}>
              <Grid.Row>
                <Grid.Column mobile={16} tablet={8} computer={8} className="col-left col-watch-details">
                  <div className="head-wrapper">
                    <h3>You have selected the BID for your PUT {this.props.bidId}!</h3>
                  </div>

                  <WatchDetails watchDetails={this.props.refProps.referenceDetails} show={{ modal_name: true, price: true }} />
                </Grid.Column>

                <Grid.Column mobile={16} tablet={8} computer={8} className="col-right">
                  <div className="head-wrapper">
                    <h3>Trade {this.props.bidId}</h3>
                  </div>
                  <div className="content-wrapper" style={{ flexWrap: 'wrap' }}>
                    <h3 style={{ flex: '1 0 auto', fontWeight: '400' }}>Buyer from {this.props.winner ? this.props.winner.user_city : ''} {this.props.winner ? this.props.winner.user_country : ''}</h3>
                    <p style={{ flex: '1 0 auto' }}>A notification has been sent to the selected buyer</p>
                    <div style={{ flex: '1 0 auto', marginTop: '20px' }}>
                      <div className="modalBkgCosts"><span>MATCHED PRICE</span><span className="modalBkgValue">{formatMoney(this.props.winnerPrice)}<i>€</i></span></div>
                      <div className="modalBkgCosts"><span>+VAT % *</span><span className="modalBkgValue">+ {formatMoney(Number(price) * data.vat / 100)}<i>€</i></span></div>
                      <div className="modalBkgCosts"><span>+ Shipping *</span><span className="modalBkgValue">+ {formatMoney(data.shipping)}<i>€</i></span></div>
                      <div className="modalBkgCosts"><span>+ Insurance *</span><span className="modalBkgValue">+ {formatMoney(data.insurance)}<i>€</i></span></div>
                      <div className="modalBkgCosts"><span>+ WB fee</span><span className="modalBkgValue">+ {formatMoney(data.wbFee)}<i>€</i></span></div>
                      <div className="modalBkgTotal orange"><span>NET CASH IN</span><span className="modalBkgValue"><NetCashIn /><i>€</i></span></div>
                      <div className="modalBkgCosts"><span>DEPOSIT</span><span className="modalBkgValue">{formatMoney((data.deposit / 100) * 85)}<i>€</i></span></div>
                    </div>
                  </div>
                </Grid.Column>
              </Grid.Row>
            </Grid>
          </Container>


          <div className="actions">
            <Button className="gray-btn" onClick={this.handleOpen}>
              Close
            </Button>
          </div>
        </Modal.Content>
      </Modal>
    )
  }
}

const mapStateToProps = store => ({
  refProps: store.referenceInfo,
})

export default withRouter(connect(mapStateToProps)(ModalRetailerWinnerSelected));
