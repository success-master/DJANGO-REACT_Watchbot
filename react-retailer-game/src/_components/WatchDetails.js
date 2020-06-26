import React from 'react'
import { connect } from 'react-redux'
import { Button} from 'semantic-ui-react'
import { formatMoney} from '../_utilities/price';

const WatchDetails = (props) => {
    const { show, refDetails } = props

    let detailsPanel = React.createRef();
    let showMoreBtn = React.createRef();

    // const ToggleDetailes = () => {
    //     if(document.getElementsByClassName("show-more__details-panel")[0].style.display === 'none'){
    //         document.getElementsByClassName("show-more__details-panel")[0].style.display = ''
    //     } else {
    //         document.getElementsByClassName("show-more__details-panel")[0].style.display = 'none'
    //     }
    // }

    function toggleHandler() {
        //console.log(showMoreBtn, " +++++++ showMoreBtn")
        if(detailsPanel.current.style.display === 'none'){
            detailsPanel.current.style.display = '';
            showMoreBtn.current.innerHTML = '<span>-</span>Show less';
        } else {
            detailsPanel.current.style.display = 'none'
            showMoreBtn.current.innerHTML = '<span>+</span>Show more';
        }
    }

    return (
        <div className="content-wrapper">
            <ul>
                {show.model_name &&
                <li>
                    <span>Watch</span>
                    {typeof refDetails.model !=='undefined' ?
                        (
                        <div>{refDetails.model.name}</div>
                    ):(
                        <div>---</div>
                    )}
                </li>
                }
                {show.price &&
                <li>
                    <span>List price</span>
                    {typeof refDetails.price !=='undefined' ?
                        (
                        <div>{formatMoney(refDetails.price)} €</div>
                    ):(
                        <div>---</div>
                    )}
                </li>
                }
                <li>
                    <span>Brand</span>
                    {typeof refDetails.model !=='undefined' ?
                        (
                        <div>{refDetails.model.brand.name}</div>
                    ):(
                        <div>---</div>
                    )}
                </li>          
                <li>
                    <span>Reference</span>
                    {typeof refDetails.reference !=='undefined' ?
                        (
                        <div>{refDetails.reference}</div>
                    ):(
                        <div>---</div>
                    )}
                </li>

                <div style={show.btn_show_more ? {display: 'none'} : {display: 'block'}} className="show-more__details-panel" ref={detailsPanel}>
                    <li>
                        <span>Case Size</span>
                        {typeof refDetails.case_size !=='undefined' ?
                            (
                            <div>{refDetails.case_size}</div>
                        ):(
                            <div>---</div>
                        )}
                    </li>
                    <li>
                        <span>Case Material</span>
                        {typeof refDetails.case_material !=='undefined' ?
                            (
                            <div>{refDetails.case_material}</div>
                        ):(
                            <div>---</div>
                        )}
                    </li>
                    <li>
                        <span>Dial Color</span>
                        {typeof refDetails.dial_color !=='undefined' ?
                            (
                            <div>{refDetails.dial_color}</div>
                        ):(
                            <div>---</div>
                        )}
                    </li>
                    <li>
                        <span>Bracelet Material</span>
                        {typeof refDetails.bracelet_material !=='undefined' ?
                            (
                            <div>{refDetails.bracelet_material}</div>
                        ):(
                            <div>---</div>
                        )}
                    </li>
                    <li>
                        <span>Movement</span>
                        {typeof refDetails.movement !=='undefined' ?
                            (
                            <div>{refDetails.movement}</div>
                        ):(
                            <div>---</div>
                        )}
                    </li>
                    <li>
                        <span>Gender</span>
                        {typeof refDetails.gender !=='undefined' ?
                            (
                            <div>{refDetails.gender}</div>
                        ):(
                            <div>---</div>
                        )}
                    </li>
                    <li>
                        <span>NOTES:</span>
                        <span>---</span>
                    </li>
                </div>
                {show.btn_show_more &&
                    <li className="btn-show-more__container">
                        <button className="dark__btn btn-show-more" onClick={toggleHandler} ref={showMoreBtn}>
                            <span>+</span>Show more
                        </button>
                    </li>
                }
            </ul>

            <div className="image-container">
                <div className="image-wrapper">
                    <img src={refDetails.picture_url} alt="watch" />
                </div>
            </div>
        </div>
    )
}

const mapStateToProps = store => ({
    refDetails: store.referenceInfo.referenceDetails
})

const mapActionsToProps = {
}

export default connect(mapStateToProps, mapActionsToProps)(WatchDetails)
