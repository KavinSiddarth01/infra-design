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

// Room Adjacency Rules
const ROOM_ADJACENCY = {
    main_entrance: {
        preferred: ['hall', 'garden'],
        avoid: ['toilet', 'bathroom', 'kitchen']
    },
    hall: {
        preferred: ['main_entrance', 'dining', 'balcony', 'garden'],
        avoid: ['toilet', 'bathroom']
    },
    kitchen: {
        preferred: ['dining', 'store_room'],
        avoid: ['bedroom', 'toilet', 'bathroom']
    },
    dining: {
        preferred: ['kitchen', 'hall'],
        avoid: ['toilet', 'bathroom', 'bedroom']
    },
    bedroom: {
        preferred: ['bathroom', 'balcony'],
        avoid: ['kitchen', 'main_entrance', 'toilet']
    },
    bathroom: {
        preferred: ['bedroom'],
        avoid: ['kitchen', 'dining', 'hall', 'main_entrance']
    },
    toilet: {
        preferred: ['bathroom'],
        avoid: ['kitchen', 'dining', 'hall', 'main_entrance', 'bedroom']
    },
    balcony: {
        preferred: ['hall', 'bedroom'],
        avoid: ['toilet', 'bathroom']
    },
    garden: {
        preferred: ['main_entrance', 'hall', 'balcony'],
        avoid: ['toilet', 'bathroom']
    },
    store_room: {
        preferred: ['kitchen'],
        avoid: ['bedroom', 'hall']
    }
};

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
                <select id="roomType" onchange="updateDefaultSize()">
                    ${Object.keys(ROOM_LABELS).map(type => 
                        `<option value="${type}">${ROOM_LABELS[type]}</option>`
                    ).join('')}
                </select>
            </div>
            
            <div class="form-group">
                <label>Size (sq ft)</label>
                <input type="number" id="roomSize" value="${ROOM_SIZES[Object.keys(ROOM_LABELS)[0]]}" min="10" step="10" placeholder="Square feet">
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
                                <input type="number" class="room-count-input" value="${room.size}" 
                                    min="10" step="10" style="width: 80px;" onchange="updateRoomSize(${index}, this.value)"
                                    title="Size (sq ft)">
                                <span style="color: #64748b; font-size: 0.875rem; margin-left: 0.25rem;">sq ft</span>
                                <span style="color: #64748b; font-size: 0.875rem; margin: 0 0.5rem;">×</span>
                                <input type="number" class="room-count-input" value="${room.count}" 
                                    min="1" style="width: 60px;" onchange="updateRoomCount(${index}, this.value)"
                                    title="Count">
                                <span style="color: #64748b; font-size: 0.875rem; margin-left: 0.5rem;">
                                    = ${room.size * room.count} sq ft
                                </span>
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
        
        <div class="info-box blue" style="margin-top: 1rem;">
            <svg class="info-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="16" x2="12" y2="12"></line>
                <line x1="12" y1="8" x2="12.01" y2="8"></line>
            </svg>
            <div class="info-content">
                <h4>Room Size Guidelines</h4>
                <div style="font-size: 0.875rem; display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 0.5rem; margin-top: 0.5rem;">
                    <div><strong>Bedroom:</strong> 120-180 sq ft</div>
                    <div><strong>Kitchen:</strong> 80-150 sq ft</div>
                    <div><strong>Hall:</strong> 150-300 sq ft</div>
                    <div><strong>Dining:</strong> 100-150 sq ft</div>
                    <div><strong>Bathroom:</strong> 40-80 sq ft</div>
                    <div><strong>Toilet:</strong> 20-50 sq ft</div>
                </div>
            </div>
        </div>
    `;
}

function updateDefaultSize() {
    const roomType = document.getElementById('roomType').value;
    const sizeInput = document.getElementById('roomSize');
    if (sizeInput) {
        sizeInput.value = ROOM_SIZES[roomType];
    }
}

function addRoom() {
    const type = document.getElementById('roomType').value;
    const floor = parseInt(document.getElementById('roomFloor').value);
    const size = parseInt(document.getElementById('roomSize').value) || ROOM_SIZES[type];
    
    const existing = appState.rooms.find(r => r.type === type && r.floor === floor && r.size === size);
    if (existing) {
        existing.count++;
    } else {
        appState.rooms.push({ type, count: 1, floor, size });
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

function updateRoomSize(index, size) {
    const newSize = parseInt(size);
    if (newSize >= 10) {
        appState.rooms[index].size = newSize;
        renderStep();
    }
}

function calculateTotalArea() {
    return appState.rooms.reduce((sum, room) => sum + room.size * room.count, 0);
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

// Advanced Room Layout Algorithm
function generateRoomLayout(rooms, plotWidth, plotHeight) {
    const layout = [];
    const placedRooms = new Set();
    
    // Sort rooms by priority: entrance first, then by adjacency importance
    const sortedRooms = [...rooms].sort((a, b) => {
        if (a.type === 'main_entrance') return -1;
        if (b.type === 'main_entrance') return 1;
        if (a.type === 'hall') return -1;
        if (b.type === 'hall') return 1;
        return 0;
    });
    
    sortedRooms.forEach(room => {
        const direction = appState.directions.find(d => d.roomType === room.type);
        const position = calculateRoomPosition(room, direction, layout, plotWidth, plotHeight);
        
        layout.push({
            ...room,
            ...position,
            direction: direction?.direction || 'Center'
        });
    });
    
    return layout;
}

function calculateRoomPosition(room, direction, existingLayout, plotWidth, plotHeight) {
    const roomSize = room.size || ROOM_SIZES[room.type];
    const roomWidth = Math.sqrt(roomSize * 1.5);
    const roomHeight = Math.sqrt(roomSize / 1.5);
    
    let x = plotWidth / 2 - roomWidth / 2;
    let y = plotHeight / 2 - roomHeight / 2;
    
    if (direction) {
        const dir = direction.direction.toLowerCase();
        
        // Position based on direction
        if (dir.includes('north') && !dir.includes('south')) {
            y = 0;
        }
        if (dir.includes('south')) {
            y = plotHeight - roomHeight;
        }
        if (dir.includes('east')) {
            x = plotWidth - roomWidth;
        }
        if (dir.includes('west') && !dir.includes('east')) {
            x = 0;
        }
        if (dir.includes('northeast')) {
            x = plotWidth - roomWidth;
            y = 0;
        }
        if (dir.includes('northwest')) {
            x = 0;
            y = 0;
        }
        if (dir.includes('southeast')) {
            x = plotWidth - roomWidth;
            y = plotHeight - roomHeight;
        }
        if (dir.includes('southwest')) {
            x = 0;
            y = plotHeight - roomHeight;
        }
    }
    
    // Check for adjacency preferences
    const adjacency = ROOM_ADJACENCY[room.type];
    if (adjacency && adjacency.preferred.length > 0) {
        for (const prefRoom of adjacency.preferred) {
            const adjacent = existingLayout.find(r => r.type === prefRoom);
            if (adjacent) {
                // Position near preferred room
                x = adjacent.x + adjacent.width;
                y = adjacent.y;
                break;
            }
        }
    }
    
    // Avoid overlaps
    let attempts = 0;
    while (attempts < 10 && checkOverlap(x, y, roomWidth, roomHeight, existingLayout)) {
        x += roomWidth * 0.3;
        if (x + roomWidth > plotWidth) {
            x = 0;
            y += roomHeight * 0.3;
        }
        attempts++;
    }
    
    return {
        x: Math.max(0, Math.min(x, plotWidth - roomWidth)),
        y: Math.max(0, Math.min(y, plotHeight - roomHeight)),
        width: roomWidth,
        height: roomHeight
    };
}

function checkOverlap(x, y, width, height, layout) {
    return layout.some(room => {
        return !(x + width < room.x || 
                x > room.x + room.width || 
                y + height < room.y || 
                y > room.y + room.height);
    });
}

// Step 5: Visualization
function renderVisualizationStep() {
    return `
        <h2>Floor Plan Visualization</h2>
        <p class="card-subtitle">View your realistic floor plan in 2D architectural view, 3D isometric view, or detailed report</p>
        
        <div class="view-toggle">
            <button class="btn ${currentView === '2d' ? 'btn-primary' : 'btn-secondary'}" onclick="changeView('2d')">
                📐 2D Floor Plan
            </button>
            <button class="btn ${currentView === '3d' ? 'btn-primary' : 'btn-secondary'}" onclick="changeView('3d')">
                🏗️ 3D Isometric View
            </button>
            <button class="btn ${currentView === 'report' ? 'btn-primary' : 'btn-secondary'}" onclick="changeView('report')">
                📊 Detailed Report
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
                    The 2D view shows an architectural blueprint with walls, doors, windows, and furniture. 
                    The 3D view provides a realistic isometric perspective with proper building structure and details.
                    The report includes comprehensive area utilization and Vastu compliance analysis.
                </p>
            </div>
        </div>
    `;
}

function changeView(view) {
    currentView = view;
    renderVisualizationContent();
    renderStep();
}

// Generate room dimensions summary table
function generateRoomDimensionsTable() {
    if (appState.rooms.length === 0) return '';
    
    let totalArea = 0;
    const roomDetails = appState.rooms.map(room => {
        const area = room.size || ROOM_SIZES[room.type];
        totalArea += area * room.count;
        
        // Calculate approximate dimensions
        const ratio = 1.5; // typical room ratio
        const widthInFeet = Math.round(Math.sqrt(area * ratio));
        const heightInFeet = Math.round(area / widthInFeet);
        
        return {
            name: ROOM_LABELS[room.type],
            floor: room.floor === 1 ? 'Ground' : 'First',
            dimensions: `${widthInFeet}' × ${heightInFeet}'`,
            area: area,
            count: room.count,
            total: area * room.count
        };
    });
    
    return `
        <div class="info-box" style="margin-top: 1.5rem; background: #f8fafc; border: 2px solid #e2e8f0;">
            <div style="overflow-x: auto;">
                <h4 style="margin-bottom: 1rem; color: #1e293b;">📐 Room Dimensions Summary</h4>
                <table style="width: 100%; border-collapse: collapse; font-size: 0.875rem;">
                    <thead>
                        <tr style="background: #e2e8f0; text-align: left;">
                            <th style="padding: 0.75rem; border: 1px solid #cbd5e1;">Room</th>
                            <th style="padding: 0.75rem; border: 1px solid #cbd5e1;">Floor</th>
                            <th style="padding: 0.75rem; border: 1px solid #cbd5e1;">Dimensions</th>
                            <th style="padding: 0.75rem; border: 1px solid #cbd5e1;">Area (sq ft)</th>
                            <th style="padding: 0.75rem; border: 1px solid #cbd5e1;">Count</th>
                            <th style="padding: 0.75rem; border: 1px solid #cbd5e1;">Total (sq ft)</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${roomDetails.map((room, index) => `
                            <tr style="background: ${index % 2 === 0 ? '#ffffff' : '#f8fafc'};">
                                <td style="padding: 0.75rem; border: 1px solid #cbd5e1; font-weight: 500;">${room.name}</td>
                                <td style="padding: 0.75rem; border: 1px solid #cbd5e1;">${room.floor}</td>
                                <td style="padding: 0.75rem; border: 1px solid #cbd5e1; font-family: monospace; color: #2563eb;">${room.dimensions}</td>
                                <td style="padding: 0.75rem; border: 1px solid #cbd5e1; text-align: right;">${room.area}</td>
                                <td style="padding: 0.75rem; border: 1px solid #cbd5e1; text-align: center;">${room.count}</td>
                                <td style="padding: 0.75rem; border: 1px solid #cbd5e1; text-align: right; font-weight: 600;">${room.total}</td>
                            </tr>
                        `).join('')}
                        <tr style="background: #dbeafe; font-weight: bold;">
                            <td colspan="5" style="padding: 0.75rem; border: 1px solid #cbd5e1; text-align: right;">TOTAL BUILT-UP AREA:</td>
                            <td style="padding: 0.75rem; border: 1px solid #cbd5e1; text-align: right; color: #1e40af;">${totalArea} sq ft</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

function renderVisualizationContent() {
    const container = document.getElementById('visualizationContent');
    
    if (currentView === '2d') {
        container.innerHTML = `
            <h3 style="margin-bottom: 1rem;">2D Architectural Floor Plan with Details</h3>
            <canvas id="canvas2d"></canvas>
            ${generateRoomDimensionsTable()}
            <div class="legend">
                ${Object.keys(ROOM_COLORS).map(type => `
                    <div class="legend-item">
                        <div class="legend-color" style="background: ${ROOM_COLORS[type]}40; border-color: ${ROOM_COLORS[type]};"></div>
                        <span>${ROOM_LABELS[type]}</span>
                    </div>
                `).join('')}
            </div>
        `;
        setTimeout(() => {
            if (typeof draw2DFloorPlan_Sketch !== 'undefined') {
                draw2DFloorPlan_Sketch();
            } else {
                draw2DFloorPlan();
            }
        }, 100);
    } else if (currentView === '3d') {
        container.innerHTML = `
            <h3 style="margin-bottom: 1rem;">3D Isometric Sketch View</h3>
            <canvas id="canvas3d"></canvas>
            ${generateRoomDimensionsTable()}
            <div class="info-box blue" style="margin-top: 1rem;">
                <p style="font-size: 0.875rem;">
                    Hand-drawn architectural sketch showing 3D isometric view with rooms, roof, and layout details in a neat sketch style.
                </p>
            </div>
        `;
        setTimeout(() => {
            if (typeof draw3DFloorPlan_Clean !== 'undefined') {
                draw3DFloorPlan_Clean();
            } else {
                draw3DFloorPlan();
            }
        }, 100);
    } else {
        container.innerHTML = renderReport();
    }
}

// Simple 2D Floor Plan - Clean and minimal
function draw2DFloorPlan() {
    const canvas = document.getElementById('canvas2d');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const width = Math.min(1400, window.innerWidth - 100);
    const height = 900;
    canvas.width = width;
    canvas.height = height;
    
    ctx.clearRect(0, 0, width, height);
    
    const padding = 120;
    const plotWidth = width - padding * 2;
    const plotHeight = height - padding * 2 - 150;
    
    // Clean white background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);
    
    // Light grid
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 0.5;
    for (let x = 0; x < width; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
    }
    for (let y = 0; y < height; y += 40) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
    }
    
    // Title
    ctx.fillStyle = '#1f2937';
    ctx.font = 'bold 24px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('2D Floor Plan', width / 2, 50);
    
    // Plot boundary
    ctx.strokeStyle = '#9ca3af';
    ctx.lineWidth = 2;
    ctx.strokeRect(padding, padding, plotWidth, plotHeight);
    
    // Directional labels
    ctx.fillStyle = '#6b7280';
    ctx.font = 'bold 14px Arial, sans-serif';
    ctx.fillText('N ↑', width / 2, padding - 40);
    ctx.fillText('S ↓', width / 2, padding + plotHeight + 50);
    ctx.fillText('W ←', padding - 40, padding + plotHeight / 2);
    ctx.fillText('E →', padding + plotWidth + 40, padding + plotHeight / 2);
    
    // Draw rooms
    const groundFloor = appState.rooms.filter(r => r.floor === 1);
    const groundLayout = generateRoomLayout(groundFloor, plotWidth, plotHeight);
    
    ctx.save();
    ctx.translate(padding, padding);
    drawSimple2DRooms(ctx, groundLayout);
    ctx.restore();
    
    // Draw dimensions table
    drawDimensionsTable2D(ctx, width, height - 130);
}

function drawSimple2DRooms(ctx, roomLayout) {
    roomLayout.forEach((room) => {
        const color = ROOM_COLORS[room.type];
        const area = room.size || ROOM_SIZES[room.type];
        
        // Room fill with opacity
        ctx.fillStyle = color + '40';
        ctx.fillRect(room.x, room.y, room.width, room.height);
        
        // Room border
        ctx.strokeStyle = color;
        ctx.lineWidth = 3;
        ctx.strokeRect(room.x, room.y, room.width, room.height);
        
        // Room label
        ctx.fillStyle = '#1f2937';
        ctx.font = 'bold 14px Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const centerX = room.x + room.width / 2;
        const centerY = room.y + room.height / 2;
        
        ctx.fillText(ROOM_LABELS[room.type], centerX, centerY - 10);
        
        // Area
        ctx.font = '12px Arial, sans-serif';
        ctx.fillStyle = '#6b7280';
        ctx.fillText(area + ' sq ft', centerX, centerY + 8);
        
        // Direction
        if (room.direction) {
            ctx.font = '11px Arial, sans-serif';
            ctx.fillStyle = color;
            ctx.fillText('(' + room.direction + ')', centerX, centerY + 22);
        }
        
        // Main entrance indicator
        if (room.type === 'main_entrance') {
            ctx.fillStyle = '#dc2626';
            ctx.fillRect(room.x + room.width / 2 - 15, room.y - 8, 30, 8);
            ctx.font = 'bold 10px Arial, sans-serif';
            ctx.fillStyle = '#ffffff';
            ctx.fillText('ENTRANCE', room.x + room.width / 2, room.y - 2);
        }
    });
}

function drawCompassRose(ctx, x, y, size) {
    ctx.save();
    ctx.translate(x, y);
    
    // Outer circle
    ctx.strokeStyle = '#2563eb';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, size, 0, Math.PI * 2);
    ctx.stroke();
    
    // North arrow (red)
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.moveTo(0, -size);
    ctx.lineTo(-size * 0.3, 0);
    ctx.lineTo(0, -size * 0.6);
    ctx.lineTo(size * 0.3, 0);
    ctx.closePath();
    ctx.fill();
    
    // Cardinal directions
    ctx.fillStyle = '#1e293b';
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('N', 0, -size - 15);
    ctx.fillText('S', 0, size + 15);
    ctx.fillText('E', size + 15, 0);
    ctx.fillText('W', -size - 15, 0);
    
    ctx.restore();
}

function drawScale(ctx, x, y, length) {
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 2;
    ctx.fillStyle = '#1e293b';
    ctx.font = '12px sans-serif';
    
    // Scale line
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + length, y);
    ctx.stroke();
    
    // Ticks
    for (let i = 0; i <= 4; i++) {
        const tickX = x + (length / 4) * i;
        ctx.beginPath();
        ctx.moveTo(tickX, y - 5);
        ctx.lineTo(tickX, y + 5);
        ctx.stroke();
    }
    
    ctx.textAlign = 'center';
    ctx.fillText('0', x, y + 20);
    ctx.fillText('5 ft', x + length / 2, y + 20);
    ctx.fillText('10 ft', x + length, y + 20);
}

function drawFloor2DRealistic(ctx, roomLayout, plotWidth, plotHeight, label) {
    // Draw floor label
    ctx.fillStyle = '#1e293b';
    ctx.font = 'bold 18px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(label, 10, -20);
    
    // Draw each room with realistic details
    roomLayout.forEach((room, index) => {
        const color = ROOM_COLORS[room.type];
        
        // Room floor
        ctx.fillStyle = color + '15';
        ctx.fillRect(room.x, room.y, room.width, room.height);
        
        // Walls
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 3;
        ctx.strokeRect(room.x, room.y, room.width, room.height);
        
        // Add doors
        drawDoor(ctx, room, roomLayout);
        
        // Add windows based on direction
        drawWindows(ctx, room);
        
        // Add furniture/fixtures
        drawFurniture(ctx, room);
        
        // Calculate dimensions in feet from area
        const area = room.size || ROOM_SIZES[room.type];
        const widthInFeet = Math.round(Math.sqrt(area * (room.width / room.height)));
        const heightInFeet = Math.round(area / widthInFeet);
        
        // Room label - centered and prominent
        ctx.fillStyle = '#1e293b';
        ctx.font = 'bold 13px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const labelY = room.y + room.height / 2;
        ctx.fillText(ROOM_LABELS[room.type], room.x + room.width / 2, labelY - 15);
        
        // Direction label
        if (room.direction) {
            ctx.fillStyle = color;
            ctx.font = '11px sans-serif';
            ctx.fillText(`(${room.direction})`, room.x + room.width / 2, labelY);
        }
        
        // Dimensions display - area and dimensions
        ctx.fillStyle = '#64748b';
        ctx.font = 'bold 11px sans-serif';
        ctx.fillText(`${area} sq ft`, room.x + room.width / 2, labelY + 15);
        
        ctx.font = '10px sans-serif';
        ctx.fillText(`${widthInFeet}' × ${heightInFeet}'`, room.x + room.width / 2, labelY + 28);
        
        // Draw dimension lines with measurements (only if room is large enough)
        if (room.width > 80 && room.height > 80) {
            drawDimensionLine(ctx, room, widthInFeet, heightInFeet);
        }
    });
}

// New function to draw dimension lines
function drawDimensionLine(ctx, room, widthFt, heightFt) {
    ctx.strokeStyle = '#94a3b8';
    ctx.fillStyle = '#64748b';
    ctx.lineWidth = 1;
    ctx.font = '9px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    const arrowSize = 4;
    const offset = 8;
    
    // Horizontal dimension (width) - top
    const topY = room.y - offset;
    const leftX = room.x + 5;
    const rightX = room.x + room.width - 5;
    
    // Draw line
    ctx.beginPath();
    ctx.moveTo(leftX, topY);
    ctx.lineTo(rightX, topY);
    ctx.stroke();
    
    // Draw arrows
    ctx.beginPath();
    ctx.moveTo(leftX, topY);
    ctx.lineTo(leftX + arrowSize, topY - arrowSize);
    ctx.lineTo(leftX + arrowSize, topY + arrowSize);
    ctx.closePath();
    ctx.fill();
    
    ctx.beginPath();
    ctx.moveTo(rightX, topY);
    ctx.lineTo(rightX - arrowSize, topY - arrowSize);
    ctx.lineTo(rightX - arrowSize, topY + arrowSize);
    ctx.closePath();
    ctx.fill();
    
    // Draw width measurement
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(room.x + room.width / 2 - 15, topY - 7, 30, 14);
    ctx.fillStyle = '#1e293b';
    ctx.fillText(`${widthFt}'`, room.x + room.width / 2, topY);
    
    // Vertical dimension (height) - left
    const leftLineX = room.x - offset;
    const topLineY = room.y + 5;
    const bottomLineY = room.y + room.height - 5;
    
    // Draw line
    ctx.beginPath();
    ctx.moveTo(leftLineX, topLineY);
    ctx.lineTo(leftLineX, bottomLineY);
    ctx.stroke();
    
    // Draw arrows
    ctx.beginPath();
    ctx.moveTo(leftLineX, topLineY);
    ctx.lineTo(leftLineX - arrowSize, topLineY + arrowSize);
    ctx.lineTo(leftLineX + arrowSize, topLineY + arrowSize);
    ctx.closePath();
    ctx.fill();
    
    ctx.beginPath();
    ctx.moveTo(leftLineX, bottomLineY);
    ctx.lineTo(leftLineX - arrowSize, bottomLineY - arrowSize);
    ctx.lineTo(leftLineX + arrowSize, bottomLineY - arrowSize);
    ctx.closePath();
    ctx.fill();
    
    // Draw height measurement with rotation
    ctx.save();
    ctx.translate(leftLineX, room.y + room.height / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(-15, -7, 30, 14);
    ctx.fillStyle = '#1e293b';
    ctx.fillText(`${heightFt}'`, 0, 0);
    ctx.restore();
}

function drawDoor(ctx, room, allRooms) {
    const doorWidth = 20;
    const doorColor = '#8b4513';
    
    // Determine door position based on adjacency
    let doorX, doorY, doorAngle = 0;
    
    // Default: door on the side facing center or main entrance
    if (room.type === 'main_entrance') {
        // Main entrance on front wall
        doorX = room.x + room.width / 2 - doorWidth / 2;
        doorY = room.y;
        doorAngle = 0;
    } else {
        // Interior doors
        doorX = room.x;
        doorY = room.y + room.height / 2 - doorWidth / 2;
        doorAngle = Math.PI / 2;
    }
    
    ctx.save();
    ctx.translate(doorX + doorWidth / 2, doorY + doorWidth / 2);
    ctx.rotate(doorAngle);
    
    // Door
    ctx.fillStyle = doorColor;
    ctx.fillRect(-doorWidth / 2, -3, doorWidth, 6);
    
    // Door arc (opening)
    ctx.strokeStyle = doorColor;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(-doorWidth / 2, 0, doorWidth, -Math.PI / 2, 0);
    ctx.stroke();
    
    // Door handle
    ctx.fillStyle = '#ffd700';
    ctx.beginPath();
    ctx.arc(doorWidth / 3, 0, 2, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.restore();
}

function drawWindows(ctx, room) {
    const windowWidth = 15;
    const windowColor = '#60a5fa';
    const dir = room.direction?.toLowerCase() || '';
    
    // Draw windows on exterior walls based on direction
    if (dir.includes('north')) {
        // Window on north wall
        drawWindow(ctx, room.x + room.width / 2 - windowWidth / 2, room.y, windowWidth, false);
    }
    if (dir.includes('south')) {
        // Window on south wall
        drawWindow(ctx, room.x + room.width / 2 - windowWidth / 2, room.y + room.height, windowWidth, false);
    }
    if (dir.includes('east')) {
        // Window on east wall
        drawWindow(ctx, room.x + room.width, room.y + room.height / 2 - windowWidth / 2, windowWidth, true);
    }
    if (dir.includes('west')) {
        // Window on west wall
        drawWindow(ctx, room.x, room.y + room.height / 2 - windowWidth / 2, windowWidth, true);
    }
}

function drawWindow(ctx, x, y, size, vertical) {
    ctx.strokeStyle = '#3b82f6';
    ctx.fillStyle = '#bfdbfe';
    ctx.lineWidth = 2;
    
    if (vertical) {
        ctx.fillRect(x - 2, y, 4, size);
        ctx.strokeRect(x - 2, y, 4, size);
        // Panes
        ctx.beginPath();
        ctx.moveTo(x, y + size / 2);
        ctx.lineTo(x, y + size / 2);
        ctx.stroke();
    } else {
        ctx.fillRect(x, y - 2, size, 4);
        ctx.strokeRect(x, y - 2, size, 4);
        // Panes
        ctx.beginPath();
        ctx.moveTo(x + size / 2, y);
        ctx.lineTo(x + size / 2, y);
        ctx.stroke();
    }
}

function drawFurniture(ctx, room) {
    const furnitureColor = '#94a3b8';
    const centerX = room.x + room.width / 2;
    const centerY = room.y + room.height / 2;
    
    ctx.fillStyle = furnitureColor;
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 1;
    
    switch (room.type) {
        case 'bedroom':
            // Bed
            ctx.fillRect(centerX - 20, centerY - 15, 40, 30);
            ctx.strokeRect(centerX - 20, centerY - 15, 40, 30);
            // Pillows
            ctx.fillStyle = '#cbd5e1';
            ctx.fillRect(centerX - 18, centerY - 13, 15, 8);
            ctx.fillRect(centerX + 3, centerY - 13, 15, 8);
            break;
            
        case 'kitchen':
            // Counter
            ctx.fillRect(room.x + 5, room.y + 5, room.width - 10, 15);
            ctx.strokeRect(room.x + 5, room.y + 5, room.width - 10, 15);
            // Stove
            ctx.fillStyle = '#ef4444';
            ctx.fillRect(centerX - 10, room.y + 7, 20, 11);
            ctx.strokeRect(centerX - 10, room.y + 7, 20, 11);
            break;
            
        case 'dining':
            // Table
            ctx.fillRect(centerX - 25, centerY - 20, 50, 40);
            ctx.strokeRect(centerX - 25, centerY - 20, 50, 40);
            // Chairs (simple circles)
            ctx.beginPath();
            ctx.arc(centerX, centerY - 25, 5, 0, Math.PI * 2);
            ctx.arc(centerX, centerY + 25, 5, 0, Math.PI * 2);
            ctx.arc(centerX - 30, centerY, 5, 0, Math.PI * 2);
            ctx.arc(centerX + 30, centerY, 5, 0, Math.PI * 2);
            ctx.fill();
            break;
            
        case 'hall':
            // Sofa
            ctx.fillRect(centerX - 30, centerY + 10, 60, 15);
            ctx.strokeRect(centerX - 30, centerY + 10, 60, 15);
            // Coffee table
            ctx.fillRect(centerX - 20, centerY - 10, 40, 15);
            ctx.strokeRect(centerX - 20, centerY - 10, 40, 15);
            break;
            
        case 'bathroom':
        case 'toilet':
            // Toilet
            ctx.beginPath();
            ctx.arc(centerX, centerY, 8, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            // Sink
            ctx.beginPath();
            ctx.arc(room.x + 15, room.y + 15, 6, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            break;
            
        case 'balcony':
            // Railing
            ctx.strokeStyle = '#64748b';
            ctx.lineWidth = 2;
            for (let i = 0; i < 5; i++) {
                ctx.beginPath();
                ctx.moveTo(room.x + 10 + i * 15, room.y + 5);
                ctx.lineTo(room.x + 10 + i * 15, room.y + 25);
                ctx.stroke();
            }
            break;
            
        case 'garden':
            // Plants
            ctx.fillStyle = '#22c55e';
            for (let i = 0; i < 3; i++) {
                ctx.beginPath();
                ctx.arc(room.x + 20 + i * 25, room.y + 20, 8, 0, Math.PI * 2);
                ctx.fill();
            }
            break;
    }
}

// Enhanced 3D Floor Plan with realistic building
function draw3DFloorPlan() {
    const canvas = document.getElementById('canvas3d');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const width = Math.min(1400, window.innerWidth - 100);
    const height = 900;
    canvas.width = width;
    canvas.height = height;
    
    ctx.clearRect(0, 0, width, height);
    
    // Background gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, '#e0f2fe');
    gradient.addColorStop(1, '#f0f9ff');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
    
    const centerX = width / 2;
    const centerY = height / 2 + 50;
    const scale = 4;
    
    const toIso = (x, y, z) => ({
        x: centerX + (x - y) * scale,
        y: centerY + (x + y) * scale * 0.5 - z * scale
    });
    
    const plotSize = Math.sqrt(appState.plotData.sizeInSqFt);
    
    // Draw ground/lawn
    drawGround(ctx, toIso, plotSize * 1.2);
    
    // Draw plot boundary (compound wall)
    drawCompoundWall(ctx, toIso, plotSize);
    
    // Draw building
    const groundFloor = appState.rooms.filter(r => r.floor === 1);
    const firstFloor = appState.rooms.filter(r => r.floor === 2);
    
    const groundLayout = generateRoomLayout(groundFloor, plotSize, plotSize);
    
    // Draw foundation
    drawFoundation(ctx, toIso, plotSize);
    
    // Draw ground floor
    drawFloor3DRealistic(ctx, toIso, groundLayout, plotSize, 0, 40);
    
    // Draw first floor if exists
    if (firstFloor.length > 0) {
        const firstLayout = generateRoomLayout(firstFloor, plotSize, plotSize);
        drawFloor3DRealistic(ctx, toIso, firstLayout, plotSize, 40, 40);
        // Draw roof
        drawRoof(ctx, toIso, plotSize, 80);
    } else {
        // Draw roof for ground floor only
        drawRoof(ctx, toIso, plotSize, 40);
    }
    
    // Draw compass
    drawCompass3D(ctx, 120, height - 120);
    
    // Add sun
    drawSun(ctx, width - 100, 100);
    
    // Add trees around
    drawTree(ctx, toIso, -plotSize * 0.3, -plotSize * 0.3, 0);
    drawTree(ctx, toIso, plotSize * 1.3, -plotSize * 0.2, 0);
}

function drawGround(ctx, toIso, size) {
    // Lawn
    const groundCorners = [
        toIso(-size * 0.2, -size * 0.2, 0),
        toIso(size * 1.2, -size * 0.2, 0),
        toIso(size * 1.2, size * 1.2, 0),
        toIso(-size * 0.2, size * 1.2, 0)
    ];
    
    ctx.fillStyle = '#86efac';
    ctx.strokeStyle = '#22c55e';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(groundCorners[0].x, groundCorners[0].y);
    groundCorners.forEach(c => ctx.lineTo(c.x, c.y));
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    
    // Grass pattern
    ctx.strokeStyle = '#4ade80';
    ctx.lineWidth = 0.5;
    for (let i = 0; i < 20; i++) {
        const p1 = toIso(-size * 0.2 + Math.random() * size * 1.4, -size * 0.2 + Math.random() * size * 1.4, 0);
        const p2 = toIso(-size * 0.2 + Math.random() * size * 1.4, -size * 0.2 + Math.random() * size * 1.4, 0);
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
    }
}

function drawCompoundWall(ctx, toIso, size) {
    const wallHeight = 5;
    const offset = -2;
    
    // Wall color
    ctx.fillStyle = '#d6d3d1';
    ctx.strokeStyle = '#78716c';
    ctx.lineWidth = 1.5;
    
    // Front wall (with gate opening)
    const gateWidth = size * 0.2;
    const gateStart = size * 0.4;
    
    // Left section of front wall
    drawWallSection(ctx, toIso, offset, offset, gateStart, offset, wallHeight);
    // Right section of front wall
    drawWallSection(ctx, toIso, gateStart + gateWidth, offset, size - offset, offset, wallHeight);
    // Back wall
    drawWallSection(ctx, toIso, offset, size - offset, size - offset, size - offset, wallHeight);
    // Left wall
    drawWallSection(ctx, toIso, offset, offset, offset, size - offset, wallHeight);
    // Right wall
    drawWallSection(ctx, toIso, size - offset, offset, size - offset, size - offset, wallHeight);
    
    // Gate posts
    drawBox3DRealistic(ctx, toIso, gateStart - 1, offset - 1, 0, 2, 2, wallHeight, '#78716c');
    drawBox3DRealistic(ctx, toIso, gateStart + gateWidth - 1, offset - 1, 0, 2, 2, wallHeight, '#78716c');
}

function drawWallSection(ctx, toIso, x1, y1, x2, y2, height) {
    const steps = Math.abs(x2 - x1) + Math.abs(y2 - y1);
    const dx = (x2 - x1) / steps;
    const dy = (y2 - y1) / steps;
    
    for (let i = 0; i < steps; i += 2) {
        const x = x1 + dx * i;
        const y = y1 + dy * i;
        drawBox3DRealistic(ctx, toIso, x, y, 0, 2, 1, height, '#d6d3d1');
    }
}

function drawFoundation(ctx, toIso, size) {
    const foundationHeight = 2;
    
    ctx.fillStyle = '#a8a29e';
    ctx.strokeStyle = '#78716c';
    ctx.lineWidth = 1;
    
    // Foundation base
    const base = [
        toIso(0, 0, 0),
        toIso(size, 0, 0),
        toIso(size, size, 0),
        toIso(0, size, 0)
    ];
    
    ctx.beginPath();
    ctx.moveTo(base[0].x, base[0].y);
    base.forEach(b => ctx.lineTo(b.x, b.y));
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    
    // Foundation walls
    drawBox3DRealistic(ctx, toIso, 0, 0, 0, size, size, foundationHeight, '#a8a29e');
}

function drawFloor3DRealistic(ctx, toIso, roomLayout, plotSize, floorZ, floorHeight) {
    const wallThickness = 1;
    
    // Draw exterior walls first
    drawBox3DRealistic(ctx, toIso, 0, 0, floorZ, plotSize, plotSize, floorHeight, '#e7e5e4', true);
    
    // Draw each room
    roomLayout.forEach((room, index) => {
        const color = ROOM_COLORS[room.type];
        
        // Room floor
        const floor = [
            toIso(room.x, room.y, floorZ),
            toIso(room.x + room.width, room.y, floorZ),
            toIso(room.x + room.width, room.y + room.height, floorZ),
            toIso(room.x, room.y + room.height, floorZ)
        ];
        
        ctx.fillStyle = color + '30';
        ctx.strokeStyle = color;
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(floor[0].x, floor[0].y);
        floor.forEach(f => ctx.lineTo(f.x, f.y));
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        
        // Interior walls
        ctx.strokeStyle = '#a8a29e';
        ctx.lineWidth = 2;
        
        // Draw wall sections
        const wallPoints = [
            [toIso(room.x, room.y, floorZ), toIso(room.x, room.y, floorZ + floorHeight)],
            [toIso(room.x + room.width, room.y, floorZ), toIso(room.x + room.width, room.y, floorZ + floorHeight)],
            [toIso(room.x + room.width, room.y + room.height, floorZ), toIso(room.x + room.width, room.y + room.height, floorZ + floorHeight)],
            [toIso(room.x, room.y + room.height, floorZ), toIso(room.x, room.y + room.height, floorZ + floorHeight)]
        ];
        
        wallPoints.forEach(wall => {
            ctx.beginPath();
            ctx.moveTo(wall[0].x, wall[0].y);
            ctx.lineTo(wall[1].x, wall[1].y);
            ctx.stroke();
        });
        
        // Draw windows on exterior walls
        if (room.x === 0 || room.x + room.width === plotSize || 
            room.y === 0 || room.y + room.height === plotSize) {
            drawWindow3D(ctx, toIso, room, floorZ, floorHeight);
        }
        
        // Calculate dimensions in feet from area
        const area = room.size || ROOM_SIZES[room.type];
        const widthInFeet = Math.round(Math.sqrt(area * (room.width / room.height)));
        const heightInFeet = Math.round(area / widthInFeet);
        
        // Room label with dimensions - positioned above the room
        const labelPos = toIso(room.x + room.width / 2, room.y + room.height / 2, floorZ + floorHeight + 5);
        
        // Room name
        ctx.fillStyle = '#1e293b';
        ctx.font = 'bold 12px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(ROOM_LABELS[room.type], labelPos.x, labelPos.y - 8);
        
        // Direction label
        if (room.direction) {
            ctx.fillStyle = color;
            ctx.font = '10px sans-serif';
            ctx.fillText(`(${room.direction})`, labelPos.x, labelPos.y + 3);
        }
        
        // Dimensions - area and physical dimensions
        ctx.fillStyle = '#64748b';
        ctx.font = 'bold 10px sans-serif';
        ctx.fillText(`${area} sq ft`, labelPos.x, labelPos.y + 14);
        
        ctx.font = '9px sans-serif';
        ctx.fillText(`${widthInFeet}' × ${heightInFeet}'`, labelPos.x, labelPos.y + 25);
    });
}

function drawWindow3D(ctx, toIso, room, floorZ, floorHeight) {
    const windowHeight = floorHeight * 0.4;
    const windowZ = floorZ + floorHeight * 0.3;
    const windowWidth = 8;
    
    ctx.fillStyle = '#bfdbfe';
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 1;
    
    // Window on appropriate wall
    const centerX = room.x + room.width / 2;
    const centerY = room.y + room.height / 2;
    
    const w1 = toIso(centerX - windowWidth / 2, room.y, windowZ);
    const w2 = toIso(centerX + windowWidth / 2, room.y, windowZ);
    const w3 = toIso(centerX + windowWidth / 2, room.y, windowZ + windowHeight);
    const w4 = toIso(centerX - windowWidth / 2, room.y, windowZ + windowHeight);
    
    ctx.beginPath();
    ctx.moveTo(w1.x, w1.y);
    ctx.lineTo(w2.x, w2.y);
    ctx.lineTo(w3.x, w3.y);
    ctx.lineTo(w4.x, w4.y);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
}

function drawRoof(ctx, toIso, size, baseZ) {
    const roofHeight = 15;
    const roofColor = '#dc2626';
    const roofEdgeColor = '#991b1b';
    
    // Pitched roof
    const apex = toIso(size / 2, size / 2, baseZ + roofHeight);
    
    // Front face
    ctx.fillStyle = roofColor;
    ctx.strokeStyle = roofEdgeColor;
    ctx.lineWidth = 2;
    
    const corners = [
        toIso(0, 0, baseZ),
        toIso(size, 0, baseZ),
        toIso(size, size, baseZ),
        toIso(0, size, baseZ)
    ];
    
    // Front slope
    ctx.beginPath();
    ctx.moveTo(corners[0].x, corners[0].y);
    ctx.lineTo(corners[1].x, corners[1].y);
    ctx.lineTo(apex.x, apex.y);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    
    // Right slope
    ctx.fillStyle = '#b91c1c';
    ctx.beginPath();
    ctx.moveTo(corners[1].x, corners[1].y);
    ctx.lineTo(corners[2].x, corners[2].y);
    ctx.lineTo(apex.x, apex.y);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    
    // Back slope
    ctx.fillStyle = '#7f1d1d';
    ctx.beginPath();
    ctx.moveTo(corners[2].x, corners[2].y);
    ctx.lineTo(corners[3].x, corners[3].y);
    ctx.lineTo(apex.x, apex.y);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    
    // Left slope
    ctx.fillStyle = '#991b1b';
    ctx.beginPath();
    ctx.moveTo(corners[3].x, corners[3].y);
    ctx.lineTo(corners[0].x, corners[0].y);
    ctx.lineTo(apex.x, apex.y);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
}

function drawBox3DRealistic(ctx, toIso, x, y, z, width, depth, height, color, hollow = false) {
    const baseColor = color;
    const topColor = color;
    const sideColor = adjustColor(color, -20);
    
    // Top face
    ctx.fillStyle = topColor;
    ctx.strokeStyle = adjustColor(color, -40);
    ctx.lineWidth = 1;
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
    if (!hollow) ctx.fill();
    ctx.stroke();
    
    // Right face
    ctx.fillStyle = sideColor;
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
    if (!hollow) ctx.fill();
    ctx.stroke();
    
    // Left face
    ctx.fillStyle = adjustColor(color, -30);
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
    if (!hollow) ctx.fill();
    ctx.stroke();
}

function adjustColor(color, amount) {
    const num = parseInt(color.replace('#', ''), 16);
    const r = Math.max(0, Math.min(255, (num >> 16) + amount));
    const g = Math.max(0, Math.min(255, ((num >> 8) & 0x00FF) + amount));
    const b = Math.max(0, Math.min(255, (num & 0x0000FF) + amount));
    return '#' + ((r << 16) | (g << 8) | b).toString(16).padStart(6, '0');
}

function drawCompass3D(ctx, x, y) {
    const size = 50;
    
    // Circle
    ctx.strokeStyle = '#2563eb';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.stroke();
    
    ctx.fillStyle = '#2563eb';
    ctx.beginPath();
    ctx.arc(x, y, size - 5, 0, Math.PI * 2);
    ctx.fill();
    
    // North arrow (red)
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.moveTo(x, y - size + 5);
    ctx.lineTo(x - 10, y);
    ctx.lineTo(x, y - size * 0.5);
    ctx.lineTo(x + 10, y);
    ctx.closePath();
    ctx.fill();
    
    // South arrow (white)
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(x, y + size - 5);
    ctx.lineTo(x - 10, y);
    ctx.lineTo(x, y + size * 0.5);
    ctx.lineTo(x + 10, y);
    ctx.closePath();
    ctx.fill();
    
    // Labels
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 16px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('N', x, y - size - 15);
    ctx.fillStyle = '#1e293b';
    ctx.fillText('S', x, y + size + 25);
    ctx.fillText('E', x + size + 20, y + 5);
    ctx.fillText('W', x - size - 20, y + 5);
}

function drawSun(ctx, x, y) {
    // Sun
    ctx.fillStyle = '#fbbf24';
    ctx.beginPath();
    ctx.arc(x, y, 30, 0, Math.PI * 2);
    ctx.fill();
    
    // Rays
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 3;
    for (let i = 0; i < 8; i++) {
        const angle = (Math.PI * 2 / 8) * i;
        ctx.beginPath();
        ctx.moveTo(x + Math.cos(angle) * 35, y + Math.sin(angle) * 35);
        ctx.lineTo(x + Math.cos(angle) * 50, y + Math.sin(angle) * 50);
        ctx.stroke();
    }
}

function drawTree(ctx, toIso, x, y, z) {
    // Trunk
    const trunk = [
        toIso(x, y, z),
        toIso(x + 3, y, z),
        toIso(x + 3, y + 3, z),
        toIso(x, y + 3, z)
    ];
    
    ctx.fillStyle = '#78350f';
    ctx.beginPath();
    ctx.moveTo(trunk[0].x, trunk[0].y);
    trunk.forEach(t => ctx.lineTo(t.x, t.y));
    ctx.closePath();
    ctx.fill();
    
    // Trunk height
    const trunkTop = [
        toIso(x, y, z + 10),
        toIso(x + 3, y, z + 10),
        toIso(x + 3, y + 3, z + 10),
        toIso(x, y + 3, z + 10)
    ];
    
    ctx.fillStyle = '#92400e';
    ctx.beginPath();
    ctx.moveTo(trunk[0].x, trunk[0].y);
    ctx.lineTo(trunkTop[0].x, trunkTop[0].y);
    ctx.lineTo(trunkTop[1].x, trunkTop[1].y);
    ctx.lineTo(trunk[1].x, trunk[1].y);
    ctx.closePath();
    ctx.fill();
    
    // Foliage
    const foliageCenter = toIso(x + 1.5, y + 1.5, z + 15);
    ctx.fillStyle = '#22c55e';
    ctx.beginPath();
    ctx.arc(foliageCenter.x, foliageCenter.y, 20, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = '#16a34a';
    ctx.beginPath();
    ctx.arc(foliageCenter.x - 5, foliageCenter.y - 5, 15, 0, Math.PI * 2);
    ctx.fill();
}

// Draw Dimensions Table for 2D View
function drawDimensionsTable2D(ctx, canvasWidth, startY) {
    if (appState.rooms.length === 0) return;
    
    const tableX = 60;
    const tableWidth = canvasWidth - 120;
    const rowHeight = 22;
    const headerHeight = 28;

    // Draw table title
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 14px Arial, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('DIMENSIONS SUMMARY', tableX, startY - 12);

    // Draw header background
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(tableX, startY, tableWidth, headerHeight);

    // Draw header text
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 11px Arial, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('ROOM NAME', tableX + 10, startY + 18);
    ctx.fillText('DIMENSIONS', tableX + tableWidth * 0.45, startY + 18);
    ctx.fillText('AREA', tableX + tableWidth * 0.7, startY + 18);

    // Draw rows
    let currentY = startY + headerHeight;
    let totalArea = 0;

    // Group rooms by type
    const roomGroups = new Map();
    appState.rooms.forEach(room => {
        const area = room.size || ROOM_SIZES[room.type];
        const label = ROOM_LABELS[room.type];
        if (roomGroups.has(label)) {
            const existing = roomGroups.get(label);
            existing.area += area * room.count;
            existing.count += room.count;
        } else {
            roomGroups.set(label, { area: area * room.count, count: room.count });
        }
    });

    let rowIndex = 0;
    roomGroups.forEach((data, roomName) => {
        const widthFeet = Math.round(Math.sqrt(data.area * 1.5));
        const heightFeet = Math.round(data.area / widthFeet);

        // Alternate row colors
        ctx.fillStyle = rowIndex % 2 === 0 ? '#f8fafc' : '#ffffff';
        ctx.fillRect(tableX, currentY, tableWidth, rowHeight);

        // Draw border
        ctx.strokeStyle = '#e2e8f0';
        ctx.lineWidth = 1;
        ctx.strokeRect(tableX, currentY, tableWidth, rowHeight);

        // Draw text
        ctx.fillStyle = '#0f172a';
        ctx.font = '11px Arial, sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(roomName + (data.count > 1 ? ' (×' + data.count + ')' : ''), tableX + 10, currentY + 15);
        ctx.fillText(widthFeet + '\' × ' + heightFeet + '\'', tableX + tableWidth * 0.45, currentY + 15);
        ctx.fillText(data.area.toFixed(0) + ' sq ft', tableX + tableWidth * 0.7, currentY + 15);

        totalArea += data.area;
        currentY += rowHeight;
        rowIndex++;
    });

    // Draw total row
    ctx.fillStyle = '#dbeafe';
    ctx.fillRect(tableX, currentY, tableWidth, headerHeight);
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 2;
    ctx.strokeRect(tableX, currentY, tableWidth, headerHeight);

    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 12px Arial, sans-serif';
    ctx.fillText('TOTAL BUILT-UP AREA', tableX + 10, currentY + 18);
    ctx.fillText(totalArea.toFixed(0) + ' sq ft', tableX + tableWidth * 0.7, currentY + 18);
}

// Report Generation (keeping existing function)
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
                            <span style="color: #64748b;">${(room.size || ROOM_SIZES[room.type]) * room.count} sq ft</span>
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
                                <span style="color: #64748b;">${(room.size || ROOM_SIZES[room.type]) * room.count} sq ft</span>
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
