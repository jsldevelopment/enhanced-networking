import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { authorizeUser } from '../api/authorizationsApi'
import { Loading } from './common/Loading'
const Authenticate = () => {

    const [authenticated, setAuthenticated] = useState(false)
    const msg = ""

  
    useEffect(() => {
      const fetchAuthorization = async () => { 
        if (!authenticated) {
          const urlSearchParams = new URLSearchParams(window.location.search);
          const params = Object.fromEntries(urlSearchParams.entries());
          const auth = await authorizeUser(params)
          if (auth) setAuthenticated(true)
        }
      }
      fetchAuthorization()
    })
  
    return (
      <div>
        { authenticated && <Navigate to="/home" replace={true} /> }
        { !authenticated && <Loading /> }
      </div>
    )
  
  }

export default Authenticate