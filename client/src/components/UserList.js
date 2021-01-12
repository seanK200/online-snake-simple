import React from 'react'
import User from './User'

export default function UserList({ gameState, myId }) {
    let users = []; //{userId, score, status: winner, playing, dead, disconnected ready, not ready}
    gameState.snakes.forEach((snake, index) => {
        users.push({
            userId: snake.userId,
            userIndex: index,
            score: snake.pos.length,
            status: snake.status,
            gameManager: snake.gameManager
        })
    })
    if(gameState.winner !== '') users.sort((a, b) => b.score - a.score);
    
    return (
        <div className="d-flex flex-column ml-3 p-3" style={{ background: '#0e0f12' }}>
            {users.map((user) => {
                return <User userInfo={user} myself={user.userId === myId} />;
            })}
        </div>
    )
}
