import React from 'react';
import { connect } from 'react-redux'

import ActivityLine from  '../_components/ActivityLine';

import { Container, Grid } from 'semantic-ui-react'

class ReferenceMyActivitiesPanel extends React.Component {
  constructor(props) {
    super(props);
    this.onShowBids = this.onShowBids.bind(this);
  }

  componentDidMount() {
    //this.props.LoadReferenceMyActivities(this.props.id)
  }

  onShowBids(e) {
    this.props.onShowBids(e);
  }

  render() {
    const ActivityItems = this.props.activProps.referenceMyActivitiesData.map(function(act, index) {
      return <ActivityLine key ={ index + "-" + act.id } act = { act } typing={index < 1 } myactivity />
    });

    return (
      <Container className="boardMyAct boardfullscroll">
          <Grid columns={16} >
            {ActivityItems}
          </Grid>
      </Container>
    )
  }
}

const mapStateToProps = store => ({
  activProps: store.activitiesList
})

const mapActionsToProps = {
  //LoadReferenceMyActivities
}

export default connect(mapStateToProps, mapActionsToProps)(ReferenceMyActivitiesPanel)
