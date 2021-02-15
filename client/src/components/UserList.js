import React from 'react'
import { useGameData } from '../contexts/GameDataProvider';
import User from './User'

export default function UserList() {
    const { users, gameState, myUserId, matchId } = useGameData();

    return (
        <div className="d-flex flex-column ml-3 p-3" style={{ background: '#0e0f12' }}>
            <div className="pb-1 mb-2 w-100 border-bottom border-white">{users.length} users in '{matchId}'</div>
            {users
                .sort((a, b) => b.score - a.score)
                .map((user, index) => {
                return (
                    <User 
                        key={index}
                        userInfo={user} 
                        userIndex={index} 
                        gameStarted={gameState.gameStarted} 
                        myself={user.userId === myUserId} />
                );
            })}
        </div>
    )
}
