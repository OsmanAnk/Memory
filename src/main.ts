import './styles/style.scss';
import './styles/themes/_code-vibes.scss';
import './styles/themes/_gaming.scss';
import { initCardsClick, resetFlippedCards, startCardGame } from './scripts/cards';
import { bindChoiceGroup, getCheckedId } from './scripts/choices';
import { hoverPreview } from './scripts/preview';

let activeTheme: string = "theme-code-vibes";
let activePlayer: string = "blue";
let activeCardCount: number = 0;
let blueScore: number = 0;
let orangeScore: number = 0;

init();

/** Initializes all event listeners and the initial UI state. */
function init() {
    bindClick("play", startGame);
    bindClick("start", startMemory);
    bindChoiceGroup("theme");
    bindChoiceGroup("player");
    bindChoiceGroup("board");
    hoverPreview();
    openModal();
    initBackToStart();
    initCardsClick({
        onMatch: handleCardMatch,
        onMismatch: handleCardMismatch,
    });
    currentPlayer();
}

/**
 * Binds a click handler to an element by id when the element exists.
 * @param id - Element id without the hash prefix.
 * @param callback - Function that runs when the element is clicked.
 */
function bindClick(id: string, callback: () => void) {
    document.getElementById(id)?.addEventListener("click", callback);
}

/** Opens the settings screen from the home screen. */
function startGame() {
    setElementVisibility("home", false);
    setElementVisibility("settings", true);
}

/** Starts a new memory round with the selected settings. */
function startMemory() {
    const theme = getCheckedId("theme");
    const player = getCheckedId("player");
    const board = getCheckedId("board");
    resetGame();
    setActiveOptions(theme, player);
    gameStarted(theme, board);
    setElementVisibility("settings", false);
    setElementVisibility("memory", true);
}

/**
 * Stores the selected theme and player and updates dependent UI.
 * @param theme - Selected theme id.
 * @param player - Selected player input id.
 */
function setActiveOptions(theme: string, player: string) {
    activeTheme = theme;
    activePlayer = player.replace("player-", "");
    applyGameTheme(theme);
    updatePlayerImages(theme);
    currentPlayer();
}

/**
 * Creates and renders the board for the selected theme and size.
 * @param theme - Selected theme id.
 * @param board - Selected board-size input id.
 */
function gameStarted(theme: string, board: string) {
    activeCardCount = startCardGame(theme, board);
}

/** Scores the current player and checks for game end after a matching pair. */
function handleCardMatch() {
    score();
    cardsCounter();
}

/** Switches the player after a non-matching pair. */
function handleCardMismatch() {
    switchPlayer();
    currentPlayer();
}

/**
 * Applies the selected theme to every themed screen.
 * @param theme - Selected theme id.
 */
function applyGameTheme(theme: string) {
    applyThemeClass("memory", theme);
    applyThemeClass("end-screen", theme);
    applyThemeClass("winner", theme);
    applyThemeClass("modal", theme);
}

/**
 * Replaces the theme modifier class on one element.
 * @param id - Element id and base class prefix.
 * @param theme - Selected theme id.
 */
function applyThemeClass(id: string, theme: string) {
    const element = document.getElementById(id);
    if (!element) return;
    element.classList.remove(`${id}--theme-code-vibes`, `${id}--theme-gaming`);
    element.classList.add(`${id}--${theme}`);
}

/**
 * Updates all player icons for the selected theme.
 * @param theme - Selected theme id.
 */
function updatePlayerImages(theme: string) {
    const blueIconSrc = getPlayerIconSrc(theme, "blue");
    const orangeIconSrc = getPlayerIconSrc(theme, "orange");
    setImgSrc("player-blue-icon", blueIconSrc);
    setImgSrc("player-orange-icon", orangeIconSrc);
    setImgSrc("final-blue-icon", blueIconSrc);
    setImgSrc("final-orange-icon", orangeIconSrc);
}

/**
 * Builds the correct player icon path for a theme.
 * @param theme - Selected theme id.
 * @param player - Player color name.
 * @returns Image path for the player icon.
 */
function getPlayerIconSrc(theme: string, player: string) {
    if (theme === "theme-gaming") {
        return `assets/icons/chess_${player}.svg`;
    }
    return `assets/icons/code_vibes/player ${player}.svg`;
}

/**
 * Sets the src attribute of an image by id when it exists.
 * @param id - Image element id.
 * @param src - New image path.
 */
function setImgSrc(id: string, src: string) {
    const imgRef = document.getElementById(id) as HTMLImageElement | null;
    if (imgRef) imgRef.src = src;
}

/** Binds modal open, close, and exit controls. */
function openModal() {
    const modal = document.getElementById("modal");
    document.getElementById("exit-btn")?.addEventListener("click", () => showModal(modal));
    document.querySelector(".modal__back")?.addEventListener("click", () => closeModalElement(modal));
    document.querySelector(".modal__exit")?.addEventListener("click", () => exitGame(modal));
}

/**
 * Shows the quit confirmation modal.
 * @param modal - Modal element.
 */
function showModal(modal: HTMLElement | null) {
    applyGameTheme(activeTheme);
    modal?.classList.remove("d_none", "modal--closing");
    modal?.classList.add("modal--open");
}

/**
 * Closes the modal when the element exists.
 * @param modal - Modal element.
 */
function closeModalElement(modal: HTMLElement | null) {
    if (modal) closeModal(modal);
}

/**
 * Exits the current game and returns to settings.
 * @param modal - Modal element.
 */
function exitGame(modal: HTMLElement | null) {
    if (!modal) return;
    closeModal(modal);
    setElementVisibility("memory", false);
    setElementVisibility("settings", true);
    resetGame();
}

/** Binds delegated clicks for dynamically rendered back-to-start buttons. */
function initBackToStart() {
    document.addEventListener("click", event => {
        if ((event.target as HTMLElement).closest(".back-to-start")) backToStart();
    });
}

/** Resets the current round and returns to the settings screen. */
function backToStart() {
    resetGame();
    setElementVisibility("memory", false);
    setElementVisibility("settings", true);
}

/** Resets round state, score, and end screens. */
function resetGame() {
    resetFlippedCards();
    resetScore();
    hideEndScreens();
}

/** Hides winner and game-over overlays. */
function hideEndScreens() {
    document.getElementById("end-screen")?.classList.remove("end-screen--open");
    document.getElementById("winner")?.classList.remove("winner--open");
}

/**
 * Starts the modal close animation.
 * @param modal - Modal element to close.
 */
function closeModal(modal: HTMLElement) {
    modal.classList.remove("modal--open");
    modal.classList.add("modal--closing");
    setTimeout(() => finishCloseModal(modal), 300);
}

/**
 * Completes modal closing after the animation.
 * @param modal - Modal element to hide.
 */
function finishCloseModal(modal: HTMLElement) {
    modal.classList.add("d_none");
    modal.classList.remove("modal--closing");
}

/** Updates current-player styles and icon. */
function currentPlayer() {
    const currentPlayerRef = document.getElementById("current-player");
    currentPlayerRef?.classList.remove("current-player--blue", "current-player--orange");
    currentPlayerRef?.classList.add(`current-player--${activePlayer}`);
    setCurrentPlayerIcon();
}

/** Updates the icon displayed next to the current player label. */
function setCurrentPlayerIcon() {
    const iconSrc = getCurrentPlayerIconSrc();
    setImgSrc("current-player-icon", iconSrc);
}

/**
 * Returns the current-player icon path for the active theme.
 * @returns Image path for the current-player icon.
 */
function getCurrentPlayerIconSrc() {
    if (activeTheme === "theme-gaming") return "assets/icons/chess_neutral.svg";
    return `assets/icons/code_vibes/player ${activePlayer}.svg`;
}

/** Switches active player between blue and orange. */
function switchPlayer() {
    activePlayer = activePlayer === "blue" ? "orange" : "blue";
}

/** Adds one point to the active player and updates the score display. */
function score() {
    if (activePlayer === "blue") {
        blueScore++;
    } else {
        orangeScore++;
    }
    updateScoreText();
}

/** Writes current score values into the visible scoreboard. */
function updateScoreText() {
    setScoreTexts("players");
}

/** Resets both player scores to zero. */
function resetScore() {
    blueScore = 0;
    orangeScore = 0;
    updateScoreText();
}

/** Counts matched cards and shows the winner when the board is complete. */
function cardsCounter() {
    const matchedCards = document.querySelectorAll(".card.is-matched").length;
    if (matchedCards === activeCardCount) showWinner();
}

/** Chooses the correct winner state based on the final score. */
function showWinner() {
    if (blueScore > orangeScore) blueWins();
    if (blueScore < orangeScore) orangeWins();
    if (blueScore === orangeScore) draw();
}

/** Shows the winner state for the blue player. */
function blueWins() {
    showResult("BLUE PLAYER", "winner__blue--text", getWinIcon("blue"));
}

/** Shows the winner state for the orange player. */
function orangeWins() {
    showResult("ORANGE PLAYER", "winner__draw--text", getWinIcon("orange"));
}

/** Shows the draw state. */
function draw() {
    showResult("DRAW", "end-title", getDrawIcon(), "It's a");
}

/**
 * Opens the result screens and renders the winner content.
 * @param text - Main result text.
 * @param textClass - CSS class for the main result text.
 * @param icon - Icon image path.
 * @param prefix - Text displayed above the main result text.
 */
function showResult(text: string, textClass: string, icon: string, prefix = "The winner is") {
    gameOverScreen();
    setWinnerHtml(text, textClass, icon, prefix);
}

/**
 * Returns the winner icon path for the active theme.
 * @param player - Winning player color name.
 * @returns Image path for the winner icon.
 */
function getWinIcon(player: string) {
    if (activeTheme === "theme-gaming") return "assets/icons/pokal.svg";
    return `assets/icons/${player} win.svg`;
}

/**
 * Returns the draw icon path for the active theme.
 * @returns Image path for the draw icon.
 */
function getDrawIcon() {
    if (activeTheme === "theme-gaming") return "assets/icons/draw_gaming.svg";
    return "assets/icons/draw_code_vibes.svg";
}

/**
 * Renders the winner content into the winner screen.
 * @param text - Main winner text.
 * @param textClass - CSS class for the main winner text.
 * @param icon - Icon image path.
 * @param prefix - Text displayed above the main winner text.
 */
function setWinnerHtml(text: string, textClass: string, icon: string, prefix = "The winner is") {
    const winnerInnerRef = document.getElementById("winner__inner");
    winnerInnerRef!.innerHTML = winnerTemplate(text, textClass, icon, prefix);
}

/**
 * Creates the winner screen inner markup.
 * @param text - Main winner text.
 * @param textClass - CSS class for the main winner text.
 * @param icon - Icon image path.
 * @param prefix - Text displayed above the main winner text.
 * @returns HTML string for the winner content.
 */
function winnerTemplate(text: string, textClass: string, icon: string, prefix: string) {
    return `<span class="winner__is">${prefix}</span>
        <span class="${textClass}">${text}</span>
        <img class="winner__img" src="${icon}" alt="">
        <button class="back-to-start exit__button" type="button"><span>Home</span></button>`;
}

/** Updates final scores and opens the game-over screen. */
function gameOverScreen() {
    setScoreTexts("final");
    document.getElementById("end-screen")?.classList.add("end-screen--open");
    setTimeout(winnerScreen, 1500);
}

/** Opens the winner screen after the game-over screen. */
function winnerScreen() {
    document.getElementById("winner")?.classList.add("winner--open");
}

/**
 * Shows or hides an element by toggling the d_none class.
 * @param id - Element id.
 * @param isVisible - Whether the element should be visible.
 */
function setElementVisibility(id: string, isVisible: boolean) {
    document.getElementById(id)?.classList.toggle("d_none", !isVisible);
}

/**
 * Sets text content on an element by id.
 * @param id - Element id.
 * @param text - New text content.
 */
function setText(id: string, text: string) {
    const element = document.getElementById(id);
    if (element) element.textContent = text;
}

/**
 * Writes both player scores into one scoreboard area.
 * @param prefix - Score element id prefix.
 */
function setScoreTexts(prefix: "players" | "final") {
    const blueScoreId = prefix === "players" ? "players__blue--score" : "final-blue-score";
    const orangeScoreId = prefix === "players" ? "players__orange--score" : "final-orange-score";
    setText(blueScoreId, `${blueScore}`);
    setText(orangeScoreId, `${orangeScore}`);
}
