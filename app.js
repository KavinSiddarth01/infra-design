// Application State
let currentStep = 0;
const STEPS = ['Plot Size', 'Room Selection', 'Zodiac & Vastu', 'Directions', 'Visualization'];

const appState = {
    plotData: {
        sizeInCents: 5,
        sizeInSqFt: 2178
    },
    rooms: [],
    zodiacSign: '',
    directions: []
};

let currentView = '2d';

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        document.getElementById('splash-screen').style.display = 'none';
        document.getElementById('app').style.display = 'block';
        renderStep();
    }, 3000);
});

// Navigation
function nextStep() {
    if (currentStep < STEPS.length - 1 && canProceed()) {
        currentStep++;
        renderStep();
        window.scrollTo(0, 0);
    }
}

function previousStep() {
    if (currentStep > 0) {
        currentStep--;
        renderStep();
        window.scrollTo(0, 0);
    }
}

function canProceed() {
    switch (currentStep) {
        case 0:
            return appState.plotData.sizeInSqFt > 0;
        case 1:
            return appState.rooms.length > 0;
        case 2:
            return true;
        case 3:
            return appState.directions.length > 0;
        default:
            return true;
    }
}

// Render Functions
function renderStep() {
    renderProgressSteps();
    renderStepContent();
    updateNavigationButtons();
}

function renderProgressSteps() {
    const container = document.getElementById('progressSteps');
    let html = '';
    
    STEPS.forEach((step, index) => {
        const status = index < currentStep ? 'completed' : index === currentStep ? 'active' : 'inactive';
        
        html += `
            <div class="step-wrapper">
                <div class="step">
                    <div class="step-circle ${status}">
                        ${index < currentStep ? '✓' : index + 1}
                    </div>
                    <div class="step-label ${status === 'active' ? 'active' : ''}">${step}</div>
                </div>
                ${index < STEPS.length - 1 ? `<div class="step-line ${index < currentStep ? 'completed' : 'inactive'}"></div>` : ''}
            </div>
        `;
    });
    
    container.innerHTML = html;
}

function renderStepContent() {
    const container = document.getElementById('stepContent');
    
    switch (currentStep) {
        case 0:
            container.innerHTML = renderPlotSizeStep();
            attachPlotSizeHandlers();
            break;
        case 1:
            container.innerHTML = renderRoomSelectionStep();
            break;
        case 2:
            container.innerHTML = renderZodiacVastuStep();
            break;
        case 3:
            container.innerHTML = renderDirectionStep();
            break;
        case 4:
            container.innerHTML = renderVisualizationStep();
            renderVisualizationContent();
            break;
    }
}

function updateNavigationButtons() {
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    
    prevBtn.disabled = currentStep === 0;
    
    if (currentStep === STEPS.length - 1) {
        nextBtn.innerHTML = `
            <svg class="icon" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"></polyline></svg>
            Complete
        `;
        nextBtn.className = 'btn btn-success';
    } else {
        nextBtn.innerHTML = `
            Next
            <svg class="icon" viewBox="0 0 24 24"><path d="M9 18l6-6-6-6"></path></svg>
        `;
        nextBtn.className = 'btn btn-primary';
    }
    nextBtn.disabled = !canProceed();
}

// Step 1: Plot Size
function renderPlotSizeStep() {
    return `
        <h2>Enter Plot Size</h2>
        <p class="card-subtitle">Specify your plot dimensions to begin planning</p>
        
        <div class="form-grid">
            <div class="form-group">
                <label>Size in Cents <span style="color: #94a3b8;">(1 cent = 435.6 sq ft)</span></label>
                <input type="number" id="plotCents" value="${appState.plotData.sizeInCents}" min="0" step="0.01" placeholder="Enter cents">
            </div>
            
            <div class="form-group">
                <label>Size in Square Feet</label>
                <input type="number" id="plotSqFt" value="${appState.plotData.sizeInSqFt}" min="0" placeholder="Enter square feet">
            </div>
        </div>
        
        <div class="info-box blue">
            <svg class="info-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="16" x2="12" y2="12"></line>
                <line x1="12" y1="8" x2="12.01" y2="8"></line>
            </svg>
            <div class="info-content">
                <h4>Plot Size Guidelines</h4>
                <ul>
                    <li>Small plot: 1-3 cents (436-1,307 sq ft) - 2-3 rooms recommended</li>
                    <li>Medium plot: 3-5 cents (1,307-2,178 sq ft) - 4-6 rooms recommended</li>
                    <li>Large plot: 5+ cents (2,178+ sq ft) - 7+ rooms possible</li>
                </ul>
            </div>
        </div>
    `;
}

function attachPlotSizeHandlers() {
    const centsInput = document.getElementById('plotCents');
    const sqFtInput = document.getElementById('plotSqFt');
    
    centsInput.addEventListener('input', (e) => {
        const cents = parseFloat(e.target.value) || 0;
        appState.plotData.sizeInCents = cents;
        appState.plotData.sizeInSqFt = Math.round(cents * 435.6);
        sqFtInput.value = appState.plotData.sizeInSqFt;
        updateNavigationButtons();
    });
    
    sqFtInput.addEventListener('input', (e) => {
        const sqft = parseFloat(e.target.value) || 0;
        appState.plotData.sizeInSqFt = sqft;
        appState.plotData.sizeInCents = Math.round((sqft / 435.6) * 100) / 100;
        centsInput.value = appState.plotData.sizeInCents;
        updateNavigationButtons();
    });
}

// Step 2: Room Selection
function renderRoomSelectionStep() {
    const totalArea = calculateTotalArea();
    const utilizationPercent = (totalArea / appState.plotData.sizeInSqFt) * 100;
    const isFeasible = utilizationPercent <= 120;
    
    return `
        <h2>Select Rooms</h2>
        <p class="card-subtitle">Choose room types and assign them to floors</p>
        
        <div class="form-grid">
            <div class="form-group">
                <label>Room Type</label>
                <select id="roomType">
                    ${Object.keys(ROOM_LABELS).map(type => 
                        `<option value="${type}">${ROOM_LABELS[type]}</option>`
                    ).join('')}
                </select>
            </div>
            
            <div class="form-group">
                <label>Floor</label>
                <select id="roomFloor">
                    <option value="1">Ground Floor</option>
                    <option value="2">First Floor</option>
                </select>
            </div>
            
            <div class="form-group">
                <label>&nbsp;</label>
                <button class="btn btn-primary" onclick="addRoom()">
                    <svg class="icon" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                    Add Room
                </button>
            </div>
        </div>
        
        ${appState.rooms.length > 0 ? `
            <div>
                <h3 style="margin-bottom: 1rem;">Selected Rooms</h3>
                <div class="room-list">
                    ${appState.rooms.map((room, index) => `
                        <div class="room-item">
                            <div class="room-item-name">
                                <strong>${ROOM_LABELS[room.type]}</strong>
                                <span style="color: #64748b; font-size: 0.875rem; margin-left: 0.5rem;">
                                    (${room.floor === 1 ? 'Ground Floor' : 'First Floor'})
                                </span>
                            </div>
                            <div class="room-item-info">
                                <span style="color: #64748b; font-size: 0.875rem;">
                                    ${ROOM_SIZES[room.type] * room.count} sq ft
                                </span>
                                <input type="number" class="room-count-input" value="${room.count}" 
                                    min="1" onchange="updateRoomCount(${index}, this.value)">
                                <button class="btn-delete" onclick="removeRoom(${index})">
                                    <svg class="icon" viewBox="0 0 24 24">
                                        <polyline points="3 6 5 6 21 6"></polyline>
                                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                    </svg>
                                </button>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        ` : ''}
        
        <div class="info-box ${isFeasible ? 'green' : 'red'}" style="margin-top: 1.5rem;">
            <svg class="info-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                ${isFeasible ? 
                    '<polyline points="20 6 9 17 4 12"></polyline>' : 
                    '<circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line>'
                }
            </svg>
            <div class="info-content">
                <h4>${isFeasible ? 'Feasible Layout' : 'Layout Exceeds Capacity'}</h4>
                <div style="margin-top: 0.5rem;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem; font-size: 0.875rem;">
                        <span>Total Area: ${totalArea} sq ft</span>
                        <span>Plot: ${appState.plotData.sizeInSqFt} sq ft</span>
                    </div>
                    <div class="progress-bar-container">
                        <div class="progress-bar" style="width: ${Math.min(utilizationPercent, 100)}%; 
                            background: ${utilizationPercent > 100 ? '#ef4444' : utilizationPercent > 80 ? '#eab308' : '#22c55e'};"></div>
                    </div>
                    <p style="margin-top: 0.5rem; font-size: 0.875rem;">
                        Utilization: ${utilizationPercent.toFixed(1)}%
                        ${utilizationPercent > 100 ? ' - Please reduce rooms or increase plot size' : ''}
                    </p>
                </div>
            </div>
        </div>
    `;
}

function addRoom() {
    const type = document.getElementById('roomType').value;
    const floor = parseInt(document.getElementById('roomFloor').value);
    
    const existing = appState.rooms.find(r => r.type === type && r.floor === floor);
    if (existing) {
        existing.count++;
    } else {
        appState.rooms.push({ type, count: 1, floor });
    }
    
    renderStep();
}

function removeRoom(index) {
    appState.rooms.splice(index, 1);
    renderStep();
}

function updateRoomCount(index, count) {
    const newCount = parseInt(count);
    if (newCount < 1) {
        removeRoom(index);
    } else {
        appState.rooms[index].count = newCount;
        renderStep();
    }
}

function calculateTotalArea() {
    return appState.rooms.reduce((sum, room) => sum + ROOM_SIZES[room.type] * room.count, 0);
}

// Step 3: Zodiac & Vastu
function renderZodiacVastuStep() {
    const selectedZodiac = appState.zodiacSign ? ZODIAC_VASTU_DATA[appState.zodiacSign] : null;
    const uniqueRoomTypes = [...new Set(appState.rooms.map(r => r.type))];
    
    return `
        <h2>Zodiac Sign & Vastu Preferences</h2>
        <p class="card-subtitle">Select your zodiac sign for personalized Vastu recommendations (optional)</p>
        
        <div class="form-group" style="margin-bottom: 1.5rem;">
            <label>Your Zodiac Sign (Rashi)</label>
            <select id="zodiacSign" onchange="handleZodiacChange(this.value)">
                <option value="">Select your zodiac sign (optional)</option>
                ${Object.keys(ZODIAC_VASTU_DATA).map(key => 
                    `<option value="${key}" ${appState.zodiacSign === key ? 'selected' : ''}>
                        ${ZODIAC_VASTU_DATA[key].name}
                    </option>`
                ).join('')}
            </select>
        </div>
        
        ${appState.zodiacSign && appState.rooms.length > 0 ? `
            <button class="btn btn-gradient" onclick="autoFillDirections()" style="width: 100%; margin-bottom: 1.5rem;">
                <svg class="icon" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path>
                </svg>
                Auto-Fill All Room Directions Based on ${selectedZodiac.name}
            </button>
        ` : ''}
        
        ${selectedZodiac ? `
            <div class="info-box purple">
                <svg class="info-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path>
                </svg>
                <div class="info-content">
                    <h4>${selectedZodiac.name}</h4>
                    <div style="font-size: 0.875rem; margin-top: 0.5rem;">
                        <p><strong>Element:</strong> ${selectedZodiac.element}</p>
                        <p><strong>Ruling Planet:</strong> ${selectedZodiac.ruler}</p>
                        <p style="margin-top: 0.5rem;">${selectedZodiac.description}</p>
                    </div>
                    
                    ${uniqueRoomTypes.length > 0 ? `
                        <div class="zodiac-preview">
                            ${uniqueRoomTypes.map(roomType => `
                                <div class="zodiac-direction-item">
                                    <span style="color: #334155;">${ROOM_LABELS[roomType]}:</span>
                                    <span style="color: #9333ea; margin-left: 0.25rem;">
                                        ${selectedZodiac.directions[roomType].join(', ')}
                                    </span>
                                </div>
                            `).join('')}
                        </div>
                    ` : ''}
                </div>
            </div>
        ` : ''}
        
        <div class="info-box blue" style="${selectedZodiac ? 'margin-top: 1.5rem;' : ''}">
            <svg class="info-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="16" x2="12" y2="12"></line>
                <line x1="12" y1="8" x2="12.01" y2="8"></line>
            </svg>
            <div class="info-content">
                <h4>About Zodiac-Based Vastu</h4>
                <p style="font-size: 0.875rem;">
                    Each zodiac sign has unique elemental properties that align with specific directions.
                    Our recommendations combine traditional Vastu Shastra with astrological insights to
                    enhance energy flow and prosperity in your home. You can also manually customize
                    directions in the next step.
                </p>
            </div>
        </div>
    `;
}

function handleZodiacChange(value) {
    appState.zodiacSign = value;
    renderStep();
}

function autoFillDirections() {
    if (!appState.zodiacSign) return;
    
    const zodiacData = ZODIAC_VASTU_DATA[appState.zodiacSign];
    const uniqueRoomTypes = [...new Set(appState.rooms.map(r => r.type))];
    
    appState.directions = uniqueRoomTypes.map(roomType => ({
        roomType,
        direction: zodiacData.directions[roomType][0]
    }));
    
    alert(`All room directions have been auto-filled based on ${zodiacData.name}!`);
    updateNavigationButtons();
}

// Step 4: Directions
function renderDirectionStep() {
    const uniqueRoomTypes = [...new Set(appState.rooms.map(r => r.type))];
    const vastuScore = calculateVastuScore();
    
    return `
        <h2>Set Room Directions</h2>
        <p class="card-subtitle">Choose the directional placement for each room. Green indicates Vastu-compliant directions.</p>
        
        <div class="direction-rooms">
            ${uniqueRoomTypes.map(roomType => {
                const currentDirection = appState.directions.find(d => d.roomType === roomType)?.direction;
                const recommended = getRecommendedDirections(roomType);
                
                return `
                    <div class="direction-room">
                        <div class="direction-room-header">
                            <div>
                                <h4 style="margin-bottom: 0.25rem;">${ROOM_LABELS[roomType]}</h4>
                                <p style="color: #64748b; font-size: 0.875rem;">
                                    Recommended: ${recommended.join(', ')}
                                </p>
                            </div>
                            ${currentDirection && recommended.includes(currentDirection) ? `
                                <svg style="color: #22c55e; width: 20px; height: 20px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <polyline points="20 6 9 17 4 12"></polyline>
                                </svg>
                            ` : ''}
                        </div>
                        
                        <div class="direction-buttons">
                            ${DIRECTIONS.map(direction => {
                                const isSelected = currentDirection === direction;
                                const isRecommended = recommended.includes(direction);
                                
                                return `
                                    <button class="direction-btn ${isRecommended ? 'recommended' : ''} ${isSelected ? 'selected' : ''}"
                                        onclick="setDirection('${roomType}', '${direction}')">
                                        ${direction}
                                    </button>
                                `;
                            }).join('')}
                        </div>
                    </div>
                `;
            }).join('')}
        </div>
        
        ${appState.directions.length > 0 ? `
            <div class="info-box ${vastuScore >= 80 ? 'green' : vastuScore >= 50 ? 'yellow' : 'red'}">
                <svg class="info-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    ${vastuScore >= 80 ? 
                        '<polyline points="20 6 9 17 4 12"></polyline>' : 
                        '<circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line>'
                    }
                </svg>
                <div class="info-content">
                    <h4>Vastu Compatibility Score: ${vastuScore}%</h4>
                    <div style="margin-top: 0.5rem;">
                        <div class="progress-bar-container">
                            <div class="progress-bar" style="width: ${vastuScore}%; 
                                background: ${vastuScore >= 80 ? '#22c55e' : vastuScore >= 50 ? '#eab308' : '#ef4444'};"></div>
                        </div>
                        <p style="margin-top: 0.5rem; font-size: 0.875rem;">
                            ${vastuScore >= 80 ? 
                                'Excellent! Your layout follows Vastu principles very well.' : 
                                vastuScore >= 50 ? 
                                'Good layout with room for improvement. Consider adjusting highlighted rooms.' : 
                                'Several rooms could benefit from different directions for better Vastu compliance.'}
                        </p>
                    </div>
                </div>
            </div>
        ` : ''}
        
        <div class="info-box blue" style="margin-top: 1.5rem;">
            <svg class="info-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="16" x2="12" y2="12"></line>
                <line x1="12" y1="8" x2="12.01" y2="8"></line>
            </svg>
            <div class="info-content">
                <h4>Direction Guidelines</h4>
                <p style="font-size: 0.875rem;">
                    Green buttons indicate Vastu-compliant directions based on ${appState.zodiacSign ? 'your zodiac sign' : 'traditional Vastu principles'}.
                    You can still choose other directions, but they may affect your Vastu compatibility score.
                </p>
            </div>
        </div>
    `;
}

function setDirection(roomType, direction) {
    const existing = appState.directions.find(d => d.roomType === roomType);
    if (existing) {
        existing.direction = direction;
    } else {
        appState.directions.push({ roomType, direction });
    }
    renderStep();
}

function getRecommendedDirections(roomType) {
    if (appState.zodiacSign && ZODIAC_VASTU_DATA[appState.zodiacSign]) {
        return ZODIAC_VASTU_DATA[appState.zodiacSign].directions[roomType];
    }
    return STANDARD_VASTU[roomType] || [];
}

function calculateVastuScore() {
    if (appState.directions.length === 0) return 0;
    
    const compliant = appState.directions.filter(d => {
        const recommended = getRecommendedDirections(d.roomType);
        return recommended.includes(d.direction);
    }).length;
    
    return Math.round((compliant / appState.directions.length) * 100);
}

// Step 5: Visualization
function renderVisualizationStep() {
    return `
        <h2>Floor Plan Visualization</h2>
        <p class="card-subtitle">View your floor plan in 2D architectural view, 3D isometric view, or detailed report</p>
        
        <div class="view-toggle">
            <button class="btn ${currentView === '2d' ? 'btn-primary' : 'btn-secondary'}" onclick="changeView('2d')">
                2D Floor Plan
            </button>
            <button class="btn ${currentView === '3d' ? 'btn-primary' : 'btn-secondary'}" onclick="changeView('3d')">
                3D Isometric View
            </button>
            <button class="btn ${currentView === 'report' ? 'btn-primary' : 'btn-secondary'}" onclick="changeView('report')">
                Detailed Report
            </button>
            <button class="btn btn-success" style="margin-left: auto;" onclick="exportPDF()">
                <svg class="icon" viewBox="0 0 24 24">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="7 10 12 15 17 10"></polyline>
                    <line x1="12" y1="15" x2="12" y2="3"></line>
                </svg>
                Export PDF
            </button>
        </div>
        
        <div class="canvas-container" id="visualizationContent"></div>
        
        <div class="info-box blue" style="margin-top: 1.5rem;">
            <svg class="info-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="16" x2="12" y2="12"></line>
                <line x1="12" y1="8" x2="12.01" y2="8"></line>
            </svg>
            <div class="info-content">
                <h4>Visualization Guide</h4>
                <p style="font-size: 0.875rem;">
                    The 2D view shows an architectural blueprint with compass directions. The 3D view
                    provides an isometric perspective showing floor separation. The report includes detailed
                    area utilization and Vastu compliance analysis.
                </p>
            </div>
        </div>
    `;
}

function changeView(view) {
    currentView = view;
    renderVisualizationContent();
    
    // Update button states in the DOM
    renderStep();
}

function renderVisualizationContent() {
    const container = document.getElementById('visualizationContent');
    
    if (currentView === '2d') {
        container.innerHTML = `
            <h3 style="margin-bottom: 1rem;">2D Architectural Floor Plan</h3>
            <canvas id="canvas2d"></canvas>
            <div class="legend">
                ${Object.keys(ROOM_COLORS).map(type => `
                    <div class="legend-item">
                        <div class="legend-color" style="background: ${ROOM_COLORS[type]}40; border-color: ${ROOM_COLORS[type]};"></div>
                        <span>${ROOM_LABELS[type]}</span>
                    </div>
                `).join('')}
            </div>
        `;
        setTimeout(() => draw2DFloorPlan(), 100);
    } else if (currentView === '3d') {
        container.innerHTML = `
            <h3 style="margin-bottom: 1rem;">3D Isometric Building View</h3>
            <canvas id="canvas3d"></canvas>
            <div class="info-box blue" style="margin-top: 1rem;">
                <p style="font-size: 0.875rem;">
                    Ground floor shown at base level. First floor (if present) shown elevated above.
                    Rotate perspective mentally to visualize different angles.
                </p>
            </div>
        `;
        setTimeout(() => draw3DFloorPlan(), 100);
    } else {
        container.innerHTML = renderReport();
    }
}

// 2D Floor Plan Drawing
function draw2DFloorPlan() {
    const canvas = document.getElementById('canvas2d');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const width = Math.min(1200, window.innerWidth - 100);
    const height = 700;
    canvas.width = width;
    canvas.height = height;
    
    ctx.clearRect(0, 0, width, height);
    
    const padding = 60;
    const plotWidth = width - padding * 2;
    const plotHeight = height - padding * 2;
    
    // Draw plot boundary
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 3;
    ctx.strokeRect(padding, padding, plotWidth, plotHeight);
    
    // Draw compass
    ctx.fillStyle = '#475569';
    ctx.font = 'bold 14px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('N ↑', width / 2, padding - 30);
    ctx.fillText('S ↓', width / 2, height - padding + 45);
    ctx.save();
    ctx.translate(padding - 35, height / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('W ←', 0, 0);
    ctx.restore();
    ctx.save();
    ctx.translate(width - padding + 35, height / 2);
    ctx.rotate(Math.PI / 2);
    ctx.fillText('E →', 0, 0);
    ctx.restore();
    
    // Draw rooms
    const groundFloor = appState.rooms.filter(r => r.floor === 1);
    const firstFloor = appState.rooms.filter(r => r.floor === 2);
    
    drawFloor2D(ctx, groundFloor, padding, padding, plotWidth, plotHeight, 'Ground Floor');
    
    if (firstFloor.length > 0) {
        // Draw first floor to the right
        const offsetX = plotWidth + padding + 40;
        if (offsetX + plotWidth <= width * 2) {
            // Expand canvas if needed
            canvas.width = offsetX + plotWidth + padding;
            ctx.strokeStyle = '#1e293b';
            ctx.lineWidth = 3;
            ctx.strokeRect(offsetX, padding, plotWidth, plotHeight);
            drawFloor2D(ctx, firstFloor, offsetX, padding, plotWidth, plotHeight, 'First Floor');
        }
    }
}

function drawFloor2D(ctx, rooms, startX, startY, width, height, label) {
    ctx.fillStyle = '#1e293b';
    ctx.font = 'bold 16px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(label, startX + width / 2, startY - 10);
    
    const cols = Math.ceil(Math.sqrt(rooms.length));
    const rows = Math.ceil(rooms.length / cols);
    const cellWidth = width / cols;
    const cellHeight = height / rows;
    
    rooms.forEach((room, index) => {
        const col = index % cols;
        const row = Math.floor(index / cols);
        let x = startX + col * cellWidth;
        let y = startY + row * cellHeight;
        
        // Position based on direction
        const direction = appState.directions.find(d => d.roomType === room.type);
        if (direction) {
            const dir = direction.direction.toLowerCase();
            if (dir.includes('north') && !dir.includes('south')) y = startY;
            if (dir.includes('south')) y = startY + height - cellHeight;
            if (dir.includes('east')) x = startX + width - cellWidth;
            if (dir.includes('west') && !dir.includes('east')) x = startX;
        }
        
        const color = ROOM_COLORS[room.type];
        ctx.fillStyle = color + '40';
        ctx.fillRect(x + 2, y + 2, cellWidth - 4, cellHeight - 4);
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.strokeRect(x + 2, y + 2, cellWidth - 4, cellHeight - 4);
        
        ctx.fillStyle = '#1e293b';
        ctx.font = '12px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(ROOM_LABELS[room.type], x + cellWidth / 2, y + cellHeight / 2 - 5);
        
        if (direction) {
            ctx.fillStyle = '#475569';
            ctx.font = '10px sans-serif';
            ctx.fillText(direction.direction, x + cellWidth / 2, y + cellHeight / 2 + 10);
        }
        
        if (room.count > 1) {
            ctx.fillStyle = color;
            ctx.font = 'bold 10px sans-serif';
            ctx.fillText(`×${room.count}`, x + cellWidth / 2, y + cellHeight / 2 + 25);
        }
    });
}

// 3D Floor Plan Drawing
function draw3DFloorPlan() {
    const canvas = document.getElementById('canvas3d');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const width = Math.min(1200, window.innerWidth - 100);
    const height = 700;
    canvas.width = width;
    canvas.height = height;
    
    ctx.clearRect(0, 0, width, height);
    
    const centerX = width / 2;
    const centerY = height / 2 - 50;
    const scale = 3;
    
    const toIso = (x, y, z) => ({
        x: centerX + (x - y) * scale,
        y: centerY + (x + y) * scale * 0.5 - z * scale
    });
    
    const plotSize = Math.sqrt(appState.plotData.sizeInSqFt);
    
    // Draw ground
    ctx.fillStyle = '#e2e8f0';
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 2;
    
    const corners = [
        toIso(0, 0, 0),
        toIso(plotSize, 0, 0),
        toIso(plotSize, plotSize, 0),
        toIso(0, plotSize, 0)
    ];
    
    ctx.beginPath();
    ctx.moveTo(corners[0].x, corners[0].y);
    corners.forEach(c => ctx.lineTo(c.x, c.y));
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    
    // Draw floors
    const groundFloor = appState.rooms.filter(r => r.floor === 1);
    const firstFloor = appState.rooms.filter(r => r.floor === 2);
    
    drawFloor3D(ctx, toIso, groundFloor, plotSize, 0, 30);
    if (firstFloor.length > 0) {
        drawFloor3D(ctx, toIso, firstFloor, plotSize, 30, 30);
    }
    
    // Draw compass
    drawCompass3D(ctx, 100, height - 100);
}

function drawFloor3D(ctx, toIso, rooms, plotSize, floorZ, floorHeight) {
    const cols = Math.ceil(Math.sqrt(rooms.length));
    const rows = Math.ceil(rooms.length / cols);
    const cellWidth = plotSize / cols;
    const cellDepth = plotSize / rows;
    
    rooms.forEach((room, index) => {
        const col = index % cols;
        const row = Math.floor(index / cols);
        const x = col * cellWidth;
        const y = row * cellDepth;
        
        const color = ROOM_COLORS[room.type];
        drawBox3D(ctx, toIso, x, y, floorZ, cellWidth, cellDepth, floorHeight, color);
        
        const labelPos = toIso(x + cellWidth / 2, y + cellDepth / 2, floorZ + floorHeight);
        ctx.fillStyle = '#1e293b';
        ctx.font = 'bold 11px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(ROOM_LABELS[room.type], labelPos.x, labelPos.y - 5);
        
        const direction = appState.directions.find(d => d.roomType === room.type);
        if (direction) {
            ctx.fillStyle = '#475569';
            ctx.font = '9px sans-serif';
            ctx.fillText(direction.direction, labelPos.x, labelPos.y + 8);
        }
    });
}

function drawBox3D(ctx, toIso, x, y, z, width, depth, height, color) {
    // Top
    ctx.fillStyle = color + 'CC';
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    const top = [
        toIso(x, y, z + height),
        toIso(x + width, y, z + height),
        toIso(x + width, y + depth, z + height),
        toIso(x, y + depth, z + height)
    ];
    ctx.moveTo(top[0].x, top[0].y);
    top.forEach(p => ctx.lineTo(p.x, p.y));
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    
    // Right
    ctx.fillStyle = color + '99';
    ctx.beginPath();
    const right = [
        toIso(x + width, y, z),
        toIso(x + width, y, z + height),
        toIso(x + width, y + depth, z + height),
        toIso(x + width, y + depth, z)
    ];
    ctx.moveTo(right[0].x, right[0].y);
    right.forEach(p => ctx.lineTo(p.x, p.y));
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    
    // Left
    ctx.fillStyle = color + '66';
    ctx.beginPath();
    const left = [
        toIso(x, y, z),
        toIso(x, y, z + height),
        toIso(x, y + depth, z + height),
        toIso(x, y + depth, z)
    ];
    ctx.moveTo(left[0].x, left[0].y);
    left.forEach(p => ctx.lineTo(p.x, p.y));
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
}

function drawCompass3D(ctx, x, y) {
    const size = 40;
    
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.stroke();
    
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.moveTo(x, y - size);
    ctx.lineTo(x - 8, y - 10);
    ctx.lineTo(x, y - 15);
    ctx.lineTo(x + 8, y - 10);
    ctx.closePath();
    ctx.fill();
    
    ctx.fillStyle = '#1e293b';
    ctx.font = 'bold 14px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('N', x, y - size - 10);
    ctx.fillText('S', x, y + size + 20);
    ctx.fillText('E', x + size + 15, y + 5);
    ctx.fillText('W', x - size - 15, y + 5);
}

// Report Generation
function renderReport() {
    const totalArea = calculateTotalArea();
    const utilizationPercent = (totalArea / appState.plotData.sizeInSqFt) * 100;
    const vastuScore = calculateVastuScore();
    const groundFloor = appState.rooms.filter(r => r.floor === 1);
    const firstFloor = appState.rooms.filter(r => r.floor === 2);
    const zodiacData = appState.zodiacSign ? ZODIAC_VASTU_DATA[appState.zodiacSign] : null;
    
    return `
        <h3 style="margin-bottom: 1.5rem;">Comprehensive Vastu Report</h3>
        
        <div class="report-grid">
            <div class="report-card info-box blue">
                <h4>Plot Information</h4>
                <div style="font-size: 0.875rem; margin-top: 0.5rem;">
                    <p>Size: ${appState.plotData.sizeInCents} cents</p>
                    <p>Area: ${appState.plotData.sizeInSqFt} sq ft</p>
                    <p>Total Rooms: ${appState.rooms.reduce((sum, r) => sum + r.count, 0)}</p>
                </div>
            </div>
            
            <div class="report-card info-box ${utilizationPercent <= 100 ? 'green' : 'yellow'}">
                <h4>Area Utilization</h4>
                <div class="report-value">${utilizationPercent.toFixed(1)}%</div>
                <div class="report-label">${totalArea} / ${appState.plotData.sizeInSqFt} sq ft</div>
            </div>
            
            <div class="report-card info-box ${vastuScore >= 80 ? 'green' : vastuScore >= 50 ? 'yellow' : 'red'}">
                <h4>Vastu Score</h4>
                <div class="report-value">${vastuScore}%</div>
                <div class="report-label">
                    ${appState.directions.filter(d => getRecommendedDirections(d.roomType).includes(d.direction)).length} / ${appState.directions.length} compliant
                </div>
            </div>
        </div>
        
        ${zodiacData ? `
            <div class="info-box purple" style="margin-bottom: 1.5rem;">
                <svg class="info-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path>
                </svg>
                <div class="info-content">
                    <h4>Zodiac-Based Analysis: ${zodiacData.name}</h4>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-top: 0.75rem; font-size: 0.875rem;">
                        <div>
                            <p><strong>Element:</strong> ${zodiacData.element}</p>
                            <p><strong>Ruling Planet:</strong> ${zodiacData.ruler}</p>
                        </div>
                        <div>
                            <p>${zodiacData.description}</p>
                        </div>
                    </div>
                </div>
            </div>
        ` : ''}
        
        <h4 style="margin-bottom: 1rem;">Room-by-Room Vastu Analysis</h4>
        <div class="analysis-list">
            ${appState.directions.map(dir => {
                const room = appState.rooms.find(r => r.type === dir.roomType);
                const recommended = getRecommendedDirections(dir.roomType);
                const isGood = recommended.includes(dir.direction);
                
                return `
                    <div class="analysis-item info-box ${isGood ? 'green' : 'red'}">
                        <svg class="info-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            ${isGood ? 
                                '<polyline points="20 6 9 17 4 12"></polyline>' : 
                                '<circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line>'
                            }
                        </svg>
                        <div style="flex: 1;">
                            <h5>${ROOM_LABELS[dir.roomType]}</h5>
                            <div style="font-size: 0.875rem; margin-top: 0.25rem;">
                                <p><strong>Current Direction:</strong> ${dir.direction}</p>
                                <p><strong>Recommended:</strong> ${recommended.join(', ')}</p>
                                ${!isGood ? `<p style="margin-top: 0.25rem;">💡 Consider relocating to ${recommended[0]} for better Vastu compliance</p>` : ''}
                            </div>
                        </div>
                        <div style="font-size: 0.875rem; color: #64748b;">
                            ${room ? (room.floor === 1 ? 'Ground' : 'First') + ' Floor' : ''}
                        </div>
                    </div>
                `;
            }).join('')}
        </div>
        
        <h4 style="margin: 1.5rem 0 1rem;">Floor Distribution</h4>
        <div class="floor-distribution">
            <div class="floor-card">
                <h4>Ground Floor (${groundFloor.length} room types)</h4>
                <ul>
                    ${groundFloor.map(room => `
                        <li>
                            <span>${ROOM_LABELS[room.type]} ×${room.count}</span>
                            <span style="color: #64748b;">${ROOM_SIZES[room.type] * room.count} sq ft</span>
                        </li>
                    `).join('')}
                </ul>
            </div>
            
            ${firstFloor.length > 0 ? `
                <div class="floor-card">
                    <h4>First Floor (${firstFloor.length} room types)</h4>
                    <ul>
                        ${firstFloor.map(room => `
                            <li>
                                <span>${ROOM_LABELS[room.type]} ×${room.count}</span>
                                <span style="color: #64748b;">${ROOM_SIZES[room.type] * room.count} sq ft</span>
                            </li>
                        `).join('')}
                    </ul>
                </div>
            ` : ''}
        </div>
        
        <div class="info-box blue" style="margin-top: 1.5rem;">
            <svg class="info-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="16" x2="12" y2="12"></line>
                <line x1="12" y1="8" x2="12.01" y2="8"></line>
            </svg>
            <div class="info-content">
                <h4>General Recommendations</h4>
                <ul style="font-size: 0.875rem;">
                    <li>Keep the Northeast (Ishanya) corner light and clutter-free for positive energy</li>
                    <li>Main entrance in North, East, or Northeast brings prosperity</li>
                    <li>Master bedroom in Southwest provides stability and rest</li>
                    <li>Kitchen in Southeast enhances health and vitality</li>
                    <li>Toilets should be in Northwest or West to maintain hygiene energy</li>
                    <li>Open spaces like balconies and gardens in North or East are ideal</li>
                </ul>
            </div>
        </div>
    `;
}

function exportPDF() {
    alert('PDF export functionality would be implemented here using a library like jsPDF or html2pdf.js\n\nTo implement this feature, you would:\n1. Include jsPDF library\n2. Capture the current floor plan\n3. Add the report data\n4. Generate and download the PDF');
}
