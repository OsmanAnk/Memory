import './styles/style.scss'
import { cardBack, cardsByTheme } from './cards'

let flippedCard: HTMLButtonElement[] = [];
let activePlayer: string = "blue";
let blueScore: number = 0;
let orangeScore: number = 0;

init()

function init() {
    const playRef = document.getElementById("play")
    playRef?.addEventListener("click", startGame);
    const startRef = document.getElementById("start")
    startRef?.addEventListener("click", startMemory);

    checkboxes("theme");
    checkboxes("player");
    checkboxes("board");
    hoverPreview();
    openModal();
    currentPlayer();

    const fieldRef = document.getElementById("field");
    if (fieldRef) {
        fieldRef.addEventListener("click", e => {
            const card = (e.target as HTMLElement).closest(".card") as HTMLButtonElement;
            if (card) {
                card.classList.toggle("is-flipped");
            }
        })
    }
}

function startGame() {
    const homeRef = document.getElementById("home");
    homeRef?.classList.add("d_none");

    const settingsRef = document.getElementById("settings");
    settingsRef?.classList.remove("d_none");
}

function startMemory() {
    const theme = document.querySelector<HTMLInputElement>(".choices__item--theme:checked")!.id;
    const player = document.querySelector<HTMLInputElement>(".choices__item--player:checked")!.id;
    const board = document.querySelector<HTMLInputElement>(".choices__item--board:checked")!.id;

    resetScore();
    activePlayer = player.replace("player-", "");
    currentPlayer();
    gameStarted(theme, player, board)

    const settingsRef = document.getElementById("settings");
    const memoryRef = document.getElementById("memory");
    settingsRef?.classList.add("d_none");
    memoryRef?.classList.remove("d_none");
}

function gameStarted(theme: string, player: string, board: string) {
    const cards = cardsByTheme[theme];
    const cardCount = Number(board.replace("board-size-", ""));
    const pairCount = cardCount / 2;
    const selectedCards = cards.slice(0, pairCount);
    const doubleSelectedCards = selectedCards.concat(selectedCards);
    shuffleCards(doubleSelectedCards)
    const cardsRef = document.getElementById("cards");
    const cardsHtml = doubleSelectedCards.map(card => {
        return `<button class="card" data-card="${card}">
                    <div class="card__inner">
                        <div class="card__face">
                            <img src="${cardBack}" alt="">
                        </div>
                        <div class="card__face card__face--back">
                            <img src="${card}" alt="">
                        </div>
                    </div>
                </button>`;
    }).join("");

    cardsRef?.addEventListener("click", (event) => {
        const card = (event.target as HTMLElement).closest(".card");
        if (!card) return;
        if (card.classList.contains("is-flipped")) return;
        if (flippedCard.length === 2) return;

        card.classList.add("is-flipped");
        flippedCard.push(card as HTMLButtonElement)

        if (flippedCard.length === 2) {
            if (flippedCard[0].dataset.card === flippedCard[1].dataset.card) {
                setTimeout(() => {
                    flippedCard[0].classList.add("is-matched");
                    flippedCard[1].classList.add("is-matched");
                    flippedCard = [];
                    score();
                    cardsCounter(cardCount);
                    //hier vergleich, wie viele karten noch im spiel übrig sind
                }, 300);
            } else {
                setTimeout(() => {
                    flippedCard[0].classList.remove("is-flipped");
                    flippedCard[1].classList.remove("is-flipped");
                    flippedCard = [];
                    switchPlayer();
                    currentPlayer();
                }, 1000);
            }
        }
    });

    cardsRef!.innerHTML = cardsHtml;


    const columns = cardCount === 4 ? 2 : cardCount === 16 ? 4 : 6;

    const cardsGrid = document.getElementById("cards");
    if (cardsGrid) {
        cardsGrid.style.gridTemplateColumns = `repeat(${columns}, 1fr)`;
    }
}

function shuffleCards(doubleSelectedCards: string[]) {
    for (let i = doubleSelectedCards.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        let temp = doubleSelectedCards[i];
        doubleSelectedCards[i] = doubleSelectedCards[j];
        doubleSelectedCards[j] = temp;
    }
}

function checkboxes(option: string) {
    const checkboxes = document.querySelectorAll<HTMLInputElement>(".choices__item--" + option);
    checkboxes.forEach((box) => {
        box.addEventListener("change", (e) => {
            const currentCheckbox = e.target as HTMLInputElement;

            checkedImg(currentCheckbox);
            updateChosenText(option, currentCheckbox);
            if (currentCheckbox.checked) {
                checkboxes.forEach((other) => {
                    if (other !== e.target) {
                        other.checked = false;
                        uncheckedImg(other);
                    }
                });
            }
            updateChosenState();
        });
    });
}

function updateChosenText(option: string, checkbox: HTMLInputElement) {
    const chosenTextRef = document.getElementById("chosen__" + option);
    if (!chosenTextRef) return;

    const label = checkbox.closest(".choices__label");
    const text = label?.querySelector(".choices__text")?.textContent;
    if (text) {
        chosenTextRef.textContent = text;
    }
}

function updateChosenState() {
    const chosenRef = document.querySelector<HTMLElement>(".chosen");
    const hasTheme = Boolean(document.querySelector<HTMLInputElement>(".choices__item--theme:checked"));
    const hasPlayer = Boolean(document.querySelector<HTMLInputElement>(".choices__item--player:checked"));
    const hasBoard = Boolean(document.querySelector<HTMLInputElement>(".choices__item--board:checked"));
    const isComplete = hasTheme && hasPlayer && hasBoard;

    if (isComplete) {
        chosenRef?.classList.add("chosen--complete");
    }

    const startRef = document.getElementById("start") as HTMLButtonElement | null;
    if (startRef) {
        startRef.disabled = !isComplete;
    }

    const lineRefs = document.querySelectorAll<HTMLElement>(".chosen__line")
    const line3Refs = document.querySelectorAll<HTMLElement>(".chosen__line-3")

    lineRefs.forEach((line) => {
        if (isComplete) {
            line.classList.add("d_none");
        }
    });
    line3Refs.forEach(line3 => {
        if (isComplete) {
            line3.classList.remove("d_none");
        }
    });
}

function checkedImg(currentCheckbox: HTMLInputElement) {
    const themeName = currentCheckbox.id.replace("theme-", "")
    const previewImg = document.getElementById("preview-" + themeName)

    previewImg?.classList.remove("d_none");
}

function uncheckedImg(other: HTMLInputElement) {
    const themeName = other.id.replace("theme-", "")
    const previewImg = document.getElementById("preview-" + themeName)

    previewImg?.classList.add("d_none");
}

function hoverPreview() {
    const themeCheckboxes = document.querySelectorAll<HTMLInputElement>(".choices__item--theme");

    themeCheckboxes.forEach((checkbox) => {
        const label = checkbox.closest(".choices__label");

        label?.addEventListener("mouseenter", () => {
            showPreviewImg(checkbox);
        });

        leavePreview(label);
    });
}

function leavePreview(label: Element | null) {
    label?.addEventListener("mouseleave", () => {
        const checkedTheme = document.querySelector<HTMLInputElement>(".choices__item--theme:checked");

        if (checkedTheme) {
            showPreviewImg(checkedTheme);
        }
    });
}

function showPreviewImg(checkbox: HTMLInputElement) {
    const previewImages = document.querySelectorAll<HTMLElement>(".preview__img");

    previewImages.forEach((img) => {
        img.classList.add("d_none");
    });

    const themeName = checkbox.id.replace("theme-", "");
    const previewImg = document.getElementById("preview-" + themeName);

    previewImg?.classList.remove("d_none");
}

function openModal() {
    const modal = document.getElementById("modal");
    const btn = document.getElementById("exit-btn")
    const back = document.querySelector(".modal__back");
    const exit = document.querySelector(".modal__exit");
    const settingsRef = document.getElementById("settings");

    btn?.addEventListener("click", () => {
        modal?.classList.remove("d_none", "modal--closing");
        modal?.classList.add("modal--open")
    });

    back?.addEventListener("click", () => {
        if (modal) {
            closeModal(modal);
        }
    });

    exit?.addEventListener("click", () => {
        if (!modal) return;

        const memoryRef = document.getElementById("memory");
        const settingsRef = document.getElementById("settings");

        closeModal(modal);
        memoryRef?.classList.add("d_none");
        settingsRef?.classList.remove("d_none");
        flippedCard = [];
        resetScore();
    });
}

function closeModal(modal: HTMLElement) {
    if (!modal) return;

    modal.classList.remove("modal--open");
    modal.classList.add("modal--closing");

    setTimeout(() => {
        modal.classList.add("d_none");
        modal.classList.remove("modal--closing");
    }, 300);
}

function currentPlayer() {
    const currentPlayerIconRef = document.getElementById("current-player-icon") as HTMLImageElement | null;

    if (!currentPlayerIconRef) return;
    currentPlayerIconRef.src = `assets/icons/code_vibes/player ${activePlayer}.svg`
}

function switchPlayer() {
    activePlayer = activePlayer === "blue" ? "orange" : "blue";
}

function score() {
    let blueScoreRef = document.getElementById("players__blue--score");
    let orangeScoreRef = document.getElementById("players__orange--score");

    if (activePlayer === "blue") {
        blueScore++;
        blueScoreRef!.textContent = `${blueScore}`
    } else {
        orangeScore++;
        orangeScoreRef!.textContent = `${orangeScore}`
    }
}

function resetScore() {
    blueScore = 0;
    orangeScore = 0;

    const blueScoreRef = document.getElementById("players__blue--score");
    const orangeScoreRef = document.getElementById("players__orange--score");

    if (blueScoreRef) blueScoreRef.textContent = "0";
    if (orangeScoreRef) orangeScoreRef.textContent = "0";
}

function cardsCounter(cardCount: number) {

    const matchedCards = document.querySelectorAll(".card.is-matched").length;
    if (matchedCards === cardCount) {
        if (blueScore > orangeScore) {
            blueWins();
        }
        if (blueScore < orangeScore) {
            gameOverScreen();
            orangeWins()
        }
        if (blueScore === orangeScore) {
            gameOverScreen();
            draw()
        }
    }
}

function blueWins() {
    gameOverScreen();
    const endScreenRef = document.getElementById("final-score");

}

function gameOverScreen() {
    const endScreenRef = document.getElementById("end-screen");
    const blueScoreRef = document.getElementById("final-blue-score");
    const orangeScoreRef = document.getElementById("final-orange-score");

    blueScoreRef!.innerHTML = `${blueScore}`;
    orangeScoreRef!.innerHTML = `${orangeScore}`;
    endScreenRef?.classList.add("end-screen--open");

    setTimeout(() => {
        winnerScreen();
    }, 3000);
}

function winnerScreen() {
    
}