export function createTooltip(element) {
    const tooltipText = element.getAttribute("data-tooltip");

    if (tooltipText) {
        // Remove the native title attribute to disable the default tooltip
        element.removeAttribute("title");

        // Create the tooltip
        const tooltip = document.createElement("div");
        tooltip.className = "customTooltip";
        tooltip.textContent = tooltipText;

        // Attach tooltip to the body
        document.body.appendChild(tooltip);
        element.tooltipInstance = tooltip;

        // Show tooltip on hover
        element.addEventListener("mouseenter", (event) => {
            if (element.tooltipInstance) {
                const rect = element.getBoundingClientRect();
                element.tooltipInstance.style.left = `${rect.left -40}px`;
                element.tooltipInstance.style.top = `${rect.top + 20}px`;
                element.tooltipInstance.style.visibility = "visible";
                element.tooltipInstance.style.opacity = "1";
            }
        });

        // Hide tooltip on mouse leave
        element.addEventListener("mouseleave", () => {
            if (element.tooltipInstance) {
                element.tooltipInstance.style.visibility = "hidden";
                element.tooltipInstance.style.opacity = "0";
            }
        });
    }
}