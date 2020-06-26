/* eslint-disable */

import React from "react";
import { connect } from 'react-redux'
import ReactGA from 'react-ga'

import { HideModal } from '../_actions/Modals.action'
import { SendCreateBid } from '../_actions/Bids.action'

import { getTimeZone, isSameDate } from '../_utilities/time'
import { formatMoney } from '../_utilities/price'
import { addDays } from '../_utilities/time'

import { Container, Grid, Modal, Form, Button, Checkbox, Popup, Portal } from 'semantic-ui-react'
import DatePicker from 'react-datepicker';

import WatchDetails from '../_components/WatchDetails'
import CreditCards from '../_components/CreditCards'
import DatePickerCustomInput from '../_components/DatePickerCustomInput'

const openingTimeGMTArr = [7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18] //orari apertura piattaforma GMT


class SubmodalAddTrade extends React.Component {
    constructor(props, context) {
        super(props, context);

        this.state = {
            pw: '',
            retailerModalPut: { modalOpen: false, checkTermValue: false, checkGdprValue: false },
            dateMDY: addDays(new Date(), 2),
            checkDate: null,
            timeSlotH: null,
            timeSlotM: null,
            priceRequired: 0,
            shipping: 0,
            insurance: 0,
            feePercent: 5,
            taxPercent: 22,
            dutiesPercent: 0,
            selectedFile: null,
            completedBeforeConfirmation: false,
            openingTimeLocalArr: [], //orari apertura piattaforma rispetto al browser del cliente
            offsetH: 0,
            popupOpen: false,
            askedPriceOK: false,
            maxAskedPrice: 0,
            newCreditCardData: {
                cc: 0,
                cvv2: 0,
                expyy: 0,
                expmm: 0
            },
            credit_card_token_id: 0,
            warningShadow: false,
        };

    }

    componentDidMount() {
        let today = new Date()
        let offset = today.getTimezoneOffset(), currentH = today.getHours(), offsetH = Math.floor(Math.abs(offset) / 60)
        this.setState({ offsetH: offsetH })
        let openingTimeLocalArrTmp = []
        openingTimeGMTArr.forEach(function (value) {
            let tmp = value
            if (offset < 0) { tmp += offsetH } else { tmp -= offsetH }
            if ((tmp >= 0) && (tmp < 24) && (tmp >= currentH)) { openingTimeLocalArrTmp.push(tmp) }
        });

        // let timelocal = openingTimeLocalArrTmp;
        // if (timelocal.length && currentH >= timelocal[0] && currentH <= timelocal[timelocal.length-1]){
        //   let mm = (`00`+ today.getMinutes()).slice(-2);
        //   this.setState({timeSlotH: currentH, timeSlotM: mm});
        // }

        this.setState({ openingTimeLocalArr: openingTimeLocalArrTmp })
    }

    resetStateHideModal = () => {
        this.setState({ selected: false, completedBeforeConfirmation: false })
        this.props.HideModal()
    }

    warningShadow = () => {
        this.setState({ warningShadow: true })
        console.log('warning shadow: ', this.state.warningShadow);
    }

    /* Form */

    handleIncreasePrice = () => {
        if (this.state.priceRequired <= (this.props.selectedOption.price - 100)) {
            this.setState(prevState => {
                return { priceRequired: Number(prevState.priceRequired) + 100 }
            })
        }
    }

    handleDecreasePrice = () => {
        if (this.state.priceRequired >= 100) {
            this.setState(prevState => {
                return { priceRequired: Number(prevState.priceRequired) - 100 }
            })
            if ((!this.state.askedPriceOK) && (this.state.priceRequired <= (this.props.selectedOption.price + 100))) {
                this.setState({ askedPriceOK: true })
            }
        }
    }

    handleProceedToConfirmation = () => {
        let checkDate = new Date(this.state.dateMDY.getTime())
        checkDate.setHours(this.state.timeSlotH, this.state.timeSlotM, 0)
        this.setState({ checkDate: checkDate, completedBeforeConfirmation: true })
    }
    clickHandlerGoogleAnalitycsSubmitCall = () => {
        ReactGA.event({
            category: 'Dashboard - Customer - Subit Call',
            action: 'E\' stato cliccato Subit Call'
        })
    }

    handleModifyBack = () => {
        this.setState({ pw: '', completedBeforeConfirmation: false })
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

        //let month=this.state.dateMDY.getUTCMonth() + 1
        //let day = this.state.dateMDY.getUTCDate()
        //let year = this.state.dateMDY.getUTCFullYear()
        //var finaldate = new Date( Date.UTC(year, month, day, Number(this.state.timeSlot.substring(0,2)), Number(this.state.timeSlot.substring(3,5)) ) );
        //alert(finaldate+' --- '+this.state.timeSlot.substring(0,2)+' --- '+this.state.timeSlot.substring(3,5)+' \\\ '+finaldate.toUTCString()+' --- '+finaldate.toISOString())

        //let finalDate = new Date(this.state.dateMDY.getTime())
        //finalDate.setHours(this.state.timeSlotH,this.state.timeSlotM,0)
        //alert(finalDate)
        console.log(this.props.selectedOption, this.state.checkDate)
        this.props.SendCreateBid(this.props.selectedOption, this.state.checkDate, this.state.selectedFile, this.state.priceRequired, newCCdata)
        this.setState({ selected: false, completedBeforeConfirmation: false })
        this.props.HideModal()
    }


    handleChangePrice = (event) => {
        let price = this.props.selectedOption.price;
        console.log('handleChangePrice: option price: ' + price);
        console.log('handleChangePrice: event value:' + event.target.value);
        let ost = ('0000000' + price).slice(-2);
        let basePrice = price - Number(ost);
        (event.target.value <= basePrice) ? this.setState({ askedPriceOK: true, maxAskedPrice: 0 }) : this.setState({ askedPriceOK: false, maxAskedPrice: basePrice });
        this.setState({ priceRequired: event.target.value })
    }

    keyPress = (event) => {
        if (event.keyCode == 13) {
            //console.log('value', event.target.value);
            event.target.blur();
        }
    }

    fileChangedHandler = (event) => {
        this.setState({ selectedFile: event.target.files[0] })
    }

    handleChangePw = (event) => {
        this.setState({ pw: event.target.value })
    }

    toggleCheckTermValue = () => {
        this.setState(prevState => ({
            retailerModalPut: {
                ...prevState.retailerModalPut,
                checkTermValue: !this.state.retailerModalPut.checkTermValue
            }
        }))
    }

    toggleCheckGdprValue = () => this.setState(prevState => ({
        retailerModalPut: {
            ...prevState.retailerModalPut,
            checkGdprValue: !this.state.retailerModalPut.checkGdprValue
        }
    }))

    handleForm = (e) => {
        alert("handle")
        e.preventDefault()
        this.setState({ pw: '', retailerModalPut: { modalOpen: false, checkTermValue: false, checkGdprValue: false } })
    }

    onChangeDate = dateMDY => {
        let day = dateMDY.getDay();
        if (day === 0) return false;

        this.setState({ dateMDY })
        this.setState({ timeSlotH: null, timeSlotM: null })
        let openingTimeLocalArrTmp = [];
        let today = new Date()
        let offset = today.getTimezoneOffset(), currentH = today.getHours()
        let offsetH = this.state.offsetH
        openingTimeGMTArr.forEach(function (value) {
            let tmp = value
            if (offset < 0) { tmp += offsetH } else { tmp -= offsetH }
            if ((tmp >= 0) && (tmp < 24) && ((tmp >= currentH) || dateMDY.setHours(0, 0, 0, 0) !== today.setHours(0, 0, 0, 0))) { openingTimeLocalArrTmp.push(tmp) }
        });

        this.setState({ openingTimeLocalArr: openingTimeLocalArrTmp })
    }

    onChangeTimeSlot = (timeSlotH, timeSlotM) => {
        this.setState({ timeSlotH, timeSlotM, popupOpen: false })
    }

    onOpenTimeslotPicker = (e) => {
        e.preventDefault()
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

    getLaunchingDates(minD, maxD) {
        const dates = [];
        const sunday = [];
        const available_dates = [];

        while (minD <= maxD) {
            let day = minD.getDay();
            if (day === 0) {
                sunday.push(new Date(minD))
                maxD.setDate(maxD.getDate() + 1);
            } else {
                available_dates.push(new Date(minD))
            }
            minD.setDate(minD.getDate() + 1);
        }
        dates.push({ sunday });
        dates.push({ available_dates });
        return dates;
    }


    render() {
        let theDate = new Date();
        let minDate = new Date(theDate);
        let maxDate = new Date(theDate);
        minDate.setDate(minDate.getDate());
        maxDate.setDate(maxDate.getDate() + 5);

        const tradeCalendar = this.getLaunchingDates(new Date(minDate), new Date(maxDate))
        const calendarStarDate = tradeCalendar[1].available_dates[0];
        const calendarEndDate = tradeCalendar[1].available_dates[tradeCalendar[1].available_dates.length - 1];
        const calendarSunday = tradeCalendar[0].sunday;


        const SingleSlot = ({ hour, minutes }) => {
            let today = new Date()
            let tominutes = today.getMinutes()
            let currentH = today.getHours()
            //console.log(currentH, tominutes, hour, minutes)

            return (
                <Button
                    disabled={((isSameDate(this.state.dateMDY, calendarEndDate) && (hour > currentH || (hour === currentH && minutes > tominutes))) || (this.state.dateMDY.setHours(0, 0, 0, 0) === today.setHours(0, 0, 0, 0) && currentH === hour && minutes < tominutes))}
                    onClick={() => this.onChangeTimeSlot(hour, minutes)}>
                    {hour.toString().padStart(2, '0')}:{minutes.toString().padStart(2, '0')}

                </Button>
            )
        }


        const TimeslotPicker = this.state.openingTimeLocalArr.map(function (timeL, index) {
            return (<div key={index}>
                <SingleSlot hour={timeL} minutes={0} />
                <SingleSlot hour={timeL} minutes={15} />
                <SingleSlot hour={timeL} minutes={30} />
                <SingleSlot hour={timeL} minutes={45} />
            </div>)
        })


        const SetTimeSlot = () => {
            let dateNow = new Date();
            let hh = dateNow.getHours();
            let mm = (`00` + dateNow.getMinutes()).slice(-2);
            let timelocal = this.state.openingTimeLocalArr;

            let timeSlotH = this.state.timeSlotH;
            let timeSlotM = this.state.timeSlotM;
            // if (timelocal.length && hh >= timelocal[0] && hh <= timelocal[timelocal.length-1]){
            //   return hh +`:`+ mm
            // } else{
            //   return `SET TIME SLOT +`
            // }
            if (timeSlotH !== null && timeSlotM !== null) {
                if (Number(timeSlotM) === 0) timeSlotM = '00';
                return timeSlotH + `:` + timeSlotM
            } else {
                if (this.state.warningShadow == true) {
                    return <div>
                    SET TIME SLOT +
                    <br />
                        <div className="fld__msg__warning_filled">
                            <span>Please set time slot</span>
                        </div>
                    </div>
                } else {
                    return <div>
                    SET TIME SLOT +
                    </div>
                }                
            }
        }


        const SubmitButton = () => {
            if (process.env.REACT_APP_USER === 'customer' &&
                this.state.retailerModalPut.checkTermValue &&
                this.state.retailerModalPut.checkGdprValue) {
                return <Button className="orange__btn" type='submit' onClick={() => { this.handleProceedToConfirmation(); }}>Submit call</Button>
            }
            if (process.env.REACT_APP_USER === 'retailer') {
                return <Button className="orange__btn" type='submit' onClick={this.handleProceedToConfirmation}>Submit put</Button>
            }
            return <Button className="orange__btn" disabled>{process.env.REACT_APP_USER === 'customer' ? 'Submit call' : 'Submit put'}</Button>
        }


        // const wbFee = (Number(this.props.selectedOption.price) / 100) * this.state.feePercent;
        let askedPrice = Number(this.state.priceRequired);
        const wbFee = (Number(askedPrice * this.state.feePercent / 100) * 1.22);

        const deposit = ((Number(this.props.selectedOption.price) / 100) * 20);
        const dateToConfirm = this.state.completedBeforeConfirmation ? new Date(this.state.checkDate) : new Date();

        /* seller */
        const NetCashIn = () => {
            let askedPrice = Number(this.state.priceRequired);
            // NetCashIn = askedPrice + VAT - shipping - insurance
            return this.state.askedPriceOK ?
                formatMoney(askedPrice + (askedPrice * this.state.taxPercent / 100) - this.state.shipping - this.state.insurance) :
                '0,00';
        }

        /* bayer */
        const TotalToPay = () => {
            let askedPrice = Number(this.state.priceRequired);
            // TotalToPay = askedPrice + VAT  + duties + shipping + insurance
            return this.state.askedPriceOK ?
                formatMoney((askedPrice + (askedPrice * this.state.taxPercent / 100) + (askedPrice * this.state.dutiesPercent / 100) + this.state.shipping + this.state.insurance)) :
                '0,00';
        }


        return (
            <Modal.Content className={process.env.REACT_APP_USER === 'customer' ? 'bayer' : 'seller'}>
                <div className="close-modal-btn__container"><div className="close-modal-btn" onClick={this.props.HideModal}></div></div>
                <Container className="mainBoard">
                    <Grid columns={16}>
                        <Grid.Row>
                            <Grid.Column mobile={16} tablet={8} computer={8} className="col-left col-watch-details">
                                <div className="head-wrapper">
                                    {!this.state.completedBeforeConfirmation ?
                                        (<h3>You are launching a {process.env.REACT_APP_USER === 'customer' ? 'CALL' : 'PUT'} for:</h3>
                                        ) : (
                                            <h3>You have launched a {process.env.REACT_APP_USER === 'customer' ? 'CALL' : 'PUT'} for:</h3>
                                        )}
                                    <h4 className="model-name">
                                        {this.props.selectedOption.model_name}
                                        {/* <span>{this.props.selectedOption.id}</span> */}
                                    </h4>
                                    <h4 className="price" style={{paddingTop: '10px'}}>
                                        {formatMoney(this.props.selectedOption.price)} €<span>list price</span>
                                    </h4>
                                </div>

                                <WatchDetails watchDetails={this.props.selectedOption} show={{}} />
                            </Grid.Column>

                            <Grid.Column mobile={16} tablet={8} computer={8} className="col-right">
                                <div className="head-wrapper">
                                    {!this.state.completedBeforeConfirmation ?
                                        (<h3>Your trade</h3>
                                        ) : (
                                            <h3>Confirm your trade</h3>
                                        )}
                                </div>
                                <div className="content-wrapper">
                                    {/*!this.state.completedBeforeConfirmation ?
                q                 ( */}
                                    <Form onSubmit={this.handleForm}>
                                        {!this.state.completedBeforeConfirmation ?
                                            (<Form.Group className="date-picker-wrapper" id="date-picker-wrapper">
                                                <Form.Field>
                                                    <label className="orange">Date</label>
                                                </Form.Field>
                                                <Form.Field>
                                                    <DatePicker
                                                        customInput={<DatePickerCustomInput />}
                                                        selected={this.state.dateMDY}
                                                        onChange={this.onChangeDate}
                                                        minDate={calendarStarDate}
                                                        maxDate={calendarEndDate}
                                                        dateFormat="dd/MM/yyyy"
                                                        excludeDates={calendarSunday}
                                                    />
                                                </Form.Field>
                                                <Form.Field>
                                                    {/* <label>Trade Start Time Slot</label> */}
                                                    <Portal mountNode={document.getElementById('date-picker-wrapper')} className="time-slot__popup"
                                                        trigger={<Button className="set-time-slot" content=
                                                            // {this.state.timeSlotH != null ?
                                                            //   (`${this.state.timeSlotH.toString().padStart(2, '0')}:${this.state.timeSlotM.toString().padStart(2, '0')}`) :
                                                            // (<SetTimeSlot />)
                                                            // }
                                                            {<SetTimeSlot />}
                                                        />}
                                                        // content={<div>Your Timezone: {getTimeZone()}<br />Available Slots:<br /><div>{TimeslotPicker}</div></div>}
                                                        // on='click'
                                                        // // position='right'
                                                        // basic
                                                        open={this.state.popupOpen}
                                                        onOpen={(e) => { e.preventDefault(), this.setState({ popupOpen: true }) }}
                                                        onClose={(e) => { e.preventDefault(), this.setState({ popupOpen: false }) }}
                                                    >
                                                        <div>
                                                            <div className="time-slot__triangle"></div>
                                                            <div className="time-slot__header">Your timezone offset (from UTC): {getTimeZone()}<br />Available Slots:</div>
                                                            <div className="time-slot__content">{TimeslotPicker}</div>
                                                        </div>
                                                    </Portal>
                                                </Form.Field>
                                            </Form.Group>
                                            ) : (
                                                <Form.Group className="date-picker-wrapper data-to-confirm">
                                                    <Form.Field>
                                                        <label className="orange">Date</label>
                                                    </Form.Field>
                                                    <Form.Field>
                                                        <span className="date-picker-wrapper__date">{dateToConfirm.getDate() + `/` + (dateToConfirm.getMonth() + 1) + `/` + dateToConfirm.getFullYear()}</span>
                                                        <span className="date-picker-wrapper__time">{dateToConfirm.getHours().toString().padStart(2, '0') + `:` + dateToConfirm.getMinutes().toString().padStart(2, '0')}</span>
                                                    </Form.Field>
                                                </Form.Group>
                                            )}

                                        {process.env.REACT_APP_USER === 'customer' &&
                                            <h4 className="price" style={{paddingTop: '10px'}}>
                                                <span>list price</span>{formatMoney(this.props.selectedOption.price)} €
                                            </h4>
                                        }

                                        <Form.Group className="fld__price-wrapper">
                                            <Form.Field>
                                                <label className="orange">Asked price</label>
                                            </Form.Field>
                                            {!this.state.completedBeforeConfirmation ?
                                                (<Form.Field>
                                                    <input required placeholder='Insert your asked price' value={this.state.priceRequired > 0 ? this.state.priceRequired : ''} type='number' onKeyDown={this.keyPress} onChange={this.handleChangePrice} step="100" />
                                                    <Button type="button" onClick={() => this.handleIncreasePrice()}>Inc</Button>
                                                    <Button type="button" onClick={() => this.handleDecreasePrice()}>Dec</Button>
                                                    
                                                    <div className="fld__msg__warning">
                                                        {(!this.state.priceRequired) && (this.state.warningShadow == true) && (<span>Please insert your price</span>)}
                                                        {(this.state.priceRequired % 100 !== 0) &&
                                                            (
                                                                <span>All bids must be a multiple of 100</span>
                                                            )
                                                        }
                                                        {(!this.state.askedPriceOK && this.state.maxAskedPrice > 0) &&
                                                            (<span>Maximum price must be equal to or less than {this.state.maxAskedPrice} €</span>)
                                                        }
                                                    </div>
                                                </Form.Field>
                                                ) : (
                                                    <Form.Field className="data-to-confirm">
                                                        <span>{formatMoney(this.state.priceRequired)} €</span>
                                                    </Form.Field>
                                                )}
                                        </Form.Group>

                                        {process.env.REACT_APP_USER === 'customer' ? (/* buyer */
                                            <div>
                                                <div className="modalBkgCosts"><span>+ VAT % *</span><span className="modalBkgValue">+ {formatMoney(this.state.priceRequired * this.state.taxPercent / 100)}<i>€</i></span></div>
                                                <div className="modalBkgCosts"><span>+ Duties *</span><span className="modalBkgValue">+ {formatMoney(this.state.priceRequired * this.state.dutiesPercent / 100)}<i>€</i></span></div>
                                                <div className="modalBkgCosts"><span>+ Shipping *</span><span className="modalBkgValue">+ {formatMoney(this.state.shipping)}<i>€</i></span></div>
                                                <div className="modalBkgCosts"><span>+ Insurance *</span><span className="modalBkgValue">+ {formatMoney(this.state.insurance)}<i>€</i></span></div>
                                                <div className="modalBkgTotal orange"><span>TOTAL TO PAY</span><span className="modalBkgValue"><TotalToPay /><i>€</i></span></div>
                                                <div className="modalBkgCosts"><span>DEPOSIT</span><span className="modalBkgValue">{formatMoney(deposit)}<i>€</i></span></div>
                                                <div className="modalBkgCosts"><span className="fld__msg__totals">* Estimate (to be calculated upon selection of seller)</span></div>
                                            </div>
                                        ) : (
                                                /* seller */
                                                <div>
                                                    <div className="modalBkgCosts"><span>+ VAT % *</span><span className="modalBkgValue">+ {formatMoney(this.state.priceRequired * this.state.taxPercent / 100)}<i>€</i></span></div>
                                                    <div className="modalBkgCosts"><span>- Shipping *</span><span className="modalBkgValue">- {formatMoney(this.state.shipping)}<i>€</i></span></div>
                                                    <div className="modalBkgCosts"><span>- Insurance *</span><span className="modalBkgValue">- {formatMoney(this.state.insurance)}<i>€</i></span></div>
                                                    <div className="modalBkgCosts"><span>- WB fee</span><span className="modalBkgValue">- {formatMoney(wbFee)}<i>€</i></span></div>
                                                    <div className="modalBkgTotal orange"><span>NET CASH IN</span><span className="modalBkgValue"><NetCashIn /><i>€</i></span></div>
                                                    {/* <div className="modalBkgCosts"><span>DEPOSIT</span><span className="modalBkgValue">{formatMoney((deposit / 100) * 85)}<i>€</i></span></div> */}
                                                    <div className="modalBkgCosts"><span className="fld__msg__totals">* Estimate (to be calculated upon selection of buyer)</span></div>
                                                </div>
                                            )}


                                        {/*
                              <Form.Field>
                                <label>Upload a picture</label>
                                <input type="file" onChange={this.fileChangedHandler} />
                              </Form.Field>
                              */ }

                                        {/* <Form.Field className="fld__pwd">
                              <input className="modalPw" required placeholder='Password' value={this.state.pw} type='password' onChange={this.handleChangePw} />
                            </Form.Field> */}

                                        {/* {process.env.REACT_APP_USER === 'customer' &&
                              <div className="actions">
                                <Button className="orange__btn full-width" type='button'>Confirm or include credit card</Button>
                              </div>
                            } */}

                                        {process.env.REACT_APP_USER === 'customer' &&
                                            <CreditCards
                                                setNewCreditCardData={this.handleNewCreditCard.bind(this)}
                                                setSelectedCreditCard={this.handleSetSelectedCreditCard.bind(this)}
                                                show={{ add_new_cc: true }} options={{ changeBtnText: 'Confirm or include credit card' }} />
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
                                        {/*(process.env.REACT_APP_USER === 'customer' && (!this.state.retailerModalPut.checkTermValue || !this.state.retailerModalPut.checkGdprValue)) &&
                                            <div className="fld__agree agree-message">
                                                <i>To participate to the trade, you must accept the Terms and Conditions and give your consent for the storage of the necessary data</i>
                                            </div>
                                        */}
                                    </Form>

                                    {/*) : (
                                <div>
                                <h4>Confirm and submit:</h4>
                                {this.props.selectedOption.brand}<br />
                                {this.props.selectedOption.label}<br />
                                (RefId: {this.props.selectedOption.id} - {this.props.selectedOption.reference})
                                <br /><br />
                                Trade starts: <br />
                                {this.state.checkDate.toString()}
                                {process.env.REACT_APP_USER === 'retailer' && (
                                    <div>
                                    <br />
                                    Price required: {this.state.priceRequired}
                                    </div>
                                )}
                                </div>
                                ) */}
                                </div>
                            </Grid.Column>
                        </Grid.Row>
                    </Grid>
                </Container>


                <div className={!this.state.completedBeforeConfirmation ? 'actions' : 'actions data-to-confirm'} style={{paddingTop: "18px"}}>
                    <div>
                        <Button className="gray-btn" onClick={() => this.resetStateHideModal()}>
                            Cancel
                        </Button>
                    </div>

                    {!this.state.completedBeforeConfirmation ?
                        (
                            <div>
                                {/* (this.state.priceRequired > 0 && this.state.priceRequired % 100 === 0) || process.env.REACT_APP_USER === 'customer') && this.state.retailerModalPut.checkTermValue && this.state.retailerModalPut.checkGdprValue && this.state.pw && (this.state.timeSlotH != null) && (this.state.timeSlotM != null) ? */}
                                {((this.state.priceRequired > 0 && this.state.priceRequired % 100 === 0) ||
                                    process.env.REACT_APP_USER === 'customer') &&
                                    (this.state.timeSlotH != null) && (this.state.timeSlotM != null) &&
                                    (this.state.askedPriceOK) ?
                                    (
                                        <SubmitButton />
                                    ) :
                                    (
                                        // <Button className="orange__btn" disabled>
                                        //     {process.env.REACT_APP_USER === 'customer' ? 'Submit call' : 'Submit put'}
                                        // </Button>
                                        <Button 
                                         className="orange__btn" 
                                         onClick={() => this.warningShadow()} 
                                         style={{opacity: '0.45'}}>
                                            {process.env.REACT_APP_USER === 'customer' ? 'Submit call' : 'Submit put'}
                                        </Button>
                                    )
                                }
                            </div>
                        ) : (
                            <div>
                                <Button className="gray-btn" type='submit' style={{ marginRight: '20px' }} onClick={this.handleModifyBack}>Modify</Button>
                                <Button className="orange__btn" type='submit' onClick={this.handleCloseSubmitted}>Confirm</Button>
                            </div>
                        )
                    }
                </div>
            </Modal.Content>
        )
    }
}

const mapStateToProps = store => ({
})

const mapActionsToProps = {
    HideModal,
    SendCreateBid
}

export default connect(mapStateToProps, mapActionsToProps)(SubmodalAddTrade)