import { viewport } from "../main";

function downloadScreenshot(base64Image, filename) {
  const link = document.createElement("a");
  link.href = base64Image;
  link.download = filename;
  link.click();
}

export const handleScreenshot = (event) => {
  event.preventDefault();

  const screenshot = viewport.getScreenshot(); // the viewport.getScreenshot() returns a base64-encoded image

  // Get the current date and format it as DDMMYY
  const currentDate = new Date();
  const day = String(currentDate.getDate()).padStart(2, "0");
  const month = String(currentDate.getMonth() + 1).padStart(2, "0"); // getMonth() returns 0-11
  const year = String(currentDate.getFullYear()).slice(-2); // Get last two digits of the year

  const date = `${day}${month}${year}`;

  // Create the dynamic filename
  const fileName = `MIKASA_Cabinet_${date}.jpeg`;

  downloadScreenshot(screenshot, fileName);
};
