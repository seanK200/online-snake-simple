import React from 'react'

export default function Square({ type, num }) {
    const squareType = type;

    //NORMAL[0], FOOD[1], USER #1-8[2~9]
    const COLORS = ['#0e0f12', '#ffc107', '#0d6efd', '#6610f2', '#0dcaf0', '#d63384', '#fd7e14', '#198754', '#20c997', '#6f42c1'];
    
    return(
        <div className="mr-1 mb-1" style={{ background: COLORS[squareType], width: '2vmin', height: '2vmin', fontSize: '0.5em' }}>
            {squareType > 0 ? num : ''}
        </div>
    );
}
