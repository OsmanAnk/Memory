import './styles/style.scss';
import './styles/themes/_code-vibes.scss';
import './styles/themes/_gaming.scss';
import { cardBackByTheme, cardsByTheme } from './cards';

let flippedCard: HTMLButtonElement[] = [];
let activeTheme: string = "theme-code-vibes";
let activePlayer: string = "blue";
let activeCardCount: number = 0;
let blueScore: number = 0;
let orangeScore: number = 0;

init();

function init() {
    bindClick("play", startGame);
    bindClick("start", startMemory);
    checkboxes("theme");
    checkboxes("player");
    checkboxes("board");
    hoverPreview();
    openModal();
    initBackToStart();
    initCardsClick();
    currentPlayer();
}

function bindClick(id: string, callback: () => void) {
    document.getElementById(id)?.addEventListener("click", callback);
}

function startGame() {
    hideElement("home");
    showElement("settings");
}

function startMemory() {
    const theme = getCheckedId("theme");
    const player = getCheckedId("player");
    const board = getCheckedId("board");
    resetGame();
    setActiveOptions(theme, player);
    gameStarted(theme, board);
    hideElement("settings");
    showElement("memory");
}

function getCheckedId(option: string) {
    const selector = `.choices__item--${option}:checked`;
    return document.querySelector<HTMLInputElement>(selector)!.id;
}

function setActiveOptions(theme: string, player: string) {
    activeTheme = theme;
    activePlayer = player.replace("player-", "");
    applyGameTheme(theme);
    updatePlayerImages(theme);
    currentPlayer();
}

function gameStarted(theme: string, board: string) {
    const cardCount = Number(board.replace("board-size-", ""));
    const cards = createGameCards(theme, cardCount);
    activeCardCount = cardCount;
    renderCards(cards, cardBackByTheme[theme]);
    updateBoardClasses(cardCount);
    updateCardsGrid(theme, cardCount);
}

function createGameCards(theme: string, cardCount: number) {
    const pairCount = cardCount / 2;
    const selectedCards = cardsByTheme[theme].slice(0, pairCount);
    const gameCards = selectedCards.concat(selectedCards);
    shuffleCards(gameCards);
    return gameCards;
}

function renderCards(cards: string[], cardBack: string) {
    const cardsRef = document.getElementById("cards");
    if (!cardsRef) return;
    cardsRef.innerHTML = cards.map(card => cardTemplate(card, cardBack)).join("");
}

function cardTemplate(card: string, cardBack: string) {
    return `<button class="card" data-card="${card}">
        <div class="card__inner">${cardFace(cardBack)}${cardBackFace(card)}</div>
    </button>`;
}

function cardFace(src: string) {
    return `<div class="card__face"><img src="${src}" alt=""></div>`;
}

function cardBackFace(src: string) {
    return `<div class="card__face card__face--back"><img src="${src}" alt=""></div>`;
}

function initCardsClick() {
    document.getElementById("cards")?.addEventListener("click", handleCardsClick);
}

function handleCardsClick(event: MouseEvent) {
    const card = getClickedCard(event);
    if (!card || cannotFlipCard(card)) return;
    card.classList.add("is-flipped");
    flippedCard.push(card);
    if (flippedCard.length === 2) {
        handleFlippedPair();
    }
}

function getClickedCard(event: MouseEvent) {
    const target = event.target as HTMLElement;
    return target.closest(".card") as HTMLButtonElement | null;
}

function cannotFlipCard(card: HTMLButtonElement) {
    return card.classList.contains("is-flipped") || flippedCard.length === 2;
}

function handleFlippedPair() {
    const [firstCard, secondCard] = flippedCard;
    if (firstCard.dataset.card === secondCard.dataset.card) {
        setTimeout(() => matchPair(firstCard, secondCard), 300);
    } else {
        setTimeout(() => resetPair(firstCard, secondCard), 1000);
    }
}

function matchPair(firstCard: HTMLButtonElement, secondCard: HTMLButtonElement) {
    firstCard.classList.add("is-matched");
    secondCard.classList.add("is-matched");
    flippedCard = [];
    score();
    cardsCounter();
}

function resetPair(firstCard: HTMLButtonElement, secondCard: HTMLButtonElement) {
    firstCard.classList.remove("is-flipped");
    secondCard.classList.remove("is-flipped");
    flippedCard = [];
    switchPlayer();
    currentPlayer();
}

function updateBoardClasses(cardCount: number) {
    const memoryRef = document.getElementById("memory");
    memoryRef?.classList.remove("memory--board-4", "memory--board-16");
    memoryRef?.classList.remove("memory--board-24", "memory--board-36");
    memoryRef?.classList.add(`memory--board-${cardCount}`);
}

function updateCardsGrid(theme: string, cardCount: number) {
    const cardsGrid = document.getElementById("cards");
    if (!cardsGrid) return;
    cardsGrid.classList.remove("cards--theme-code-vibes", "cards--theme-gaming");
    cardsGrid.classList.add(`cards--${theme}`);
    cardsGrid.style.gridTemplateColumns = `repeat(${getColumnCount(cardCount)}, 1fr)`;
}

function getColumnCount(cardCount: number) {
    if (cardCount === 4) return 2;
    if (cardCount === 16) return 4;
    return 6;
}

function applyGameTheme(theme: string) {
    applyThemeClass("memory", theme);
    applyThemeClass("end-screen", theme);
    applyThemeClass("winner", theme);
    applyThemeClass("modal", theme);
}

function applyThemeClass(id: string, theme: string) {
    const element = document.getElementById(id);
    if (!element) return;
    element.classList.remove(`${id}--theme-code-vibes`, `${id}--theme-gaming`);
    element.classList.add(`${id}--${theme}`);
}

function updatePlayerImages(theme: string) {
    const blueIconSrc = getPlayerIconSrc(theme, "blue");
    const orangeIconSrc = getPlayerIconSrc(theme, "orange");
    setImgSrc("player-blue-icon", blueIconSrc);
    setImgSrc("player-orange-icon", orangeIconSrc);
    setImgSrc("final-blue-icon", blueIconSrc);
    setImgSrc("final-orange-icon", orangeIconSrc);
}

function getPlayerIconSrc(theme: string, player: string) {
    if (theme === "theme-gaming") {
        return `assets/icons/chess_${player}.svg`;
    }
    return `assets/icons/code_vibes/player ${player}.svg`;
}

function setImgSrc(id: string, src: string) {
    const imgRef = document.getElementById(id) as HTMLImageElement | null;
    if (imgRef) imgRef.src = src;
}

function shuffleCards(cards: string[]) {
    for (let i = cards.length - 1; i > 0; i--) {
        swapCards(cards, i, Math.floor(Math.random() * (i + 1)));
    }
}

function swapCards(cards: string[], first: number, second: number) {
    const temp = cards[first];
    cards[first] = cards[second];
    cards[second] = temp;
}

function checkboxes(option: string) {
    const boxes = document.querySelectorAll<HTMLInputElement>(`.choices__item--${option}`);
    boxes.forEach(box => bindCheckbox(box, boxes, option));
}

function bindCheckbox(box: HTMLInputElement, boxes: NodeListOf<HTMLInputElement>, option: string) {
    box.addEventListener("change", event => {
        const currentCheckbox = event.target as HTMLInputElement;
        checkedImg(currentCheckbox);
        updateChosenText(option, currentCheckbox);
        uncheckOtherBoxes(boxes, currentCheckbox);
        updateChosenState();
    });
}

function uncheckOtherBoxes(boxes: NodeListOf<HTMLInputElement>, current: HTMLInputElement) {
    if (!current.checked) return;
    boxes.forEach(other => {
        if (other === current) return;
        other.checked = false;
        uncheckedImg(other);
    });
}

function updateChosenText(option: string, checkbox: HTMLInputElement) {
    const chosenTextRef = document.getElementById("chosen__" + option);
    const text = getChoiceText(checkbox);
    if (chosenTextRef && text) chosenTextRef.textContent = text;
}

function getChoiceText(checkbox: HTMLInputElement) {
    const label = checkbox.closest(".choices__label");
    return label?.querySelector(".choices__text")?.textContent;
}

function updateChosenState() {
    const isComplete = hasCompleteChoices();
    if (isComplete) document.querySelector(".chosen")?.classList.add("chosen--complete");
    updateStartButton(isComplete);
    updateChosenLines(isComplete);
}

function hasCompleteChoices() {
    return Boolean(getCheckedBox("theme") && getCheckedBox("player") && getCheckedBox("board"));
}

function getCheckedBox(option: string) {
    return document.querySelector<HTMLInputElement>(`.choices__item--${option}:checked`);
}

function updateStartButton(isComplete: boolean) {
    const startRef = document.getElementById("start") as HTMLButtonElement | null;
    if (startRef) startRef.disabled = !isComplete;
}

function updateChosenLines(isComplete: boolean) {
    if (!isComplete) return;
    hideAll(".chosen__line");
    showAll(".chosen__line-3");
}

function checkedImg(currentCheckbox: HTMLInputElement) {
    getPreviewImg(currentCheckbox)?.classList.remove("d_none");
}

function uncheckedImg(other: HTMLInputElement) {
    getPreviewImg(other)?.classList.add("d_none");
}

function getPreviewImg(checkbox: HTMLInputElement) {
    const themeName = checkbox.id.replace("theme-", "");
    return document.getElementById("preview-" + themeName);
}

function hoverPreview() {
    const themeBoxes = document.querySelectorAll<HTMLInputElement>(".choices__item--theme");
    themeBoxes.forEach(bindPreviewEvents);
}

function bindPreviewEvents(checkbox: HTMLInputElement) {
    const label = checkbox.closest(".choices__label");
    label?.addEventListener("mouseenter", () => showPreviewImg(checkbox));
    label?.addEventListener("mouseleave", showCheckedPreview);
}

function showCheckedPreview() {
    const checkedTheme = getCheckedBox("theme");
    if (checkedTheme) showPreviewImg(checkedTheme);
}

function showPreviewImg(checkbox: HTMLInputElement) {
    hideAll(".preview__img");
    getPreviewImg(checkbox)?.classList.remove("d_none");
}

function openModal() {
    const modal = document.getElementById("modal");
    document.getElementById("exit-btn")?.addEventListener("click", () => showModal(modal));
    document.querySelector(".modal__back")?.addEventListener("click", () => closeModalElement(modal));
    document.querySelector(".modal__exit")?.addEventListener("click", () => exitGame(modal));
}

function showModal(modal: HTMLElement | null) {
    applyGameTheme(activeTheme);
    modal?.classList.remove("d_none", "modal--closing");
    modal?.classList.add("modal--open");
}

function closeModalElement(modal: HTMLElement | null) {
    if (modal) closeModal(modal);
}

function exitGame(modal: HTMLElement | null) {
    if (!modal) return;
    closeModal(modal);
    hideElement("memory");
    showElement("settings");
    resetGame();
}

function initBackToStart() {
    document.addEventListener("click", event => {
        if ((event.target as HTMLElement).closest(".back-to-start")) backToStart();
    });
}

function backToStart() {
    resetGame();
    hideElement("memory");
    showElement("settings");
}

function resetGame() {
    flippedCard = [];
    resetScore();
    hideEndScreens();
}

function hideEndScreens() {
    document.getElementById("end-screen")?.classList.remove("end-screen--open");
    document.getElementById("winner")?.classList.remove("winner--open");
}

function closeModal(modal: HTMLElement) {
    modal.classList.remove("modal--open");
    modal.classList.add("modal--closing");
    setTimeout(() => finishCloseModal(modal), 300);
}

function finishCloseModal(modal: HTMLElement) {
    modal.classList.add("d_none");
    modal.classList.remove("modal--closing");
}

function currentPlayer() {
    const currentPlayerRef = document.getElementById("current-player");
    currentPlayerRef?.classList.remove("current-player--blue", "current-player--orange");
    currentPlayerRef?.classList.add(`current-player--${activePlayer}`);
    setCurrentPlayerIcon();
}

function setCurrentPlayerIcon() {
    const iconSrc = getCurrentPlayerIconSrc();
    setImgSrc("current-player-icon", iconSrc);
}

function getCurrentPlayerIconSrc() {
    if (activeTheme === "theme-gaming") return "assets/icons/chess_neutral.svg";
    return `assets/icons/code_vibes/player ${activePlayer}.svg`;
}

function switchPlayer() {
    activePlayer = activePlayer === "blue" ? "orange" : "blue";
}

function score() {
    if (activePlayer === "blue") {
        blueScore++;
    } else {
        orangeScore++;
    }
    updateScoreText();
}

function updateScoreText() {
    setText("players__blue--score", `${blueScore}`);
    setText("players__orange--score", `${orangeScore}`);
}

function resetScore() {
    blueScore = 0;
    orangeScore = 0;
    updateScoreText();
}

function cardsCounter() {
    const matchedCards = document.querySelectorAll(".card.is-matched").length;
    if (matchedCards === activeCardCount) showWinner();
}

function showWinner() {
    if (blueScore > orangeScore) blueWins();
    if (blueScore < orangeScore) orangeWins();
    if (blueScore === orangeScore) draw();
}

function blueWins() {
    gameOverScreen();
    setWinnerHtml("BLUE PLAYER", "winner__blue--text", getWinIcon("blue"));
}

function orangeWins() {
    gameOverScreen();
    setWinnerHtml("ORANGE PLAYER", "winner__draw--text", getWinIcon("orange"));
}

function draw() {
    gameOverScreen();
    setWinnerHtml("DRAW", "end-title", getDrawIcon(), "It's a");
}

function getWinIcon(player: string) {
    if (activeTheme === "theme-gaming") return "assets/icons/pokal.svg";
    return `assets/icons/${player} win.svg`;
}

function getDrawIcon() {
    if (activeTheme === "theme-gaming") return "assets/icons/draw_gaming.svg";
    return "assets/icons/draw_code_vibes.svg";
}

function setWinnerHtml(text: string, textClass: string, icon: string, prefix = "The winner is") {
    const winnerInnerRef = document.getElementById("winner__inner");
    winnerInnerRef!.innerHTML = winnerTemplate(text, textClass, icon, prefix);
}

function winnerTemplate(text: string, textClass: string, icon: string, prefix: string) {
    return `<span class="winner__is">${prefix}</span>
        <span class="${textClass}">${text}</span>
        <img class="winner__img" src="${icon}" alt="">
        <button class="back-to-start exit__button"><span>Home</span></button>`;
}

function gameOverScreen() {
    setText("final-blue-score", `${blueScore}`);
    setText("final-orange-score", `${orangeScore}`);
    document.getElementById("end-screen")?.classList.add("end-screen--open");
    setTimeout(winnerScreen, 1500);
}

function winnerScreen() {
    document.getElementById("winner")?.classList.add("winner--open");
}

function hideElement(id: string) {
    document.getElementById(id)?.classList.add("d_none");
}

function showElement(id: string) {
    document.getElementById(id)?.classList.remove("d_none");
}

function hideAll(selector: string) {
    document.querySelectorAll<HTMLElement>(selector).forEach(element => element.classList.add("d_none"));
}

function showAll(selector: string) {
    document.querySelectorAll<HTMLElement>(selector).forEach(element => element.classList.remove("d_none"));
}

function setText(id: string, text: string) {
    const element = document.getElementById(id);
    if (element) element.textContent = text;
}
