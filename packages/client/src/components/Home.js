import LogoutButton from "./common/LogoutButton";
import { Loading } from './common/Loading'
import { useState, useEffect } from 'react'
import { getCurrentUser } from '../api/usersApi'
import { useNavigate } from "react-router-dom";
import AuthError from '../error/AuthError'
import UsersList from './UsersList'
import Container from 'react-bootstrap/Container';
// TODO: collapse and cleanup react imports
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { Toast } from 'react-bootstrap'
import ToastWrapper from './common/ToastWrapper'

const Home = () => {

  const navigate = useNavigate()
  const [user, setUser] = useState(undefined)
  const [loading, setLoading] = useState(true)
  const [toast, showToast] = useState(false)
  const [toasts, setToasts] = useState([])
  const [count, setCount] = useState(0)
  // the max amount of entity mentions
  const entityWidth = 5

  useEffect(() => {

    async function fetchCurrentUser() {
      try {
        let currentUser = await getCurrentUser()
        setUser(currentUser)
        setLoading(false)
      } catch (err) {
        if (err instanceof AuthError) navigate('/login')
        else navigate('/error', { error: 'general' })
      }
    }
    if (!user) {
      fetchCurrentUser()
    }
  })

  const addToast = (msg) => {
    console.log('adding new toast')
    setToasts(toasts => [...toasts, <ToastWrapper key={toasts.length} msg={msg} />])
    console.log(toasts)
  }

  return (
    <div className="home">
      { loading && <Loading /> }
      { 
        !loading && 
          <div>
            <Container fluid className="m-0 p-0">
              { toasts }
              <Row className="header m-0 p-2">
                <Col xs="8" lg="9">
                  <img src={user.img} className="header-img"/><span className="header-text">@{ user.username }</span>
                </Col>
                <Col xs="4" lg="3" className="d-flex align-items-center justify-content-end">
                  <LogoutButton />
                </Col>
              </Row>
            </Container>
            <Container fluid className="content m-0 p-0">
                <UsersList entities={ user.entities.slice(0, entityWidth) } addToast={addToast} />
            </Container>
          </div>
      }
    </div>
  )
}

export default Home