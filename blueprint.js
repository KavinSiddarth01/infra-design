// 2D & 3D Floor Plan Blueprint Generation

const roomColors = {
    hall: '#fbbf24',
    dining: '#ef4444',
    kitchen: '#f97316',
    bedroom: '#8b5cf6',
    bathroom: '#10b981',
    toilet: '#06b6d4',
    garden: '#22c55e',
    balcony: '#a78bfa',
    storeRoom: '#94a3b8',
    entrance: '#3b82f6'
};

function generateFloorPlan(floorName, rooms, plotWidth, plotHeight, isGroundFloor) {
    const canvasId2D = `canvas-2d-${floorName.replace(' ', '-').toLowerCase()}`;
    const canvasId3D = `canvas-3d-${floorName.replace(' ', '-').toLowerCase()}`;
    
    const html = `
        <div class="floor-plan">
            <h3 class="floor-title">
                ${isGroundFloor ? '📐' : '🏢'} ${floorName}
            </h3>
            
            <div class="floor-views-container">
                <!-- 2D Floor Plan -->
                <div class="floor-view-section">
                    <h4 class="view-title">2D Architectural Plan</h4>
                    <div class="floor-canvas-container">
                        <canvas id="${canvasId2D}" class="floor-canvas"></canvas>
                    </div>
                </div>
                
                <!-- 3D Isometric View -->
                <div class="floor-view-section">
                    <h4 class="view-title">3D Isometric View</h4>
                    <div class="floor-canvas-container">
                        <canvas id="${canvasId3D}" class="floor-canvas"></canvas>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Render after adding to DOM
    setTimeout(() => {
        const layout = createRoomLayout(rooms, plotWidth, plotHeight, isGroundFloor);
        render2DFloorPlan(canvasId2D, layout, plotWidth, plotHeight, isGroundFloor);
        render3DFloorPlan(canvasId3D, layout, plotWidth, plotHeight, isGroundFloor);
    }, 100);
    
    return html;
}

function createRoomLayout(rooms, plotWidth, plotHeight, isGroundFloor) {
    const layout = [];
    const wallThickness = 0.5;
    
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
                const direction = appState.directions[sizeKey === 'hall' ? 'hall' : 
                                                     sizeKey === 'storeRoom' ? 'storeRoom' : 
                                                     key.slice(0, -1)];
                roomsToPlace.push({
                    type: sizeKey,
                    label: formatRoomLabel(key),
                    width: Math.min(size.width, plotWidth * 0.9),
                    height: Math.min(size.height, plotHeight * 0.9),
                    number: count > 1 ? i + 1 : null,
                    direction: direction
                });
            }
        }
    });
    
    // Sort rooms by priority and area
    const priority = ['hall', 'kitchen', 'bedroom', 'dining', 'bathroom', 'toilet', 'garden', 'balcony', 'storeRoom'];
    roomsToPlace.sort((a, b) => {
        const aPriority = priority.indexOf(a.type);
        const bPriority = priority.indexOf(b.type);
        if (aPriority !== bPriority) return aPriority - bPriority;
        return (b.width * b.height) - (a.width * a.height);
    });
    
    // Main entrance position (always on ground floor in preferred direction)
    if (isGroundFloor) {
        const entranceDirection = appState.directions.mainDoor || 'north';
        const entranceWidth = 4;
        const entranceHeight = 3;
        
        let entranceX = 0, entranceY = 0;
        
        // Position entrance based on direction
        switch(entranceDirection) {
            case 'north':
                entranceX = plotWidth / 2 - entranceWidth / 2;
                entranceY = 0;
                break;
            case 'south':
                entranceX = plotWidth / 2 - entranceWidth / 2;
                entranceY = plotHeight - entranceHeight;
                break;
            case 'east':
                entranceX = plotWidth - entranceWidth;
                entranceY = plotHeight / 2 - entranceHeight / 2;
                break;
            case 'west':
                entranceX = 0;
                entranceY = plotHeight / 2 - entranceHeight / 2;
                break;
            case 'northeast':
                entranceX = plotWidth - entranceWidth;
                entranceY = 0;
                break;
            case 'northwest':
                entranceX = 0;
                entranceY = 0;
                break;
            case 'southeast':
                entranceX = plotWidth - entranceWidth;
                entranceY = plotHeight - entranceHeight;
                break;
            case 'southwest':
                entranceX = 0;
                entranceY = plotHeight - entranceHeight;
                break;
        }
        
        layout.push({
            type: 'entrance',
            label: 'Main Entrance',
            x: entranceX,
            y: entranceY,
            width: entranceWidth,
            height: entranceHeight,
            direction: entranceDirection,
            isEntrance: true
        });
    }
    
    // Smart grid-based layout with directional placement
    const placedRooms = placeRoomsIntelligently(roomsToPlace, plotWidth, plotHeight, isGroundFloor);
    layout.push(...placedRooms);
    
    return layout;
}

function placeRoomsIntelligently(rooms, plotWidth, plotHeight, isGroundFloor) {
    const placed = [];
    const grid = createGrid(plotWidth, plotHeight, 1); // 1 foot grid
    
    // Mark entrance area as occupied if ground floor
    if (isGroundFloor) {
        const entranceDirection = appState.directions.mainDoor || 'north';
        markEntranceArea(grid, entranceDirection, plotWidth, plotHeight);
    }
    
    rooms.forEach(room => {
        const position = findBestPosition(grid, room, plotWidth, plotHeight);
        
        if (position) {
            placed.push({
                ...room,
                x: position.x,
                y: position.y
            });
            
            // Mark grid as occupied
            markGridOccupied(grid, position.x, position.y, room.width, room.height);
        }
    });
    
    return placed;
}

function createGrid(width, height, resolution) {
    const cols = Math.ceil(width / resolution);
    const rows = Math.ceil(height / resolution);
    return Array(rows).fill(null).map(() => Array(cols).fill(false));
}

function markEntranceArea(grid, direction, plotWidth, plotHeight) {
    const entranceWidth = 4;
    const entranceHeight = 3;
    
    let x = 0, y = 0;
    switch(direction) {
        case 'north':
            x = plotWidth / 2 - entranceWidth / 2;
            y = 0;
            break;
        case 'south':
            x = plotWidth / 2 - entranceWidth / 2;
            y = plotHeight - entranceHeight;
            break;
        case 'east':
            x = plotWidth - entranceWidth;
            y = plotHeight / 2 - entranceHeight / 2;
            break;
        case 'west':
            x = 0;
            y = plotHeight / 2 - entranceHeight / 2;
            break;
    }
    
    markGridOccupied(grid, x, y, entranceWidth, entranceHeight);
}

function markGridOccupied(grid, x, y, width, height) {
    const startRow = Math.floor(y);
    const endRow = Math.min(Math.ceil(y + height), grid.length);
    const startCol = Math.floor(x);
    const endCol = Math.min(Math.ceil(x + width), grid[0].length);
    
    for (let r = startRow; r < endRow; r++) {
        for (let c = startCol; c < endCol; c++) {
            if (r >= 0 && r < grid.length && c >= 0 && c < grid[0].length) {
                grid[r][c] = true;
            }
        }
    }
}

function findBestPosition(grid, room, plotWidth, plotHeight) {
    const directionPreference = getDirectionPreference(room.direction, plotWidth, plotHeight);
    
    // Try preferred positions first
    for (let pos of directionPreference) {
        if (canPlaceRoom(grid, pos.x, pos.y, room.width, room.height, plotWidth, plotHeight)) {
            return pos;
        }
    }
    
    // Fallback: scan entire grid
    for (let y = 0; y < plotHeight - room.height; y += 1) {
        for (let x = 0; x < plotWidth - room.width; x += 1) {
            if (canPlaceRoom(grid, x, y, room.width, room.height, plotWidth, plotHeight)) {
                return { x, y };
            }
        }
    }
    
    return null;
}

function getDirectionPreference(direction, plotWidth, plotHeight) {
    const positions = [];
    const margin = 1;
    
    switch(direction) {
        case 'north':
            positions.push({ x: plotWidth / 3, y: margin });
            positions.push({ x: plotWidth / 2, y: margin });
            break;
        case 'south':
            positions.push({ x: plotWidth / 3, y: plotHeight * 0.7 });
            positions.push({ x: plotWidth / 2, y: plotHeight * 0.7 });
            break;
        case 'east':
            positions.push({ x: plotWidth * 0.7, y: plotHeight / 3 });
            positions.push({ x: plotWidth * 0.7, y: plotHeight / 2 });
            break;
        case 'west':
            positions.push({ x: margin, y: plotHeight / 3 });
            positions.push({ x: margin, y: plotHeight / 2 });
            break;
        case 'northeast':
            positions.push({ x: plotWidth * 0.7, y: margin });
            break;
        case 'northwest':
            positions.push({ x: margin, y: margin });
            break;
        case 'southeast':
            positions.push({ x: plotWidth * 0.7, y: plotHeight * 0.7 });
            break;
        case 'southwest':
            positions.push({ x: margin, y: plotHeight * 0.7 });
            break;
    }
    
    return positions;
}

function canPlaceRoom(grid, x, y, width, height, plotWidth, plotHeight) {
    if (x < 0 || y < 0 || x + width > plotWidth || y + height > plotHeight) {
        return false;
    }
    
    const startRow = Math.floor(y);
    const endRow = Math.min(Math.ceil(y + height), grid.length);
    const startCol = Math.floor(x);
    const endCol = Math.min(Math.ceil(x + width), grid[0].length);
    
    for (let r = startRow; r < endRow; r++) {
        for (let c = startCol; c < endCol; c++) {
            if (r >= 0 && r < grid.length && c >= 0 && c < grid[0].length) {
                if (grid[r][c]) return false;
            }
        }
    }
    
    return true;
}

function formatRoomLabel(key) {
    const labels = {
        halls: 'Living Room',
        dining: 'Dining',
        kitchens: 'Kitchen',
        bedrooms: 'Bedroom',
        bathrooms: 'Bathroom',
        toilets: 'Toilet',
        gardens: 'Garden',
        balconies: 'Balcony',
        storeRooms: 'Store'
    };
    return labels[key] || key;
}

// ============= 2D FLOOR PLAN RENDERING =============

function render2DFloorPlan(canvasId, layout, plotWidth, plotHeight, isGroundFloor) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const scale = 10;
    const padding = 80;
    
    canvas.width = plotWidth * scale + padding * 2;
    canvas.height = plotHeight * scale + padding * 2;
    
    // Background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw outer walls
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 4;
    ctx.strokeRect(padding, padding, plotWidth * scale, plotHeight * scale);
    
    // Draw compass
    drawCompass(ctx, padding - 50, padding + 30);
    
    // Draw dimension labels
    drawDimensions(ctx, plotWidth, plotHeight, scale, padding);
    
    // Draw rooms
    layout.forEach(room => {
        if (room.isEntrance) {
            draw2DEntrance(ctx, room, scale, padding);
        } else {
            draw2DRoom(ctx, room, scale, padding);
        }
    });
    
    // Draw interior walls
    drawInteriorWalls(ctx, layout, scale, padding);
    
    // Draw grid (subtle)
    drawGrid(ctx, plotWidth, plotHeight, scale, padding);
}

function draw2DRoom(ctx, room, scale, padding) {
    const x = padding + room.x * scale;
    const y = padding + room.y * scale;
    const width = room.width * scale;
    const height = room.height * scale;
    
    // Room fill
    ctx.fillStyle = roomColors[room.type] || '#e2e8f0';
    ctx.globalAlpha = 0.6;
    ctx.fillRect(x + 2, y + 2, width - 4, height - 4);
    ctx.globalAlpha = 1.0;
    
    // Room border
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, width, height);
    
    // Add door symbol
    drawDoorSymbol(ctx, x, y, width, height, room.type);
    
    // Room label
    ctx.fillStyle = '#1e293b';
    ctx.font = 'bold 13px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    const label = room.number ? `${room.label} ${room.number}` : room.label;
    ctx.fillText(label, x + width / 2, y + height / 2 - 8);
    
    // Room dimensions
    ctx.font = '11px Arial';
    ctx.fillStyle = '#475569';
    ctx.fillText(`${Math.round(room.width)}' × ${Math.round(room.height)}'`, x + width / 2, y + height / 2 + 8);
}

function draw2DEntrance(ctx, entrance, scale, padding) {
    const x = padding + entrance.x * scale;
    const y = padding + entrance.y * scale;
    const width = entrance.width * scale;
    const height = entrance.height * scale;
    
    // Entrance area
    ctx.fillStyle = roomColors.entrance;
    ctx.globalAlpha = 0.3;
    ctx.fillRect(x, y, width, height);
    ctx.globalAlpha = 1.0;
    
    // Door
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 4;
    ctx.strokeRect(x + 2, y + 2, width - 4, height - 4);
    
    // Door arc (opening indication)
    const isVertical = height > width;
    if (isVertical) {
        ctx.beginPath();
        ctx.arc(x + width / 2, y + height - 4, width / 2, 0, Math.PI);
        ctx.strokeStyle = '#3b82f6';
        ctx.lineWidth = 2;
        ctx.stroke();
    } else {
        ctx.beginPath();
        ctx.arc(x + width - 4, y + height / 2, height / 2, -Math.PI / 2, Math.PI / 2);
        ctx.strokeStyle = '#3b82f6';
        ctx.lineWidth = 2;
        ctx.stroke();
    }
    
    // Label
    ctx.fillStyle = '#1e40af';
    ctx.font = 'bold 12px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('ENTRANCE', x + width / 2, y + height / 2);
}

function drawDoorSymbol(ctx, x, y, width, height, roomType) {
    // Draw simple door indicator line
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 2;
    
    if (width > height) {
        // Door on side
        const doorY = y + height / 2;
        ctx.beginPath();
        ctx.moveTo(x + 5, doorY);
        ctx.lineTo(x + 15, doorY);
        ctx.stroke();
    } else {
        // Door on top/bottom
        const doorX = x + width / 2;
        ctx.beginPath();
        ctx.moveTo(doorX, y + 5);
        ctx.lineTo(doorX, y + 15);
        ctx.stroke();
    }
}

function drawInteriorWalls(ctx, layout, scale, padding) {
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 2;
    
    // This is simplified - in a real app, you'd calculate shared walls
    layout.forEach(room => {
        const x = padding + room.x * scale;
        const y = padding + room.y * scale;
        const width = room.width * scale;
        const height = room.height * scale;
        
        if (!room.isEntrance) {
            ctx.strokeRect(x, y, width, height);
        }
    });
}

// ============= 3D ISOMETRIC RENDERING =============

function render3DFloorPlan(canvasId, layout, plotWidth, plotHeight, isGroundFloor) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const scale = 8;
    const padding = 100;
    const wallHeight = 10; // feet
    
    canvas.width = (plotWidth + plotHeight) * scale + padding * 2;
    canvas.height = (plotWidth + plotHeight) * scale / 2 + wallHeight * scale + padding * 2;
    
    // Background
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#f0f9ff');
    gradient.addColorStop(1, '#e0f2fe');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    const originX = padding + plotWidth * scale / 2;
    const originY = padding + wallHeight * scale;
    
    // Draw ground/floor first
    draw3DFloor(ctx, originX, originY, plotWidth, plotHeight, scale);
    
    // Sort rooms by depth (back to front)
    const sortedLayout = [...layout].sort((a, b) => (a.y + a.x) - (b.y + b.x));
    
    // Draw rooms
    sortedLayout.forEach(room => {
        if (room.isEntrance) {
            draw3DEntrance(ctx, room, originX, originY, scale, wallHeight, isGroundFloor);
        } else {
            draw3DRoom(ctx, room, originX, originY, scale, wallHeight);
        }
    });
    
    // Draw outer walls
    draw3DOuterWalls(ctx, originX, originY, plotWidth, plotHeight, scale, wallHeight);
}

function toIsometric(x, y, originX, originY, scale) {
    const isoX = originX + (x - y) * scale;
    const isoY = originY + (x + y) * scale / 2;
    return { x: isoX, y: isoY };
}

function draw3DFloor(ctx, originX, originY, width, height, scale) {
    const p1 = toIsometric(0, 0, originX, originY, scale);
    const p2 = toIsometric(width, 0, originX, originY, scale);
    const p3 = toIsometric(width, height, originX, originY, scale);
    const p4 = toIsometric(0, height, originX, originY, scale);
    
    // Floor
    ctx.fillStyle = '#cbd5e1';
    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.lineTo(p3.x, p3.y);
    ctx.lineTo(p4.x, p4.y);
    ctx.closePath();
    ctx.fill();
    
    // Floor grid
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 0.5;
    
    for (let i = 0; i <= height; i += 5) {
        const start = toIsometric(0, i, originX, originY, scale);
        const end = toIsometric(width, i, originX, originY, scale);
        ctx.beginPath();
        ctx.moveTo(start.x, start.y);
        ctx.lineTo(end.x, end.y);
        ctx.stroke();
    }
    
    for (let i = 0; i <= width; i += 5) {
        const start = toIsometric(i, 0, originX, originY, scale);
        const end = toIsometric(i, height, originX, originY, scale);
        ctx.beginPath();
        ctx.moveTo(start.x, start.y);
        ctx.lineTo(end.x, end.y);
        ctx.stroke();
    }
}

function draw3DRoom(ctx, room, originX, originY, scale, wallHeight) {
    const x = room.x;
    const y = room.y;
    const w = room.width;
    const h = room.height;
    const roomHeight = wallHeight * 0.9;
    
    const base1 = toIsometric(x, y, originX, originY, scale);
    const base2 = toIsometric(x + w, y, originX, originY, scale);
    const base3 = toIsometric(x + w, y + h, originX, originY, scale);
    const base4 = toIsometric(x, y + h, originX, originY, scale);
    
    const color = roomColors[room.type] || '#e2e8f0';
    
    // Floor
    ctx.fillStyle = color;
    ctx.globalAlpha = 0.8;
    ctx.beginPath();
    ctx.moveTo(base1.x, base1.y);
    ctx.lineTo(base2.x, base2.y);
    ctx.lineTo(base3.x, base3.y);
    ctx.lineTo(base4.x, base4.y);
    ctx.closePath();
    ctx.fill();
    ctx.globalAlpha = 1.0;
    
    // Draw walls (simplified - right and left faces)
    drawDarkerShade(ctx, color, [
        base2,
        base3,
        { x: base3.x, y: base3.y - roomHeight * scale },
        { x: base2.x, y: base2.y - roomHeight * scale }
    ]);
    
    drawLighterShade(ctx, color, [
        base3,
        base4,
        { x: base4.x, y: base4.y - roomHeight * scale },
        { x: base3.x, y: base3.y - roomHeight * scale }
    ]);
    
    // Top face
    const top1 = { x: base1.x, y: base1.y - roomHeight * scale };
    const top2 = { x: base2.x, y: base2.y - roomHeight * scale };
    const top3 = { x: base3.x, y: base3.y - roomHeight * scale };
    const top4 = { x: base4.x, y: base4.y - roomHeight * scale };
    
    ctx.fillStyle = shadeColor(color, 20);
    ctx.beginPath();
    ctx.moveTo(top1.x, top1.y);
    ctx.lineTo(top2.x, top2.y);
    ctx.lineTo(top3.x, top3.y);
    ctx.lineTo(top4.x, top4.y);
    ctx.closePath();
    ctx.fill();
    
    // Outline
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    
    // Label on top
    ctx.fillStyle = '#1e293b';
    ctx.font = 'bold 11px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const centerTop = {
        x: (top1.x + top2.x + top3.x + top4.x) / 4,
        y: (top1.y + top2.y + top3.y + top4.y) / 4
    };
    const label = room.number ? `${room.label} ${room.number}` : room.label;
    ctx.fillText(label, centerTop.x, centerTop.y);
}

function draw3DEntrance(ctx, entrance, originX, originY, scale, wallHeight, isGroundFloor) {
    const x = entrance.x;
    const y = entrance.y;
    const w = entrance.width;
    const h = entrance.height;
    const doorHeight = wallHeight * 0.8;
    
    const base1 = toIsometric(x, y, originX, originY, scale);
    const base2 = toIsometric(x + w, y, originX, originY, scale);
    const base3 = toIsometric(x + w, y + h, originX, originY, scale);
    const base4 = toIsometric(x, y + h, originX, originY, scale);
    
    // Door structure
    ctx.fillStyle = '#3b82f6';
    ctx.globalAlpha = 0.7;
    
    // Right face
    ctx.beginPath();
    ctx.moveTo(base2.x, base2.y);
    ctx.lineTo(base3.x, base3.y);
    ctx.lineTo(base3.x, base3.y - doorHeight * scale);
    ctx.lineTo(base2.x, base2.y - doorHeight * scale);
    ctx.closePath();
    ctx.fill();
    
    ctx.globalAlpha = 1.0;
    ctx.strokeStyle = '#1e40af';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Draw door frame
    const doorTop = { x: (base2.x + base3.x) / 2, y: (base2.y + base3.y) / 2 - doorHeight * scale };
    ctx.fillStyle = '#1e40af';
    ctx.font = 'bold 10px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('MAIN', doorTop.x, doorTop.y - 5);
    ctx.fillText('ENTRANCE', doorTop.x, doorTop.y + 5);
    
    // Add small roof/canopy
    drawEntranceCanopy(ctx, base2, base3, doorHeight, scale);
}

function drawEntranceCanopy(ctx, base2, base3, doorHeight, scale) {
    const canopyHeight = doorHeight * scale + 10;
    const overhang = 8;
    
    ctx.fillStyle = '#60a5fa';
    ctx.beginPath();
    ctx.moveTo(base2.x - overhang, base2.y - canopyHeight);
    ctx.lineTo(base3.x + overhang, base3.y - canopyHeight);
    ctx.lineTo(base3.x + overhang, base3.y - canopyHeight - 15);
    ctx.lineTo(base2.x - overhang, base2.y - canopyHeight - 15);
    ctx.closePath();
    ctx.fill();
    
    ctx.strokeStyle = '#2563eb';
    ctx.lineWidth = 1;
    ctx.stroke();
}

function draw3DOuterWalls(ctx, originX, originY, width, height, scale, wallHeight) {
    const base1 = toIsometric(0, 0, originX, originY, scale);
    const base2 = toIsometric(width, 0, originX, originY, scale);
    const base3 = toIsometric(width, height, originX, originY, scale);
    const base4 = toIsometric(0, height, originX, originY, scale);
    
    const wallColor = '#94a3b8';
    
    // Back wall (right)
    drawDarkerShade(ctx, wallColor, [
        base2,
        { x: base2.x, y: base2.y - wallHeight * scale },
        { x: base3.x, y: base3.y - wallHeight * scale },
        base3
    ]);
    
    // Left wall
    drawLighterShade(ctx, wallColor, [
        base3,
        { x: base3.x, y: base3.y - wallHeight * scale },
        { x: base4.x, y: base4.y - wallHeight * scale },
        base4
    ]);
    
    // Outline
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(base1.x, base1.y);
    ctx.lineTo(base2.x, base2.y);
    ctx.lineTo(base2.x, base2.y - wallHeight * scale);
    ctx.lineTo(base3.x, base3.y - wallHeight * scale);
    ctx.lineTo(base3.x, base3.y);
    ctx.moveTo(base3.x, base3.y - wallHeight * scale);
    ctx.lineTo(base4.x, base4.y - wallHeight * scale);
    ctx.lineTo(base4.x, base4.y);
    ctx.stroke();
}

function drawDarkerShade(ctx, color, points) {
    ctx.fillStyle = shadeColor(color, -20);
    ctx.globalAlpha = 0.8;
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i].x, points[i].y);
    }
    ctx.closePath();
    ctx.fill();
    ctx.globalAlpha = 1.0;
}

function drawLighterShade(ctx, color, points) {
    ctx.fillStyle = shadeColor(color, 10);
    ctx.globalAlpha = 0.8;
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i].x, points[i].y);
    }
    ctx.closePath();
    ctx.fill();
    ctx.globalAlpha = 1.0;
}

function shadeColor(color, percent) {
    let R = parseInt(color.substring(1, 3), 16);
    let G = parseInt(color.substring(3, 5), 16);
    let B = parseInt(color.substring(5, 7), 16);
    
    R = Math.max(0, Math.min(255, R + percent));
    G = Math.max(0, Math.min(255, G + percent));
    B = Math.max(0, Math.min(255, B + percent));
    
    return `#${((1 << 24) + (R << 16) + (G << 8) + B).toString(16).slice(1)}`;
}

// ============= HELPER FUNCTIONS =============

function drawCompass(ctx, x, y) {
    const size = 35;
    
    // Circle background
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // North arrow (red)
    ctx.beginPath();
    ctx.moveTo(x, y - size + 5);
    ctx.lineTo(x - 10, y);
    ctx.lineTo(x + 10, y);
    ctx.closePath();
    ctx.fillStyle = '#ef4444';
    ctx.fill();
    
    // South arrow (white)
    ctx.beginPath();
    ctx.moveTo(x, y + size - 5);
    ctx.lineTo(x - 10, y);
    ctx.lineTo(x + 10, y);
    ctx.closePath();
    ctx.fillStyle = '#f1f5f9';
    ctx.fill();
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 1;
    ctx.stroke();
    
    // Labels
    ctx.fillStyle = '#1e293b';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('N', x, y - size - 18);
    
    ctx.font = '12px Arial';
    ctx.fillText('E', x + size + 15, y);
    ctx.fillText('S', x, y + size + 15);
    ctx.fillText('W', x - size - 15, y);
}

function drawDimensions(ctx, width, height, scale, padding) {
    ctx.strokeStyle = '#64748b';
    ctx.fillStyle = '#64748b';
    ctx.font = 'bold 13px Arial';
    ctx.textAlign = 'center';
    ctx.lineWidth = 1.5;
    
    // Top dimension
    const topY = padding - 30;
    ctx.beginPath();
    ctx.moveTo(padding, topY);
    ctx.lineTo(padding + width * scale, topY);
    ctx.stroke();
    
    drawArrow(ctx, padding, topY, -5, 0);
    drawArrow(ctx, padding + width * scale, topY, 5, 0);
    
    ctx.fillText(`${Math.round(width)} ft`, padding + (width * scale) / 2, topY - 12);
    
    // Left dimension
    const leftX = padding - 30;
    ctx.beginPath();
    ctx.moveTo(leftX, padding);
    ctx.lineTo(leftX, padding + height * scale);
    ctx.stroke();
    
    drawArrow(ctx, leftX, padding, 0, -5);
    drawArrow(ctx, leftX, padding + height * scale, 0, 5);
    
    ctx.save();
    ctx.translate(leftX - 12, padding + (height * scale) / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText(`${Math.round(height)} ft`, 0, 0);
    ctx.restore();
}

function drawArrow(ctx, x, y, dx, dy) {
    const size = 6;
    ctx.fillStyle = '#64748b';
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
    ctx.strokeStyle = '#f1f5f9';
    ctx.lineWidth = 0.5;
    
    const gridSize = 5; // feet
    
    for (let x = gridSize; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(padding + x * scale, padding);
        ctx.lineTo(padding + x * scale, padding + height * scale);
        ctx.stroke();
    }
    
    for (let y = gridSize; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(padding, padding + y * scale);
        ctx.lineTo(padding + width * scale, padding + y * scale);
        ctx.stroke();
    }
}
