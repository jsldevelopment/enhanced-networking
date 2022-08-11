import BarLoader from "react-spinners/BarLoader";
import SyncLoader from "react-spinners/SyncLoader";
import { useEffect, useState } from 'react'
const Loading = () => {

  const msgs = [
    "Loading the application.",
    "If this is your first time here, it might take a while.",
    "Tidying up some loose ends now.",
    "Crunching the numbers...",
  ]

  let curMsg = 0
  const [msg, setMsg] = useState()

  useEffect(() => {
    setMsg(msgs[curMsg])
    curMsg++
    setInterval(() => {
      setMsg(msgs[curMsg])
      curMsg = curMsg === msgs.length - 1 ? 0 : curMsg+1
    }, 5000)
  }, [])

  return (
    <div className="loading-bar">
      <div className="loading-text">{ msg }</div> 
      <BarLoader className="loader" size={20} width={1000} height={30} speedMultiplier={.5} color={'#0C856D'} />
    </div>
  )

}

const SimpleLoading = () => {

  return (
    <div className="loading-bar">
      <SyncLoader className="loader" size={20} width={1000} height={30} speedMultiplier={.5} color={'#0C856D'} />
    </div>
  )

}

const ProfileLoading = () => {

  return (
    <div className="loading-bar">
      <SyncLoader className="profile-loader" size={20} width={1000} height={30} speedMultiplier={.5} color={'#0C856D'} />
    </div>
  )

}
export { Loading, SimpleLoading, ProfileLoading }