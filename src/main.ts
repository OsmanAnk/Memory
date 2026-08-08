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
    initCardsClick();
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
    hideElement("home");
    showElement("settings");
}

/** Starts a new memory round with the selected settings. */
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

/**
 * Returns the id of the checked choice for a settings group.
 * @param option - Choice group suffix such as theme, player, or board.
 * @returns The selected input id.
 */
function getCheckedId(option: string) {
    const selector = `.choices__item--${option}:checked`;
    return document.querySelector<HTMLInputElement>(selector)!.id;
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
    const cardCount = Number(board.replace("board-size-", ""));
    const cards = createGameCards(theme, cardCount);
    activeCardCount = cardCount;
    renderCards(cards, cardBackByTheme[theme]);
    updateBoardClasses(cardCount);
    updateCardsGrid(theme, cardCount);
}

/**
 * Creates a shuffled list of card fronts containing matching pairs.
 * @param theme - Selected theme id.
 * @param cardCount - Total number of cards on the board.
 * @returns Shuffled card image paths.
 */
function createGameCards(theme: string, cardCount: number) {
    const pairCount = cardCount / 2;
    const selectedCards = cardsByTheme[theme].slice(0, pairCount);
    const gameCards = selectedCards.concat(selectedCards);
    shuffleCards(gameCards);
    return gameCards;
}

/**
 * Renders all cards into the cards list.
 * @param cards - Card front image paths.
 * @param cardBack - Card back image path.
 */
function renderCards(cards: string[], cardBack: string) {
    const cardsRef = document.getElementById("cards");
    if (!cardsRef) return;
    cardsRef.innerHTML = cards.map(card => cardTemplate(card, cardBack)).join("");
}

/**
 * Creates the markup for one playable card list item.
 * @param card - Card front image path.
 * @param cardBack - Card back image path.
 * @returns HTML string for one card.
 */
function cardTemplate(card: string, cardBack: string) {
    return `<li class="cards__item">
        <button class="card" type="button" data-card="${card}">
            <span class="card__inner">${cardFace(cardBack)}${cardBackFace(card)}</span>
        </button>
    </li>`;
}

/**
 * Creates the hidden card face markup.
 * @param src - Image path for the card back.
 * @returns HTML string for the card face.
 */
function cardFace(src: string) {
    return `<span class="card__face"><img src="${src}" alt=""></span>`;
}

/**
 * Creates the revealed card face markup.
 * @param src - Image path for the card front.
 * @returns HTML string for the revealed card face.
 */
function cardBackFace(src: string) {
    return `<span class="card__face card__face--back"><img src="${src}" alt=""></span>`;
}

/** Binds delegated card click handling to the card grid. */
function initCardsClick() {
    document.getElementById("cards")?.addEventListener("click", handleCardsClick);
}

/**
 * Handles card clicks and starts pair matching once two cards are flipped.
 * @param event - Click event from the cards container.
 */
function handleCardsClick(event: MouseEvent) {
    const card = getClickedCard(event);
    if (!card || cannotFlipCard(card)) return;
    card.classList.add("is-flipped");
    flippedCard.push(card);
    if (flippedCard.length === 2) {
        handleFlippedPair();
    }
}

/**
 * Finds the clicked card button from a click event.
 * @param event - Click event from the cards container.
 * @returns The clicked card button, or null when the click was outside a card.
 */
function getClickedCard(event: MouseEvent) {
    const target = event.target as HTMLElement;
    return target.closest(".card") as HTMLButtonElement | null;
}

/**
 * Checks whether a card is currently blocked from flipping.
 * @param card - Card button to check.
 * @returns True when the card is already flipped or a pair is being evaluated.
 */
function cannotFlipCard(card: HTMLButtonElement) {
    return card.classList.contains("is-flipped") || flippedCard.length === 2;
}

/** Compares the two flipped cards and schedules match or reset behavior. */
function handleFlippedPair() {
    const [firstCard, secondCard] = flippedCard;
    if (firstCard.dataset.card === secondCard.dataset.card) {
        setTimeout(() => matchPair(firstCard, secondCard), 300);
    } else {
        setTimeout(() => resetPair(firstCard, secondCard), 1000);
    }
}

/**
 * Marks a matching pair, scores the current player, and checks for game end.
 * @param firstCard - First flipped card.
 * @param secondCard - Second flipped card.
 */
function matchPair(firstCard: HTMLButtonElement, secondCard: HTMLButtonElement) {
    firstCard.classList.add("is-matched");
    secondCard.classList.add("is-matched");
    flippedCard = [];
    score();
    cardsCounter();
}

/**
 * Flips a non-matching pair back and switches the active player.
 * @param firstCard - First flipped card.
 * @param secondCard - Second flipped card.
 */
function resetPair(firstCard: HTMLButtonElement, secondCard: HTMLButtonElement) {
    firstCard.classList.remove("is-flipped");
    secondCard.classList.remove("is-flipped");
    flippedCard = [];
    switchPlayer();
    currentPlayer();
}

/**
 * Applies board-size classes to the memory screen.
 * @param cardCount - Total number of cards on the board.
 */
function updateBoardClasses(cardCount: number) {
    const memoryRef = document.getElementById("memory");
    memoryRef?.classList.remove("memory--board-4", "memory--board-16");
    memoryRef?.classList.remove("memory--board-24", "memory--board-36");
    memoryRef?.classList.add(`memory--board-${cardCount}`);
}

/**
 * Applies theme and column styling to the cards grid.
 * @param theme - Selected theme id.
 * @param cardCount - Total number of cards on the board.
 */
function updateCardsGrid(theme: string, cardCount: number) {
    const cardsGrid = document.getElementById("cards");
    if (!cardsGrid) return;
    cardsGrid.classList.remove("cards--theme-code-vibes", "cards--theme-gaming");
    cardsGrid.classList.add(`cards--${theme}`);
    cardsGrid.style.gridTemplateColumns = `repeat(${getColumnCount(cardCount)}, 1fr)`;
}

/**
 * Returns the number of columns for a board size.
 * @param cardCount - Total number of cards on the board.
 * @returns Grid column count.
 */
function getColumnCount(cardCount: number) {
    if (cardCount === 4) return 2;
    if (cardCount === 16) return 4;
    return 6;
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

/**
 * Shuffles cards in place with the Fisher-Yates algorithm.
 * @param cards - Card image paths to shuffle.
 */
function shuffleCards(cards: string[]) {
    for (let i = cards.length - 1; i > 0; i--) {
        swapCards(cards, i, Math.floor(Math.random() * (i + 1)));
    }
}

/**
 * Swaps two entries inside the cards array.
 * @param cards - Card image paths.
 * @param first - First array index.
 * @param second - Second array index.
 */
function swapCards(cards: string[], first: number, second: number) {
    const temp = cards[first];
    cards[first] = cards[second];
    cards[second] = temp;
}

/**
 * Binds change handlers for one settings choice group.
 * @param option - Choice group suffix such as theme, player, or board.
 */
function bindChoiceGroup(option: string) {
    const boxes = document.querySelectorAll<HTMLInputElement>(`.choices__item--${option}`);
    boxes.forEach(box => bindChoice(box, boxes, option));
}

/**
 * Binds one choice input and updates selection-related UI on change.
 * @param box - Input to bind.
 * @param boxes - All inputs in the same group.
 * @param option - Choice group suffix.
 */
function bindChoice(box: HTMLInputElement, boxes: NodeListOf<HTMLInputElement>, option: string) {
    box.addEventListener("change", event => {
        const currentCheckbox = event.target as HTMLInputElement;
        checkedImg(currentCheckbox);
        updateChosenText(option, currentCheckbox);
        uncheckOtherBoxes(boxes, currentCheckbox);
        updateChosenState();
    });
}

/**
 * Unchecks all other inputs in a group and hides their preview images.
 * @param boxes - All inputs in the same group.
 * @param current - Currently selected input.
 */
function uncheckOtherBoxes(boxes: NodeListOf<HTMLInputElement>, current: HTMLInputElement) {
    if (!current.checked) return;
    boxes.forEach(other => {
        if (other === current) return;
        other.checked = false;
        uncheckedImg(other);
    });
}

/**
 * Updates the selected-settings summary text.
 * @param option - Choice group suffix.
 * @param checkbox - Selected input.
 */
function updateChosenText(option: string, checkbox: HTMLInputElement) {
    const chosenTextRef = document.getElementById("chosen__" + option);
    const text = getChoiceText(checkbox);
    if (chosenTextRef && text) chosenTextRef.textContent = text;
}

/**
 * Reads the visible label text for a choice input.
 * @param checkbox - Choice input.
 * @returns Label text, or undefined when no label text exists.
 */
function getChoiceText(checkbox: HTMLInputElement) {
    const label = checkbox.closest(".choices__label");
    return label?.querySelector(".choices__text")?.textContent;
}

/** Updates the selected-settings state and start button availability. */
function updateChosenState() {
    const isComplete = hasCompleteChoices();
    if (isComplete) document.querySelector(".chosen")?.classList.add("chosen--complete");
    updateStartButton(isComplete);
    updateChosenLines(isComplete);
}

/**
 * Checks whether theme, player, and board choices are all selected.
 * @returns True when all required settings are selected.
 */
function hasCompleteChoices() {
    return Boolean(getCheckedBox("theme") && getCheckedBox("player") && getCheckedBox("board"));
}

/**
 * Returns the checked input for a choice group.
 * @param option - Choice group suffix.
 * @returns Checked input, or null when nothing is selected.
 */
function getCheckedBox(option: string) {
    return document.querySelector<HTMLInputElement>(`.choices__item--${option}:checked`);
}

/**
 * Enables or disables the start button.
 * @param isComplete - Whether all required settings are selected.
 */
function updateStartButton(isComplete: boolean) {
    const startRef = document.getElementById("start") as HTMLButtonElement | null;
    if (startRef) startRef.disabled = !isComplete;
}

/**
 * Switches the summary separator graphics after all settings are selected.
 * @param isComplete - Whether all required settings are selected.
 */
function updateChosenLines(isComplete: boolean) {
    if (!isComplete) return;
    hideAll(".chosen__line");
    showAll(".chosen__line-3");
}

/**
 * Shows the preview image connected to the selected input.
 * @param currentCheckbox - Selected input.
 */
function checkedImg(currentCheckbox: HTMLInputElement) {
    getPreviewImg(currentCheckbox)?.classList.remove("d_none");
}

/**
 * Hides the preview image connected to an unselected input.
 * @param other - Unselected input.
 */
function uncheckedImg(other: HTMLInputElement) {
    getPreviewImg(other)?.classList.add("d_none");
}

/**
 * Gets the preview image element connected to a theme input.
 * @param checkbox - Theme input.
 * @returns Preview image element, or null when it does not exist.
 */
function getPreviewImg(checkbox: HTMLInputElement) {
    const themeName = checkbox.id.replace("theme-", "");
    return document.getElementById("preview-" + themeName);
}

/** Binds hover preview behavior for theme choices. */
function hoverPreview() {
    const themeBoxes = document.querySelectorAll<HTMLInputElement>(".choices__item--theme");
    themeBoxes.forEach(bindPreviewEvents);
}

/**
 * Binds mouseenter and mouseleave preview behavior to one theme choice.
 * @param checkbox - Theme input.
 */
function bindPreviewEvents(checkbox: HTMLInputElement) {
    const label = checkbox.closest(".choices__label");
    label?.addEventListener("mouseenter", () => showPreviewImg(checkbox));
    label?.addEventListener("mouseleave", showCheckedPreview);
}

/** Restores the preview image for the currently selected theme. */
function showCheckedPreview() {
    const checkedTheme = getCheckedBox("theme");
    if (checkedTheme) showPreviewImg(checkedTheme);
}

/**
 * Shows only the preview image connected to a theme input.
 * @param checkbox - Theme input.
 */
function showPreviewImg(checkbox: HTMLInputElement) {
    hideAll(".preview__img");
    getPreviewImg(checkbox)?.classList.remove("d_none");
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
    hideElement("memory");
    showElement("settings");
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
    hideElement("memory");
    showElement("settings");
}

/** Resets round state, score, and end screens. */
function resetGame() {
    flippedCard = [];
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
    setText("players__blue--score", `${blueScore}`);
    setText("players__orange--score", `${orangeScore}`);
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
    gameOverScreen();
    setWinnerHtml("BLUE PLAYER", "winner__blue--text", getWinIcon("blue"));
}

/** Shows the winner state for the orange player. */
function orangeWins() {
    gameOverScreen();
    setWinnerHtml("ORANGE PLAYER", "winner__draw--text", getWinIcon("orange"));
}

/** Shows the draw state. */
function draw() {
    gameOverScreen();
    setWinnerHtml("DRAW", "end-title", getDrawIcon(), "It's a");
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
    setText("final-blue-score", `${blueScore}`);
    setText("final-orange-score", `${orangeScore}`);
    document.getElementById("end-screen")?.classList.add("end-screen--open");
    setTimeout(winnerScreen, 1500);
}

/** Opens the winner screen after the game-over screen. */
function winnerScreen() {
    document.getElementById("winner")?.classList.add("winner--open");
}

/**
 * Hides an element by adding the d_none class.
 * @param id - Element id.
 */
function hideElement(id: string) {
    document.getElementById(id)?.classList.add("d_none");
}

/**
 * Shows an element by removing the d_none class.
 * @param id - Element id.
 */
function showElement(id: string) {
    document.getElementById(id)?.classList.remove("d_none");
}

/**
 * Hides every element matching a selector.
 * @param selector - CSS selector.
 */
function hideAll(selector: string) {
    document.querySelectorAll<HTMLElement>(selector).forEach(element => element.classList.add("d_none"));
}

/**
 * Shows every element matching a selector.
 * @param selector - CSS selector.
 */
function showAll(selector: string) {
    document.querySelectorAll<HTMLElement>(selector).forEach(element => element.classList.remove("d_none"));
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
