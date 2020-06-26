import React from 'react';
import { connect } from 'react-redux'

import { Button } from 'semantic-ui-react'

class ButtonPay extends React.Component {

  render() {
    return (
      <Button className="panel-btn join-btn">
        Pay
      </Button>
    )
  }
}

const mapStateToProps = store => ({
})

const mapActionsToProps = {
}

export default connect(mapStateToProps, mapActionsToProps)(ButtonPay)
