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
img.src = 'https://raw.githubusercontent.com/frasermccarter/Canvas-Designer/refs/heads/main/Images/500x400.png'; // Replace with your image source
img.onload = () => {
    redrawCanvas();
};

// Default text properties
let currentFontColor = 'black';
let currentFontSize = '30px';
let currentFontStyle = 'Arial';
let currentFontBold = false;
let currentFontItalic = false;

// Function to add text
function addText(text, x, y) {
    texts.push({ text, x, y, fontColor: currentFontColor, fontSize: currentFontSize, fontStyle: currentFontStyle, isBold: currentFontBold, isItalic: currentFontItalic });
    redrawCanvas();
}

// Function to delete the selected text
function deleteText() {
    if (selectedText) {
        texts = texts.filter(t => t !== selectedText);

        redrawCanvas(); // Redraw the canvas to reflect changes
        updateTextBoxPosition(); // Update textbox position
        selectedText = null; // Clear the selection
        textBox.style.display = 'none'; // Hide the text box
        cursor.style.display = 'none'; // Hide the cursor
        clearInterval(cursorBlinkInterval); // Stop cursor blinking
    }
}

// Redraw the canvas
function redrawCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    texts.forEach(t => {
        ctx.font = `${t.isBold ? 'bold' : 'normal'} ${t.isItalic ? 'italic' : 'normal'} ${t.fontSize} ${t.fontStyle}`;
        ctx.fillStyle = t.fontColor;
        ctx.fillText(t.text, t.x, t.y);
    });
}

// Add text to canvas when button clicked
document.getElementById('addTextBtn').addEventListener('click', () => {
    addText('text', 50, 50); // Add text box with default text 'text'
});

// Delete text from canvas when button clicked
document.getElementById('deleteTextBtn').addEventListener('click', () => {
    deleteText();
});

// Function to get text under mouse
function getTextAtPosition(x, y) {
    for (let i = texts.length - 1; i >= 0; i--) {
        let t = texts[i];
        ctx.font = `${t.isBold ? 'bold' : 'normal'} ${t.isItalic ? 'italic' : 'normal'} ${t.fontSize} ${t.fontStyle}`;
        let width = ctx.measureText(t.text).width;
        let height = parseInt(t.fontSize, 10); // Height based on font size
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
        selectedText = clickedText;
        dragOffsetX = mouseX - selectedText.x;
        dragOffsetY = mouseY - selectedText.y;
        cursorPosition = selectedText.text.length;
        updateTextBoxPosition();
        startCursorBlink();

        // Set hotbar values to the selected text properties
        setHotbarValues(selectedText);
    } else {
        selectedText = null;
        textBox.style.display = 'none';
        cursor.style.display = 'none';
        clearInterval(cursorBlinkInterval);
    }
});

// Function to set hotbar values based on selected text
function setHotbarValues(text) {
    // Set color
    document.getElementById('colorSelect').value = text.fontColor;

    // Set font size
    const sizeMapping = {
        '20px': 'small',
        '30px': 'medium',
        '40px': 'large'
    };
    // Reverse mapping to find the corresponding size option
    const selectedSize = Object.entries(sizeMapping).find(([key, value]) => key === text.fontSize);
    document.getElementById('fontSizeSelect').value = selectedSize ? selectedSize[1] : 'medium'; // Default to 'medium'

    // Set font style
    const styleMapping = {
        'Arial': 'regular',
        'Courier New': 'simple',
        'Times New Roman': 'fancy'
    };
    // Reverse mapping to find the corresponding style option
    const selectedStyle = Object.entries(styleMapping).find(([key, value]) => key === text.fontStyle);
    document.getElementById('fontStyleSelect').value = selectedStyle ? selectedStyle[1] : 'regular'; // Default to 'regular'

    // Set bold and italic buttons
    currentFontBold = text.isBold;
    document.getElementById('boldBtn').classList.toggle('active', currentFontBold);

    currentFontItalic = text.isItalic;
    document.getElementById('italicBtn').classList.toggle('active', currentFontItalic);
}

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
            cursor.style.display = 'none';
            clearInterval(cursorBlinkInterval);
            return;
        } else if (e.key.length === 1) {
            selectedText.text = selectedText.text.slice(0, cursorPosition) + e.key + selectedText.text.slice(cursorPosition);
            cursorPosition++;
        } else if (e.key === 'ArrowLeft') {
            cursorPosition = Math.max(0, cursorPosition - 1);
        } else if (e.key === 'ArrowRight') {
            cursorPosition = Math.min(selectedText.text.length, cursorPosition + 1);
        }

        redrawCanvas();
        updateTextBoxPosition();
        updateCursorPosition();
    }
});

// Function to update the position and size of the text box
function updateTextBoxPosition() {
    if (selectedText) {
        ctx.font = `${selectedText.isBold ? 'bold' : 'normal'} ${selectedText.isItalic ? 'italic' : 'normal'} ${selectedText.fontSize} ${selectedText.fontStyle}`;
        let width = ctx.measureText(selectedText.text).width;
        let height = parseInt(selectedText.fontSize, 10);

        textBox.style.left = (selectedText.x + canvas.offsetLeft) + 'px';
        textBox.style.top = (selectedText.y - height + canvas.offsetTop) + 'px';
        textBox.style.width = width + 'px';
        textBox.style.height = height + 'px';
        textBox.style.display = 'block';

        updateCursorPosition();
    }
}

// Update cursor position based on the current text
function updateCursorPosition() {
    if (selectedText) {
        ctx.font = `${selectedText.isBold ? 'bold' : 'normal'} ${selectedText.isItalic ? 'italic' : 'normal'} ${selectedText.fontSize} ${selectedText.fontStyle}`;
        const textBeforeCursor = selectedText.text.slice(0, cursorPosition);
        const cursorX = selectedText.x + ctx.measureText(textBeforeCursor).width;

        // Calculate text height
        const textHeight = parseInt(selectedText.fontSize, 10);
        const cursorY = selectedText.y - textHeight + (textHeight * 0.2); // Adjust for baseline

        // Set cursor length to 0.8 times the font height
        const cursorLength = textHeight * 0.8;

        // Update cursor styles
        cursor.style.width = `${2}px`; // Set cursor width (thickness)
        cursor.style.height = `${cursorLength}px`; // Set cursor length
        cursor.style.left = (cursorX + canvas.offsetLeft) + 'px';
        cursor.style.top = (cursorY + canvas.offsetTop) + 'px';
        cursor.style.display = 'block';
    }
}

// Start cursor blinking
function startCursorBlink() {
    clearInterval(cursorBlinkInterval);
    cursor.style.display = 'block'; // Show cursor
}

// Handle color selection
document.getElementById('colorSelect').addEventListener('change', (e) => {
    currentFontColor = e.target.value; // Update the current font color
    if (selectedText) {
        selectedText.fontColor = currentFontColor; // Update selected text color
        redrawCanvas(); // Redraw canvas to reflect changes
        updateTextBoxPosition(); // Update textbox position
    }
});

// Handle font size selection
document.getElementById('fontSizeSelect').addEventListener('change', (e) => {
    const sizeMapping = {
        small: '20px',
        medium: '30px',
        large: '40px'
    };
    currentFontSize = sizeMapping[e.target.value] || '30px'; // Update current font size
    if (selectedText) {
        selectedText.fontSize = currentFontSize; // Update selected text color
        redrawCanvas(); // Redraw canvas to reflect changes
        updateTextBoxPosition(); // Update textbox position
        updateCursorPosition(); // Update cursor position
    }
});

// Handle font style selection
document.getElementById('fontStyleSelect').addEventListener('change', (e) => {
    const styleMapping = {
        regular: 'Arial',
        simple: 'Courier New',
        fancy: 'Times New Roman'
    };

    currentFontStyle = styleMapping[e.target.value] || 'Arial';
    if (selectedText) {
        selectedText.fontStyle = currentFontStyle
        redrawCanvas(); // Redraw canvas
        updateTextBoxPosition(); // Update textbox position
        updateCursorPosition(); // Update cursor position
    }
});

// Handle bold button
document.getElementById('boldBtn').addEventListener('click', () => {
    currentFontBold = !currentFontBold; // Toggle bold
    document.getElementById('boldBtn').classList.toggle('active', currentFontBold);
    if (selectedText) {
        selectedText.isBold = currentFontBold; // Update selected text color
        redrawCanvas(); // Redraw canvas to reflect changes
        updateTextBoxPosition(); // Update textbox position
    }
});

// Handle italic button
document.getElementById('italicBtn').addEventListener('click', () => {
    currentFontItalic = !currentFontItalic; // Toggle italic
    document.getElementById('italicBtn').classList.toggle('active', currentFontItalic);
    if (selectedText) {
        selectedText.isItalic = currentFontItalic; // Update selected text color
        redrawCanvas(); // Redraw canvas to reflect changes
        updateTextBoxPosition(); // Update textbox position
    }
});

// Save as PNG button
document.getElementById('savePngBtn').addEventListener('click', () => {
    const link = document.createElement('a');
    link.download = 'canvas-image.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
});

// Enable typing in the canvas when text is selected
canvas.addEventListener('click', (e) => {
    if (selectedText) {
        canvas.focus();
    }
});

// Prevent default behavior for keydown event
canvas.setAttribute('tabindex', '0');
canvas.focus();
