export function ShowModal(modalType, modalProps) {

  return function(dispatch) {
    dispatch({type: 'SHOW_MODAL', modalType: modalType, modalProps: modalProps})
  }
}

export function HideModal() {
  return function(dispatch) {
    dispatch({type: 'HIDE_MODAL'})
  }
}
