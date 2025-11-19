// 3D Blueprint rendering functions

function drawBlueprint(plotData, roomCounts, directions) {
    const canvas = document.getElementById('blueprintCanvas');
    const ctx = canvas.getContext('2d');

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw compass rose
    drawCompassRose(ctx, canvas.width - 80, 60);

    // Draw 3D floor plan
    draw3DFloorPlan(ctx, canvas.width, canvas.height, roomCounts, directions);
}

function drawCompassRose(ctx, x, y) {
    const radius = 30;

    // Draw circle
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw directions
    ctx.fillStyle = '#1e293b';
    ctx.font = '14px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // N
    ctx.fillText('N', x, y - radius - 15);
    // S
    ctx.fillText('S', x, y + radius + 15);
    // E
    ctx.textAlign = 'left';
    ctx.fillText('E', x + radius + 10, y);
    // W
    ctx.textAlign = 'right';
    ctx.fillText('W', x - radius - 10, y);

    // Draw arrow pointing north
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x, y - radius + 5);
    ctx.stroke();

    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.moveTo(x, y - radius + 5);
    ctx.lineTo(x - 5, y - radius + 12);
    ctx.lineTo(x + 5, y - radius + 12);
    ctx.closePath();
    ctx.fill();
}

function draw3DFloorPlan(ctx, canvasWidth, canvasHeight, roomCounts, directions) {
    // Isometric projection settings
    const centerX = canvasWidth / 2;
    const centerY = canvasHeight / 2 - 50;
    const scale = 40;
    const wallHeight = 3;

    // Create room layout
    const rooms = [];

    // Determine grid size
    const totalRooms = getTotalRooms(roomCounts);
    const gridCols = Math.ceil(Math.sqrt(totalRooms + 2));
    const gridRows = Math.ceil((totalRooms + 2) / gridCols);

    let currentIndex = 0;

    // Add main entrance
    if (roomCounts.mainDoors > 0) {
        const pos = getDirectionGridPosition(directions.mainDoor, gridCols, gridRows);
        rooms.push({
            name: 'Entrance',
            gridX: pos.col,
            gridY: pos.row,
            gridWidth: 2,
            gridHeight: 1,
            color: '#3b82f6',
            direction: directions.mainDoor
        });
    }

    // Add hall
    for (let i = 0; i < roomCounts.halls; i++) {
        const pos = getAutoGridPosition(currentIndex, gridCols);
        rooms.push({
            name: `Hall ${i + 1}`,
            gridX: pos.col,
            gridY: pos.row,
            gridWidth: 3,
            gridHeight: 3,
            color: '#fbbf24',
            direction: directions.hall
        });
        currentIndex += 2;
    }

    // Add dining
    for (let i = 0; i < roomCounts.dining; i++) {
        const pos = getAutoGridPosition(currentIndex, gridCols);
        rooms.push({
            name: `Dining ${i + 1}`,
            gridX: pos.col,
            gridY: pos.row,
            gridWidth: 2,
            gridHeight: 2,
            color: '#ef4444',
            direction: directions.hall
        });
        currentIndex++;
    }

    // Add kitchen
    for (let i = 0; i < roomCounts.kitchens; i++) {
        const pos = getDirectionGridPosition(directions.kitchen, gridCols, gridRows);
        rooms.push({
            name: `Kitchen ${i + 1}`,
            gridX: pos.col,
            gridY: pos.row,
            gridWidth: 2,
            gridHeight: 2,
            color: '#f97316',
            direction: directions.kitchen
        });
        currentIndex++;
    }

    // Add bedrooms
    for (let i = 0; i < roomCounts.bedrooms; i++) {
        const pos = i === 0
            ? getDirectionGridPosition(directions.bedroom, gridCols, gridRows)
            : getAutoGridPosition(currentIndex, gridCols);
        rooms.push({
            name: i === 0 ? 'Master BR' : `BR ${i + 1}`,
            gridX: pos.col,
            gridY: pos.row,
            gridWidth: 2,
            gridHeight: 2,
            color: '#8b5cf6',
            direction: directions.bedroom
        });
        currentIndex++;
    }

    // Add bathrooms
    for (let i = 0; i < roomCounts.bathrooms; i++) {
        const pos = i === 0
            ? getDirectionGridPosition(directions.bathroom, gridCols, gridRows)
            : getAutoGridPosition(currentIndex, gridCols);
        rooms.push({
            name: `Bath ${i + 1}`,
            gridX: pos.col,
            gridY: pos.row,
            gridWidth: 1,
            gridHeight: 1,
            color: '#10b981',
            direction: directions.bathroom
        });
        currentIndex++;
    }

    // Sort rooms by depth (back to front for proper rendering)
    rooms.sort((a, b) => (a.gridX + a.gridY) - (b.gridX + b.gridY));

    // Draw ground/floor base
    const maxGridX = Math.max(...rooms.map(r => r.gridX + r.gridWidth));
    const maxGridY = Math.max(...rooms.map(r => r.gridY + r.gridHeight));
    drawIsometricFloor(ctx, centerX, centerY, 0, 0, maxGridX + 2, maxGridY + 2, scale);

    // Draw each room in 3D
    rooms.forEach(room => {
        drawIsometricRoom(
            ctx,
            centerX,
            centerY,
            room.gridX,
            room.gridY,
            room.gridWidth,
            room.gridHeight,
            wallHeight,
            scale,
            room.color,
            room.name,
            room.direction
        );
    });
}

function drawIsometricFloor(ctx, centerX, centerY, gridX, gridY, width, height, scale) {
    const points = [
        isoProject(centerX, centerY, gridX, gridY, 0, scale),
        isoProject(centerX, centerY, gridX + width, gridY, 0, scale),
        isoProject(centerX, centerY, gridX + width, gridY + height, 0, scale),
        isoProject(centerX, centerY, gridX, gridY + height, 0, scale)
    ];

    // Draw floor
    ctx.fillStyle = '#e2e8f0';
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    points.forEach(p => ctx.lineTo(p.x, p.y));
    ctx.closePath();
    ctx.fill();

    // Draw grid lines
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 1;

    // Vertical grid lines
    for (let i = 0; i <= width; i++) {
        const p1 = isoProject(centerX, centerY, gridX + i, gridY, 0, scale);
        const p2 = isoProject(centerX, centerY, gridX + i, gridY + height, 0, scale);
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
    }

    // Horizontal grid lines
    for (let i = 0; i <= height; i++) {
        const p1 = isoProject(centerX, centerY, gridX, gridY + i, 0, scale);
        const p2 = isoProject(centerX, centerY, gridX + width, gridY + i, 0, scale);
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
    }

    // Draw border
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    points.forEach(p => ctx.lineTo(p.x, p.y));
    ctx.closePath();
    ctx.stroke();
}

function drawIsometricRoom(ctx, centerX, centerY, gridX, gridY, width, height, wallHeight, scale, color, label, direction) {
    // Calculate corners
    const bottomCorners = [
        isoProject(centerX, centerY, gridX, gridY, 0, scale),
        isoProject(centerX, centerY, gridX + width, gridY, 0, scale),
        isoProject(centerX, centerY, gridX + width, gridY + height, 0, scale),
        isoProject(centerX, centerY, gridX, gridY + height, 0, scale)
    ];

    const topCorners = [
        isoProject(centerX, centerY, gridX, gridY, wallHeight, scale),
        isoProject(centerX, centerY, gridX + width, gridY, wallHeight, scale),
        isoProject(centerX, centerY, gridX + width, gridY + height, wallHeight, scale),
        isoProject(centerX, centerY, gridX, gridY + height, wallHeight, scale)
    ];

    // Draw floor
    ctx.fillStyle = lightenColor(color, 40);
    ctx.beginPath();
    ctx.moveTo(bottomCorners[0].x, bottomCorners[0].y);
    bottomCorners.forEach(p => ctx.lineTo(p.x, p.y));
    ctx.closePath();
    ctx.fill();

    // Draw front wall (right side)
    ctx.fillStyle = lightenColor(color, 20);
    ctx.beginPath();
    ctx.moveTo(bottomCorners[1].x, bottomCorners[1].y);
    ctx.lineTo(bottomCorners[2].x, bottomCorners[2].y);
    ctx.lineTo(topCorners[2].x, topCorners[2].y);
    ctx.lineTo(topCorners[1].x, topCorners[1].y);
    ctx.closePath();
    ctx.fill();

    // Draw side wall (left side)
    ctx.fillStyle = lightenColor(color, 0);
    ctx.beginPath();
    ctx.moveTo(bottomCorners[2].x, bottomCorners[2].y);
    ctx.lineTo(bottomCorners[3].x, bottomCorners[3].y);
    ctx.lineTo(topCorners[3].x, topCorners[3].y);
    ctx.lineTo(topCorners[2].x, topCorners[2].y);
    ctx.closePath();
    ctx.fill();

    // Draw top
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(topCorners[0].x, topCorners[0].y);
    topCorners.forEach(p => ctx.lineTo(p.x, p.y));
    ctx.closePath();
    ctx.fill();

    // Draw edges
    ctx.strokeStyle = darkenColor(color, 30);
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(topCorners[0].x, topCorners[0].y);
    topCorners.forEach(p => ctx.lineTo(p.x, p.y));
    ctx.closePath();
    ctx.stroke();

    // Draw vertical edges
    for (let i = 0; i < 4; i++) {
        ctx.beginPath();
        ctx.moveTo(bottomCorners[i].x, bottomCorners[i].y);
        ctx.lineTo(topCorners[i].x, topCorners[i].y);
        ctx.stroke();
    }

    // Draw label on top
    const centerTop = isoProject(centerX, centerY, gridX + width / 2, gridY + height / 2, wallHeight, scale);

    ctx.fillStyle = '#1e293b';
    ctx.font = 'bold 13px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, centerTop.x, centerTop.y - 8);

    // Draw direction
    ctx.font = '11px sans-serif';
    ctx.fillStyle = '#475569';
    const dirLabel = direction.charAt(0).toUpperCase() + direction.slice(1);
    ctx.fillText(`(${dirLabel})`, centerTop.x, centerTop.y + 6);
}

// Isometric projection helper
function isoProject(centerX, centerY, x, y, z, scale) {
    const isoX = (x - y) * Math.cos(Math.PI / 6) * scale;
    const isoY = (x + y) * Math.sin(Math.PI / 6) * scale - z * scale;
    return {
        x: centerX + isoX,
        y: centerY + isoY
    };
}

function getTotalRooms(roomCounts) {
    return (
        roomCounts.halls +
        roomCounts.dining +
        roomCounts.kitchens +
        roomCounts.bedrooms +
        roomCounts.bathrooms
    );
}

function getAutoGridPosition(index, gridCols) {
    const col = index % gridCols;
    const row = Math.floor(index / gridCols);
    return { col, row };
}

function getDirectionGridPosition(direction, gridCols, gridRows) {
    const positions = {
        north: { col: Math.floor(gridCols / 2), row: 0 },
        south: { col: Math.floor(gridCols / 2), row: gridRows - 1 },
        east: { col: gridCols - 1, row: Math.floor(gridRows / 2) },
        west: { col: 0, row: Math.floor(gridRows / 2) },
        northeast: { col: gridCols - 1, row: 0 },
        northwest: { col: 0, row: 0 },
        southeast: { col: gridCols - 1, row: gridRows - 1 },
        southwest: { col: 0, row: gridRows - 1 }
    };

    return positions[direction] || positions.north;
}

function lightenColor(color, percent) {
    const num = parseInt(color.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) + amt;
    const G = ((num >> 8) & 0x00ff) + amt;
    const B = (num & 0x0000ff) + amt;
    return (
        '#' +
        (
            0x1000000 +
            (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
            (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
            (B < 255 ? (B < 1 ? 0 : B) : 255)
        )
            .toString(16)
            .slice(1)
    );
}

function darkenColor(color, percent) {
    const num = parseInt(color.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) - amt;
    const G = ((num >> 8) & 0x00ff) - amt;
    const B = (num & 0x0000ff) - amt;
    return (
        '#' +
        (
            0x1000000 +
            (R > 0 ? R : 0) * 0x10000 +
            (G > 0 ? G : 0) * 0x100 +
            (B > 0 ? B : 0)
        )
            .toString(16)
            .slice(1)
    );
}
