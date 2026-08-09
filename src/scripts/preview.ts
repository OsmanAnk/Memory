/**
 * Shows or hides the preview image connected to a theme input.
 * @param checkbox - Theme input.
 * @param isVisible - Whether the preview image should be visible.
 */
export function setPreviewVisibility(checkbox: HTMLInputElement, isVisible: boolean) {
    getPreviewImg(checkbox)?.classList.toggle("d_none", !isVisible);
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
export function hoverPreview() {
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
    const checkedTheme = document.querySelector<HTMLInputElement>(".choices__item--theme:checked");
    if (checkedTheme) showPreviewImg(checkedTheme);
}

/**
 * Shows only the preview image connected to a theme input.
 * @param checkbox - Theme input.
 */
function showPreviewImg(checkbox: HTMLInputElement) {
    document.querySelectorAll<HTMLElement>(".preview__img").forEach(element => element.classList.add("d_none"));
    setPreviewVisibility(checkbox, true);
}
