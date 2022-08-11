import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { Loading } from './components/common/Loading'
import AuthError from './error/AuthError'
import { getCurrentUser } from './api/usersApi'

const App = () => {

  const navigate = useNavigate()

  useEffect(() => {
    (async function getAuthUser() {
      try {
        await getCurrentUser()
        navigate('/home')
      } catch (err) {
        if (err instanceof AuthError) navigate('/login')
        else navigate('/error', { error: 'general' })
      }
    })()
  })

  return (
    <div>
      {<Loading />}
    </div>
  )
}

export default App;