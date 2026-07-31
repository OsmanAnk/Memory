interface CardsByTheme {
    [theme: string]: string[];
}

const base = import.meta.env.BASE_URL;

export const cardBack = `${base}assets/icons/code_vibes/code vibes back.svg`;

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
    "theme-gaming": [],
    "theme-da-projects": [],
    "theme-foods": [],
};
