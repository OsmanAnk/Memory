import { cardBackByTheme, cardsByTheme } from "../cards";

interface CardCallbacks {
    onMatch: () => void;
    onMismatch: () => void;
}

let flippedCard: HTMLButtonElement[] = [];
let cardCallbacks: CardCallbacks | null = null;

/**
 * Creates and renders the board for the selected theme and size.
 * @param theme - Selected theme id.
 * @param board - Selected board-size input id.
 * @returns Total number of rendered cards.
 */
export function startCardGame(theme: string, board: string) {
    const cardCount = Number(board.replace("board-size-", ""));
    const cards = createGameCards(theme, cardCount);
    renderCards(cards, cardBackByTheme[theme]);
    updateBoardClasses(cardCount);
    updateCardsGrid(theme, cardCount);
    return cardCount;
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

/**
 * Binds delegated card click handling to the card grid.
 * @param callbacks - Functions that run after a match or mismatch.
 */
export function initCardsClick(callbacks: CardCallbacks) {
    cardCallbacks = callbacks;
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
 * Marks a matching pair and runs the match callback.
 * @param firstCard - First flipped card.
 * @param secondCard - Second flipped card.
 */
function matchPair(firstCard: HTMLButtonElement, secondCard: HTMLButtonElement) {
    firstCard.classList.add("is-matched");
    secondCard.classList.add("is-matched");
    resetFlippedCards();
    cardCallbacks?.onMatch();
}

/**
 * Flips a non-matching pair back and runs the mismatch callback.
 * @param firstCard - First flipped card.
 * @param secondCard - Second flipped card.
 */
function resetPair(firstCard: HTMLButtonElement, secondCard: HTMLButtonElement) {
    firstCard.classList.remove("is-flipped");
    secondCard.classList.remove("is-flipped");
    resetFlippedCards();
    cardCallbacks?.onMismatch();
}

/** Clears the currently flipped cards. */
export function resetFlippedCards() {
    flippedCard = [];
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
