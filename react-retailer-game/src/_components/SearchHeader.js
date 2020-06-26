import React from 'react';
import { connect } from 'react-redux'
import { UpdateLatestReference, LoadReferenceInfo, LoadRefDetails } from '../_actions/References.action'
import axios from "axios"

import { withRouter } from "react-router-dom"

import Autocomplete from 'react-autocomplete'; // consiglio di usare import Select from 'react-select' come in WatchesSearch.js

import lens from '../_assets/icons/lens.png';

class SearchHeader extends React.Component {
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

  lensRenderer () {
     return (
         <div style={{position: "relative", top: "6px"}}><img src={lens} alt="lens search"/></div>
        );
  }

  /*
  updateSearch = (selectedOption) => {
    console.log(selectedOption)
    this.setState({ selectedOption })
    this.props.UpdateLatestReference({ selectedOption })
    this.props.history.push('/reference-info') //remember withRouter in export
  }
  */

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

      this.props.LoadRefDetails(item.id);

      //this.setState({ selectedOption : {reference: item.reference, label: item.label, id: item.id, price: item.price, brand: item.brand }, selected: true } )
      this.props.UpdateLatestReference({ selectedOption : { ...item }})
      this.setState({
          searchFieldValueText: '',
          autocompleteData: (process.env.REACT_APP_GAME === "false" ? [] : require("../_game/references.js")(''))
      });

      //this.props.LoadReferenceInfo({ selectedOption: { reference: item.reference, label: item.label, id: item.id, price: item.price, brand: item.brand }})
      this.props.LoadReferenceInfo({ refId: item.id, refPrice: item.price})

      //this.props.history.push('/reference-info') //remember withRouter in export

      this.input.blur();
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
          <div key={item.id} style={{ paddingLeft: '10px', paddingRight: '10px', background: isHighlighted ? 'dimgray' : 'black' }}>
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



  render() {
    //const { selectedOption } = this.state

    let placeHolder = ( process.env.REACT_APP_USER === 'customer' ? 'Launch Call' : 'Launch Put')

    return (
      <div>
            <Autocomplete
                ref={el => this.input = el}
                inputProps={{ id: 'states-autocomplete', placeholder: placeHolder }}
                wrapperStyle={{ position: 'relative', display: 'inline-block' }}
                getItemValue={this.getItemValue}
                items={this.state.autocompleteData}
                renderItem={this.renderItem}
                value={this.state.searchFieldValueText}
                onChange={this.onChange}
                onSelect={this.onSelect}
                autoHighlight={true}
                selectOnBlur={true}
                menuStyle={{borderRadius: '0',
                            boxShadow: '0 2px 12px rgba(0, 0, 0, 0.1)',
                            background: 'rgba(0, 10, 18, 1)',
                            padding: '0',
                            fontSize: '90%',
                            position: 'absolute',
                            overflow: 'visible',
                            maxHeight: '300px',
                            left: '0px',
                            top: '100%',
                            color: '#ffffff',
                            zIndex: '9999',
                            cursor: 'pointer'
                          }}
            />
      </div>
    )
  }
}

const mapStateToProps = store => ({
})

const mapActionsToProps = {
  UpdateLatestReference,
  LoadReferenceInfo,
  LoadRefDetails,
}

export default withRouter(connect(mapStateToProps, mapActionsToProps)(SearchHeader))
