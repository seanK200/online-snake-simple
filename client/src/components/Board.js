import React, { useEffect, useState } from 'react'
import Square from './Square'

export default function Board({ gameState }) {
    const gameSizeX = 30;
    const gameSizeY = 20;

    let boardState = [];
    for (let i=0; i<gameSizeY; i++) boardState.push(Array(gameSizeX).fill(0));
    boardState[gameState.food[1]][gameState.food[0]] = 1;
    //set snakes
    gameState.snakes.forEach((snake, userIndex) => {
        snake.pos.forEach((snakePos) => {
            boardState[snakePos[1]][snakePos[0]] = 2 + userIndex;
        });
    });

    return (
        <div className="d-flex flex-column">
            {boardState.map((row, rowIndex) => {
                return (
                    <div className="d-flex">
                        {row.map((sq, colIndex) => {
                            return <Square type={sq} key={(rowIndex*10 + colIndex)}/>
                        })}
                    </div>
                );
            })}
        </div>
    )
}
