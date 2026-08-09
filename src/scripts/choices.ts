import { setPreviewVisibility } from "./preview";

/**
 * Returns the id of the checked choice for a settings group.
 * @param option - Choice group suffix such as theme, player, or board.
 * @returns The selected input id.
 */
export function getCheckedId(option: string) {
    const selector = `.choices__item--${option}:checked`;
    return document.querySelector<HTMLInputElement>(selector)!.id;
}

/**
 * Binds change handlers for one settings choice group.
 * @param option - Choice group suffix such as theme, player, or board.
 */
export function bindChoiceGroup(option: string) {
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
        setPreviewVisibility(currentCheckbox, true);
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
        setPreviewVisibility(other, false);
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
    document.querySelectorAll<HTMLElement>(".chosen__line").forEach(element => element.classList.add("d_none"));
    document.querySelectorAll<HTMLElement>(".chosen__line-3").forEach(element => element.classList.remove("d_none"));
}
