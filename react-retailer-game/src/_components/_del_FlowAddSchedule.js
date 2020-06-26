import React from 'react';
import { connect } from 'react-redux'
import axios from "axios"
import Autocomplete from 'react-autocomplete';

import { SendCreateBid } from '../_actions/Bids.action'

class FlowAddSchedule extends React.Component {

    constructor(props, context) {
        super(props, context);

        // Set initial State
        this.state = {
            // Current value of the select field
            valueText: "",
            // Data that will be rendered in the autocomplete
            // As it is asynchronous, it is initially empty
            autocompleteData: [],
            selectedOption: {},
            selected: false
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
        let _this = this;

        axios.get(process.env.REACT_APP_API_HOST+`reference/?search=${searchText}`, { headers: { 'Authorization': 'Token '+localStorage.getItem('wbtk')} })
          .then((response) => {
            _this.setState({
                autocompleteData: response.data
            });
          })

        /*
        // Url of your website that process the data and returns a
        let url = `mywebsite/searchApi?query=${searchText}`;

        // Configure a basic AJAX request to your server side API
        // that returns the data according to the sent text
        let xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.responseType = 'json';
        xhr.onload = () => {
            let status = xhr.status;

            if (status == 200) {
                // In this example we expects from the server data with the structure of:
                // [
                //    {
                //        label: "Some Text",
                //        value: 1,
                //    },
                //    {
                //        label: "Some Other Text",
                //        value: 1,
                //    },
                // ]
                // But you can obviously change the render data :)

                // Update the state with the remote data and that's it !
                _this.setState({
                    autocompleteData: xhr.response
                });

                // Show response of your server in the console
                console.log(xhr.response);
            } else {
                console.error("Cannot load data from remote source");
            }
        };

        xhr.send();
        */
    }

    /**
     * Callback triggered when the user types in the autocomplete field
     *
     * @param {Event} e JavaScript Event
     * @return {Event} Event of JavaScript can be used as usual.
     */
    onChange(e){
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
    onSelect(val, item){
        this.setState({
            valueText: val
        });

        console.log("Option from 'database' selected : ", val);
        console.log(item)
        console.log(item.label)
        this.setState({ selectedOption : {reference: item.reference, label: item.label, id: item.id, price: item.price}, selected: true } )
        console.log(this.state)
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
            <div style={{ background: isHighlighted ? 'lightgrey' : 'white' }}>
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
        return (
          <div>
              {!this.state.selected ? (
                <div>
                  <label htmlFor="states-autocomplete" style={{display: "block"}}>Select Watch Model:</label>
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
              ):
              (
                <div>
                  {this.state.selectedOption.reference}<br />
                  {this.state.selectedOption.label}<br />
                  Refid: {this.state.selectedOption.id}
                  <div className="modalColor2">SUGGESTED PRICE: ${this.state.selectedOption.price}</div>
                </div>
              )
            }


            </div>
        );
    }
}

const mapStateToProps = store => ({
})

const mapActionsToProps = {
  SendCreateBid
}

export default connect(mapStateToProps, mapActionsToProps)(FlowAddSchedule)
