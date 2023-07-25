
const numbers = [];
let attamps = 0;
let timer = 0;
let player1Matches = 0;
let player2Matches = 0;
let currentPlayer = 1;
const board = document.querySelector(".board");
let timerInterval;

document.getElementById("restart-button").disabled = true;

function startGame() {
    const sizeInput = document.getElementById("board-size");
    const boardSize = parseInt(sizeInput.value);

    if (isNaN(boardSize) || boardSize < 4 || boardSize > 20) {
        alert("Please enter a valid board size between 4 and 20.");
        return;
    }

    const playerNames = document.querySelectorAll(".player-name");
    const player1Name = playerNames[0].value.trim();
    const player2Name = playerNames[1].value.trim();

    if (player1Name === "" || player2Name === "") {
        alert("Please enter names for both players.");
        return;
    }

    const previousBestTime = localStorage.getItem("bestTime");
    if (previousBestTime !== null) {
        document.getElementById("best-time").textContent = formatTime(previousBestTime);
    }

    sizeInput.disabled = true;
    document.getElementById("start-button").disabled = true;

    //לגרום לכך שלא יוכלו לשנות את השמות לאחר תחילת המשחק 
    playerNames[0].readOnly = true;
    playerNames[1].readOnly = true;

    initializeGame(boardSize);
}

function initializeGame(boardSize) {
    startTimer();


    board.style.gridTemplateColumns = `repeat(6, 1fr)`;

    for (let i = 1; i <= boardSize; i++) {
        numbers.push(i, i);
    }

    for (let i = 1; i <= boardSize * 2; i++) {
        // אינדקס רנדומלי מהמערך
        const rand = Math.floor(Math.random() * numbers.length);

        const div = document.createElement("div");
        div.innerHTML = `<span>${numbers[rand]}</span>`;
        board.appendChild(div);

        // בכדי שלא יהיו כפילויות, לאחר שהשתמשנו במיקום מסויים, הסרנו אותו מהמערך
        numbers.splice(rand, 1);

        div.addEventListener("click", ev => {
            if (ev.target.classList.contains('hidden')) {
                return;
            }

            if (board.querySelectorAll(".showing").length == 2) {
                return;
            }

            ev.target.classList.add("showing");

            board.querySelectorAll(".cheat").forEach(elem => elem.classList.remove('cheat'));
            const elements = board.querySelectorAll("div:not(.showing)");

            for (const elem of elements) {
                if (elem.textContent == ev.target.textContent) {
                    elem.classList.add("cheat");
                    break;
                }
            }

            check();
        });
    }
}
function check() {

    const cards = board.querySelectorAll(".showing");

    if (cards.length === 2) {
        const first = cards[0];
        const last = cards[1];
        document.querySelector(".counter").innerHTML = ++attamps;

        if (first.textContent == last.textContent) {
            setTimeout(() => {
                first.classList.remove("showing");
                last.classList.remove("showing");

                first.classList.add("hidden");
                last.classList.add("hidden");

                if (currentPlayer === 1) {
                    player1Matches++;
                    document.querySelectorAll(".pairsCounter")[0].textContent = player1Matches;
                } else if (currentPlayer === 2) {
                    player2Matches++;
                    document.querySelectorAll(".pairsCounter")[1].textContent = player2Matches;
                }

                checkIsComplete();

            }, 1000);
        } else {
            setTimeout(() => {
                first.classList.remove("showing");
                last.classList.remove("showing");

                switchPlayer();
            }, 1500);
        }
    }
}

function switchPlayer() {
    currentPlayer = currentPlayer === 1 ? 2 : 1;
    const playerElements = document.querySelectorAll("h2");
    const playerNames = document.querySelectorAll(".player-name");
    playerElements.forEach((elem, index) => {
        elem.textContent = playerNames[index].value || `Player ${index + 1}`;
        elem.classList.toggle("active");
    });
}

function checkIsComplete() {
    const cards = board.querySelectorAll("div:not(.hidden)");

    if (!cards.length) {
        clearInterval(timerInterval);

        const currentTime = timer;
        const previousBestTime = localStorage.getItem("bestTime");

        if (previousBestTime === null || currentTime < previousBestTime) {
            localStorage.setItem("bestTime", currentTime);
            document.getElementById("best-time").textContent = formatTime(currentTime);
        }

        confetti({
            particleCount: 100,
            spread: 70,
            decay: 0.9,
            origin: { y: 0.6 }
        });

        const playerElements = document.querySelectorAll("h2");
        playerElements.forEach((elem) => { elem.classList.remove("active"); });

        if (player1Matches > player2Matches) {
            playerElements[0].classList.add("winner");
            playerElements[1].classList.add("loser");
        } else if (player1Matches < player2Matches) {
            playerElements[1].classList.add("winner");
            playerElements[0].classList.add("loser");
        } else {
            playerElements[0].classList.add("tie");
            playerElements[1].classList.add("tie");
        }
    }

    document.getElementById("restart-button").disabled = false;

}

function formatTime(time) {
    const date = new Date(time * 1000);
    const m = date.getMinutes();
    const s = date.getSeconds();

    return `${m < 10 ? '0' + m : m}:${s < 10 ? '0' + s : s}`;
}


function startTimer() {
    timer = 0;
    timerInterval = setInterval(() => {
        timer++;

        const date = new Date(timer * 1000);
        const m = date.getMinutes();
        const s = date.getSeconds();

        document.querySelector('.timer').innerHTML = `${m < 10 ? '0' + m : m}:${s < 10 ? '0' + s : s}`;
    }, 1000);
}

function restartGame() {
    window.location.reload();
}