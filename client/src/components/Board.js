import Square from './Square'

export default function Board({ gameState, users }) {
    // console.log("Rendering board");
    const gameSizeX = gameState.gameSizeX;
    const gameSizeY = gameState.gameSizeY;


    function getPosX(pos) {
        return pos % gameSizeX;
    }

    function getPosY(pos) {
        return Math.floor(pos / gameSizeX);
    }

    let boardState = [];
    for (let i=0; i<gameSizeY; i++) boardState.push(Array(gameSizeX).fill(0));
    boardState[getPosY(gameState.food)][getPosX(gameState.food)] = 1;
    //set snakes
    users.forEach((user, userIndex) => {
        user.snakePos.forEach((p) => {
            if(p >= 0) boardState[getPosY(p)][getPosX(p)] = 2 + userIndex;
        });
    });

    return (
        <div className="d-flex flex-column">
            {boardState.map((row, rowIndex) => {
                return (
                    <div className="d-flex" key={rowIndex}>
                        {row.map((sq, colIndex) => {
                            const keyValue = rowIndex*gameSizeX + colIndex;
                            return <Square type={sq} key={keyValue} num={keyValue}/>
                        })}
                    </div>
                );
            })}
        </div>
    )
}
