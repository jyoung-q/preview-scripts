
        const canvas = document.getElementById('drawingCanvas');
        const ctx = canvas.getContext('2d');
        const description = document.getElementById('description');
        const clearBtn = document.getElementById('clearBtn');
        const generateBtn = document.getElementById('generateBtn');
        let isDrawing = false;
        // Set initial background to white
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        canvas.addEventListener('mousedown', startDrawing);
        canvas.addEventListener('mousemove', draw);
        canvas.addEventListener('mouseup', stopDrawing);
        canvas.addEventListener('mouseout', stopDrawing);
        clearBtn.addEventListener('click', clearCanvas);
        generateBtn.addEventListener('click', generateImage);
        function startDrawing(e) {
            isDrawing = true;
            draw(e);
        }
        function draw(e) {
            if (!isDrawing) return;
            ctx.lineWidth = 2;
            ctx.lineCap = 'round';
            ctx.strokeStyle = 'black';
            ctx.lineTo(e.clientX - canvas.offsetLeft, e.clientY - canvas.offsetTop);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(e.clientX - canvas.offsetLeft, e.clientY - canvas.offsetTop);
        }
        function stopDrawing() {
            isDrawing = false;
            ctx.beginPath();
        }
        function clearCanvas() {
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
        function generateImage() {
            const imageData = canvas.toDataURL('image/png');
            const descText = description.value;
            // Convert base64 to blob
            fetch(imageData)
                .then(res => res.blob())
                .then(blob => {
                    const file = new File([blob], 'drawing.png', { type: 'image/png' });
                    window.Poe.sendMessage("@scribbleToDrawing " + descText, { attachments: [file] });
                });
        }
