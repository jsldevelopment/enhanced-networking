import { Button } from 'react-bootstrap'
import { useNavigate } from "react-router-dom";
import { logoutUser } from '../../api/authorizationsApi'
const LogoutButton = () => {

    const navigate = useNavigate()
  
    async function logout () {
  
      logoutUser()
      navigate('/login')
  
    }
  
    return (
      <Button onClick={ logout } className="btn logout-btn">Sign Out</Button>
    )
  
  }

export default LogoutButton