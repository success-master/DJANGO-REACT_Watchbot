import React from 'react'

class DatePickerCustomInput extends React.Component {
    constructor(props) {
        super(props)
    }

    render () {
        return (
        <input
            {...this.props}
            readOnly
            type="text"
        />
        )
    }
}

export default DatePickerCustomInput;
