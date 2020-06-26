import React from 'react'
import { connect } from 'react-redux'
import { Button} from 'semantic-ui-react'
import {updateSelectedCreditCard, creditCardList} from '../_actions/Settings.action'

class CreditCards extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            addNewCC: false,
            showManageCC: false,
            selectedCC: ''
        }
    }

    updateSelectedCreditCard(id){
        this.props.setSelectedCreditCard(id)
        //this.props.updateSelectedCreditCard(id)
        this.props.setNewCreditCardData(0, 0, {cc: 0, cvv2: 0, expyy: 0, expmm: 0})//RESET DATA
    }


    ShowHideManageCreditCard = () => {
        this.setState((prevState) => {
            if (prevState.showManageCC && prevState.addNewCC) {
                return {showManageCC: false, addNewCC: false, selectedCC: this.props.userProfile.credit_card_data !== null ? this.props.userProfile.credit_card_data.id : ''}
            }
            return {showManageCC: prevState.showManageCC === false ? true : false};
        });

        //RESET DATA
        this.props.setNewCreditCardData(0, 0, {cc: 0, cvv2: 0, expyy: 0, expmm: 0});
        this.props.setSelectedCreditCard(0);
    }


    handleCClist = (event) => {
        //RESET DATA
        this.props.setNewCreditCardData(0, 0, {cc: 0, cvv2: 0, expyy: 0, expmm: 0});
        this.props.setSelectedCreditCard(0);

        let val = event.target.value.toString();

        if(val === "-1"){
            this.setState({addNewCC: true, selectedCC: '-1'});
        } else {
            this.setState({addNewCC: false, selectedCC: val});
            //this.props.updateSelectedCreditCard(val)
            this.props.setSelectedCreditCard(val);
        }
    }


    handleFormValueChange = (event) => {
        //this.setState({
        //    [event.target.name]: event.target.value
        //})
        this.props.setNewCreditCardData(event.target.name, event.target.value, null)
    }


    componentWillMount () {
        this.props.creditCardList();

        //if(this.props.userProfile.credit_card_data !== null){
        //   this.setState({selectedCC: this.props.userProfile.credit_card_data.id})
        //}
    }

    yearList(){
        let now = new Date();
        let year_from = now.getFullYear(),
            year_to = year_from + 10,
            yearList = [];
        for(let i = year_from; i <= year_to; i++){
            yearList.push(i)
        }

        return yearList;
    }


    render() {
        //if(this.props.userProfile.credit_card_data === null) return false;

        const {addNewCC, showManageCC, selectedCC} = this.state;
        const { userProfile, show, options} = this.props;

        if (userProfile.creditCardList === undefined) {
            return null;
        }

        //console.log(userProfile, " --- this props userInfo ---")
        //console.log(userProfile.creditCardList, " ---- creditCardList ----")

        const CreditCardOptions = userProfile.creditCardList.map((cc) => (
            userProfile.credit_card_data !== null && userProfile.credit_card_data.id === cc.id ? (
                <option
                    value={cc.id}
                    key={cc.id}
                >{cc.number}</option>
            ) : (
                <option
                    value={cc.id}
                    key={cc.id}
                >{cc.number}</option>
            )
        ));

        const YearList = this.yearList();
        const YearOptions = YearList.map((y) => {
            return <option key={y} value={y.toString().substr(2,2)}>{y}</option>
        });

        const AddNewCreditCardOption = () =>{
            if (show.add_new_cc) {
                return <option value="-1">Add credit card</option>
            } else {
                return false
            }
        }

        return(
            <div className={`manage-credit-card__container${!showManageCC ? "" : " open"}`}>
                {(userProfile.creditCardList.length > 0 || show.add_new_cc) &&
                    <div className="actions">
                        <Button className={`change-credit-card${!showManageCC ? "" : " open"}`} type="button" onClick={this.ShowHideManageCreditCard}>
                        <div className="change-credit-card__triangle"></div>
                        {options.changeBtnText !== '' ?
                            options.changeBtnText :
                            'Choose or add a credit card'
                        }
                        </Button>
                    </div>
                }

                {showManageCC &&
                    <div className="manage-credit-card__ddl">
                        <select id="cc_list" name="cc_list" value={selectedCC} onChange={this.handleCClist}>
                            <option value="">Select an option</option>
                            {CreditCardOptions}
                            <AddNewCreditCardOption/>
                        </select>
                    </div>
                }

                {addNewCC &&
                    <div className="manage-credit-card__add-new">
                        <div className="add-credit-card__row">
                            <div className="add-credit-card__cell cell__cc-number">
                                <label>Credit card number</label>
                                <input type="number" name="cc" onChange={this.handleFormValueChange} />
                            </div>
                            <div className="add-credit-card__cell cell__cvv2">
                                <label>CVV2</label>
                                <input type="number" name="cvv2" onChange={this.handleFormValueChange} />
                            </div>
                        </div>
                        <div className="add-credit-card__row">
                            <div className="add-credit-card__cell cell__yy">
                                <label>Expires year YY</label>
                                <select name="expyy" onChange={this.handleFormValueChange}>
                                    <option value=""></option>
                                    {YearOptions}
                                </select>
                            </div>
                            <div className="add-credit-card__cell cell__mm">
                                <label>YY Month MM</label>
                                <select name="expmm" onChange={this.handleFormValueChange}>
                                    <option value=""></option>
                                    <option value="01">01</option>
                                    <option value="02">02</option>
                                    <option value="03">03</option>
                                    <option value="04">04</option>
                                    <option value="05">05</option>
                                    <option value="06">06</option>
                                    <option value="07">07</option>
                                    <option value="08">08</option>
                                    <option value="09">08</option>
                                    <option value="10">10</option>
                                    <option value="11">11</option>
                                    <option value="12">12</option>
                                </select>
                            </div>
                        </div>
                    </div>
                }
            </div>
        );
    }
}

const mapStateToProps = store => ({
    userProfile: store.userInfo.userSettingsProfile
})

const mapActionsToProps = {
    creditCardList,
    //updateSelectedCreditCard
}

export default connect(mapStateToProps, mapActionsToProps)(CreditCards)
