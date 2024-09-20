document.addEventListener('DOMContentLoaded', () => {
  // Create file input for image upload
  const fileInput = document.createElement('input');
  fileInput.type = 'file';
  fileInput.accept = 'image/*';
  fileInput.style.display = 'block';
  fileInput.style.margin = '10px auto';
  document.body.appendChild(fileInput);

  // Create image element to hold the uploaded image
  const img = new Image();

  // Create and append canvas (initially hidden)
  const canvas = document.createElement('canvas');
  canvas.style.border = '1px solid #000';
  canvas.style.display = 'none';
  canvas.style.maxWidth = '100%';
  canvas.style.width = '400px';
  canvas.style.height = 'auto';
  canvas.style.margin = '0 auto';
  document.body.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  let isDrawing = false;
  let currentPath = [];
  let paths = [];

  // Function to handle image upload
  fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onload = (event) => {
      img.onload = () => {
        // Set canvas size to match image aspect ratio
        const aspectRatio = img.width / img.height;
        canvas.width = 400;
        canvas.height = canvas.width / aspectRatio;
        
        // Draw image on canvas
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        // Show canvas and hide file input
        canvas.style.display = 'block';
        fileInput.style.display = 'none';
      };
      img.src = event.target.result;
    };

    reader.readAsDataURL(file);
  });

  // Function to draw all paths
  function drawPaths() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    paths.forEach(path => {
      ctx.beginPath();
      ctx.moveTo(path[0].x, path[0].y);
      for (let i = 1; i < path.length; i++) {
        ctx.lineTo(path[i].x, path[i].y);
      }
      ctx.closePath();
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.fill();
      ctx.stroke();
    });
  }

  // Function to draw the current path
  function drawCurrentPath() {
    ctx.beginPath();
    ctx.moveTo(currentPath[0].x, currentPath[0].y);
    for (let i = 1; i < currentPath.length; i++) {
      ctx.lineTo(currentPath[i].x, currentPath[i].y);
    }
    ctx.stroke();
  }

  // Event listeners
  canvas.addEventListener('mousedown', (e) => {
    isDrawing = true;
    currentPath = [{x: e.offsetX, y: e.offsetY}];
    ctx.beginPath();
    ctx.moveTo(e.offsetX, e.offsetY);
  });

  canvas.addEventListener('mousemove', (e) => {
    if (!isDrawing) return;
    currentPath.push({x: e.offsetX, y: e.offsetY});
    drawPaths();
    drawCurrentPath();
  });

  canvas.addEventListener('mouseup', () => {
    isDrawing = false;
    paths.push(currentPath);
    drawPaths();
  });

  // Remove the download button code

  // Add title and instructions
  const title = document.createElement('h1');
  title.textContent = 'Image Mask Generator';
  document.body.insertBefore(title, canvas);

  const instructions = document.createElement('p');
  instructions.textContent = 'Upload an image, then click and drag to draw a custom mask. Release to finalize and fill. You can draw multiple masks. Enter a prompt and click "Generate" to create a new image.';
  document.body.insertBefore(instructions, fileInput);

  // Add prompt input and generate button
  const promptInput = document.createElement('input');
  promptInput.type = 'text';
  promptInput.placeholder = 'Enter your prompt here';
  promptInput.style.display = 'block';
  promptInput.style.margin = '10px auto';
  promptInput.style.width = '80%';
  promptInput.style.padding = '5px';
  document.body.appendChild(promptInput);

  const generateBtn = document.createElement('button');
  generateBtn.textContent = 'Generate';
  generateBtn.style.display = 'block';
  generateBtn.style.margin = '10px auto';
  document.body.appendChild(generateBtn);

  generateBtn.addEventListener('click', () => {
    // Create mask image
    const maskCanvas = document.createElement('canvas');
    maskCanvas.width = canvas.width;
    maskCanvas.height = canvas.height;
    const maskCtx = maskCanvas.getContext('2d');

    // Set white background
    maskCtx.fillStyle = 'white';
    maskCtx.fillRect(0, 0, maskCanvas.width, maskCanvas.height);

    // Draw black masks
    maskCtx.fillStyle = 'black';
    paths.forEach(path => {
      maskCtx.beginPath();
      maskCtx.moveTo(path[0].x, path[0].y);
      for (let i = 1; i < path.length; i++) {
        maskCtx.lineTo(path[i].x, path[i].y);
      }
      maskCtx.closePath();
      maskCtx.fill();
    });

    // Convert mask canvas to blob
    maskCanvas.toBlob(maskBlob => {
      const maskFile = new File([maskBlob], 'mask.png', { type: 'image/png' });
      
      // Get the original uploaded image file
      const uploadFile = fileInput.files[0];

      // Send message with attachments
      window.Poe.sendMessage(`@generativeFill ${promptInput.value}`, { attachments: [uploadFile, maskFile] });
    }, 'image/png');
  });

  // Add some basic styling
  document.body.style.fontFamily = 'Arial, sans-serif';
  document.body.style.maxWidth = '800px';
  document.body.style.margin = '0 auto';
  document.body.style.padding = '20px';
  title.style.textAlign = 'center';
  instructions.style.textAlign = 'center';
});
