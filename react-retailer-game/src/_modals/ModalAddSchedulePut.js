import React from "react";
import { connect } from 'react-redux'
import axios from "axios"
import Autocomplete from 'react-autocomplete';

import { HideModal } from '../_actions/Modals.action'

import SubmodalAddTrade from './SubmodalAddTrade'

import { Modal, Button, Icon} from 'semantic-ui-react'

class ModalAddSchedulePut extends React.Component {
  constructor(props, context) {
      super(props, context);

      this.state = {
          // Current value of the select field
          searchFieldValueText: '',
          // Data that will be rendered in the autocomplete
          // As it is asynchronous, it is initially empty
          autocompleteData: (process.env.REACT_APP_GAME === "false" ? [] : require("../_game/references.js")('')),
          selectedOption: {},
          selected: false,
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
  retrieveDataAsynchronously(searchText){

      if (process.env.REACT_APP_GAME === "false") {
        let _this = this;

        axios.get(process.env.REACT_APP_API_HOST+`reference/?search=${searchText}`, { headers: { 'Authorization': 'Token '+localStorage.getItem('wbtk')} })
          .then((response) => {
            _this.setState({
                autocompleteData: response.data
            });
          })
      } else {
         this.setState({
            autocompleteData: require("../_game/references.js")(searchText)
        });
      }

  }

  /**
   * Callback triggered when the user types in the autocomplete field
   *
   * @param {Event} e JavaScript Event
   * @return {Event} Event of JavaScript can be used as usual.
   */
  onChange(e){
      this.setState({
          searchFieldValueText: e.target.value
      });

      /**
       * Handle the remote request with the current text !
       */
      this.retrieveDataAsynchronously(e.target.value)
  }

  /**
   * Callback triggered when the autocomplete input changes.
   *
   * @param {Object} val Value returned by the getItemValue function.
   * @return {Nothing} No value is returned
   */
  onSelect(val, item){
      this.setState({
          searchFieldValueText: val
      });

      this.setState({ selectedOption : {reference: item.reference, label: item.label, id: item.id, price: item.price, brand: item.brand }, selected: true } )
  }

  /**
   * Define the markup of every rendered item of the autocomplete.
   *
   * @param {Object} item Single object from the data that can be shown inside the autocomplete
   * @param {Boolean} isHighlighted declares wheter the item has been highlighted or not.
   * @return {Markup} Component
   */
  renderItem(item, isHighlighted){
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
  getItemValue(item){
      // You can obviously only return the Label or the component you need to show
      // In this case we are going to show the value and the label that shows in the input
      //return `${item.id} - ${item.label}`;
      return `${item.label}`
  }

  resetStateHideModal = () => {
    this.setState({selected: false, completedBeforeConfirmation: false})
    this.props.HideModal()
  }

  render() {

    return (
      <Modal size='tiny' open closeOnEscape={true}
          closeOnDimmerClick={false} onClose={() => this.resetStateHideModal()}>
        <Modal.Header>ADD SCHEDULED TRADE</Modal.Header>
          {!this.state.selected ?
            (
              <div style={{padding: "1.25rem 1.5rem"}}>
                <Modal.Content>
                  <Modal.Description>
                    <div style={{position: "relative"}}>
                      <div>
                        <label htmlFor="states-autocomplete" style={{display: "block"}}>Select Watch Model:</label>

                            <Autocomplete
                                inputProps={{ id: 'states-autocomplete' }}
                                wrapperStyle={{ position: 'relative', display: 'inline-block' }}
                                getItemValue={this.getItemValue}
                                items={this.state.autocompleteData}
                                renderItem={this.renderItem}
                                value={this.state.searchFieldValueText}
                                onChange={this.onChange}
                                onSelect={this.onSelect}
                                autoHighlight={true}
                                menuStyle={{borderRadius: '3px',
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

                      </div>
                    </div>

                  </Modal.Description>

                </Modal.Content>
                <Modal.Actions>
                  <Button style={{marginLeft: "0"}} color='grey' inverted onClick={() => this.resetStateHideModal()}>
                    <Icon name='checkmark' /> Cancel
                  </Button>
                </Modal.Actions>
              </div>
            )
              :
            (
              <SubmodalAddTrade selectedOption={this.state.selectedOption} calledFrom="schedulePut" />
            )
          }
        </Modal>

    )
  }
}

const mapStateToProps = store => ({
})

const mapActionsToProps = {
  HideModal
}

export default connect(mapStateToProps, mapActionsToProps)(ModalAddSchedulePut)
