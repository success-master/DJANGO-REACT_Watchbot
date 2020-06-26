import React from "react";
import { connect } from 'react-redux'
import axios from "axios"
import Autocomplete from 'react-autocomplete';

import { HideModal } from '../_actions/Modals.action'
import { SendCreateBid } from '../_actions/Bids.action'

import { getTimeZone } from '../_utilities/time'

//import CreateScheduledTrade from '../_modals/_CreateScheduledTrade.modal'

import { Modal, Form, Button, Header, Checkbox, Icon, Popup } from 'semantic-ui-react'
import DatePicker from 'react-date-picker';
//import FlowAddSchedule from '../_components/FlowAddSchedule'

const openingTimeGMTArr = [9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20]

let today = new Date(), offset = today.getTimezoneOffset(), currentH = today.getHours(), offsetH = Math.floor(Math.abs(offset) / 60)
let openingTimeLocalArr = []
openingTimeGMTArr.forEach(function (value) {
    let tmp = value
    if (offset < 0) { tmp += offsetH } else { tmp -= offsetH }
    if ((tmp >= 0) && (tmp < 24) && (tmp >= currentH)) { openingTimeLocalArr.push(tmp) }
});


class ModalAddSchedule extends React.Component {
    constructor(props, context) {
        super(props, context);

        // Set initial State
        this.state = {
            // Current value of the select field
            valueText: '',
            // Data that will be rendered in the autocomplete
            // As it is asynchronous, it is initially empty
            autocompleteData: [],
            selectedOption: {},
            selected: false,
            pw: '',
            retailerModalPut: { modalOpen: false, checkTermValue: false, checkGdprValue: false },
            dateMDY: new Date(),
            checkDate: null,
            timeSlotH: null,
            timeSlotM: null,
            priceRequired: 0,
            shipping: 0,
            insurance: 0,
            feePercent: 5,
            taxPercent: 22,
            selectedFile: null,
            completedBeforeConfirmation: false
        };

        // Bind `this` context to functions of the class
        this.onChange = this.onChange.bind(this);
        this.onSelect = this.onSelect.bind(this);
        this.getItemValue = this.getItemValue.bind(this);
        this.renderItem = this.renderItem.bind(this);
        this.retrieveDataAsynchronously = this.retrieveDataAsynchronously.bind(this);
    }


    /**
     * Updates the state of the autocomplete data with the remote data obtained via AJAX.
     *
     * @param {String} searchText content of the input that will filter the autocomplete data.
     * @return {Nothing} The state is updated but no value is returned
     */
    retrieveDataAsynchronously(searchText) {
        let _this = this;

        axios.get(process.env.REACT_APP_API_HOST + `reference/?search=${searchText}`, { headers: { 'Authorization': 'Token ' + localStorage.getItem('wbtk') } })
            .then((response) => {
                _this.setState({
                    autocompleteData: response.data
                });
            })

    }

    /**
     * Callback triggered when the user types in the autocomplete field
     *
     * @param {Event} e JavaScript Event
     * @return {Event} Event of JavaScript can be used as usual.
     */
    onChange(e) {
        this.setState({
            valueText: e.target.value
        });

        /**
         * Handle the remote request with the current text !
         */
        this.retrieveDataAsynchronously(e.target.value);
    }

    /**
     * Callback triggered when the autocomplete input changes.
     *
     * @param {Object} val Value returned by the getItemValue function.
     * @return {Nothing} No value is returned
     */
    onSelect(val, item) {
        this.setState({
            valueText: val
        });

        this.setState({ selectedOption: { reference: item.reference, label: item.label, id: item.id, price: item.price }, selected: true })
    }

    /**
     * Define the markup of every rendered item of the autocomplete.
     *
     * @param {Object} item Single object from the data that can be shown inside the autocomplete
     * @param {Boolean} isHighlighted declares wheter the item has been highlighted or not.
     * @return {Markup} Component
     */
    renderItem(item, isHighlighted) {
        return (
            <div key={item.id} style={{ background: isHighlighted ? 'lightgrey' : 'white' }}>
                {item.label}
            </div>
        );
    }

    /**
     * Define which property of the autocomplete source will be show to the user.
     *
     * @param {Object} item Single object from the data that can be shown inside the autocomplete
     * @return {String} val
     */
    getItemValue(item) {
        // You can obviously only return the Label or the component you need to show
        // In this case we are going to show the value and the label that shows in the input
        //return `${item.id} - ${item.label}`;
        return `${item.label}`
    }


    resetStateHideModal = () => {
        this.setState({ selected: false, completedBeforeConfirmation: false })
        this.props.HideModal()
    }

    /* Form */

    handleProceedToConfirmation = () => {
        let checkDate = new Date(this.state.dateMDY.getTime())
        checkDate.setHours(this.state.timeSlotH, this.state.timeSlotM, 0)
        this.setState({ checkDate: checkDate, completedBeforeConfirmation: true })
    }

    handleModifyBack = () => {
        this.setState({ pw: '', completedBeforeConfirmation: false })
    }

    handleCloseSubmitted = () => {
        //let month=this.state.dateMDY.getUTCMonth() + 1
        //let day = this.state.dateMDY.getUTCDate()
        //let year = this.state.dateMDY.getUTCFullYear()
        //var finaldate = new Date( Date.UTC(year, month, day, Number(this.state.timeSlot.substring(0,2)), Number(this.state.timeSlot.substring(3,5)) ) );
        //alert(finaldate+' --- '+this.state.timeSlot.substring(0,2)+' --- '+this.state.timeSlot.substring(3,5)+' \\\ '+finaldate.toUTCString()+' --- '+finaldate.toISOString())

        //let finalDate = new Date(this.state.dateMDY.getTime())
        //finalDate.setHours(this.state.timeSlotH,this.state.timeSlotM,0)
        //alert(finalDate)

        this.props.SendCreateBid(this.state.selectedOption.id, this.state.checkDate, this.state.selectedFile, this.state.priceRequired)
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

    handleForm = (e) => {
        e.preventDefault()
        this.setState({ pw: '', retailerModalPut: { modalOpen: false, checkTermValue: false, checkGdprValue: false } })
    }

    onChangeDate = dateMDY => {
        this.setState({ dateMDY })
        this.setState({ timeSlotH: null, timeSlotM: null })
        openingTimeLocalArr = [];
        openingTimeGMTArr.forEach(function (value) {
            let tmp = value
            if (offset < 0) { tmp += offsetH } else { tmp -= offsetH }
            if ((tmp >= 0) && (tmp < 24) && ((tmp >= currentH) || dateMDY.setHours(0, 0, 0, 0) != today.setHours(0, 0, 0, 0))) { openingTimeLocalArr.push(tmp) }
        });
    }

    onChangeTimeSlot = (timeSlotH, timeSlotM) => {
        this.setState({ timeSlotH, timeSlotM })
    }

    onOpenTimeslotPicker = (e) => {
        e.preventDefault()
    }

    render() {

        const SingleSlot = ({ hour, minutes }) => {
            let tominutes = new Date().getMinutes()
            console.log(currentH, tominutes, hour, minutes)
            return (
                <Button style={{ fontSize: "12px", padding: "4px" }}
                    disabled={this.state.dateMDY.setHours(0, 0, 0, 0) == today.setHours(0, 0, 0, 0) && currentH == hour && minutes < tominutes}
                    onClick={() => this.onChangeTimeSlot(hour, minutes)}>
                    {hour.toString().padStart(2, '0')}:{minutes.toString().padStart(2, '0')}
                </Button>

            )
        }

        const TimeslotPicker = openingTimeLocalArr.map(function (timeL, index) {
            return (<div>
                <SingleSlot hour={timeL} minutes={0} />
                <SingleSlot hour={timeL} minutes={15} />
                <SingleSlot hour={timeL} minutes={30} />
                <SingleSlot hour={timeL} minutes={45} />
            </div>)
        })

        return (


            <Modal size='tiny' open closeOnEscape={true}
                closeOnDimmerClick={false} onClose={() => this.resetStateHideModal()}>
                <Modal.Header>ADD SCHEDULED TRADE</Modal.Header>

                <Modal.Content>
                    <Modal.Description>
                        <div style={{ position: "relative" }}>
                            {!this.state.selected ? (
                                <div>
                                    <label htmlFor="states-autocomplete" style={{ display: "block" }}>Select Watch Model:</label>
                                    <Autocomplete
                                        inputProps={{ id: 'states-autocomplete' }}
                                        wrapperStyle={{ position: 'relative', display: 'inline-block' }}
                                        getItemValue={this.getItemValue}
                                        items={this.state.autocompleteData}
                                        renderItem={this.renderItem}
                                        value={this.state.valueText}
                                        onChange={this.onChange}
                                        onSelect={this.onSelect}
                                        autoHighlight={true}
                                        menuStyle={{
                                            borderRadius: '3px',
                                            boxShadow: '0 2px 12px rgba(0, 0, 0, 0.1)',
                                            background: 'rgba(255, 255, 255, 0.9)',
                                            padding: '2px 0',
                                            fontSize: '90%',
                                            position: 'absolute',
                                            overflow: 'auto',
                                            maxHeight: '100px',
                                            left: '0px',
                                            top: '24px',
                                            color: '#000'
                                        }}
                                    />
                                </div>)
                                :
                                (
                                    <div>
                                        {!this.state.completedBeforeConfirmation ?
                                            (
                                                <div>
                                                    {this.state.selectedOption.label}<br /> RefId: {this.state.selectedOption.id}
                                                    <div className="modalColor2">SUGGESTED PRICE: €{this.state.selectedOption.price}</div>

                                                    <hr style={{ color: "#d1d2d3" }} />
                                                    <Form onSubmit={this.handleForm}>
                                                        <Form.Field>
                                                            <label>Your proposal:</label>

                                                            <div className='field'><div style={{ position: "relative" }}><div style={{ position: "absolute", left: "5px", padding: ".67857143em 0.5em", color: "#000" }}>€</div></div>

                                                                <input style={{ paddingLeft: "25px" }} required placeholder='Price' value={this.state.priceRequired > 0 ? this.state.priceRequired : ''} type='number' onChange={this.handleChangePrice} />
                                                            </div>
                                                        </Form.Field>
                                                        <div className="modalBkgCosts">Watchbot fee 5%: <span className="modalBkgValue">€{this.state.priceRequired * this.state.feePercent / 100}</span></div>
                                                        <div className="modalBkgCosts">VAT 22%: <span className="modalBkgValue">€{this.state.priceRequired * this.state.taxPercent / 100}</span></div>
                                                        <div className="modalBkgCosts">Shipping: <span className="modalBkgValue">€{this.state.shipping}</span></div>
                                                        <div className="modalBkgCosts">Insurance: <span className="modalBkgValue">€{this.state.insurance}</span></div>
                                                        <div className="modalBkgTotal">TOTAL: <span className="modalBkgValue">€{Number(this.state.priceRequired) + this.state.priceRequired * this.state.feePercent / 100 + this.state.priceRequired * this.state.taxPercent / 100 + this.state.shipping + this.state.insurance}</span></div>
                                                        <br />
                                                        <Form.Group widths='equal'>
                                                            <Form.Field>
                                                                <label>Trade Start Day (mm/dd/yy)</label>
                                                                <DatePicker
                                                                    onChange={this.onChangeDate}
                                                                    value={this.state.dateMDY}
                                                                    minDate={new Date()}
                                                                    clearIcon={null}
                                                                />
                                                            </Form.Field>
                                                            <Form.Field>
                                                                <label>Trade Start Time Slot</label>
                                                                <Popup style={{ padding: "4px" }}
                                                                    trigger={<Button color='orange' content=
                                                                        {this.state.timeSlotH != null ?
                                                                            (`${this.state.timeSlotH.toString().padStart(2, '0')}:${this.state.timeSlotM.toString().padStart(2, '0')}`) :
                                                                            (<div>
                                                                                SET TIME SLOT +
                                                                                {/* <br />
                                                                                <div className="fld__msg__warning_filled">
                                                                                    <span>Please set time slot</span>
                                                                                </div> */}
                                                                            </div>)
                                                                        }
                                                                    />}
                                                                    content={<div>Your Timezone: {getTimeZone()}<br />Available Slots:<br /><div style={{}}>{TimeslotPicker}</div></div>}
                                                                    on='click'
                                                                    position='right'
                                                                    basic
                                                                    onOpen={(e) => { e.preventDefault() }}
                                                                    onClose={(e) => { e.preventDefault() }}
                                                                />
                                                            </Form.Field>

                                                        </Form.Group>

                                                        <Form.Field>
                                                            <label>Upload a picture</label>
                                                            <input type="file" onChange={this.fileChangedHandler} />
                                                        </Form.Field>

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
                                            ) : (
                                                <div>
                                                    <h3>CONFIRM AND SUBMIT:</h3>
                                                    {this.state.selectedOption.label} (RefId: {this.state.selectedOption.id})
                                                    <br />
                            Trade starts: <br />
                                                    {this.state.checkDate.toString()}
                                                    {process.env.REACT_APP_USER === 'retailer' && (
                                                        <div>
                                                            <br />
                               Price required: {this.state.priceRequired}
                                                        </div>
                                                    )}
                                                </div>
                                            )
                                        }
                                    </div>
                                )
                            }

                        </div>

                    </Modal.Description>

                </Modal.Content>
                <Modal.Actions>
                    <Button color='grey' inverted onClick={() => this.resetStateHideModal()}>
                        <Icon name='checkmark' /> Cancel
          </Button>
                    {!this.state.completedBeforeConfirmation ?
                        (
                            <span>
                                {this.state.priceRequired > 0 && this.state.retailerModalPut.checkTermValue && this.state.retailerModalPut.checkGdprValue && this.state.pw && (this.state.timeSlotH != null) && (this.state.timeSlotM != null) ?
                                    (
                                        <Button color='white' inverted type='submit' onClick={this.handleProceedToConfirmation}><Icon name='checkmark' />Proceed</Button>

                                    ) :
                                    (
                                        <Button color='grey' disabled inverted>
                                            Proceed
                                        </Button>
                                    )
                                }
                            </span>
                        ) : (
                            <span>
                                <Button color='white' inverted type='submit' onClick={this.handleModifyBack}>Modify</Button>
                                <Button color='white' inverted type='submit' onClick={this.handleCloseSubmitted}>Submit</Button>
                            </span>
                        )
                    }

                </Modal.Actions>
            </Modal>

        )
    }
}

const mapStateToProps = store => ({
})

const mapActionsToProps = {
    HideModal,
    SendCreateBid
}


export default connect(mapStateToProps, mapActionsToProps)(ModalAddSchedule)