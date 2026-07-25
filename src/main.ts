import './styles/style.scss'

init()

function init() {
    const playRef = document.getElementById("play")
    playRef?.addEventListener("click", startGame);

    checkboxes("theme");
    checkboxes("player");
    checkboxes("board");

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
    homeRef?.classList.add("d_none")

    const settingsRef = document.getElementById("settings")
    settingsRef?.classList.remove("d_none")
}

function checkboxes(option: string) {
    const checkboxes = document.querySelectorAll<HTMLInputElement>(".choices__item--" + option);
    checkboxes.forEach((box) => {
        box.addEventListener("change", (e) => {
            const currentCheckbox = e.target as HTMLInputElement;

            if (currentCheckbox.checked) {
                checkboxes.forEach((other) => {
                    if (other !== e.target) {
                        other.checked = false;
                    }
                });
            }
        });
    });
}