import React, { useCallback, useContext, useEffect, useState } from 'react'
import { useSocket } from '../contexts/SocketProvider';

const GameDataContext = React.createContext();

export function useGameData() {
    return useContext(GameDataContext);
}

export function GameDataProvider({ myUserId, matchId, children }) {
    const socket = useSocket();
    const [gameState, setGameState] = useState(null);
    const [users, setUsers] = useState(null);
    const [myUserInfo, setMyUserInfo] = useState(null);

    useEffect(() => {
        if(socket==null) return;
        socket.emit('getGameData', myUserId, (response) => {
            setGameState(response.gameState);
        });
    }, [socket, myUserId])

    useEffect(() => {
        if(socket==null) return;
        socket.emit('getAllUsers', myUserId, (response) => {
            setUsers(response.users);
        });
    }, [socket, myUserId])

    useEffect(() => {
        if(users !== null) {
            for(let i=0; i<users.length; i++) {
                if(users[i].userId === myUserId) {
                    setMyUserInfo(users[i]);
                    break;
                }
            }
        }
    }, [users, myUserId, setMyUserInfo]);

    function setNewGameState(changes) {
        // food, snakePos, snakeDirection, gameSizeX/Y, gameSpeed, gameStarted, gameEnded
        setGameState(prevGameState => {
            return {
                food: (typeof changes.food === 'undefined') ? prevGameState.food : changes.food,
                gameSizeX: (typeof changes.gameSizeX === 'undefined') ? prevGameState.gameSizeX : changes.gameSizeX,
                gameSizeY: (typeof changes.gameSizeY === 'undefined') ? prevGameState.gameSizeY : changes.gameSizeY,
                gameSpeed: (typeof changes.gameSpeed === 'undefined') ? prevGameState.gameSpeed : changes.gameSpeed,
                gameStarted: (typeof changes.gameStarted === 'undefined') ? prevGameState.gameStarted : changes.gameStarted,
                gameEnded: (typeof changes.gameEnded === 'undefined') ? prevGameState.gameEnded : changes.gameEnded,
            }
        })
    }

    function setNewUsers(changesObj) {
        // changes = [{ userId, [, ready, gameOver, score, gameManager, disconnected, snakePos, snakeDirection]}]
        // directionChangeQueue and directionChangeOverride is NOT kept in sync with server
        let changes = changesObj;
        if(typeof changes.length ==='undefined') changes = [changesObj];
        const changedUsers = changes.map(change => change.userId);

        setUsers(prevUsers => {
            const newUsers = prevUsers.map(user => {
                const idx = changedUsers.indexOf(user.userId);
                if (idx >= 0) {
                    const newUser = {
                        userId: changes[idx].userId,
                        ready: (typeof changes[idx].ready === 'undefined') ? user.ready : changes[idx].ready,
                        gameOver: (typeof changes[idx].gameOver === 'undefined') ? user.gameOver : changes[idx].gameOver,
                        score: (typeof changes[idx].score === 'undefined') ? user.score : changes[idx].score,
                        gameManager: (typeof changes[idx].gameManager === 'undefined') ? user.gameManager : changes[idx].gameManager,
                        disconnected: (typeof changes[idx].disconnected === 'undefined') ? user.disconnected : changes[idx].disconnected,
                        snakePos: (typeof changes[idx].snakePos === 'undefined') ? user.snakePos : changes[idx].snakePos,
                        snakeDirection: (typeof changes[idx].snakeDirection === 'undefined') ? user.snakeDirection : changes[idx].snakeDirection,
                        directionChangeQueue: (typeof changes[idx].directionChangeQueue === 'undefined') ? user.directionChangeQueue : changes[idx].directionChangeQueue,
                        directionChangeOverride: (typeof changes[idx].directionChangeOverride === 'undefined') ? user.directionChangeOverride : changes[idx].directionChangeOverride,
                    }
                    return newUser;
                } else {
                    return user;
                }
            });
            return newUsers;
        });
    }

    useEffect(() => {
        if(socket==null) return;
        socket.on("connect_error", err => {
            // connectSuccess = false;
            console.log("Error: " + err.message);
        })
    }, [socket]);

    function userReady(userId, newReady) {
        if(socket==null) return;
        socket.emit('user-ready', userId);
        setNewUsers({ userId: userId, ready: newReady })
    }

    function gameStart() {
        if(socket==null) return;
        socket.emit('game-start', myUserId);
    }

    function directionChange(newDirection) {
        if(socket==null) return;
        socket.emit('direction-change', myUserId, newDirection);
    }

    // new (other) user join
    useEffect(() => {
        if(socket==null) return;
        socket.on('user-join', ({ newUser }) => {
            const userIds = users.map(user => user.userId);
            if(userIds.indexOf(newUser.userId) < 0) {
                setUsers(prevUsers => [...prevUsers, newUser]);
            }
        })
        return () => socket.off('user-join');
    }, [socket, users]);

    // user ready
    useEffect(() => {
        if(socket==null) return;
        socket.on('user-ready', ({ userId, ready }) => {
            setNewUsers([{ userId, ready }]);
        })
        return () => socket.off('user-ready');
    }, [socket]);
    
    // game start
    useEffect(() => {
        if(socket==null) return;
        socket.on('game-start', ({ gameState }) => {
           setNewGameState(gameState); 
        })
        return () => socket.off('game-start');
    }, [socket]);

    // direction change listeners
    const handleKeyDown = useCallback((e) => {
        if(e.defaultPrevented) return;
        // ignore long press (repeats)
        if(!e.repeat) {
            if(gameState.gameStarted && !gameState.gameEnded) {
                const currentDirection = myUserInfo.snakeDirection;
                let newDirection = '';
                switch(e.key) {
                    case "Down": // IE/Edge specific value
                    case "ArrowDown":
                        newDirection = 'down';
                        break;
                    case "Up": // IE/Edge specific value
                    case "ArrowUp":
                        newDirection = 'up';
                        break;
                    case "Left": // IE/Edge specific value
                    case "ArrowLeft":
                        newDirection = 'left';
                        break;
                    case "Right": // IE/Edge specific value
                    case "ArrowRight":
                        newDirection = 'right';
                        break;
                    default:
                        newDirection = currentDirection;
                        break;
                }
                if(socket==null) return;
                socket.emit('direction-change', myUserInfo.userId, newDirection);
            }
        }
        e.preventDefault();
    }, [socket, gameState, myUserInfo])

    // adding keyboard event listeners on mount
    useEffect(() => {
        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        }
    }, [handleKeyDown])
    
    // advance game
    useEffect(() => {
        if(socket==null) return;

        // function getNewHeadPosition(prevHead, snakeDirection) {
        //     const x = gameState.gameSizeX;
        //     const y = gameState.gameSizeY;
        //     const isAtTopEdge = prevHead < x;
        //     const isAtLeftEdge = (prevHead % x) === 0;
        //     const isAtRightEdge = (prevHead % x) === (x-1);
        //     const isAtBottomEdge = prevHead >= x*(y-1);
    
        //     switch (snakeDirection) {
        //         case 'up':
        //             if(isAtTopEdge) return -1;
        //             return prevHead - x;
        //         case 'down':
        //             if(isAtBottomEdge) return -1;
        //             return prevHead + x;
        //         case 'left':
        //             if(isAtLeftEdge) return -1;
        //             return prevHead - 1;
        //         case 'right':
        //             if(isAtRightEdge) return -1;
        //             return prevHead + 1;
        //         default:
        //             return -1;
        //     }
        // }

        socket.on('advance-game', async (users, food, ateFoodUserIndex) => {
            // console.log('advance-game');
            const foodLocal = gameState.food;
            //set food
            if(foodLocal !== food) {
                setNewGameState({ food });
            }

            // let ateFoodUserIndexLocal = -1;
            setUsers(users)
            // // set Snakes
            // setUsers(prevUsers => {
            //     const newUsers = prevUsers.map((user, idx) => {
            //         let newUser = {}
            //         Object.assign(newUser, user);
            //         console.log(`${newUser.userId}'s snake: ${newUser.snakePos}`);
            //         if(newHeadPositions[idx] < 0) {
            //             // for gameOver users
            //             if(!user.gameOver) {
            //                 newUser.snakePos = [-1];
            //                 newUser.gameOver = true;
            //             }
            //         } else {
            //             // get new direction of snake from server
            //             newUser.snakeDirection = newSnakeDirections[idx];
            //             newUser.snakePos.unshift(newHeadPositions[idx]);
            //             console.log(`${newUser.userId}'s snake: ${newUser.snakePos} (unshift(${newHeadPositions[idx]}))`);
            //             if(foodLocal === newHeadPositions[idx]) {
            //                 ateFoodUserIndexLocal = idx;
            //             } else {
            //                 newUser.snakePos.pop();
            //                 console.log(`${newUser.userId}'s snake: ${newUser.snakePos} (pop())`);
            //             }
            //         }
            //         console.log(`${newUser.userId}'s snake: ${newUser.snakePos}`);
            //         return newUser;
            //     });
            //     return newUsers;
            // })
            // if(ateFoodUserIndex !== ateFoodUserIndexLocal) {
            //     socket.emit('getInitialData', myUserId, (response) => {
            //         setGameState(response.gameState);
            //         setUsers(response.users);
            //     });
            // }
            if (ateFoodUserIndex >=0 ) {
                setNewUsers({ userId: users[ateFoodUserIndex].userId, score: (users[ateFoodUserIndex].score + 10) })
            }
        })
        return () => socket.off('advance-game');
    }, [socket, gameState, myUserId, users]);

    // user leave
    useEffect(() => {
        if(socket==null) return;
        socket.on('user-leave', ({users}) => {
            setUsers(users);
        });
        return () => socket.off('user-leave');
    }, [socket]);

    // game end
    useEffect(() => {
        if(socket==null) return;
        socket.on('game-end', (aliveUsers) => {
            setNewGameState({ gameEnded: true })
        })
        return () => socket.off('game-end');
    }, [socket]);
    
    const value = {
        gameState, users, myUserId, matchId,
        userReady, gameStart, directionChange
    }

    return(
        <GameDataContext.Provider value={value}>
            {(gameState!==null && users!==null) && children}
        </GameDataContext.Provider>
    );
}

