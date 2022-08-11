import { Toast } from 'react-bootstrap'
import { useState } from 'react'
const ToastWrapper = (props) => {

    const [show, setShow] = useState(true)

    return (
        <div className="toast-container">
            <Toast onClose={() => setShow(false)} show={show} delay={1500} animation={true} autohide>
                <Toast.Body>{props.msg}</Toast.Body>
            </Toast>
        </div>
    )

}

export default ToastWrapper