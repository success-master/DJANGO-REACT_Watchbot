import React from 'react';
import { connect } from 'react-redux'
import { WriteSettingsProfile } from '../_actions/Settings.action'

import { Button, Form } from 'semantic-ui-react'

import AccountAddress from '../_components/AccountAddress'

const logout=`${process.env.REACT_APP_SITE_URL}/logout`

/*
const genderOptions = [
  { key: 'm', text: 'Male', value: 'male' },
  { key: 'f', text: 'Female', value: 'female' },
]
*/

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
          ],
          "document": {
            "type": "",
            "number": "",
            "issuer": "",
            "expiring_date": ""
          }
        },
        "first_name": "",
        "last_name": "",
        "email" : "",
        "retailer": null,
        "show_splash": false
      },
      disableSave: true,
      showingChangePwd: false,
      new_password: '',
      new_password_confirm: '',
      new_password_matches: false,
      formErrors: {email_login: '', email_contact: '', new_password: ''},
      validEmailLogin: true,
      validEmailContact: false,
      validPassword: true,
      validForm: false,
      showingAddNewAddress: false
    }
  }

  validateField(fieldName, value) {
    let fieldValidationErrors = this.state.formErrors;
    let validEmailLogin = this.state.validEmailLogin;
    let validEmailContact = this.state.validEmailContact;
    let validPassword = this.state.validPassword;

    switch(fieldName) {
      case 'email':
        validEmailLogin = value.match(/^([\w.%+-]+)@([\w-]+\.)+([\w]{2,})$/i);
        fieldValidationErrors.email_login = validEmailLogin ? '' : 'Login Email is invalid';
        break;
      case 'new_password':
        validPassword = value.length >= 8;
        fieldValidationErrors.new_password = validPassword ? '': 'Password is too short';
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
                    validEmailContact: validEmailContact,
                    validPassword: validPassword
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
    stateCopy.retailer[name] = value;
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
    this.setState({initialUserSettings: stateCopy});
  }

  handleChangeShowSplash = (e) => {
    let stateCopy = Object.assign({}, this.state.initialUserSettings)
    stateCopy.show_splash = !stateCopy.show_splash
    this.setState({disableSave: false })
    this.setState({initialUserSettings: stateCopy});
  }

  handleChangePw = (e) => {
    this.setState({new_password: e.target.value})
  }

  handleChangePwConfirm = (e) => {
    this.setState({new_password_confirm: e.target.value})
    if (e.target.value === this.state.new_password) {
      this.setState({new_password_matches: true})
    } else {
      this.setState({new_password_matches: false})
    }
  }

  onSave = () => {
    this.props.onSave(this.state.initialUserSettings)
    this.setState({disableSave: true})
  }

  manageLocalStorageOnLogout = () => {
    localStorage.removeItem('wbtk')
  }

  componentWillMount () {
    this.setState({ initialUserSettings: this.props.userProps.userSettingsProfile})
  }

  componentWillUnmount() {
    /* if (this.state.initialUserSettings!== this.props.userProps.userSettingsProfile) {
      alert("non hai salvato")
    }
    */
  }

  render() {
    let that=this;
    const AdressItems = this.state.initialUserSettings.customer != null ? (this.state.initialUserSettings.customer.addresses.map(function(addr, index) {
      return (<AccountAddress
                key={index}
                index={index}
                addr={addr }
                country={addr.country}
                address={addr.address}
                zip_code={addr.zip_code}
                city={addr.city}
                state={addr.state}
                preferred_shipping_addr={addr.preferred_shipping_addr}
                preferred_billing_addr={addr.preferred_billing_addr}
                handleChangeAddress={that.handleChangeAddress}
                handleChangeDefaultAddress={that.handleChangeDefaultAddress} />)
    })) : (
      null
    )

    return (
        <div className="modal-wrapper">
          <Form>
            <div className="paneAccountHeader">
              RETAILER INFORMATION
            </div>
            <div className="paneAccountContent">
              <div className="paneAccount50 label-wrapper">
                UserID (email)
              </div>
              <div className="paneAccount50 input-wrapper">
                <input placeholder='Email' name='email' value={this.state.initialUserSettings.email} type='email' onChange={this.handleChangeSettings} />
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
              <div className="paneAccount50 label-wrapper">
                Password
              </div>
              <div className="paneAccount50 input-wrapper">
                {this.state.showingChangePwd ?
                  (<div className="change-pwd-container">
                      <input placeholder='New Password' value={this.state.new_password} type='password' onChange={this.handleChangePw} />
                      <input placeholder='Confirm Password' value={this.state.new_password_confirm} type='password' onChange={this.handleChangePwConfirm} />
                      {this.state.new_password_matches ? (
                        <div>
                          Password Matches
                        </div>
                      ) : (
                          <div>
                          </div>
                        )
                      }
                    <Button className="panel-btn join-btn save-btn" onClick={() => this.setState((prevState) => ({ showingChangePwd: !prevState.showingChangePwd }))}>
                      Save
                    </Button>
                  </div>) :
                 (
                    <Button className="panel-btn join-btn" onClick={() => this.setState((prevState) => ({ showingChangePwd: !prevState.showingChangePwd }))} style={{marginLeft:'8px'}}>
                      Change
                    </Button>
                 )
                }
              </div>
            </div>
            <div className="paneAccountContent">
              <div className="paneAccount50 label-wrapper">
                Name
              </div>
              <div className="paneAccount50 input-wrapper">
                <input placeholder='First Name' name='first_name' value={this.state.initialUserSettings.first_name} type='text' onChange={this.handleChangeSettings} />
              </div>
            </div>
            <div className="paneAccountContent">
              <div className="paneAccount50 label-wrapper">
                Last name
              </div>
              <div className="paneAccount50 input-wrapper">
                <input placeholder='Last Name' name='last_name' value={this.state.initialUserSettings.last_name} type='text' onChange={this.handleChangeSettings} />
              </div>
            </div>
            {/*
            <div className="paneAccountContent">
              <div className="paneAccount50 label-wrapper">
                Birthdate
              </div>
              <div className="paneAccount50 input-wrapper">
                {this.state.initialUserSettings.customer !== null &&
                  <input placeholder='Birthdate' name='birth_date' value={this.state.initialUserSettings.customer.birth_date} type='date' onChange={this.handleChangeSettingsCustObj} />
                }
                </div>
            </div>
            */ }
          </Form>

          { /*} NOT USE
          <div className="paneAccountContent">
            <div className="paneAccount50">
              <div className="settings-select-cont">
                <select
                  name='gender'
                  value={this.state.initialUserSettings.customer.gender}
                  onChange={this.handleChangeSettingsCustObj}>

                    <option value="male">Male</option>
                    <option value="female">Female</option>

                </select>
              </div>
            </div>
            <div className="paneAccount50r">
              <input placeholder='DD MM YYYY' name='birth_date' value={this.state.initialUserSettings.customer.birth_date} type='date' onChange={this.handleChangeSettingsCustObj} />
            </div>
          </div>

          <div className="paneAccountHeader">
            CONTACT INFORMATION
          </div>
          <div className="paneAccountContent">
            <input placeholder='Phone number' name='phone_number' value={this.state.initialUserSettings.customer.phone_number} type='text' onChange={this.handleChangeSettingsCustObj} />
            <input placeholder='Email' name='email_contact' value={this.state.initialUserSettings.customer.email_contact} type='email' onChange={this.handleChangeSettingsCustObj} />
          </div>
          <div className="paneAccountHeader">
            ADDRESS
          </div>
          */ }
          { /*
          <div className="paneAccountContent">
            {AdressItems}
            {this.state.initialUserSettings.customer.addresses.length<3 ? (
              <Button className="addAddress" onClick={this.handleAddAddress}>Add another address</Button>
            ) :
            (
              <div></div>
            )

            }
          </div>
          */ }

          <Form>
            <div className="paneAccountHeader">
              PRIMARY ADDRESS
            </div>
            <div className="paneAccountContent">
              <div className="paneAccount label-wrapper">
                  Address
              </div>
              <div className="paneAccount input-wrapper">
                {this.state.initialUserSettings.retailer.primary_address !== null? this.state.initialUserSettings.retailer.primary_address : 'not present' }
              </div>
            </div>
            <div className="paneAccountContent">
              <div className="paneAccount label-wrapper">
                  Second Line Address
              </div>
              <div className="paneAccount input-wrapper">
                {this.state.initialUserSettings.retailer.primary_second_line_address !== null? this.state.initialUserSettings.retailer.primary_second_line_address : 'not present' }
              </div>
            </div>
            <div className="paneAccountContent">
              <div className="paneAccount label-wrapper">
                  Primary City
              </div>
              <div className="paneAccount input-wrapper">
                {this.state.initialUserSettings.retailer.primary_city !== null? this.state.initialUserSettings.retailer.primary_city : 'not present' }
              </div>
            </div>
            <div className="paneAccountContent">
              <div className="paneAccount label-wrapper">
                  Primary Contry
              </div>
              <div className="paneAccount input-wrapper">
                {this.state.initialUserSettings.retailer.primary_country !== null? this.state.initialUserSettings.retailer.primary_country : 'not present' }
              </div>
            </div>
            <div className="paneAccountContent">
              <div className="paneAccount label-wrapper">
                  Primary State
              </div>
              <div className="paneAccount input-wrapper">
                {this.state.initialUserSettings.retailer.primary_state !== null? this.state.initialUserSettings.retailer.primary_state : 'not present' }
              </div>
            </div>
            <div className="paneAccountContent">
              <div className="paneAccount label-wrapper">
                  Primary Zip Code
              </div>
              <div className="paneAccount input-wrapper">
                {this.state.initialUserSettings.retailer.primary_zip_code !== null? this.state.initialUserSettings.retailer.primary_zip_code : 'not present' }
              </div>
            </div>

            <div className="paneAccountHeader" style={{marginTop: '24px'}}>
              SECONDARY ADDRESS
            </div>
            <div className="paneAccountContent">
              <div className="paneAccount label-wrapper">
                  Address
              </div>
              <div className="paneAccount input-wrapper">
                {this.state.initialUserSettings.retailer.secondary_address !== null? this.state.initialUserSettings.retailer.secondary_address : 'not present' }
              </div>
            </div>
            <div className="paneAccountContent">
              <div className="paneAccount label-wrapper">
                  Second Line Address
              </div>
              <div className="paneAccount input-wrapper">
                {this.state.initialUserSettings.retailer.secondary_second_line_address !== null? this.state.initialUserSettings.retailer.secondary_second_line_address : 'not present' }
              </div>
            </div>
            <div className="paneAccountContent">
              <div className="paneAccount label-wrapper">
                  secondary City
              </div>
              <div className="paneAccount input-wrapper">
                {this.state.initialUserSettings.retailer.secondary_city !== null? this.state.initialUserSettings.retailer.secondary_city : 'not present' }
              </div>
            </div>
            <div className="paneAccountContent">
              <div className="paneAccount label-wrapper">
                  secondary Contry
              </div>
              <div className="paneAccount input-wrapper">
                {this.state.initialUserSettings.retailer.secondary_country !== null? this.state.initialUserSettings.retailer.secondary_country : 'not present' }
              </div>
            </div>
            <div className="paneAccountContent">
              <div className="paneAccount label-wrapper">
                  secondary State
              </div>
              <div className="paneAccount input-wrapper">
                {this.state.initialUserSettings.retailer.secondary_state !== null? this.state.initialUserSettings.retailer.secondary_state : 'not present' }
              </div>
            </div>
            <div className="paneAccountContent">
              <div className="paneAccount label-wrapper">
                  secondary Zip Code
              </div>
              <div className="paneAccount input-wrapper">
                {this.state.initialUserSettings.retailer.secondary_zip_code !== null? this.state.initialUserSettings.retailer.secondary_zip_code : 'not present' }
              </div>
            </div>
          </Form>

          <Form>
            <div className="paneAccountHeader">
              YOUR REGISTERED DOCUMENT
            </div>
          <div className="paneAccountContent">
            <div className="paneAccount50 label-wrapper">
              Type
            </div>
            <div className="paneAccount50 input-wrapper">
            {this.state.initialUserSettings.retailer.document_type !== null? this.state.initialUserSettings.retailer.document_type : 'not present' }

            </div>
          </div>
          <div className="paneAccountContent">
            <div className="paneAccount50 label-wrapper">
              Number
            </div>
            <div className="paneAccount50 input-wrapper">
              {this.state.initialUserSettings.retailer.document_number !== null? this.state.initialUserSettings.retailer.document_number : 'not present' }
            </div>
          </div>
          <div className="paneAccountContent">
            <div className="paneAccount50 label-wrapper">
              Issuer
            </div>
            <div className="paneAccount50 input-wrapper">
            {this.state.initialUserSettings.retailer.document_issuer !== null? this.state.initialUserSettings.retailer.document_issuer : 'not present' }
            </div>
          </div>
          <div className="paneAccountContent">
            <div className="paneAccount50 label-wrapper">
              Expiring date
            </div>
            <div className="paneAccount50 input-wrapper">
            {this.state.initialUserSettings.retailer.document_expiry_date !== null? this.state.initialUserSettings.retailer.document_expiry_date : 'not present' }
            </div>
          </div>
          {/*}
          <div className="paneAccountContent">
            <div className="paneAccount">
              <Button className="panel-btn join-btn">
                Change
                </Button>
            </div>
          </div>
          */}
          </Form>


          <Form>
            <div className="paneAccountHeader">
              YOUR CONTACTS
            </div>
            <div className="paneAccountContent">
              <div className="paneAccount label-wrapper">
                  Mobile number
              </div>
              <div className="paneAccount input-wrapper">
                {this.state.initialUserSettings.retailer.mobile_number !== null? this.state.initialUserSettings.retailer.mobile_number : 'not present' }

              </div>
            </div>
            <div className="paneAccountContent">
              <div className="paneAccount label-wrapper">
                Phone number
              </div>
              <div className="paneAccount input-wrapper">
                {this.state.initialUserSettings.retailer.phone_number !== null? this.state.initialUserSettings.retailer.phone_number : 'not present' }

                {/* {AdressItems}
                {this.state.initialUserSettings.customer.addresses.length < 3 ? (
                  <Button className="addAddress" onClick={this.handleAddAddress}>Add another address</Button>
                ) :
                  (
                    <div></div>
                  )

                } */}
              </div>
            </div>
            {this.state.showingAddNewAddress &&
              <div className="new-address-container">
                <div className="paneAccountContent">
                  <div className="paneAccount50 label-wrapper">
                    Company
                  </div>
                  <div className="paneAccount50 input-wrapper">
                    {/* <input placeholder='Company Name' name='company_name' value={this.state.initialUserSettings.retailer.company_name} type='text' /> */}
                  </div>
                </div>
                <div className="paneAccountContent">
                  <div className="paneAccount50 label-wrapper">
                    Country
                  </div>
                  <div className="paneAccount50 input-wrapper">
                    <select name='country'>
                      <option>Select an option</option>
                      {/*this.state.initialUserSettings.retailer.country*/}
                    </select>
                  </div>
                </div>
                <div className="paneAccountContent">
                  <div className="paneAccount50 label-wrapper">
                    State/Region
                  </div>
                  <div className="paneAccount50 input-wrapper">
                    <select name='state'>
                      <option>Select an option</option>
                      {/*this.state.initialUserSettings.retailer.state*/}
                    </select>
                  </div>
                </div>
                <div className="paneAccountContent">
                  <div className="paneAccount50 label-wrapper">
                    City
                  </div>
                  <div className="paneAccount50 input-wrapper">
                    {/** AUTOCOMPLETE ?! */}
                    {/* <input placeholder='City' name='city' value={this.state.initialUserSettings.retailer.city} type='text' /> */}
                  </div>
                </div>
                <div className="paneAccountContent">
                  <div className="paneAccount50 label-wrapper">
                    Zip
                  </div>
                  <div className="paneAccount50 input-wrapper">
                    {/* <input placeholder='Zip' name='zip' value={this.state.initialUserSettings.retailer.zip} type='text' /> */}
                  </div>
                </div>
                {/* <div className="paneAccountContent">
                  <div className="paneAccount50 label-wrapper">
                    Vat
                  </div>
                  <div className="paneAccount50 input-wrapper">
                    <input placeholder='Vat' name='vat' value={this.state.initialUserSettings.retailer.vat} type='text' />
                  </div>
                </div> */}
              </div>
            }

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
                  <Button className="settings-btn settings-save-btn" onClick={this.onSave}>>
                    SAVE CHANGES
                  </Button>
                )
                }
              </div>
            </div>
          </Form>

            {/* <div className="paneAccountHeader"> NOT USE
              OTHER APP OPTIONS
            </div>
            <div className="paneAccountContent" style={{ marginTop: "16px", marginBottom: "0px" }}>
              <div style={{ marginLeft: "16px" }}>
                <Checkbox className="prefAddress" label='Show splash page' checked={this.state.initialUserSettings.show_splash} onChange={() => this.handleChangeShowSplash()} />
              </div>
            </div> */}

            {/* <div className="settings-save">
              <div style={{ width: "40%", display: "inline-block", marginRight: "20px" }}>
                <Button className="settings-btn settings-cancel-btn">
                  CANCEL
                </Button>
              </div>
              <div style={{ width: "40%", display: "inline-block" }}>
                {this.state.disableSave ? (
                  <Button className="settings-btn settings-save-btn" disabled>
                    SAVE
                  </Button>
                ) : (
                    <Button className="settings-btn settings-save-btn" onClick={this.onSave}>>
                      SAVE
                  </Button>
                  )
                }

              </div>
            </div> */}

          {/* <Form> // NOT USE
            <div className="paneAccountHeader">
              YOUR LOGIN CRENDENTIALS
            </div>
            <div className="paneAccountContent">
              <input placeholder='Email' name='email' value={this.state.initialUserSettings.email} type='email' onChange={this.handleChangeSettings} />
              {!this.state.validEmailLogin ? (
                  <div>
                    {this.state.formErrors.email_login}
                  </div>
                ) : (
                  <div>
                  </div>
                )
              }
              <input placeholder='Reset Password' value={this.state.new_password} type='password' onChange={this.handleChangePw} />
              <input placeholder='Confirm Password' value={this.state.new_password_confirm} type='password' onChange={this.handleChangePwConfirm} />
              {this.state.new_password_matches ? (
                  <div>
                    Password Matches
                  </div>
                ) : (
                  <div>
                  </div>
                )
              }
              <div>
              </div>
            </div>
          </Form> */}
      </div>
    )
  }
}


const mapStateToProps = store => ({
    userProps: store.userInfo
})

const mapActionsToProps = {
    onSave: WriteSettingsProfile
}

export default connect(mapStateToProps, mapActionsToProps)(TabProfile)
