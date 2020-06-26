import React from "react";
import { connect } from 'react-redux'
import { Container, Grid, Modal, Button } from 'semantic-ui-react'
import { HideModal } from '../_actions/Modals.action'
import ReferenceChart from '../_components/ReferenceChart';

import { AddWatchGraph } from '../_actions/WatchGraphList.action'
import { ShowModalAddTrade } from '../_actions/Bids.action'

import { formatMoney} from '../_utilities/price';

import WatchDetails from '../_components/WatchDetails'

let launchTradeBtnName = (process.env.REACT_APP_USER === 'customer' ? 'call' : 'put')


class ModalReferenceInfo extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            addedToHomeWithButton: false,
        }
    }

    // componentDidMount() {
    //    // this.props.LoadRefDetails(this.props.modalProps.selectedOption.id)
    // }

    onAddWatch = () => {
        this.props.onAddWatch(this.props.refProps.referenceDetails.id);
        this.setState({ addedToHomeWithButton: true })
    }


    render(){
        let alreadyAddedToMyHome = this.state.addedToHomeWithButton
        if (!this.state.addedToHomeWithButton) {
             for (const k in this.props.watchProps.watchesDetailsInDashboard) {
                 if (this.props.watchProps.watchesDetailsInDashboard[k].refId === this.props.refProps.referenceDetails.id) {
                     alreadyAddedToMyHome = true
                 }
             }
        }

        return(
            <Modal open onClose={this.props.HideModal} className="modal-container reference-info__modal-container">
                <Modal.Content>
                    <div className="close-modal-btn__container"><div className="close-modal-btn" onClick={this.props.HideModal}></div></div>
                    <Container className="mainBoard">
                        <Grid columns={16}>
                            <Grid.Row>
                                <Grid.Column mobile={16} tablet={8} computer={8} className="col-left col-watch-details">
                                    <div className="head-wrapper">
                                        <h3>Watch details</h3>
                                        <h4 className="model-name">
                                            {typeof this.props.refProps.referenceDetails.label !=='undefined' && this.props.refProps.referenceDetails.label}
                                            {/* <span>{this.props.modalProps.selectedOption.id}</span> */}
                                        </h4>
                                        <div className="actions">
                                            <Button className="orange__btn" onClick={() => this.props.ShowModalAddTrade(this.props.refProps.referenceDetails)}>
                                                Launch {launchTradeBtnName}
                                            </Button>
                                        </div>
                                    </div>

                                    <WatchDetails show={{}}/>

                                    {!alreadyAddedToMyHome &&
                                        <div className="btn-wrapper">
                                            <Button className="dark__btn add-to-watchlist" onClick={this.onAddWatch}>
                                                <span>+</span>Add to watchlist{/* Add To My Home <img src={btnAddToMyHome} alt="add to my home btn"/> */}
                                            </Button>
                                        </div>
                                    }

                                </Grid.Column>

                                <Grid.Column mobile={16} tablet={8} computer={8} className="col-right col-analytics">
                                    <div className="head-wrapper">
                                        <h3>Analytics</h3>
                                        <h4 className="price" style={{paddingTop: '10px'}}>{formatMoney(this.props.refProps.referenceDetails.price)} € <span>list price</span></h4>
                                    </div>
                                    <div className="content-wrapper">
                                        <ReferenceChart data={this.props.modalProps.historicalData} suggestedPrice={this.props.modalProps.refPrice} />
                                    </div>

                                    <div className="actions one-button">
                                        <Button className="dark__btn" onClick={this.props.HideModal}>
                                            Close
                                        </Button>
                                    </div>
                                </Grid.Column>
                            </Grid.Row>
                        </Grid>
                    </Container>
                    
                </Modal.Content>
            </Modal>
        )
    }
}

const mapStateToProps = store => ({
    watchProps: store.watchList,
    userProps: store.userInfo,
    refProps: store.referenceInfo,
})

const mapActionsToProps = {
    HideModal,
    onAddWatch: AddWatchGraph,
    ShowModalAddTrade,
}

export default connect(mapStateToProps, mapActionsToProps)(ModalReferenceInfo)
