import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCrown, faExclamationCircle, faExclamationTriangle, faCheckCircle, faUser, faWrench } from '@fortawesome/free-solid-svg-icons'

export default function User({ userInfo, myself }) {
    const USER_COLORS = ['#0d6efd', '#6610f2', '#0dcaf0', '#d63384', '#fd7e14', '#198754', '#20c997', '#6f42c1'];
    
    //user status string
    const userStatus = userInfo.status;
    let userStatusString = '';
    let userStatusColor = '';
    switch (userStatus) {
        case "winner":
            userStatusString = userInfo.score;
            userStatusColor = 'white';
            break;
        case "playing":
            userStatusString = userInfo.score;
            userStatusColor = 'white';
            break;
        case "dead":
            userStatusString = userInfo.score;
            userStatusColor = '#dc3545';
            break;
        case "not ready":
            userStatusString = '';
            userStatusColor = 'white';
            break;
        case "ready":
            userStatusString = <FontAwesomeIcon icon={faCheckCircle} />;
            userStatusColor = '#198754';
            break;
        case "disconnected":
            userStatusString = <FontAwesomeIcon icon={faExclamationCircle} />
            userStatusColor = "#dc3545";
            break;
        default:
            userStatusString = <FontAwesomeIcon icon={faExclamationTriangle} />
            userStatusColor = "white";
            break;
    }

    //{userId, score, status: winner, playing, dead, disconnected, ready, not ready}
    return (
        <div 
            className="d-flex justify-content-between align-items-center mb-1" 
            style={{ minWidth: '200px' }}
        >
            <div className="d-flex align-items-center">
                <div style={{ color: USER_COLORS[userInfo.userIndex] }} className="mr-2"><FontAwesomeIcon icon={faUser} /></div>
                <div className="mr-2" style={{ color: myself ? '#ffc107' : 'white' }}>
                    {userInfo.userId}
                </div>
                {userInfo.gameManager && <div className="mr-2" style={{ fontSize: '0.7em' }}><FontAwesomeIcon icon={faWrench} /></div>}
            </div>
            <div>
                <div style={{ color: userStatusColor }}>
                    {userStatusString}
                </div>
            </div>
        </div>
    )
}
