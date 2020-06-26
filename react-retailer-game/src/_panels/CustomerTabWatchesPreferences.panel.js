import React from 'react';
import { connect } from 'react-redux'

//import PreferenceSearch from  '../_components/PreferenceSearch'
import WatchesSearch from  '../_components/WatchesSearch'
import { Grid, Button } from 'semantic-ui-react'

//import TabWatchesPreferencesBrands from './CustomerTabWatchesPreferencesBrands.panel';
//import { LoadBrandsByFirstLetter } from '../_actions/WatchesPreferences.action';
import { LoadWatchesInDashboard } from '../_actions/WatchGraphList.action';
import { LoadReferenceInfo, LoadRefDetails} from '../_actions/References.action';
import { DeleteWatchGraph } from '../_actions/WatchGraphList.action';
import { formatMoney} from '../_utilities/price';


class TabWatchesPreferences extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedLetter: 65
    }
  }

  componentWillMount () {
    this.props.LoadWatchesInDashboard()
    //this.props.LoadBrandsByFirstLetter(65)
  }

  changeLetter = (charCode) => {
    this.setState({selectedLetter: charCode })
    this.props.LoadBrandsByFirstLetter(charCode)
  }


  onDelWatch = (listId, refId) => {
    this.props.onDelWatch(listId, refId)
  }



  render() {
    const {watchList} = this.props;

    if(watchList === undefined && watchList.length === 0){
      return null;
    }

    const WatchList = watchList.map((item, index) => (
      <Grid.Row key={index+ "-" + item.ref} className="panelRow">
        <Grid.Column mobile={2} tablet={2} computer={2} className="col-actions remove">
          <Button className="btn-remove" onClick={() => { this.onDelWatch(index, item.refId)}}>REMOVE</Button>
        </Grid.Column>
        <Grid.Column mobile={5} tablet={5} computer={5} className="col-description">
          <div style={{ height: "auto" }} className="model-wrapper">
            <span>{item.model}</span>
          </div>
          <div style={{height: "auto"}} className="highlighted-text">
            {item.brand} {item.ref}
          </div>
        </Grid.Column>
        <Grid.Column mobile={3} tablet={3} computer={3} className="col-date">
          {item.api20.case_size}
          <span className="td__label">case size</span>
        </Grid.Column>
        <Grid.Column mobile={4} tablet={4} computer={4} className="col-price">
          {formatMoney(item.suggestedPriceDollars)} €
        <span className="td__label">list price</span>
        </Grid.Column>
        <Grid.Column mobile={2} tablet={2} computer={2} className="col-actions view-reference">
            <Button className="btn-show-watch" onClick={() => {
                this.props.LoadRefDetails(item.refId)
                this.props.LoadReferenceInfo({ historicalData: item.historicalData, refId: item.refId, refPrice: item.suggestedPriceDollars})
              }}
            >VIEW WATCH</Button>
        </Grid.Column>
      </Grid.Row>
    ));


    let LetterList = []
    for (var i = 65; i <= 90; i++) {
        let charCode=i
        {charCode !== this.state.selectedLetter ?
          (LetterList.push(<Button key={i} className="letter-btn" onClick={() => this.changeLetter(charCode)}>{String.fromCharCode(i)}</Button>))
          :
          (LetterList.push(<Button key={i} className="letter-btn letter-btn-selected">{String.fromCharCode(i)}</Button>))
        }
    }

    return (
      <div className="xxxx">
        {/* <div style={{fontSize: "16px", background: "#707070", padding: "12px"}}>
          SELECT ALL REFERENCES YOU WANT TO ADD
        </div> */}
       {/* <PreferenceSearch /> */}
       <WatchesSearch empty={false}/>

       {/* <div style={{margin: "8px 0 8px 0", borderBottom: "2px solid #707070", padding: "8px 0px 0px 8px"}}>
        {LetterList}
       </div> */}
      {/* <TabWatchesPreferencesBrands /> */}

      <Grid columns={16} className="table-body watchlist__tab">
        {WatchList}
      </Grid>


      </div>
    )
  }
}

const mapStateToProps = store => ({
    userProps: store.userInfo,
    watchList: store.watchList.watchesDetailsInDashboard
})

const mapActionsToProps = {
  LoadWatchesInDashboard,
  //LoadBrandsByFirstLetter,
  LoadReferenceInfo,
  LoadRefDetails,
  onDelWatch: DeleteWatchGraph,
}

export default connect(mapStateToProps, mapActionsToProps)(TabWatchesPreferences)
