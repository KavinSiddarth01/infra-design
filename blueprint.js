// 2D Floor Plan Blueprint Generation

const roomColors = {
    hall: '#fbbf24',
    dining: '#ef4444',
    kitchen: '#f97316',
    bedroom: '#8b5cf6',
    bathroom: '#10b981',
    toilet: '#06b6d4',
    garden: '#22c55e',
    balcony: '#a78bfa',
    storeRoom: '#94a3b8'
};

function generateFloorPlan(floorName, rooms, plotWidth, plotHeight, isGroundFloor) {
    const canvasId = `canvas-${floorName.replace(' ', '-').toLowerCase()}`;
    
    const html = `
        <div class="floor-plan">
            <h3 class="floor-title">
                ${isGroundFloor ? '📐' : '🏢'} ${floorName}
            </h3>
            <div class="floor-canvas-container">
                <canvas id="${canvasId}" class="floor-canvas"></canvas>
            </div>
        </div>
    `;
    
    // Render after adding to DOM
    setTimeout(() => {
        renderFloorPlan(canvasId, rooms, plotWidth, plotHeight, isGroundFloor);
    }, 100);
    
    return html;
}

function renderFloorPlan(canvasId, rooms, plotWidth, plotHeight, isGroundFloor) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const scale = 8; // pixels per foot
    const padding = 60;
    
    canvas.width = plotWidth * scale + padding * 2;
    canvas.height = plotHeight * scale + padding * 2;
    
    // Clear canvas
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw outer boundary
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 3;
    ctx.strokeRect(padding, padding, plotWidth * scale, plotHeight * scale);
    
    // Draw compass
    drawCompass(ctx, padding - 40, padding + 20);
    
    // Draw dimension labels
    drawDimensions(ctx, plotWidth, plotHeight, scale, padding);
    
    // Create room layout
    const roomLayout = createRoomLayout(rooms, plotWidth, plotHeight);
    
    // Draw rooms
    roomLayout.forEach(room => {
        drawRoom(ctx, room, scale, padding);
    });
    
    // Draw grid
    drawGrid(ctx, plotWidth, plotHeight, scale, padding);
}

function createRoomLayout(rooms, plotWidth, plotHeight) {
    const layout = [];
    let currentY = 0;
    
    const roomTypeMapping = {
        halls: 'hall',
        dining: 'dining',
        kitchens: 'kitchen',
        bedrooms: 'bedroom',
        bathrooms: 'bathroom',
        toilets: 'toilet',
        gardens: 'garden',
        balconies: 'balcony',
        storeRooms: 'storeRoom'
    };
    
    // Get all rooms to place
    const roomsToPlace = [];
    Object.keys(rooms).forEach(key => {
        const count = rooms[key] || 0;
        const sizeKey = roomTypeMapping[key];
        if (count > 0 && sizeKey) {
            for (let i = 0; i < count; i++) {
                const size = appState.roomSizes[sizeKey];
                roomsToPlace.push({
                    type: sizeKey,
                    label: key.charAt(0).toUpperCase() + key.slice(1, -1),
                    width: Math.min(size.width, plotWidth),
                    height: Math.min(size.height, plotHeight),
                    number: count > 1 ? i + 1 : null
                });
            }
        }
    });
    
    // Sort rooms by area (largest first)
    roomsToPlace.sort((a, b) => (b.width * b.height) - (a.width * a.height));
    
    // Simple layout algorithm - row-based placement
    let currentRow = [];
    let currentRowWidth = 0;
    let currentRowHeight = 0;
    
    roomsToPlace.forEach(room => {
        if (currentRowWidth + room.width > plotWidth || currentRow.length >= 3) {
            // Place current row
            placeRow(layout, currentRow, currentY, plotWidth);
            currentY += currentRowHeight;
            currentRow = [];
            currentRowWidth = 0;
            currentRowHeight = 0;
        }
        
        currentRow.push(room);
        currentRowWidth += room.width;
        currentRowHeight = Math.max(currentRowHeight, room.height);
    });
    
    // Place remaining row
    if (currentRow.length > 0) {
        placeRow(layout, currentRow, currentY, plotWidth);
    }
    
    return layout;
}

function placeRow(layout, row, startY, plotWidth) {
    let currentX = 0;
    const rowHeight = Math.max(...row.map(r => r.height));
    
    row.forEach(room => {
        layout.push({
            ...room,
            x: currentX,
            y: startY,
            height: rowHeight // Normalize height in row
        });
        currentX += room.width;
    });
}

function drawRoom(ctx, room, scale, padding) {
    const x = padding + room.x * scale;
    const y = padding + room.y * scale;
    const width = room.width * scale;
    const height = room.height * scale;
    
    // Fill room
    ctx.fillStyle = roomColors[room.type] || '#e2e8f0';
    ctx.fillRect(x, y, width, height);
    
    // Room border
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, width, height);
    
    // Room label
    ctx.fillStyle = '#1e293b';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    const label = room.number ? `${room.label} ${room.number}` : room.label;
    ctx.fillText(label, x + width / 2, y + height / 2 - 10);
    
    // Room dimensions
    ctx.font = '12px Arial';
    ctx.fillText(`${Math.round(room.width)}' × ${Math.round(room.height)}'`, x + width / 2, y + height / 2 + 10);
}

function drawCompass(ctx, x, y) {
    const size = 30;
    
    // Circle
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fillStyle = '#f8fafc';
    ctx.fill();
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // North arrow
    ctx.beginPath();
    ctx.moveTo(x, y - size);
    ctx.lineTo(x - 8, y);
    ctx.lineTo(x + 8, y);
    ctx.closePath();
    ctx.fillStyle = '#ef4444';
    ctx.fill();
    
    // N label
    ctx.fillStyle = '#1e293b';
    ctx.font = 'bold 12px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('N', x, y - size - 15);
    
    // E, S, W labels
    ctx.font = '10px Arial';
    ctx.fillText('E', x + size + 10, y);
    ctx.fillText('S', x, y + size + 12);
    ctx.fillText('W', x - size - 10, y);
}

function drawDimensions(ctx, width, height, scale, padding) {
    ctx.strokeStyle = '#64748b';
    ctx.fillStyle = '#64748b';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.lineWidth = 1;
    
    // Top dimension
    const topY = padding - 25;
    ctx.beginPath();
    ctx.moveTo(padding, topY);
    ctx.lineTo(padding + width * scale, topY);
    ctx.stroke();
    
    // Top arrows
    drawArrow(ctx, padding, topY, -5, 0);
    drawArrow(ctx, padding + width * scale, topY, 5, 0);
    
    ctx.fillText(`${Math.round(width)}'`, padding + (width * scale) / 2, topY - 10);
    
    // Left dimension
    const leftX = padding - 25;
    ctx.beginPath();
    ctx.moveTo(leftX, padding);
    ctx.lineTo(leftX, padding + height * scale);
    ctx.stroke();
    
    // Left arrows
    drawArrow(ctx, leftX, padding, 0, -5);
    drawArrow(ctx, leftX, padding + height * scale, 0, 5);
    
    ctx.save();
    ctx.translate(leftX - 10, padding + (height * scale) / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText(`${Math.round(height)}'`, 0, 0);
    ctx.restore();
}

function drawArrow(ctx, x, y, dx, dy) {
    const size = 5;
    ctx.beginPath();
    ctx.moveTo(x, y);
    if (dx !== 0) {
        ctx.lineTo(x + (dx > 0 ? -size : size), y - size);
        ctx.lineTo(x + (dx > 0 ? -size : size), y + size);
    } else {
        ctx.lineTo(x - size, y + (dy > 0 ? -size : size));
        ctx.lineTo(x + size, y + (dy > 0 ? -size : size));
    }
    ctx.closePath();
    ctx.fill();
}

function drawGrid(ctx, width, height, scale, padding) {
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 0.5;
    
    const gridSize = 5; // feet
    
    // Vertical lines
    for (let x = gridSize; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(padding + x * scale, padding);
        ctx.lineTo(padding + x * scale, padding + height * scale);
        ctx.stroke();
    }
    
    // Horizontal lines
    for (let y = gridSize; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(padding, padding + y * scale);
        ctx.lineTo(padding + width * scale, padding + y * scale);
        ctx.stroke();
    }
}
