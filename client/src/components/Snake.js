import React from 'react'
import { Button } from 'react-bootstrap'
import Board from './Board'
import UserList from './UserList'

export default function Snake({ myId, onLogout }) {
    //user status: winner, playing, dead, ready, not ready, disconnected
    const gameState = {
        food: [7, 9],
        snakes: [
            {
                userId: 'sean',
                pos: [[3, 3], [3, 2]],
                status: 'playing',
                gameManager: true
            },
            {
                userId: 'jace',
                pos: [[5, 4], [5, 3], [5, 2]],
                status: 'playing',
                gameManager: false
            },
            {
                userId: 'min',
                pos: [[7, 4], [7, 3]],
                status: 'playing',
                gameManager: false
            },
            {
                userId: 'sun',
                pos: [[10, 11], [10, 12], [10, 13], [10, 14]],
                status: 'playing',
                gameManager: false
            },
        ],
        winner: ''
    }

    return (
        <>
            <div className="d-flex mb-4">
                <Board gameState={gameState}/>
                <UserList gameState={gameState} myId={myId}/>
            </div>
            <div className="d-flex align-item-center">
                <Button className="mr-2">Ready</Button>
                <Button variant="danger" onClick={onLogout}>Leave Game</Button>
            </div>
        </>
    )
}
