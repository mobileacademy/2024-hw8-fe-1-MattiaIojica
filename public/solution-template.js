let board = [];
let openedSquares = [];
let flaggedSquares = [];
let bombCount = 0;
let squaresLeft = 0;
let bombProbability = 3;
let maxProbability = 15;
let gameOver = false;
let rows;
let columns;

const difficulties = {
    easy: { rowCount: 9, colCount: 9, bombProbability: 2, maxProbability: 15 },
    medium: { rowCount: 16, colCount: 16, bombProbability: 3, maxProbability: 15 },
    expert: { rowCount: 16, colCount: 30, bombProbability: 4, maxProbability: 15 } 
};

function startGame() {
    const difficulty = document.getElementById("difficulty").value;
    const settings = difficulties[difficulty];
    rows = settings.rowCount;
    columns = settings.colCount;
    bombProbability = parseInt(document.getElementById("bombProbability").value);
    maxProbability = parseInt(document.getElementById("maxProbability").value);
    generateBoard(rows, columns);
    drawBoard();
}

function changeDifficulty() {
    const difficulty = document.getElementById("difficulty").value;
    const settings = difficulties[difficulty];
    document.getElementById("bombProbability").value = settings.bombProbability;
    document.getElementById("maxProbability").value = settings.maxProbability;
    startGame();
}

function updateSettings() {
    bombProbability = parseInt(document.getElementById("bombProbability").value);
    maxProbability = parseInt(document.getElementById("maxProbability").value);
}

function generateBoard(rowCount, colCount) {
    board = [];
    openedSquares = [];
    flaggedSquares = [];
    bombCount = 0;
    gameOver = false;
    squaresLeft = rowCount * colCount;

    for (let i = 0; i < rowCount; i++) {
        board[i] = new Array(colCount);
        for (let j = 0; j < colCount; j++) {
            board[i][j] = new BoardSquare(false, 0);
        }
    }

    for (let i = 0; i < rowCount; i++) {
        for (let j = 0; j < colCount; j++) {
            if (Math.random() * maxProbability < bombProbability) {
                board[i][j].hasBomb = true;
                bombCount++;
            }
        }
    }

    for (let i = 0; i < rowCount; i++) {
        for (let j = 0; j < colCount; j++) {
            if (!board[i][j].hasBomb) {
                board[i][j].bombsAround = countBombsAround(i, j);
            }
        }
    }
}

function countBombsAround(x, y) {
    let bombCount = 0;
    const directions = [
        [-1, -1], [-1, 0], [-1, 1],
        [0, -1],           [0, 1],
        [1, -1], [1, 0], [1, 1]
    ];

    directions.forEach(([dx, dy]) => {
        const newX = x + dx;
        const newY = y + dy;
        if (isValidPosition(newX, newY) && board[newX][newY].hasBomb) {
            bombCount++;
        }
    });

    return bombCount;
}

function isValidPosition(x, y) {
    return x >= 0 && x < board.length && y >= 0 && y < board[0].length;
}

class BoardSquare {
    constructor(hasBomb, bombsAround) {
        this.hasBomb = hasBomb;
        this.bombsAround = bombsAround;
        this.isOpened = false;
        this.isFlagged = false;
    }
}

function discoverSquare(x, y) {
    if (!isValidPosition(x, y) || board[x][y].isOpened || board[x][y].isFlagged || gameOver) {
        return;
    }

    board[x][y].isOpened = true;
    openedSquares.push({ x, y });
    squaresLeft--;

    const squareElement = document.getElementById(`square-${x}-${y}`);
    squareElement.classList.add('opened');
    if (board[x][y].hasBomb) {
        squareElement.classList.add('bomb');
        squareElement.textContent = '💣';
        gameOver = true;
        drawBombs();
        alert("Game Over! You hit a bomb.");
        return;
    }

    squareElement.textContent = board[x][y].bombsAround > 0 ? board[x][y].bombsAround : '';

    if (board[x][y].bombsAround === 0) {
        const directions = [
            [-1, -1], [-1, 0], [-1, 1],
            [0, -1],           [0, 1],
            [1, -1], [1, 0], [1, 1]
        ];

        directions.forEach(([dx, dy]) => {
            discoverSquare(x + dx, y + dy);
        });
    }

    if (squaresLeft === bombCount) {
        alert("Congratulations! You've won the game.");
    }
}

function toggleFlagSquare(x, y) {
    if (!isValidPosition(x, y) || board[x][y].isOpened) {
        return;
    }

    board[x][y].isFlagged = !board[x][y].isFlagged;
    const squareElement = document.getElementById(`square-${x}-${y}`);
    if (board[x][y].isFlagged) {
        squareElement.classList.add('flagged');
        squareElement.textContent = '🚩';
    } else {
        squareElement.classList.remove('flagged');
        squareElement.textContent = '';
    }
}

function drawBoard() {
    const gameBoard = document.getElementById('game-board');
    gameBoard.innerHTML = '';
    gameBoard.style.gridTemplateColumns = `repeat(${board[0].length}, 30px)`;
    gameBoard.style.gridTemplateRows = `repeat(${board.length}, 30px)`;

    for (let i = 0; i < board.length; i++) {
        for (let j = 0; j < board[i].length; j++) {
            const square = document.createElement('div');
            square.id = `square-${i}-${j}`;
            square.className = 'square';
            square.addEventListener('click', () => discoverSquare(i, j));
            square.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                toggleFlagSquare(i, j);
            });
            gameBoard.appendChild(square);
        }
    }
}

function drawBombs() {
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < columns; j++) {
            const squareElement = document.getElementById(`square-${i}-${j}`);

            if(board[i][j].hasBomb) {
                squareElement.textContent = '💣';
            } else
                squareElement.textContent = board[i][j].bombsAround != 0? board[i][j].bombsAround : '';
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    changeDifficulty();
    startGame();
});