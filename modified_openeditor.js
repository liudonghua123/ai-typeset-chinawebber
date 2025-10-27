function openneweditor(url) {
// Create a temporary anchor element to simulate a:href behavior
const link = document.createElement('a');
link.href = url;
link.target = '_blank';  // Open in new tab/window like a normal link
link.rel = 'noopener noreferrer'; // Security best practice

// Append to body, click, and remove
document.body.appendChild(link);
link.click();
document.body.removeChild(link);
}