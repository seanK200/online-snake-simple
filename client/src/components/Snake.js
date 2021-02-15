import React, { useState, useEffect } from 'react'
import { Button } from 'react-bootstrap'
import Board from './Board'
import UserList from './UserList'
import { useGameData } from '../contexts/GameDataProvider';

export default function Snake({ myUserId, onLogout }) {
    // console.log("Rendering Snake");
    const {
        gameState, users, gameStart,
        userReady
    } = useGameData();

    const [myUserInfo, setMyUserInfo] = useState(() => {
        for (let i=0; i<users.length; i++) {
            if(users[i].userId === myUserId) {
                return users[i];
            }
        }
        return null;
    })

    useEffect(() => {
        setMyUserInfo(() => {
            for (let i=0; i<users.length; i++) {
                if(users[i].userId === myUserId) {
                    return users[i];
                }
            }
            return null;
        })
    }, [users, myUserId]);

    const GameControlView = () => {
        if(typeof myUserInfo.gameManager !== 'undefined') {
            let allUsersReady = true;
            for (let i=0; i<users.length; i++) {
                if (!users[i].ready) {
                    allUsersReady = false;
                    break;
                }
            }
            if (!myUserInfo.gameManager) {
                return(
                    <>
                        <Button
                            className="mr-3"
                            variant={myUserInfo.ready ? 'outline-warning' : "primary"}
                            onClick={() => {userReady(myUserId, (!myUserInfo.ready))}}
                        >
                            {myUserInfo.ready ? 'Cancel' : 'Ready'}
                        </Button>
                        {myUserInfo.ready ? `Waiting for ${allUsersReady ? 'game manager to start': 'other users'}..` : ''}
                        {(myUserInfo.ready === false) && <Button variant="danger" onClick={handleLogout}>Leave Game</Button>}
                    </>
                ); 
            } else {
                return(
                    <>
                        {allUsersReady ?
                            <Button className="mr-3" variant="primary" onClick={gameStart}>Start Game</Button> :
                            <Button className="mr-3" variant="outline-secondary" disabled>Start Game</Button>}
                        <Button variant="danger" onClick={handleLogout}>Leave Game</Button>
                    </>
                )
            }
        }
    }

    function handleLogout() {
        onLogout();
    }
    
    return (
        <>
            <h3>Online Snake</h3>
            <div className="d-flex mb-4">
                <Board gameState={gameState} users={users}/>
                <UserList />
            </div>
            <div className="d-flex align-items-center">
                <GameControlView />
            </div>
        </>
    )
}
