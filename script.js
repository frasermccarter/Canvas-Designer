const canvas = document.getElementById('imageCanvas');
const ctx = canvas.getContext('2d');
const textBox = document.getElementById('text-box');
const cursor = document.getElementById('cursor');
let texts = [];
let selectedText = null;
let dragging = false;
let dragOffsetX = 0;
let dragOffsetY = 0;
let cursorPosition = 0;
let cursorBlinkInterval;

// Load the image
const img = new Image();
img.crossOrigin = 'Anonymous';
img.src = 'Images/500x400.png'; // Replace with your image source
img.onload = () => {
    redrawCanvas();
};

// Function to add text
function addText(text, x, y) {
    texts.push({ text: text, x: x, y: y });
    redrawCanvas();
}

// Redraw the canvas
function redrawCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);  // Clear the entire canvas
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);  // Redraw the background image

    texts.forEach(t => {
        ctx.font = '30px Arial';
        ctx.fillStyle = 'black';
        ctx.fillText(t.text, t.x, t.y);
    });
}

// Add text to canvas when button clicked
document.getElementById('addTextBtn').addEventListener('click', () => {
    addText('text', 50, 50); // Add text box with default text 'text'
});

// Function to get text under mouse
function getTextAtPosition(x, y) {
    for (let i = texts.length - 1; i >= 0; i--) {
        let t = texts[i];
        ctx.font = '30px Arial';
        let width = ctx.measureText(t.text).width;
        let height = 30; // Approximate height
        if (x >= t.x && x <= t.x + width && y >= t.y - height && y <= t.y) {
            return t;
        }
    }
    return null;
}

// Canvas mouse down event
canvas.addEventListener('mousedown', (e) => {
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const clickedText = getTextAtPosition(mouseX, mouseY);

    if (clickedText) {
        dragging = true;
        selectedText = clickedText; // Set the selected text
        dragOffsetX = mouseX - selectedText.x;
        dragOffsetY = mouseY - selectedText.y;
        cursorPosition = clickedText.text.length; // Reset cursor position to end of text
        updateTextBoxPosition(); // Update the text box position
        startCursorBlink(); // Start blinking cursor
    } else {
        // Clicked outside any text, deselect
        selectedText = null;
        textBox.style.display = 'none';
        cursor.style.display = 'none'; // Hide cursor
        clearInterval(cursorBlinkInterval);
    }
});

// Canvas mouse move event
canvas.addEventListener('mousemove', (e) => {
    if (dragging && selectedText) {
        const rect = canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        selectedText.x = mouseX - dragOffsetX;
        selectedText.y = mouseY - dragOffsetY;

        redrawCanvas();
        updateTextBoxPosition();
    }
});

// Canvas mouse up event
canvas.addEventListener('mouseup', () => {
    dragging = false;
});

// Update text when input changes
canvas.addEventListener('keydown', (e) => {
    if (selectedText) {
        if (e.key === 'Backspace') {
            selectedText.text = selectedText.text.slice(0, cursorPosition - 1) + selectedText.text.slice(cursorPosition);
            cursorPosition = Math.max(0, cursorPosition - 1);
        } else if (e.key === 'Enter') {
            selectedText = null;
            textBox.style.display = 'none';
            cursor.style.display = 'none'; // Hide cursor
            clearInterval(cursorBlinkInterval);
            return; // Prevent further processing
        } else if (e.key.length === 1) { // To check for single character
            selectedText.text = selectedText.text.slice(0, cursorPosition) + e.key + selectedText.text.slice(cursorPosition);
            cursorPosition++;
        } else if (e.key === 'ArrowLeft') {
            cursorPosition = Math.max(0, cursorPosition - 1);
        } else if (e.key === 'ArrowRight') {
            cursorPosition = Math.min(selectedText.text.length, cursorPosition + 1);
        }

        redrawCanvas();
        updateTextBoxPosition();
        updateCursorPosition(); // Update cursor position
    }
});

// Function to update the position and size of the text box
function updateTextBoxPosition() {
    if (selectedText) {
        ctx.font = '30px Arial';
        let width = ctx.measureText(selectedText.text).width;
        let height = 30; // Approximate height

        // Position the dotted box relative to the canvas container
        textBox.style.left = (selectedText.x + canvas.offsetLeft) + 'px';
        textBox.style.top = (selectedText.y - height + canvas.offsetTop) + 'px';
        textBox.style.width = width + 'px';
        textBox.style.height = height + 'px';
        textBox.style.display = 'block';

        updateCursorPosition(); // Update cursor position whenever the text box is updated
    }
}

// Update cursor position based on the current text
function updateCursorPosition() {
    if (selectedText) {
        ctx.font = '30px Arial';
        const textBeforeCursor = selectedText.text.slice(0, cursorPosition);
        const cursorX = selectedText.x + ctx.measureText(textBeforeCursor).width;
        const cursorY = selectedText.y - 30; // Adjust for cursor height

        cursor.style.left = (cursorX + canvas.offsetLeft) + 'px';
        cursor.style.top = cursorY + canvas.offsetTop + 'px';
        cursor.style.display = 'block'; // Show cursor
    }
}

// Start cursor blinking
function startCursorBlink() {
    clearInterval(cursorBlinkInterval);
    cursor.style.display = 'block'; // Show cursor initially
    cursorBlinkInterval = setInterval(() => {
        cursor.style.display = 'block';
    }, 500); // Blink every 500ms
}

document.getElementById('savePngBtn').addEventListener('click', () => {
    const link = document.createElement('a');
    link.download = 'canvas-image.png'; // Name of the file
    link.href = canvas.toDataURL('image/png'); // Convert canvas to PNG
    link.click(); // Trigger the download
});

// Enable typing in the canvas when text is selected
canvas.addEventListener('click', (e) => {
    if (selectedText) {
        canvas.focus();
    }
});

// Prevent default behavior for keydown event
canvas.setAttribute('tabindex', '0'); // Make the canvas focusable
