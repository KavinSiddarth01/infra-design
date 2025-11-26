// ===================================================================
// CLEAN 3D ISOMETRIC FLOOR PLAN RENDERER
// Modern style with colored room blocks like the reference image
// ===================================================================

// Replace the existing draw3DFloorPlan function
window.draw3DFloorPlan_Clean = function() {
    const canvas = document.getElementById('canvas3d');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const width = Math.min(1400, window.innerWidth - 100);
    const height = 900;
    canvas.width = width;
    canvas.height = height;
    
    ctx.clearRect(0, 0, width, height);
    
    // Light background gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, '#f0f4f8');
    gradient.addColorStop(1, '#ffffff');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
    
    // Title
    ctx.fillStyle = '#1f2937';
    ctx.font = 'bold 24px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('3D Isometric Floor Plan', width / 2, 50);
    
    const centerX = width / 2;
    const centerY = height / 2 + 50;
    const scale = 5;
    
    // Isometric projection
    const toIso = (x, y, z) => ({
        x: centerX + (x - y) * scale,
        y: centerY + (x + y) * scale * 0.5 - z * scale
    });
    
    const plotSize = Math.sqrt(appState.plotData.sizeInSqFt);
    
    // Draw ground plane
    drawCleanGround(ctx, toIso, plotSize * 1.4);
    
    // Draw rooms
    const groundFloor = appState.rooms.filter(r => r.floor === 1);
    const groundLayout = generateRoomLayout(groundFloor, plotSize, plotSize);
    
    const roomHeight = 35;
    
    // Draw each room as 3D box
    groundLayout.forEach((room, index) => {
        const color = ROOM_COLORS[room.type];
        const area = room.size || ROOM_SIZES[room.type];
        const isMainDoor = room.type === 'main_entrance';
        
        drawClean3DRoom(ctx, toIso, room.x, room.y, 0, room.width, room.height, roomHeight, color, ROOM_LABELS[room.type], area, room.direction, isMainDoor);
    });
    
    // Legend/Info
    drawCleanLegend(ctx, 50, height - 140);
    
    // Dimensions table
    drawDimensionsTable2D(ctx, width, height - 130);
};

function drawCleanGround(ctx, toIso, size) {
    // Ground platform
    const offset = size * 0.15;
    const groundCorners = [
        toIso(-offset, -offset, 0),
        toIso(size + offset, -offset, 0),
        toIso(size + offset, size + offset, 0),
        toIso(-offset, size + offset, 0)
    ];
    
    // Fill
    ctx.fillStyle = '#e2e8f0';
    ctx.beginPath();
    ctx.moveTo(groundCorners[0].x, groundCorners[0].y);
    groundCorners.forEach(c => ctx.lineTo(c.x, c.y));
    ctx.closePath();
    ctx.fill();
    
    // Border
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Grid lines on ground
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 0.5;
    const gridSize = size / 10;
    for (let i = 0; i <= 10; i++) {
        const x = i * gridSize;
        const y = i * gridSize;
        
        // Vertical lines
        const v1 = toIso(x, 0, 0);
        const v2 = toIso(x, size, 0);
        ctx.beginPath();
        ctx.moveTo(v1.x, v1.y);
        ctx.lineTo(v2.x, v2.y);
        ctx.stroke();
        
        // Horizontal lines
        const h1 = toIso(0, y, 0);
        const h2 = toIso(size, y, 0);
        ctx.beginPath();
        ctx.moveTo(h1.x, h1.y);
        ctx.lineTo(h2.x, h2.y);
        ctx.stroke();
    }
}

function drawClean3DRoom(ctx, toIso, x, y, z, width, depth, height, color, label, area, direction, isMainDoor) {
    // Calculate all corners
    const bottomCorners = [
        toIso(x, y, z),
        toIso(x + width, y, z),
        toIso(x + width, y + depth, z),
        toIso(x, y + depth, z)
    ];
    
    const topCorners = [
        toIso(x, y, z + height),
        toIso(x + width, y, z + height),
        toIso(x + width, y + depth, z + height),
        toIso(x, y + depth, z + height)
    ];
    
    // Draw bottom face (floor)
    ctx.fillStyle = color + '60';
    ctx.beginPath();
    ctx.moveTo(bottomCorners[0].x, bottomCorners[0].y);
    bottomCorners.forEach(c => ctx.lineTo(c.x, c.y));
    ctx.closePath();
    ctx.fill();
    
    // Draw left face (darker)
    ctx.fillStyle = color + '80';
    ctx.beginPath();
    ctx.moveTo(bottomCorners[0].x, bottomCorners[0].y);
    ctx.lineTo(topCorners[0].x, topCorners[0].y);
    ctx.lineTo(topCorners[3].x, topCorners[3].y);
    ctx.lineTo(bottomCorners[3].x, bottomCorners[3].y);
    ctx.closePath();
    ctx.fill();
    
    // Diagonal hatching on left face
    drawDiagonalHatch(ctx, [bottomCorners[0], topCorners[0], topCorners[3], bottomCorners[3]], color, 5);
    
    // Draw right face (lighter)
    ctx.fillStyle = color + '95';
    ctx.beginPath();
    ctx.moveTo(bottomCorners[1].x, bottomCorners[1].y);
    ctx.lineTo(topCorners[1].x, topCorners[1].y);
    ctx.lineTo(topCorners[2].x, topCorners[2].y);
    ctx.lineTo(bottomCorners[2].x, bottomCorners[2].y);
    ctx.closePath();
    ctx.fill();
    
    // Diagonal hatching on right face
    drawDiagonalHatch(ctx, [bottomCorners[1], topCorners[1], topCorners[2], bottomCorners[2]], color, 5);
    
    // Draw top face (lightest)
    ctx.fillStyle = color + 'AA';
    ctx.beginPath();
    ctx.moveTo(topCorners[0].x, topCorners[0].y);
    topCorners.forEach(c => ctx.lineTo(c.x, c.y));
    ctx.closePath();
    ctx.fill();
    
    // Edges (clean black lines)
    ctx.strokeStyle = '#1f2937';
    ctx.lineWidth = 2;
    
    // Vertical edges
    for (let i = 0; i < 4; i++) {
        ctx.beginPath();
        ctx.moveTo(bottomCorners[i].x, bottomCorners[i].y);
        ctx.lineTo(topCorners[i].x, topCorners[i].y);
        ctx.stroke();
    }
    
    // Top edges
    ctx.beginPath();
    ctx.moveTo(topCorners[0].x, topCorners[0].y);
    topCorners.forEach(c => ctx.lineTo(c.x, c.y));
    ctx.closePath();
    ctx.stroke();
    
    // Main door indicator (red marker)
    if (isMainDoor) {
        const doorPos = toIso(x + width / 2, y, z + height / 2);
        const arrowStart = toIso(x + width / 2, y - 8, z + height / 2);
        
        // Red door marker
        ctx.fillStyle = '#b91c1c';
        ctx.strokeStyle = '#7f1d1d';
        ctx.lineWidth = 2;
        
        const doorWidth = 8;
        const doorHeight = 15;
        ctx.fillRect(doorPos.x - doorWidth / 2, doorPos.y - doorHeight / 2, doorWidth, doorHeight);
        ctx.strokeRect(doorPos.x - doorWidth / 2, doorPos.y - doorHeight / 2, doorWidth, doorHeight);
        
        // Arrow pointing to door
        ctx.fillStyle = '#dc2626';
        ctx.beginPath();
        ctx.moveTo(arrowStart.x, arrowStart.y);
        ctx.lineTo(arrowStart.x - 10, arrowStart.y + 10);
        ctx.lineTo(arrowStart.x + 10, arrowStart.y + 10);
        ctx.closePath();
        ctx.fill();
        
        // Label
        ctx.fillStyle = '#dc2626';
        ctx.font = 'bold 11px Arial, sans-serif';
        ctx.textAlign = 'center';
        const labelY = isMainDoor ? arrowStart.y - 5 : arrowStart.y;
        ctx.fillText('Main Door (' + (direction || 'N') + ')', arrowStart.x, labelY);
    }
    
    // Room label (above the room)
    const labelPos = toIso(x + width / 2, y + depth / 2, z + height + 8);
    
    ctx.fillStyle = '#1f2937';
    ctx.font = 'bold 13px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, labelPos.x, labelPos.y - 8);
    
    // Area
    ctx.font = '11px Arial, sans-serif';
    ctx.fillStyle = '#6b7280';
    ctx.fillText(area + ' sq ft', labelPos.x, labelPos.y + 3);
}

function drawDiagonalHatch(ctx, corners, color, spacing) {
    if (corners.length < 3) return;
    
    ctx.save();
    ctx.strokeStyle = color + '40';
    ctx.lineWidth = 1;
    
    // Create clipping path
    ctx.beginPath();
    ctx.moveTo(corners[0].x, corners[0].y);
    corners.forEach(c => ctx.lineTo(c.x, c.y));
    ctx.closePath();
    ctx.clip();
    
    // Find bounding box
    const minX = Math.min(...corners.map(c => c.x));
    const maxX = Math.max(...corners.map(c => c.x));
    const minY = Math.min(...corners.map(c => c.y));
    const maxY = Math.max(...corners.map(c => c.y));
    
    const width = maxX - minX;
    const height = maxY - minY;
    
    // Draw diagonal lines
    for (let i = -height; i < width + height; i += spacing) {
        ctx.beginPath();
        ctx.moveTo(minX + i, minY);
        ctx.lineTo(minX + i + height, minY + height);
        ctx.stroke();
    }
    
    ctx.restore();
}

function drawCleanLegend(ctx, x, y) {
    ctx.fillStyle = '#1f2937';
    ctx.font = 'bold 12px Arial, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('Direction: North (↑)', x, y);
}

// Update the app.js to call this function
if (typeof window !== 'undefined') {
    const originalDraw3D = window.draw3DFloorPlan;
    window.draw3DFloorPlan = function() {
        if (typeof draw3DFloorPlan_Clean !== 'undefined') {
            draw3DFloorPlan_Clean();
        } else if (originalDraw3D) {
            originalDraw3D();
        }
    };
}
