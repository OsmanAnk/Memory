import './styles/style.scss'

init()

function init() {
    const playRef = document.getElementById("play")
    playRef?.addEventListener("click", startGame);

    checkboxes("theme");
    checkboxes("player");
    checkboxes("board");
    hoverPreview();

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
            checkedImg(currentCheckbox)
            if (currentCheckbox.checked) {
                checkboxes.forEach((other) => {
                    if (other !== e.target) {
                        other.checked = false;
                        uncheckedImg(other)
                    }
                });
            }
        });
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
