import React from "react";
import { generateAuthUrl, authorizeUser } from '../api/authorizationsApi'
import { Button } from 'react-bootstrap'

const Login = () => {

    async function login () {
      let signOn = await generateAuthUrl()
      window.location.href = signOn.url
    }

    return (
      <div className="login">
        <Button variant='primary' onClick={ login } className="login-btn">Login</Button>
      </div>
    )

}

export default Login