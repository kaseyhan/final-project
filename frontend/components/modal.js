import React from "react";
import styles from "../styles/modal.module.css";
import PropTypes from "prop-types";

const Modal = props => {
    if (!props.show) return null;
    return (
        <div className={styles.modal}>
            <div className={styles.modalContent}>
                <div className={styles.modalHeader}>
                    <h3 className={styles.modalTitle}>{props.title}</h3>
                    <button className={styles.exitButton} onClick={props.onClose}>x</button>
                </div>
                <div className={styles.modalBody}>
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