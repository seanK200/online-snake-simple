import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// import { faCrown, faExclamationCircle, faExclamationTriangle, faCheckCircle, faUser, faWrench } from '@fortawesome/free-solid-svg-icons'
import { faUser, faWrench } from '@fortawesome/free-solid-svg-icons'

export default function User({ userInfo, userIndex, gameStarted, myself }) {
    const USER_COLORS = ['#0d6efd', '#6610f2', '#0dcaf0', '#d63384', '#fd7e14', '#198754', '#20c997', '#6f42c1'];
    
    //user status string
    const USER_COLOR = USER_COLORS[userIndex]

    //{userId, score, status: winner, playing, dead, disconnected, ready, not ready}
    return (
        <div 
            className="d-flex justify-content-between align-items-center mb-1" 
            style={{ minWidth: '200px' }}
        >
            <div className="d-flex align-items-center" style={{ opacity: (userInfo.ready ? '100%' : '50%') }}>
                <div style={{ color: USER_COLOR }} className="mr-2"><FontAwesomeIcon icon={faUser} /></div>
                <div className="mr-2" style={{ color: myself ? '#ffc107' : 'white' }}>
                    {userInfo.userId}
                </div>
                {userInfo.gameManager && <div className="mr-2" style={{ fontSize: '0.7em' }}><FontAwesomeIcon icon={faWrench} /></div>}
            </div>
            <div>
                <div style={{ color: 'white' }}>
                    {gameStarted ? userInfo.score : (userInfo.ready ? (userInfo.gameManager ? '' : 'READY') : '')}
                </div>
            </div>
        </div>
    )
}
