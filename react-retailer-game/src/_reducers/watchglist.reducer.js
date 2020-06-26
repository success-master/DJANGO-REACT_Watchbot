import { LOAD_WATCHES_IN_DASHBOARD_OK, RESET_WATCHES_IN_DASHBOARD, ADD_WATCHES_DETAILS_TO_DASHBOARD, ADD_WATCH_GRAPH, DELETE_WATCH_GRAPH } from '../_actions/WatchGraphList.action'

//define the initial state
const initialState = {
  watchesDetailsInDashboard: [],
  watchListLoaded: false
}

export default function watchgraphReducer(state = initialState, action) {
  switch(action.type) {
    case LOAD_WATCHES_IN_DASHBOARD_OK:
      return {...state, watchListLoaded: true }
      //return {...state, watchesDetailsInDashboard: [], watchListLoaded: true }
    case RESET_WATCHES_IN_DASHBOARD:
      return {...state, watchesDetailsInDashboard: [], watchListLoaded: false }
    case ADD_WATCHES_DETAILS_TO_DASHBOARD:
        let newObj = [
          {refId: action.payload.id,
           ref: action.payload.reference,
           label: action.payload.label,
           model: action.payload.model.name,
           brand: action.payload.model.brand.name ,
           caseMaterial: action.payload.case_material,
           suggestedPriceDollars: action.payload.price,
           historicalData: action.historicalData,
           api20: {...action.payload} }];

        const newData = [...state.watchesDetailsInDashboard, ...newObj].reduce((res, data) => {
          if (res.findIndex(item => item.refId === data.refId ) < 0) { 
              res.push(data);
          }  
          return res;
        }, []) 
        
        //console.log(newData, "|||||||| reducer |||||");
        
      return {...state, watchesDetailsInDashboard: newData}
  
      // return {...state, watchesDetailsInDashboard: state.watchesDetailsInDashboard.concat([
      //     {refId: action.payload.id,
      //      ref: action.payload.reference,
      //      label: action.payload.label,
      //      model: action.payload.model.name,
      //      brand: action.payload.model.brand.name ,
      //      caseMaterial: action.payload.case_material,
      //      suggestedPriceDollars: action.payload.price,
      //      historicalData: action.historicalData,
      //      api20: {...action.payload} } ])}
    case ADD_WATCH_GRAPH:
      //let incremented = Object.assign({}, state)
      //incremented.watchData.push( { id: incremented.watches.length, ref: "added" })
      //incremented.watches.push(incremented.watches.length)
      //return incremented
      return {...state, watchData: state.watchData.concat([action.payload])}
    case DELETE_WATCH_GRAPH:
      return {...state, watchesDetailsInDashboard: state.watchesDetailsInDashboard.slice(0,action.payload.rigaDaCanc).concat(state.watchesDetailsInDashboard.slice(action.payload.rigaDaCanc+1))}
    default:
      return state
  }
}
