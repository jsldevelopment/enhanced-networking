import { useState, useEffect, useRef, useLayoutEffect } from 'react'
import { ProfileLoading, SimpleLoading } from './common/Loading'
import { getProfiles } from '../api/profilesApi'
import { getTweets } from '../api/tweetApi'
import { getUsers, followUser, blockUser } from '../api/usersApi'
import { Container, Row, Col, Button } from 'react-bootstrap';
import { useNavigate } from "react-router-dom";
import AuthError from '../error/AuthError'

const MODE = process.env.REACT_APP_MODE

const UsersList = (props) => {

    const [users, setUsers] = useState([])
    const [loading, setLoading] = useState(false)
    const [scrollPos, setScrollPos] = useState(0)
    const [initialized, setInitalized] = useState(false)
    const [entityList, setEntityList] = useState([])
    const [fetchProfiles, setFetchProfiles] = useState(false)
    const pageSize = process.env.REACT_APP_PAGE_SIZE

    const navigate = useNavigate()

    useEffect(() => {
        if (users.length <= pageSize/2) {
            setFetchProfiles(true)
        }
    }, [users])
    
    // get next portion of profiles
    useEffect(() => {
        if (!fetchProfiles) return
        getNextPage()

    }, [fetchProfiles])

    const checkScrollPos = () => {
        const usersList = document.getElementById('users-list')
        setScrollPos(usersList.scrollTop)
        if (usersList.scrollTop != 0) {
            if(usersList.scrollTop + usersList.clientHeight >= usersList.scrollHeight - 50) {
                setFetchProfiles(true)
            }
        }
    }

    const hideUser = async (id) => {

        try {
            await blockUser(id)
            setUsers((users) => {
                return users.filter((user) => {
                    return user.key !== id
                })
            })
        } catch (err) {
            
            if (err instanceof AuthError) {
                navigate('/login')
            } else {
                props.addToast('Something went wrong with hiding.')
            }
        }

    }

    const setUpScrollBarEvents = () => {
        document.getElementById("users-list").addEventListener('mouseover', () => {
            document.getElementById("users-list").style.overflowY = "scroll";
        });
        document.getElementById("users-list").addEventListener('mouseleave', () => {
            document.getElementById("users-list").style.overflowY = "hidden";
        });
    }

    const initializePage = async () => {

        setUpScrollBarEvents()

        // grab only the id of each entity
        const entityList = props.entities.map((entity) => entity["entity_id"])
        setEntityList(entityList)

        // // get first page (100) for those ids
        const profilesForEntities = await getProfiles(entityList, pageSize)

        if (profilesForEntities.length) await buildProfilesList(profilesForEntities)
        setInitalized(true)

    }

    const getNextPage = async () => {
        setLoading(true)
        const profilesForEntities = await getProfiles(entityList, pageSize)
        if (profilesForEntities.length) await buildProfilesList(profilesForEntities)
        setFetchProfiles(false)
        setLoading(false)
    }

    const buildProfilesList = async (profilesForEntities) => {
   
        // now we want to fetch the full author profilesForEntities on the profile
        try {
            const fullProfiles = await getUsers(profilesForEntities.map((profile) => {
                return profile.author
            }))

            // add tweets back to fullProfile object
            fullProfiles.forEach((profile, index) => {
                profile.tweets = profilesForEntities[index].tweets
            })
    
            // map full profiles to state to be rendered by list
            setUsers(oldArray => [...oldArray, ...fullProfiles.map((profile) => {
                return (<Profile user={profile} key={profile.id} addToast={props.addToast} hideUser={ () => { hideUser(profile.id) }} ></Profile>)
            })])

        } catch (err) {

            if (err instanceof AuthError) navigate('/login')
            else navigate('/error', { error: 'general' })

        }

    }

    useEffect(() => {
        initializePage()
    }, [])
    

    return (
        <div id="users-list" onScroll={ checkScrollPos }>
            {
                !initialized && <SimpleLoading />
            }
            { 
                initialized && <div>
                    { users.length ? <div>
                        { users }
                    </div> : null }
                    { !users.length ? <div class="no-results">
                        <p>No users found.</p>
                    </div> : null }
                </div>
            }
            {
                initialized && loading && <ProfileLoading />
            }
        </div>
    )
}

export const Profile = (props) => {
    const [displayTweets, setDisplayTweets] = useState(false)
    const [tweets, setTweets] = useState([])
    const profileRef = useRef(null)

    const navigate = useNavigate()

    const toggleTweets = () => {
        setDisplayTweets(!displayTweets)
    }

    // TODO CLEAN THIS
    const fetchFollowUser = async (id) => {
        try {
            const followResponse = await followUser(id)
            if (!followResponse) props.addToast()// something went wrong toast
            if (followResponse.following) { 
                props.addToast("User followed.")// follow toast
                profileRef.current.classList.add('hide-slide')
                setTimeout(() => {
                    props.hideUser()
                }, 500)
            }
            if (followResponse.pending_follow) {
                props.addToast("Follow request sent.")// follow request toast
                profileRef.current.classList.add('hide-slide')
                setTimeout(() => {
                    props.hideUser()
                }, 500)
            }
        } catch (err) {
            
            if (err instanceof AuthError) navigate('/login')
            else {
                props.addToast("Failed to follow user.")// follow request toast
                profileRef.current.classList.add('hide-slide')
            }

        }
    }

    const fetchViewProfile = (username) => {
        window.open(`https://www.twitter.com/${username}`, '_blank');
    }

    const hideUser = () => {
        props.hideUser()
        setTimeout(() => {
            profileRef.current.classList.add('hide-slide')
        }, 500)
    }

    const getCompleteTweets = async (tweetList) => {
        if (!tweets.length) {
            const fullTweets = await getTweets(tweetList)
            setTweets(fullTweets.map((tweet) => {
                return <Tweet key={tweet.id} text={tweet.text}></Tweet>
            }))
        }
        toggleTweets()
    }

    return (
        <div className="profile" ref={profileRef}>
            <Container fluid className="profile">
                <Row>
                    <Col xs="8" md="9">
                        <div className="user-info">
                            <div className="identity">
                                <div className="username">{ props.user.user }</div>
                                <div className="handle">@{ props.user.username }</div>
                            </div>
                            <div className="description">{ props.user.description }</div>
                        </div>
                        <Button onClick={() => {getCompleteTweets(props.user.tweets)}}>{ displayTweets? 'Hide Tweets' : 'Show Tweets' }</Button>
                    </Col>
                    <Col xs="4" md="3" className="d-flex justify-content-end">
                        <Container fluid className="profile">
                            {  MODE === "FOLLOW" && <Row className='mb-3 d-flex justify-content-end'>
                                <Button className="btn follow-btn" onClick={ () => fetchFollowUser(props.user.id)}>Follow</Button>
                            </Row> }
                            {  MODE === "VIEW_PROFILE" && <Row className='mb-3 d-flex justify-content-end'>
                                <Button className="btn view-profile-btn" onClick={ () => fetchViewProfile(props.user.username)}>View Profile</Button>
                            </Row> }
                            <Row className="d-flex justify-content-end">
                                <Button className="btn hide-btn" onClick={hideUser}>Hide</Button>
                            </Row>
                        </Container>
                    </Col>
                </Row>
            </Container>
            <Container className="tweet-container">
                <Row>
                    <Col xs="1" className="tweet-margin">
                    </Col>
                    <Col xs="11">
                        {
                            displayTweets && 
                                <div>
                                    { tweets }
                                </div>
                        }
                    </Col>
                </Row>
            </Container>
        </div>
    )
}

const Tweet = (props) => {
    return (
        <Row className="tweet-row">
            <div>{ props.text }</div>
        </Row>
    )
}

export default UsersList