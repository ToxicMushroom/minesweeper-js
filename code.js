//Schrijf hier je JavaScript-code

let gameField = []; // matrix met Cell elementen
let bombPositions = []; // lijst met 
let availableCells = [];
let alive = true;

let width = 30;
let height = 16;
let mines = 99;

let revealed = 0;
let startTime = 0;
let clickCounter = 0;

let flagCounter = 0;

class Cell {
    constructor(state, hidden, flag) {
        this.state = state;
        this.hidden = hidden;
        this.flag = flag;
    }
}

function randomInt(until) {
    return Math.floor(Math.random() * until);
}

function addRandomBomb() {
    const position = randomInt(availableCells.length);
    bombPositions.push(availableCells[position]);
    availableCells.splice(position, 1);
}

function arrayIncludesArray(array, subArray) {
    for (index in array) {
        const arrayElement = array[parseInt(index)];
        if (arrayElement.length == subArray.length) {
            let fullMatch = true;
            for (let subIndex = 0; subIndex < subArray.length; subIndex++) {
                if (arrayElement[subIndex] != subArray[subIndex]) {
                    fullMatch = false;
                }
            }
            if (fullMatch) {
                return true;
            }
        }
    }
    return false;
}

function createCellObject(x, y) {
    // Check of de cell een bom moet bevatten
    if (arrayIncludesArray(bombPositions, [x, y])) {
        return new Cell(-1, true, false);
    } else {
        // Check buurlocaties voor bom
        let counter = 0;
        for (let a = -1; a < 2; a++) {
            for (let b = -1; b < 2; b++) {
                if (arrayIncludesArray(bombPositions, [x + a, y + b])) {
                    counter++;
                }
            }
        }
        return new Cell(counter, true, false);
    }
}

function generateGameField(width, height, bombs) {
    alive = true;
    revealed = 0;
    clickCounter = 0;
    startTime = 0;
    gameField = [];
    availableCells = [];
    bombPositions = [];
    updateClickCounterTracker();
    resetStartTime();
    // Genereerd een lijst met mogelijke locaties voor bommen die we updaten wanneer een bom wordt toegevoegd zodat we geen gedupliceerde bommen krijgen
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            availableCells.push([x, y]);
        }
    }

    // Genereerd bom locaties zodat we deze kunnen gebruiken om het veld mee op te stellen
    for (let i = 0; i < bombs; i++) {
        addRandomBomb();
    }

    // Genereerd alle cellen in het gamefield
    for (let y = 0; y < height; y++) {
        const row = [];
        for (let x = 0; x < width; x++) {
            row.push(createCellObject(x, y));
        }
        gameField.push(row);
    }

    const gameFieldElement = document.getElementById("playing-field");
    gameFieldElement.innerHTML = generateGameFieldHtml();
    updateFlagCounter();
}

function generateGameFieldHtml() {
    let html = "<table>";
    for (rowIndex in gameField) {
        const row = gameField[parseInt(rowIndex)];
        html += generateRowHtml(row, rowIndex);
    }
    html += "</table>";
    return html;
}

function generateRowHtml(row, rowIndex) {
    let rowHtml = "<tr>";
    for (cellIndex in row) {
        const cell = row[parseInt(cellIndex)];
        rowHtml += generateCellHtml(cell, rowIndex, cellIndex);
    }
    rowHtml += "</tr>";
    return rowHtml;
}

function generateCellHtml(cell, rowIndex, cellIndex) {
    // right click handler: https://stackoverflow.com/a/4236294/6160062
    let cellHtml = `<td id="cell-${rowIndex}-${cellIndex}" onclick="clickedSquare(this)" oncontextmenu="rightClickedSquare(this);return false;"><p class="hidden">`;
    cellHtml += cell.state;
    cellHtml += "</hidden></td>";
    return cellHtml;
}

function showSquareInternal(y, x) {
    const cell = gameField[y][x];
    if (!cell.hidden) return;

    cell.hidden = false;

    if (cell.flag) {
        cell.flag = false;
        flagCounter--;
        updateFlagCounter();
    }

    gameField[y][x] = cell;
    revealed++;
}

function clickedSquare(el) {
    if (!alive) return;
    if (revealed == 0) {
        resetStartTime();
    }
    const y = parseInt(el.parentElement.rowIndex);
    const x = parseInt(el.cellIndex);

    addClickToClickcounter();
    checkXPositionedSquare(y, x);
    if (alive) {
        checkWon();
    }
}


function rightClickedSquare(el) {
    if (!alive) return;
    if (revealed == 0) {
        resetStartTime();
    }
    const y = parseInt(el.parentElement.rowIndex);
    const x = parseInt(el.cellIndex);

    const cell = gameField[y][x];
    if (cell.revealed) return;

    if (!cell.flag) {
        cell.flag = true;
        flagCounter++;
        el.classList.add("flag");
    } else {
        cell.flag = false;
        flagCounter--;
        el.classList.remove("flag");
    }
    gameField[y][x] = cell;

    updateFlagCounter();
}

function updateFlagCounter() {
    const flagCounterEl = document.getElementById("flagCounter");
    flagCounterEl.innerHTML = bombPositions.length - flagCounter;
}

function addClickToClickcounter() {
    clickCounter++;
    updateClickCounterTracker();
}

function updateClickCounterTracker() {
    const clickCounterEl = document.getElementById("clickCounter");
    clickCounterEl.innerHTML = clickCounter.toString();
}

function resetStartTime() {
    startTime = new Date().getTime();
    const timeTracker = document.getElementById("playTime");
    timeTracker.innerHTML = 0;
}

function registerTimeTracker() {
    const timeTracker = document.getElementById("playTime");

    setInterval(function () {
        if (alive && revealed != 0) {
            let seconds = Math.round((new Date().getTime() - startTime) / 1000);
            timeTracker.innerHTML = seconds.toString();
        }
    }, 1000);
}

function registerGameStateTracker() {
    const gameStateTracker = document.getElementById("gameState");

    setInterval(function () {
        gameStateTracker.innerHTML = getGameStateString();
    }, 1000);
}

function getGameStateString() {
    if (alive && revealed != 0) {
        return "alive";
    } else if (hasWon()) {
        return "won";
    } else if (alive && revealed == 0) {
        return "not playing";
    } else {
        return "lost";
    }
}

function checkWon() {
    if (hasWon()) {
        window.alert("You won!");
        alive = false;
    }
}

function hasWon() {
    return (width * height) == (revealed + bombPositions.length);
}


function checkSquare(y, x, el) {
    const cell = gameField[y][x];
    const p = el.firstChild;
    if (!cell.hidden && !p.classList.contains("hidden")) return;


    p.classList.remove("hidden");

    if (cell.state == -1) {
        alive = false;
        el.classList.add("bomb");
        showAllBombs();
        alert("Lost!");
    } else {
        el.classList.add("state-" + cell.state);
    }

    if (cell.flag) {
        el.classList.add("flag");
    } else {
        el.classList.remove("flag");
    }
}

function showAllBombs() {
    for (let index = 0; index < bombPositions.length; index++) {
        const coords = bombPositions[index];
        const el = document.getElementById(`cell-${coords[1]}-${coords[0]}`);
        el.firstChild.classList.remove("hidden");
        el.classList.add("bomb");
    }
}

function checkXPositionedSquare(y, x) {
    const el = document.getElementById(`cell-${y}-${x}`);
    const cell = gameField[y][x];
    const wasHidden = cell.hidden;
    showSquareInternal(y, x)
    checkSquare(y, x, el);
    if (cell.state == 0 && wasHidden && alive) {
        checkConnectingSquares(y, x);
    }
}

function checkConnectingSquares(y, x) {
    const leftX = x - 1;
    const rightX = x + 1;
    const downY = y - 1;
    const upY = y + 1;

    const leftExists = leftX >= 0
    const rightExists = rightX < width
    const downExists = downY >= 0
    const upExists = upY < height
    if (leftExists) {
        checkXPositionedSquare(y, leftX);
    }
    if (rightExists) {
        checkXPositionedSquare(y, rightX);
    }
    if (downExists) {
        checkXPositionedSquare(downY, x);
        if (leftExists) {
            checkXPositionedSquare(downY, leftX);
        }
        if (rightExists) {
            checkXPositionedSquare(downY, rightX);
        }
    }
    if (upExists) {
        checkXPositionedSquare(upY, x);
        if (leftExists) {
            checkXPositionedSquare(upY, leftX);
        }
        if (rightExists) {
            checkXPositionedSquare(upY, rightX);
        }
    }
}


function newGame() {
    alive = true;

    generateGameField(width, height, mines);
}

function registerSliderListeners() {
    const widthSlider = document.getElementById("width-slider");
    const heightSlider = document.getElementById("height-slider");
    const minesSlider = document.getElementById("mines-slider");
    const minesValue = document.getElementById("mines-value");
    widthSlider.oninput = function () {
        const widthValue = document.getElementById("width-value");
        width = this.value;
        minesSlider.max = width * height;
        minesSlider.value = Math.min(minesSlider.max, minesSlider.value);
        mines = minesSlider.value;
        widthValue.innerHTML = width;
        minesValue.innerHTML = mines;
    }
    heightSlider.oninput = function () {
        const heightValue = document.getElementById("height-value");
        height = this.value;
        minesSlider.max = width * height;
        minesSlider.value = Math.min(minesSlider.max, minesSlider.value);
        mines = minesSlider.value;
        heightValue.innerHTML = height;
        minesValue.innerHTML = mines;
    }
    minesSlider.oninput = function () {
        mines = minesSlider.value;
        minesValue.innerHTML = mines;
    }
    widthSlider.value = width;
    heightSlider.value = height;
    minesSlider.value = mines;
}

window.onload = function () {
    registerSliderListeners();
    registerTimeTracker();
    registerGameStateTracker();
    generateGameField(width, height, mines);
}

