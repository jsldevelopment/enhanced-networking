const Error = (props) => {
    return (
        <div>
            { props.error==="session" && <div>Session expired... /:</div> }
            { props.error==="general" && <div>Something went wrong. /:</div> }
        </div>
    )
}

export default Error