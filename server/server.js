const io = require('socket.io')(5000, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"]
    }
});

console.log("Socket.io server initialized at port: 5000");

let gameState = {
    food: 0,
    gameSizeX: 30,
    gameSizeY: 20,
    gameSpeed: 800,
    gameStarted: false,
    gameEnded: false,
};
let users = []
function findUser(userId) {
    for(let i=0; i<users.length; i++) {
        if (users[i].userId === userId) {
            return {user: users[i], index: i};
        }
    }
    return {user: null, index: -1};
}

let mainloop = null;

function cLog(category, userId, matchId, msg='') {
    //category: VALIDATE, CONNECT, JOIN, LEAVE, DISCONNECT, GAME, WARN, ERROR
    console.log(`[${category.toUpperCase()}] '${userId}' in '${matchId}': ${msg}`);
}

function getInitialHeadPosition(i) {
    const gameSizeX = gameState.gameSizeX;
    const gameSizeY = gameState.gameSizeY;
    // 11, 1, 5, 7, 12, 3, 6, 9
    const initialHeadPositions = [
        (2 + gameSizeX*2),
        ((gameSizeX-3) + gameSizeX*2),
        ((gameSizeX-3) + gameSizeX*(gameSizeY-3)),
        (2 + gameSizeX*(gameSizeY-3)),
        ((Math.floor((gameSizeX+1)/2)) + gameSizeX*2),
        ((gameSizeX-3) + gameSizeX*(Math.floor((gameSizeY+1)/2))),
        ((Math.floor((gameSizeX+1)/2)) + gameSizeX*(gameSizeY-3)),
        (2 + gameSizeX*(Math.floor((gameSizeY+1)/2)))
    ]
    return initialHeadPositions[i];
}

function getInitialTailPosition(i) {
    const gameSizeX = gameState.gameSizeX;
    const gameSizeY = gameState.gameSizeY;
    // 11, 1, 5, 7, 12, 3, 6, 9
    let initialTailPositions = [];
    const incrementValues = [-1, (-1 * gameSizeX), 1, gameSizeX, -1, (-1 * gameSizeX), 1, gameSizeX];
    for(let i=0; i<8; i++) {
        initialTailPositions.push(getInitialHeadPosition(i) + incrementValues[i]);
    }
    return initialTailPositions[i];
}

function getInitialDirection(i) {
    const initialDirections = ['right', 'down', 'left', 'up', 'right', 'down', 'left', 'up'];
    return initialDirections[i];
}

function getNewHeadPosition(prevHead, snakeDirection) {
    const x = gameState.gameSizeX;
    const y = gameState.gameSizeY;
    const isAtTopEdge = prevHead < x;
    const isAtLeftEdge = (prevHead % x) === 0;
    const isAtRightEdge = (prevHead % x) === (x-1);
    const isAtBottomEdge = prevHead >= x*(y-1);

    switch (snakeDirection) {
        case 'up':
            if(isAtTopEdge) return -1;
            return prevHead - x;
        case 'down':
            if(isAtBottomEdge) return -1;
            return prevHead + x;
        case 'left':
            if(isAtLeftEdge) return -1;
            return prevHead - 1;
        case 'right':
            if(isAtRightEdge) return -1;
            return prevHead + 1;
        default:
            return -1;
    }
}

function userJoin(socket, matchId, userId) {
    const { index } = findUser(userId);
    if(index < 0) {
        const setAsNewGameManager = users.length <= 0;
        if(setAsNewGameManager) gameState.food = Math.floor(gameState.gameSizeX * gameState.gameSizeY / 2) + Math.floor(gameState.gameSizeX / 2);
        const newUser = {
            userId,
            ready: setAsNewGameManager,
            gameOver: false,
            score: 0,
            gameManager: setAsNewGameManager,
            disconnected: false,
            snakePos: [getInitialHeadPosition(users.length), getInitialTailPosition(users.length)],
            snakeDirection: getInitialDirection(users.length),
            directionChangeQueue: [],
            directionChangeOverride: true,
        };
        users = [...users, newUser];
        
        socket.join(matchId);
        socket.broadcast.to(matchId).emit('user-join', { newUser });
        cLog('join', userId, matchId, 'joined match')
    }
}

function userReady(socket, matchId, userId) {
    let originalState = false;
    for(let i=0; i<users.length; i++) {
        if(users[i].userId === userId) {
            originalState = users[i].ready;
            users[i].ready = !users[i].ready;
            break;
        }
    }
    socket.to(matchId).emit('user-ready', { userId, ready: !originalState });
    cLog('game', userId, matchId, `is ${!originalState ? '' : 'not '} ready`);
}

function gameStart(socket, matchId, userId) {
    const { user } = findUser(userId);
    const isGameManager = (user !== null) && user.gameManager;
    if(isGameManager) {
        gameState.gameStarted = true;
        mainloop = setInterval(() => {advanceGame(socket, matchId)}, gameState.gameSpeed);
        io.to(matchId).emit('game-start', {gameState})
        cLog('game', userId, matchId, 'GAME START!');
    }
}

function directionChange(matchId, userId, newDirection) {
    const { user } = findUser(userId);
    if(user.directionChangeOverride) {
        user.directionChangeQueue = [newDirection];
    } else {
        user.directionChangeQueue.push(newDirection);
    }
    user.directionChangeOverride = false;
    cLog('game', userId, matchId, `new direction ${user.directionChangeOverride ? 'override to ' : ''}${newDirection}, buffer: ${user.directionChangeQueue.toString()}`)
}

function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
}

function isSnake(pos) {
    let isSnake = false;
    for(let i=0; i<users.length; i++) {
        for(let j=0; j<users[i].snakePos.length; j++) {
            if(users[i].snakePos[j] === pos) {
                isSnake = true;
                cLog('game', 'system', '-', `${users[i].userId} is at position(${pos})`)
                break;
            }
            if(isSnake) break;
        }
    }
    return isSnake;
}

function newFood(socket, matchId) {
    const prevFood = gameState.food;
    const gameSize = gameState.gameSizeX * gameState.gameSizeY;
    let newFoodPos = getRandomInt(gameSize);
    while(newFoodPos === prevFood || isSnake(newFoodPos)) {
        newFoodPos = getRandomInt(gameSize);
    }
    // socket.to(matchId).emit('new-food', { newFoodPos });
    cLog('game', 'system', matchId, `new food location: ${newFoodPos}`)
    return newFoodPos;
}

function eatFood(socket, matchId, userId) {
    const { user, index } = findUser(userId);
    if(!user.gameOver) {
        user.score += 10;
        // socket.to(matchId).emit('eat-food', { userId });
        cLog('game', userId, matchId, `ate food at ${gameState.food}. New score: ${user.score}`);
        gameState.food = newFood(socket, matchId);
    }
}


function gameOver(socket, matchId, userId, checkGameEnd=true) {
    const { user, index } = findUser(userId);
    if(index < 0) return; //user not found
    // set user state to game over
    if(!user.gameOver) {
        user.gameOver = true;
    }

    user.snakePos = [-1];

    // socket.to(matchId).emit('game-over', { userId })
    let aliveUsers = [];
    if(checkGameEnd) {
        for(let i=0; i<users.length; i++) {
            if(!users[i].gameOver) aliveUsers.push(i)
        }
    
        // if only one user is alive, end game
        if(aliveUsers.length <= 1) {
            const aliveUsersObj = aliveUsers.map((index) => {return {userId: users[index].userId, score: users[index].score}});
            gameEnd(socket, aliveUsersObj);
        }
        cLog('game', userId, matchId, 'check game end');
    }
    cLog('game', userId, matchId, `game over. ${checkGameEnd ? aliveUsers.length : ''} users still alive`);
}

function gameEnd(socket, matchId, aliveUsers) {
    gameState.gameEnded = true;
    clearInterval(mainloop);
    users.forEach(user => user.ready = false)
    socket.to(matchId).emit('game-end', aliveUsers);
    cLog('game end', 'system', matchId, `game ended.`)
}

function userLeave(socket, userId, matchId) {
    let isGameManager = false;
    const { user, index } = findUser(userId);
    if(gameState.gameStarted) {
        //during game
        isGameManager = user.gameManager;
        user.disconnected = true;
        gameOver(socket, matchId, userId);
    } else {
        // when not during game
        users = users.filter(user => {
            if(user.userId === userId) {
                isGameManager = user.gameManager;
                return false;
            } else {
                return true;
            }
        });
        users.forEach((user, idx) => {
            user.snakePos = [getInitialHeadPosition(idx), getInitialTailPosition(idx)];
            user.snakeDirection = getInitialDirection(users.length);
        })
    }

    cLog('leave', userId, matchId, `${isGameManager ? 'The game manager' : 'A user'} left the match.`)
    if(users.length>0 && isGameManager) {
        users[0].gameManager = true;
        users[0].ready = true;
        cLog('game', 'system', matchId, `The new game manager is: ${users[0].userId}`);
    }
}

async function advanceGame(socket, matchId) {
    const food = gameState.food;
    let headButtedIntoFood = false;
    let ateFoodUserIndex = -1;
    
    let newHeadPositions = [];
    let newSnakeDirections = [];
    // index of users that head-butted into each other
    let headButtUsersIndex = [];

    // set direction change override to true for all users
    users.forEach(user => {user.directionChangeOverride = true});

    for (let i=0; i<users.length; i++) {
        if(users[i].directionChangeQueue.length > 0) users[i].snakeDirection = users[i].directionChangeQueue.shift();
        let snakeDirection = users[i].snakeDirection;
        newSnakeDirections.push(snakeDirection);
        let snakePos = users[i].snakePos;
        if(users[i].gameOver || users[i].snakePos[0]==-1) {
            newHeadPositions.push(-1)
        } else {
            // get new snake head position based on current snake direction
            let newHead = getNewHeadPosition(snakePos[0], snakeDirection)
            if(newHead < 0) {
                cLog('game', users[i].userId, matchId, `collided into a wall. (${newHead})`);
            }
    
            // if snake will head-butt another snake
            if(newHeadPositions.indexOf(newHead) >= 0) {
                headButtUsersIndex.push(i);
                if (newHead === food) headButtedIntoFood = true;
            } else {
                if (newHead === food) ateFoodUserIndex = i;
                if (isSnake(newHead)) {
                    newHead = -1;
                    cLog('game', users[i].userId, matchId, 'collided into another snake');
                }
            }
            newHeadPositions.push(newHead);
        }
        console.log(`${users[i].userId} snake: ${users[i].snakePos}`);
    }
    headButtUsersIndex.forEach((userIndex) => {
        newHeadPositions[userIndex] = -1;
    });
    if(headButtUsersIndex.length > 0) {
        cLog('game', 'system', matchId, `${headButtUsersIndex.map((i) => users[i].userId).toString()} collided into each other ${headButtedIntoFood ? 'into food.' : '.'}`)
    }

    if (headButtedIntoFood) gameState.food = newFood(socket)

    newHeadPositions.forEach((head, index, arr) => {
        console.log(`inspecting newHeadPositions[${index}] = ${head}`)
        if(head < 0) {
            gameOver(socket, matchId, users[index].userId, (index === (arr.length-1)))
            console.log(`calling gameover for newHeadPositions[${index}] = ${head}, ${arr.length-1}`)
        } else {
            let snakePos = users[index].snakePos.slice();
            snakePos.unshift(head);
            if (ateFoodUserIndex !== index) snakePos.pop()
            users[index].snakePos = snakePos;
        }
    });

    if (ateFoodUserIndex > 0) {
        eatFood(socket, matchId, users[ateFoodUserIndex].userId);
    }
    cLog('game', 'system', matchId, 'advance game');
    console.log(newHeadPositions, newSnakeDirections, food, ateFoodUserIndex);
    io.in(matchId).emit('advance-game', users, gameState.food, ateFoodUserIndex);
}

// validate new user
io.use((socket, next) => {
    const userId = socket.handshake.query.userId;
    const matchId = socket.handshake.query.matchId;

    const userIdIsValid = userId && userId !== '';
    const userAlreadyExists = users.filter(user => user.userId === userId).length > 0
    const roomIsFull = users.length >= 8;
    const gameStarted = gameState.gameStarted;

    if(!userIdIsValid) return next(new Error("Invalid user id"));
    if(userAlreadyExists) return next(new Error("User already exists"));
    if(roomIsFull) return next(new Error("Room is full"));
    if(gameStarted) return next(new Error("Game has already started"))
    cLog('validate', userId, matchId, 'validation successful')
    next();
})

io.on('connection', (socket) => {
    const userId = socket.handshake.query.userId;
    const matchId = socket.handshake.query.matchId;
    cLog('connect', userId, matchId, 'User connected');
    userJoin(socket, matchId, userId);

    socket.on('getGameData', (userId, callback) => {
        cLog('game', userId, matchId, 'initial game data request')
        callback({ gameState })
    });
    
    socket.on('getAllUsers', (userId, callback) => {
        cLog('game', userId, matchId, 'initial all users request')
        callback({ users })
    });

    socket.on('getUserData', (myUserId, userId, callback) => {
        cLog('warn', myUserId, matchId, `OUT OF SYNC: request userdata of '${userId}'`)
        let { user } = findUser(userId)
        callback({ user })
    })

    socket.on('user-ready', (userId) => {userReady(socket, matchId, userId)});
    socket.on('game-start', (userId) => {gameStart(socket, matchId, userId)});
    socket.on('direction-change', (userId, newDirection) => {directionChange(matchId, userId, newDirection)});
    socket.on('disconnect', (reason) => {
        userLeave(socket, userId, matchId);
        cLog('disconnect', userId, matchId, reason)
        socket.broadcast.to(matchId).emit('user-leave', { users: users })
    })
});