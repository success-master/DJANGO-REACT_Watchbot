import React from 'react';
import { connect } from 'react-redux'
import { LoadWatchesInDashboard, AddWatchGraph } from '../_actions/WatchGraphList.action'

import WatchMiniGraph from  '../_components/WatchMiniGraph'
import WatchesSearch from  '../_components/WatchesSearch'

import { Grid, Container } from 'semantic-ui-react'

class WatchesGraphListPanel extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      activeAnalytics: []
    }
    this.onAddWatch = this.onAddWatch.bind(this);
  }

  componentDidMount() {
    if (this.props.watchProps.watchListLoaded === false) {
      this.props.LoadWatchesInDashboard()
    }
  }

  onAddWatch() {
    this.props.onAddWatch("ref","brand");
  }

  onShowAnalytics = (indexList) => {
    this.setState((prevState) => {
      let prevArr = prevState.activeAnalytics;
      let newArr = [];
      if(prevArr.includes(indexList)){
        newArr = prevArr.filter(item => item !== indexList)
      } else {
        newArr = [...prevArr, indexList]
      }

      return {
        activeAnalytics: newArr
      };
    });
    /*
    this.setState(prevState => ({
      activeAnalytics: prevState.activeAnalytics === indexList? -1 : indexList
    }))
    */
    /* in futuro per ottimizzazione, caricare qui i dati di cui mostrare i grafici */
  }

  render() {
      let _onShowAnalytics = this.onShowAnalytics
      let _activeAnalytics = this.state.activeAnalytics

      const watchItems = this.props.watchProps.watchesDetailsInDashboard.map((w, index) => {
        return (<WatchMiniGraph
                    key = { index + "-" + w.ref }
                    listId = { index }
                    api20={ w.api20 }
                    refId={ w.refId }
                    reference = { w.ref }
                    label={ w.label }
                    model={ w.model}
                    brand = { w.brand }
                    suggestedPriceDollars= {w.suggestedPriceDollars}
                    historicalData={w.historicalData}
                    onShowAnalytics={_onShowAnalytics}
                    openAnalytics={_activeAnalytics} />)
      }
    )

    return (

      <Container className="activities-list-container watchlist-container">
        <div className="boardfull boardfullscroll">
          <div className="page-title">WATCHLIST</div>
          <WatchesSearch empty={this.props.watchProps.watchesDetailsInDashboard.length > 0 ? false : true}/>

          <Grid columns={16} className="table-body watchlist-table">
            {this.props.watchProps.watchesDetailsInDashboard.length > 0 ?
              watchItems :
              (
                <span></span>
              )
            }
          </Grid>

        </div>
      </Container>
    )
  }
}

const mapStateToProps = store => ({
  watchProps: store.watchList
})

const mapActionsToProps = {
  onAddWatch: AddWatchGraph,
  LoadWatchesInDashboard,
}

export default connect(mapStateToProps, mapActionsToProps)(WatchesGraphListPanel)
 /*
<div className="watches-list-container">
  <div className="boardle" id="boardlescroll">
    {this.props.watchProps.watchesDetailsInDashboard.length > 0 ?
     watchItems :
    (
      <span></span>
    )
    }
  </div>
</div>
*/
