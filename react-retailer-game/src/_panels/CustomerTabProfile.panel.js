import React from 'react';
import { connect } from 'react-redux'
import { WriteSettingsProfile, updateSelectedCreditCard, LoadSettingsProfile } from '../_actions/Settings.action'

import PrimaryAddress from  '../_components/CustomerPrimaryAddress';
import AccountAddress from  '../_components/AccountAddress';

import { Button, Form, Checkbox } from 'semantic-ui-react'

import CreditCards from '../_components/CreditCards'

const logout=`${process.env.REACT_APP_SITE_URL}/logout`

const possibleDocumentList = [
  'passport',
  'other'
]

class TabProfile extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      initialUserSettings: {
        "customer" : {
          "gender": "",
          "birth_date" : "",
          "email_contact" : "",
          "phone_number" : "",
          "tax_id" : "",
          "addresses" : [
            {
              "country" : "",
              "address" : "",
              "zip_code" : "",
              "city" : "",
              "state" : "",
              "preferred_billing_addr": true,
              "preferred_shipping_addr": true
            }
          ]
        },
        "first_name": "",
        "last_name": "",
        "email" : "",
        "retailer": null,
        "show_splash": false
      },
      disableSave: true,
      showingChangePwd: false,
      formErrors: {email_login: '', email_contact: ''},
      validEmailLogin: true,
      validEmailContact: false,
      validPassword: true,
      validForm: false,
      activeAddress: -1,
      addNewAddress: false,
      newCreditCardData: {
        cc: 0,
        cvv2: 0,
        expyy: 0,
        expmm: 0
      },
      credit_card_token_id: 0,
      edit_primary: false
    }
  }

  validateField(fieldName, value) {
    let fieldValidationErrors = this.state.formErrors;
    let validEmailLogin = this.state.validEmailLogin;
    let validEmailContact = this.state.validEmailContact;

    switch(fieldName) {
      case 'email':
        validEmailLogin = value.match(/^([\w.%+-]+)@([\w-]+\.)+([\w]{2,})$/i);
        fieldValidationErrors.email_login = validEmailLogin ? '' : 'Login Email is invalid';
        break;
      case 'email_contact':
        validEmailContact = value.match(/^([\w.%+-]+)@([\w-]+\.)+([\w]{2,})$/i);
        fieldValidationErrors.email_contact = validEmailContact ? '' : 'Contact Email is invalid';
        break;
      default:
        break;
    }

    this.setState({formErrors: fieldValidationErrors,
                    validEmailLogin: validEmailLogin,
                    validEmailContact: validEmailContact
                  }, this.validateForm);
  }

  validateForm() {
    this.setState({validForm: true});
  }

  handleChangeSettings = (e) => {
    let name=e.target.name
    let value=e.target.value
    this.setState(prevState => ({ initialUserSettings: {...prevState.initialUserSettings, [name]: value}}), () => { this.validateField(name, value) } )
    this.setState({disableSave: false })
  }

  handleChangeSettingsCustObj = (e) => {
    let name=e.target.name
    let value=e.target.value
    let stateCopy = Object.assign({}, this.state.initialUserSettings);
    stateCopy.customer[name] = value;
    this.setState({initialUserSettings: stateCopy}, () => { this.validateField(name, value)});
    this.setState({disableSave: false })
    //this.setState(prevState => ({ initialUserSettings: {...prevState.initialUserSettings, [name]: value}}), () => { this.validateField(name, value) } )
  }

  handleChangeAddress = (e, index) => {
    let name=e.target.name
    let value=e.target.value
    let stateCopy = Object.assign({}, this.state.initialUserSettings);
    stateCopy.customer.addresses[index][name] = value;
    this.setState({initialUserSettings: stateCopy, disableSave: false});
  }

  handleChangeDefaultAddress = (e, index, kind) => {
    let stateCopy = Object.assign({}, this.state.initialUserSettings);
    this.setState({disableSave: false })
    switch(kind) {
      case 'billing':
        stateCopy.customer.addresses[index].preferred_billing_addr = !stateCopy.customer.addresses[index].preferred_billing_addr
        for (let i = 0; i < stateCopy.customer.addresses.length; ++i) {
          if (i !== index) {
            stateCopy.customer.addresses[i].preferred_billing_addr  = false
          }
        }
        this.setState({initialUserSettings: stateCopy});
        break;
      case 'shipping':
        stateCopy.customer.addresses[index].preferred_shipping_addr = !stateCopy.customer.addresses[index].preferred_shipping_addr
        for (let i = 0; i < stateCopy.customer.addresses.length; ++i) {
          if (i !== index) {
            stateCopy.customer.addresses[i].preferred_shipping_addr  = false
          }
        }
        this.setState({initialUserSettings: stateCopy});
        break
      default:
        break;
    }

  }

  handleAddAddress = () => {
    let stateCopy = Object.assign({}, this.state.initialUserSettings);
    stateCopy.customer.addresses.push(
      {
        "country" : "",
        "address" : "",
        "zip_code" : "",
        "city" : "",
        "state" : "",
        "preferred_billing_addr": false,
        "preferred_shipping_addr": false
      }
    )
    this.setState({initialUserSettings: stateCopy, addNewAddress:true, activeAddress: stateCopy.customer.addresses.length-1});
  }

  handleChangeShowSplash = (e) => {
    let stateCopy = Object.assign({}, this.state.initialUserSettings)
    stateCopy.show_splash = !stateCopy.show_splash
    this.setState({disableSave: false })
    this.setState({initialUserSettings: stateCopy});
  }

  onPrimaryEditAddress = () => {
    this.setState(prevState => ({
      edit_primary: !prevState.edit_primary
    }));
  }

  handleChangePrimaryAddress = (e) => {
    let name=e.target.name
    let value=e.target.value
    let stateCopy = Object.assign({}, this.state.initialUserSettings);
    stateCopy.customer[name] = value;
    this.setState({initialUserSettings: stateCopy, disableSave: false});
  }

  onShowFormEditAddress = (index) => {
    if(this.state.addNewAddress){
      let stateCopy = Object.assign({}, this.state.initialUserSettings);
      stateCopy.customer.addresses.splice(index, 1);
      this.setState({initialUserSettings: stateCopy, addNewAddress: false});
    }

    this.setState(prevState => ({
      activeAddress: prevState.activeAddress === index ? -1 : index
    }))
  }

  onSave = () => {
    const {newCreditCardData, credit_card_token_id, initialUserSettings} = this.state;
    // add new credit card
    // let newCCdata = null;
    // if(newCreditCardData.cc > 0 &&
    // newCreditCardData.cvv2 > 0 &&
    // newCreditCardData.expyy > 0 &&
    // newCreditCardData.expmm > 0
    // ){
    // newCCdata = newCreditCardData;
    // }

    if(credit_card_token_id > 0){
      //   newCCdata = {credit_card_token_id};
      let creditCardList = this.props.userProps.userSettingsProfile.creditCardList;
      let credit_card_data = creditCardList.filter(cc =>{
        return parseInt(cc.id) === parseInt(credit_card_token_id)
      });
      const newObject = {
        ...initialUserSettings,
        creditCardList,
        credit_card_data: credit_card_data[0]
      }
      this.setState({initialUserSettings: newObject})
      this.props.onSave(newObject)
      this.props.updateSelectedCreditCard(credit_card_token_id);
      this.props.LoadSettingsProfile()

    } else {

      this.props.onSave(initialUserSettings)
    }

    this.setState({disableSave: true})
  }

  manageLocalStorageOnLogout = () => {
    localStorage.removeItem('wbtk')
  }

  componentWillMount () {
    if (process.env.REACT_APP_GAME !== "true")  {
      this.setState({ initialUserSettings: this.props.userProps.userSettingsProfile})
    }
  }

  componentWillUnmount() {
    /* if (this.state.initialUserSettings!== this.props.userProps.userSettingsProfile) {
      alert("non hai salvato")
    }
    */
  }


  handleNewCreditCard = (key, value, obj) =>{
    let ccData = this.state.newCreditCardData;
    let newObject = {};
    (typeof obj === 'object' && obj !== null) ?
      (newObject = {
        ...ccData,
        ...obj}
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

  handleDocList = (event) => {
    this.setState({initialUserSettings:
                    {...this.state.initialUserSettings,
                          customer: { ...this.state.initialUserSettings.customer,
                                      document_type: event.target.value }
                                    }
                    }
                  );
  }


  render() {
    let { addNewAddress, activeAddress } = this.state;
    let that=this

    const AdressItems = this.state.initialUserSettings.customer.addresses !== undefined ? this.state.initialUserSettings.customer.addresses.map(function(addr, index) {
      return <AccountAddress key={index} index={index} addr={addr }
              country={addr.country} address={addr.address} zip_code={addr.zip_code} city={addr.city} state={addr.state}
              preferred_shipping_addr={addr.preferred_shipping_addr}
              preferred_billing_addr={addr.preferred_billing_addr}
              handleChangeAddress={that.handleChangeAddress}
              handleChangeDefaultAddress={that.handleChangeDefaultAddress}
              addNewAddress={addNewAddress}
              activeAddress={activeAddress}
              onShowFormEditAddress={that.onShowFormEditAddress} />
    }) : null

    const DocumentOptions = possibleDocumentList.filter(d => d !== this.state.initialUserSettings.customer.document_type).map(doc => (
            <option
                value={doc}
                key={doc}
            >{doc}</option>
        )
    );


    return (

      <div className="account__bayer">
        <Form>
          <div className="account__block">
            <div className="paneAccountHeader">
              Your Personal Details
            </div>
            <div className="paneAccountContent">
              <div className="paneAccount50 label-wrapper">UserID (email)</div>
              <div className="paneAccount50 input-wrapper">
                <input placeholder='Email' name='email' value={this.state.initialUserSettings.email} type='email' readonly />
                {!this.state.validEmailLogin ? (
                    <div>
                      {this.state.formErrors.email_login}
                    </div>
                  ) : (
                    <div>
                    </div>
                  )
                }
              </div>
            </div>

            <div className="paneAccountContent">
              <div className="paneAccount50 label-wrapper">First name</div>
              <div className="paneAccount50 input-wrapper">
                <input placeholder='First Name' name='first_name' value={this.state.initialUserSettings.first_name} type='text' onChange={this.handleChangeSettings} />
              </div>
            </div>

            <div className="paneAccountContent">
              <div className="paneAccount50 label-wrapper">Last Name</div>
              <div className="paneAccount50 input-wrapper">
                <input placeholder='Last Name' name='last_name' value={this.state.initialUserSettings.last_name} type='text' onChange={this.handleChangeSettings} />
              </div>
            </div>

            <div className="paneAccountContent">
              <div className="paneAccount50 label-wrapper">Birth date</div>
              <div className="paneAccount50 input-wrapper">
                <input placeholder='Date of Birth' name='birth_date' value={this.state.initialUserSettings.customer.birth_date} type='date' onChange={this.handleChangeSettingsCustObj} />
              </div>
            </div>


            <div className="paneAccountHeader">
              Your contact
            </div>
            <div className="paneAccountContent">
              <div className="paneAccount50 label-wrapper">Mobile number</div>
              <div className="paneAccount50 input-wrapper">
                <input placeholder='Phone number' name='phone_number' value={this.state.initialUserSettings.customer.phone_number} type='text' onChange={this.handleChangeSettingsCustObj} />
              </div>
              {/* <input placeholder='Email' name='email_contact' value={this.state.initialUserSettings.customer.email_contact} type='email' onChange={this.handleChangeSettingsCustObj} /> */}
            </div>

            <div className="paneAccountContent address-list">
              <div className="paneAccount50 label-wrapper">Primary address</div>
              <div className="paneAccount50 input-wrapper">

              <PrimaryAddress address={this.state.initialUserSettings.customer.address}
                                     city={this.state.initialUserSettings.customer.city}
                                     country={this.state.initialUserSettings.customer.country}
                                     state={this.state.initialUserSettings.customer.state}
                                     zip_code={this.state.initialUserSettings.customer.zip_code}
                                     edit={this.state.edit_primary}
                                     handleChangePrimaryAddress={this.handleChangePrimaryAddress}
                                     onPrimaryEditAddress={this.onPrimaryEditAddress} />
              </div>
            </div>

            <div className="paneAccountContent address-list">
              <div className="paneAccount50 label-wrapper">Other address</div>
              <div className="paneAccount50 input-wrapper">
                {AdressItems}
              </div>
            </div>
            <div className="paneAccountContent address-list__add-new">
              <div className="paneAccount50 label-wrapper"></div>
              {/*
              <div className="paneAccount50 input-wrapper">
                {this.state.initialUserSettings.customer.addresses.length<3 ? (
                  <Button className="settings-addAddress panel-btn" onClick={this.handleAddAddress}><span></span>Add another address</Button>
                ) : (
                  <div></div>
                )}
              </div>
              */ }
            </div>
          </div>

          <div className="account__block">
            <div className="paneAccountHeader">
                YOUR CREDIT CARD
            </div>
            <div className="paneAccountContent credit-card-container">
              <div className="paneAccount label-wrapper">
                Credit card
              </div>
              <div className="paneAccount">
                <span>{(this.state.initialUserSettings.credit_card_data !== null && this.state.initialUserSettings.credit_card_data !== undefined) ? this.state.initialUserSettings.credit_card_data.number : 'Nessuna CC predefinita'}</span>
              </div>

              <CreditCards setNewCreditCardData={this.handleNewCreditCard.bind(this)} setSelectedCreditCard={this.handleSetSelectedCreditCard.bind(this)} show={{add_new_cc: false}} options={{changeBtnText: 'Change credit card'}}/>
            </div>

            <div className="paneAccountHeader">
              YOUR REGISTERED DOCUMENT {this.state.initialUserSettings.document_type}
            </div>
            <div className="paneAccountContent">
              <div className="paneAccount50 label-wrapper">
                Type
              </div>
              <div className="paneAccount50 input-wrapper">

                <select name='document_type' onChange={this.handleDocList}>
                  <option value={this.state.initialUserSettings.customer.document_type}>{this.state.initialUserSettings.customer.document_type}</option>
                  {DocumentOptions}
                </select>
              </div>
            </div>
            <div className="paneAccountContent">
              <div className="paneAccount50 label-wrapper">
                Number
              </div>
              <div className="paneAccount50 input-wrapper">
                <input placeholder='Document number' name='document_number' value={this.state.initialUserSettings.customer.document_number} type='text' onChange={this.handleChangeSettingsCustObj} />
              </div>
            </div>
            <div className="paneAccountContent">
              <div className="paneAccount50 label-wrapper">
                    Issuer
              </div>
              <div className="paneAccount50 input-wrapper">
                <input placeholder='Issuer' name='document_issuer' value={this.state.initialUserSettings.customer.document_issuer} type='text' onChange={this.handleChangeSettingsCustObj} />
              </div>
            </div>
            <div className="paneAccountContent">
              <div className="paneAccount50 label-wrapper">
                Expiring date
              </div>
              <div className="paneAccount50 input-wrapper">
                <input placeholder='DD MM YYYY' name='document_expiry_date' value={this.state.initialUserSettings.customer.document_expiry_date} type='text' onChange={this.handleChangeSettingsCustObj} />
              </div>
            </div>
            {/*
            <div className="paneAccountContent">
              <div className="paneAccount">
                <Button className="panel-btn join-btn">
                  Change
                  </Button>
              </div>
            </div>
            */ }
          </div>

          <div className="settings-save">
            <div><a href={logout} onClick={this.manageLocalStorageOnLogout} className="btn-logout">LOGOUT</a></div>
            {/* <div>
              <Button className="settings-btn settings-cancel-btn">
                CANCEL
              </Button>
            </div> */}
            <div>
              {this.state.disableSave ? (
                <Button className="settings-btn settings-save-btn" disabled>
                  SAVE CHANGES
                </Button>
              ):(
                <Button className="settings-btn settings-save-btn" onClick={this.onSave}>
                  SAVE CHANGES
                </Button>
              )
              }
            </div>
          </div>

        </Form>
      </div>
    )
  }
}

const mapStateToProps = store => ({
    userProps: store.userInfo
})

const mapActionsToProps = {
    onSave: WriteSettingsProfile,
    updateSelectedCreditCard,
    LoadSettingsProfile
}

export default connect(mapStateToProps, mapActionsToProps)(TabProfile)
