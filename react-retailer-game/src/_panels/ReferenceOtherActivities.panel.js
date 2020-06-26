import React from 'react';
import { connect } from 'react-redux'

import ActivityLine from  '../_components/ActivityLine';

import { Container, Grid } from 'semantic-ui-react'

class ReferenceOtherActivitiesPanel extends React.Component {
  constructor(props) {
    super(props);
    this.onShowBids = this.onShowBids.bind(this);
  }

  componentDidMount() {
    //this.props.LoadReferenceOtherActivities(this.props.id)
  }

  onShowBids(e) {
    this.props.onShowBids(e);
  }

  render() {
    const ActivityItems = this.props.activProps.referenceOtherActivitiesData.map(function(act, index) {
      return <ActivityLine key ={index + "-" + act.id} act={act} typing={index < 1 } />
    });

    return (
      <Container className="boardOtherAct boardfullscroll">
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
  //LoadReferenceOtherActivities
}

export default connect(mapStateToProps, mapActionsToProps)(ReferenceOtherActivitiesPanel)
