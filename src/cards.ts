/** Maps a theme id to the matching card image paths. */
interface CardsByTheme {
    [theme: string]: string[];
}

/** Maps a theme id to the matching card back image path. */
interface CardBackByTheme {
    [theme: string]: string;
}

const base = import.meta.env.BASE_URL;

/** Card back images used for the currently selected theme. */
export const cardBackByTheme: CardBackByTheme = {
    "theme-code-vibes": `${base}assets/icons/code_vibes/code vibes back.svg`,
    "theme-gaming": `${base}assets/icons/gaming/Back.svg`,
};

/** Front card images grouped by theme. Each selected image is duplicated for a matching pair. */
export const cardsByTheme: CardsByTheme = {
    "theme-code-vibes": [
        `${base}assets/icons/code_vibes/code vibe angular.svg`,
        `${base}assets/icons/code_vibes/code vibe boots.svg`,
        `${base}assets/icons/code_vibes/code vibe css.svg`,
        `${base}assets/icons/code_vibes/code vibe dja.svg`,
        `${base}assets/icons/code_vibes/code vibe firebase.svg`,
        `${base}assets/icons/code_vibes/code vibe git.svg`,
        `${base}assets/icons/code_vibes/code vibe github.svg`,
        `${base}assets/icons/code_vibes/code vibe html.svg`,
        `${base}assets/icons/code_vibes/code vibe js.svg`,
        `${base}assets/icons/code_vibes/code vibe node.svg`,
        `${base}assets/icons/code_vibes/code vibe phyton.svg`,
        `${base}assets/icons/code_vibes/code vibe react.svg`,
        `${base}assets/icons/code_vibes/code vibe sass.svg`,
        `${base}assets/icons/code_vibes/code vibe sql.svg`,
        `${base}assets/icons/code_vibes/code vibe terminal.svg`,
        `${base}assets/icons/code_vibes/code vibe ts.svg`,
        `${base}assets/icons/code_vibes/code vibe vsc.svg`,
        `${base}assets/icons/code_vibes/code vibe vue.svg`,
    ],
    "theme-gaming": [
        `${base}assets/icons/gaming/Ass.svg`,
        `${base}assets/icons/gaming/Banana.svg`,
        `${base}assets/icons/gaming/Circle.svg`,
        `${base}assets/icons/gaming/Coin.svg`,
        `${base}assets/icons/gaming/Controller.svg`,
        `${base}assets/icons/gaming/Gameboy.svg`,
        `${base}assets/icons/gaming/Kaese.svg`,
        `${base}assets/icons/gaming/Labyrinth.svg`,
        `${base}assets/icons/gaming/Level up.svg`,
        `${base}assets/icons/gaming/Mario.svg`,
        `${base}assets/icons/gaming/Minecraft.svg`,
        `${base}assets/icons/gaming/Pacman.svg`,
        `${base}assets/icons/gaming/Play.svg`,
        `${base}assets/icons/gaming/Puzzle.svg`,
        `${base}assets/icons/gaming/Rectangle.svg`,
        `${base}assets/icons/gaming/Snake.svg`,
        `${base}assets/icons/gaming/Triangle.svg`,
        `${base}assets/icons/gaming/Wuerfel.svg`,
    ],
};
