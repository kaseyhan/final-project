import React from "react";
// import "../styles/modal.css";
import PropTypes from "prop-types";

const Modal = props => {
    if (!props.show) return null;
    return (
        <div className="modal">
            <div className="modalContent">
                <div className="modalHeader">
                    <h3 className="modalTitle">{props.title}</h3>
                    <button className="exitButton" onClick={props.onClose}>x</button>
                </div>
                <div className="modalBody">
                    {props.children}
                </div>
                {/* <div className="modalFooter">
                    <button className="modalButton" onClick={props.onClose}>{props.button}</button>
                </div> */}
            </div>
        </div>
    )
}

export default Modal;