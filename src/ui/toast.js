/**
 * Tiny replacement for the toastr dependency: same idea, four lines of state.
 */

const DISPLAY_MS = 3200;

export function createToaster(container) {
    return function toast(message, type = 'info') {
        const element = document.createElement('div');
        element.className = `toast toast--${type}`;
        element.textContent = message;
        container.append(element);

        const remove = () => {
            element.classList.add('toast--leaving');
            element.addEventListener('transitionend', () => element.remove(), { once: true });
        };

        setTimeout(remove, DISPLAY_MS);
        element.addEventListener('click', remove);
    };
}
