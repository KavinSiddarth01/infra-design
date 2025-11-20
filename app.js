// Application state
let appState = {
    currentStep: 0,
    plotData: {
        size: 0,
        unit: 'sqft'
    },
    roomCounts: {
        mainDoors: 1,
        halls: 0,
        dining: 0,
        kitchens: 0,
        bedrooms: 0,
        bathrooms: 0,
        toilets: 0,
        gardens: 0,
        balconies: 0,
        storeRooms: 0
    },
    floorAssignment: {
        groundFloor: {
            halls: 0,
            dining: 0,
            kitchens: 0,
            bedrooms: 0,
            bathrooms: 0,
            toilets: 0,
            gardens: 0,
            balconies: 0,
            storeRooms: 0
        },
        firstFloor: {
            halls: 0,
            dining: 0,
            kitchens: 0,
            bedrooms: 0,
            bathrooms: 0,
            toilets: 0,
            gardens: 0,
            balconies: 0,
            storeRooms: 0
        }
    },
    roomSizes: {
        hall: { width: 15, height: 15 },
        dining: { width: 12, height: 12 },
        kitchen: { width: 10, height: 10 },
        bedroom: { width: 12, height: 12 },
        bathroom: { width: 7, height: 7 },
        toilet: { width: 5, height: 6 },
        garden: { width: 15, height: 10 },
        balcony: { width: 10, height: 8 },
        storeRoom: { width: 8, height: 8 }
    },
    directions: {
        mainDoor: 'north',
        hall: 'north',
        dining: 'east',
        kitchen: 'southeast',
        bedroom: 'southwest',
        bathroom: 'northwest',
        toilet: 'northwest',
        garden: 'north',
        balcony: 'east',
        storeRoom: 'south',
        enableVastu: true
    },
    currentTab: 'ground'
};

const roomTypes = [
    { key: 'halls', label: 'Living Room/Hall', icon: '🛋️', sizeKey: 'hall' },
    { key: 'dining', label: 'Dining Area', icon: '🍽️', sizeKey: 'dining' },
    { key: 'kitchens', label: 'Kitchen', icon: '🍳', sizeKey: 'kitchen' },
    { key: 'bedrooms', label: 'Bedroom', icon: '🛏️', sizeKey: 'bedroom' },
    { key: 'bathrooms', label: 'Bathroom', icon: '🛁', sizeKey: 'bathroom' },
    { key: 'toilets', label: 'Toilet', icon: '🚽', sizeKey: 'toilet' },
    { key: 'gardens', label: 'Garden', icon: '🌳', sizeKey: 'garden' },
    { key: 'balconies', label: 'Balcony', icon: '🏡', sizeKey: 'balcony' },
    { key: 'storeRooms', label: 'Store Room', icon: '📦', sizeKey: 'storeRoom' }
];

// Initialize app
window.addEventListener('DOMContentLoaded', () => {
    // Show splash screen for 3 seconds
    setTimeout(() => {
        document.getElementById('splashScreen').style.display = 'none';
        document.getElementById('mainApp').style.display = 'block';
        initializeStep0();
    }, 3000);
});

// Step 0: Plot Size
function initializeStep0() {
    const plotSizeInput = document.getElementById('plotSize');
    const unitRadios = document.querySelectorAll('input[name="unit"]');

    plotSizeInput.addEventListener('input', updatePlotSummary);
    unitRadios.forEach(radio => {
        radio.addEventListener('change', updatePlotSummary);
    });

    if (appState.plotData.size > 0) {
        plotSizeInput.value = appState.plotData.size;
        document.querySelector(`input[name="unit"][value="${appState.plotData.unit}"]`).checked = true;
        updatePlotSummary();
    }
}

function updatePlotSummary() {
    const plotSize = parseFloat(document.getElementById('plotSize').value) || 0;
    const unit = document.querySelector('input[name="unit"]:checked').value;
    const summaryDiv = document.getElementById('plotSummary');

    if (plotSize > 0) {
        const sqft = unit === 'cents' ? plotSize * 435.6 : plotSize;
        summaryDiv.style.display = 'block';
        summaryDiv.innerHTML = `
            <p><strong>Plot Area:</strong> ${plotSize} ${unit === 'cents' ? 'cents' : 'sq.ft'}</p>
            <p><strong>Equivalent:</strong> ${Math.round(sqft)} sq.ft</p>
            <p><strong>Estimated Dimensions:</strong> ${Math.round(Math.sqrt(sqft))}' × ${Math.round(sqft / Math.sqrt(sqft))}'</p>
        `;
    } else {
        summaryDiv.style.display = 'none';
    }
}

// Step 1: Room Count
function initializeStep1() {
    renderRoomCountGrids();
    renderRoomSizesGrid();
    updateTotalRooms();
}

function renderRoomCountGrids() {
    const groundFloorGrid = document.getElementById('groundFloorGrid');
    const firstFloorGrid = document.getElementById('firstFloorGrid');

    groundFloorGrid.innerHTML = roomTypes.map(room => createRoomCountItem(room, 'groundFloor')).join('');
    firstFloorGrid.innerHTML = roomTypes.map(room => createRoomCountItem(room, 'firstFloor')).join('');
}

function createRoomCountItem(room, floor) {
    const count = appState.floorAssignment[floor][room.key] || 0;
    return `
        <div class="room-count-item">
            <div class="room-label">
                <span class="room-icon">${room.icon}</span>
                <span>${room.label}</span>
            </div>
            <div class="counter-controls">
                <button class="counter-btn" onclick="updateRoomCount('${floor}', '${room.key}', -1)" ${count === 0 ? 'disabled' : ''}>−</button>
                <div class="counter-value">${count}</div>
                <button class="counter-btn" onclick="updateRoomCount('${floor}', '${room.key}', 1)">+</button>
            </div>
        </div>
    `;
}

function updateRoomCount(floor, roomKey, delta) {
    const currentCount = appState.floorAssignment[floor][roomKey] || 0;
    const newCount = Math.max(0, currentCount + delta);
    appState.floorAssignment[floor][roomKey] = newCount;
    
    // Update total room count
    appState.roomCounts[roomKey] = 
        appState.floorAssignment.groundFloor[roomKey] + 
        appState.floorAssignment.firstFloor[roomKey];
    
    renderRoomCountGrids();
    updateTotalRooms();
}

function renderRoomSizesGrid() {
    const grid = document.getElementById('roomSizesGrid');
    grid.innerHTML = roomTypes.map(room => {
        const size = appState.roomSizes[room.sizeKey];
        return `
            <div class="room-size-item">
                <div class="room-size-label">${room.label}</div>
                <div class="size-inputs">
                    <div class="size-input-group">
                        <label>Width (ft)</label>
                        <input type="number" 
                               value="${size.width}" 
                               min="1" 
                               max="100" 
                               step="0.5"
                               onchange="updateRoomSize('${room.sizeKey}', 'width', this.value)">
                    </div>
                    <span>×</span>
                    <div class="size-input-group">
                        <label>Height (ft)</label>
                        <input type="number" 
                               value="${size.height}" 
                               min="1" 
                               max="100" 
                               step="0.5"
                               onchange="updateRoomSize('${room.sizeKey}', 'height', this.value)">
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function updateRoomSize(sizeKey, dimension, value) {
    const numValue = parseFloat(value) || 0;
    appState.roomSizes[sizeKey][dimension] = Math.max(1, Math.min(100, numValue));
}

function updateTotalRooms() {
    const total = Object.values(appState.roomCounts).reduce((sum, count) => sum + count, 0);
    document.getElementById('totalRooms').textContent = `Total Rooms: ${total}`;
}

function switchTab(tab) {
    appState.currentTab = tab;
    
    // Update tab triggers
    document.querySelectorAll('.tab-trigger').forEach(trigger => {
        trigger.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // Update tab contents
    document.getElementById('groundFloorTab').classList.toggle('active', tab === 'ground');
    document.getElementById('firstFloorTab').classList.toggle('active', tab === 'first');
}

// Step 2: Direction Preferences
function initializeStep2() {
    renderDirectionGrid();
}

function renderDirectionGrid() {
    const grid = document.getElementById('directionGrid');
    const enableVastu = appState.directions.enableVastu;
    
    const directionItems = [
        { key: 'mainDoor', label: 'Main Entrance', icon: '🚪' },
        { key: 'hall', label: 'Living Room/Hall', icon: '🛋️' },
        { key: 'dining', label: 'Dining Area', icon: '🍽️' },
        { key: 'kitchen', label: 'Kitchen', icon: '🍳' },
        { key: 'bedroom', label: 'Master Bedroom', icon: '🛏️' },
        { key: 'bathroom', label: 'Bathroom', icon: '🛁' },
        { key: 'toilet', label: 'Toilet', icon: '🚽' },
        { key: 'garden', label: 'Garden', icon: '🌳' },
        { key: 'balcony', label: 'Balcony', icon: '🏡' },
        { key: 'storeRoom', label: 'Store Room', icon: '📦' }
    ];

    grid.innerHTML = directionItems.map(item => {
        const direction = appState.directions[item.key];
        const vastuInfo = enableVastu ? getVastuValidation(item.key, direction) : { status: 'neutral', message: '' };
        
        return `
            <div class="direction-item vastu-${vastuInfo.status}">
                <div class="direction-header">
                    <div class="direction-label">
                        <span>${item.icon}</span>
                        <span>${item.label}</span>
                    </div>
                    ${enableVastu ? `<span class="vastu-badge ${vastuInfo.status}">${vastuInfo.status}</span>` : ''}
                </div>
                <select class="direction-select" onchange="updateDirection('${item.key}', this.value)">
                    <option value="north" ${direction === 'north' ? 'selected' : ''}>North</option>
                    <option value="northeast" ${direction === 'northeast' ? 'selected' : ''}>Northeast</option>
                    <option value="east" ${direction === 'east' ? 'selected' : ''}>East</option>
                    <option value="southeast" ${direction === 'southeast' ? 'selected' : ''}>Southeast</option>
                    <option value="south" ${direction === 'south' ? 'selected' : ''}>South</option>
                    <option value="southwest" ${direction === 'southwest' ? 'selected' : ''}>Southwest</option>
                    <option value="west" ${direction === 'west' ? 'selected' : ''}>West</option>
                    <option value="northwest" ${direction === 'northwest' ? 'selected' : ''}>Northwest</option>
                </select>
                ${enableVastu && vastuInfo.message ? `<div class="vastu-message ${vastuInfo.status}">${vastuInfo.message}</div>` : ''}
            </div>
        `;
    }).join('');
}

function updateDirection(key, value) {
    appState.directions[key] = value;
    renderDirectionGrid();
}

function toggleVastuValidation() {
    appState.directions.enableVastu = document.getElementById('enableVastu').checked;
    renderDirectionGrid();
}

// Navigation
function nextStep(currentStep) {
    // Validate current step
    if (currentStep === 0) {
        const plotSize = parseFloat(document.getElementById('plotSize').value);
        if (!plotSize || plotSize <= 0) {
            alert('Please enter a valid plot size');
            return;
        }
        appState.plotData.size = plotSize;
        appState.plotData.unit = document.querySelector('input[name="unit"]:checked').value;
    } else if (currentStep === 1) {
        const totalRooms = Object.values(appState.roomCounts).reduce((sum, count) => sum + count, 0);
        if (totalRooms === 0) {
            alert('Please add at least one room');
            return;
        }
    }

    // Move to next step
    goToStep(currentStep + 1);
    
    // Initialize next step
    if (currentStep === 0) {
        initializeStep1();
    } else if (currentStep === 1) {
        initializeStep2();
    } else if (currentStep === 2) {
        generateBlueprint();
    }
}

function previousStep(currentStep) {
    goToStep(currentStep - 1);
}

function goToStep(step) {
    appState.currentStep = step;
    
    // Hide all steps
    for (let i = 0; i <= 3; i++) {
        const stepEl = document.getElementById(`step${i}`);
        if (stepEl) stepEl.style.display = 'none';
    }
    
    // Show current step
    document.getElementById(`step${step}`).style.display = 'block';
    
    // Update progress
    updateProgressSteps();
}

function updateProgressSteps() {
    document.querySelectorAll('.step-circle').forEach((circle, index) => {
        circle.classList.remove('active', 'completed');
        if (index < appState.currentStep) {
            circle.classList.add('completed');
        } else if (index === appState.currentStep) {
            circle.classList.add('active');
        }
    });
}

function resetApp() {
    // Reset state
    appState = {
        currentStep: 0,
        plotData: { size: 0, unit: 'sqft' },
        roomCounts: {
            mainDoors: 1,
            halls: 0,
            dining: 0,
            kitchens: 0,
            bedrooms: 0,
            bathrooms: 0,
            toilets: 0,
            gardens: 0,
            balconies: 0,
            storeRooms: 0
        },
        floorAssignment: {
            groundFloor: {
                halls: 0,
                dining: 0,
                kitchens: 0,
                bedrooms: 0,
                bathrooms: 0,
                toilets: 0,
                gardens: 0,
                balconies: 0,
                storeRooms: 0
            },
            firstFloor: {
                halls: 0,
                dining: 0,
                kitchens: 0,
                bedrooms: 0,
                bathrooms: 0,
                toilets: 0,
                gardens: 0,
                balconies: 0,
                storeRooms: 0
            }
        },
        roomSizes: {
            hall: { width: 15, height: 15 },
            dining: { width: 12, height: 12 },
            kitchen: { width: 10, height: 10 },
            bedroom: { width: 12, height: 12 },
            bathroom: { width: 7, height: 7 },
            toilet: { width: 5, height: 6 },
            garden: { width: 15, height: 10 },
            balcony: { width: 10, height: 8 },
            storeRoom: { width: 8, height: 8 }
        },
        directions: {
            mainDoor: 'north',
            hall: 'north',
            dining: 'east',
            kitchen: 'southeast',
            bedroom: 'southwest',
            bathroom: 'northwest',
            toilet: 'northwest',
            garden: 'north',
            balcony: 'east',
            storeRoom: 'south',
            enableVastu: true
        },
        currentTab: 'ground'
    };
    
    // Reset form
    document.getElementById('plotSize').value = '';
    document.getElementById('plotSummary').style.display = 'none';
    document.querySelector('input[name="unit"][value="sqft"]').checked = true;
    
    // Go back to step 0
    goToStep(0);
    initializeStep0();
}

// Generate Blueprint and Report
function generateBlueprint() {
    const plotSizeSqft = appState.plotData.unit === 'cents' 
        ? appState.plotData.size * 435.6 
        : appState.plotData.size;
    
    const plotWidth = Math.sqrt(plotSizeSqft);
    const plotHeight = plotSizeSqft / plotWidth;
    
    // Update plot info
    document.getElementById('plotInfo').innerHTML = `
        <strong>Plot Size:</strong> ${appState.plotData.size} ${appState.plotData.unit === 'cents' ? 'cents' : 'sq.ft'} 
        (${Math.round(plotSizeSqft)} sq.ft | ${Math.round(plotWidth)}' × ${Math.round(plotHeight)}')
    `;
    
    // Generate floor plans
    const container = document.getElementById('blueprintContainer');
    container.innerHTML = '';
    
    // Ground Floor
    const hasGroundFloor = Object.values(appState.floorAssignment.groundFloor).some(count => count > 0);
    if (hasGroundFloor) {
        container.innerHTML += generateFloorPlan('Ground Floor', appState.floorAssignment.groundFloor, plotWidth, plotHeight, true);
    }
    
    // First Floor
    const hasFirstFloor = Object.values(appState.floorAssignment.firstFloor).some(count => count > 0);
    if (hasFirstFloor) {
        container.innerHTML += generateFloorPlan('First Floor', appState.floorAssignment.firstFloor, plotWidth, plotHeight, false);
    }
    
    // Generate report
    generateReport(plotSizeSqft);
}

function generateReport(plotSizeSqft) {
    const totalRooms = Object.values(appState.roomCounts).reduce((sum, count) => sum + count, 0);
    
    // Calculate area usage
    let totalUsedArea = 0;
    roomTypes.forEach(room => {
        const count = appState.roomCounts[room.key];
        const size = appState.roomSizes[room.sizeKey];
        totalUsedArea += count * size.width * size.height;
    });
    
    const utilizationPercent = Math.round((totalUsedArea / plotSizeSqft) * 100);
    
    // Vastu compliance
    let vastuScore = 0;
    let vastuChecks = 0;
    const recommendations = [];
    
    if (appState.directions.enableVastu) {
        Object.keys(appState.directions).forEach(key => {
            if (key !== 'enableVastu') {
                const validation = getVastuValidation(key, appState.directions[key]);
                vastuChecks++;
                if (validation.status === 'good') vastuScore += 100;
                else if (validation.status === 'neutral') vastuScore += 60;
                else recommendations.push(validation.message);
            }
        });
    }
    
    const vastuPercentage = vastuChecks > 0 ? Math.round(vastuScore / vastuChecks) : 0;
    
    const reportsContainer = document.getElementById('reportsContainer');
    reportsContainer.innerHTML = `
        <div class="card report-card">
            <div class="card-header">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                    <line x1="16" y1="13" x2="8" y2="13"></line>
                    <line x1="16" y1="17" x2="8" y2="17"></line>
                    <polyline points="10 9 9 9 8 9"></polyline>
                </svg>
                <h3>Design Analysis Report</h3>
            </div>
            <div class="card-body">
                ${appState.directions.enableVastu ? `
                <div class="vastu-score">
                    <div>
                        <div class="vastu-score-value">${vastuPercentage}%</div>
                        <div class="vastu-score-label">Vastu Compliance Score</div>
                    </div>
                </div>
                ` : ''}
                
                <div class="report-section">
                    <h4>Space Utilization</h4>
                    <div class="report-grid">
                        <div class="report-item">
                            <div class="report-label">Total Rooms</div>
                            <div class="report-value">${totalRooms}</div>
                        </div>
                        <div class="report-item">
                            <div class="report-label">Plot Area</div>
                            <div class="report-value">${Math.round(plotSizeSqft)} sq.ft</div>
                        </div>
                        <div class="report-item">
                            <div class="report-label">Used Area</div>
                            <div class="report-value">${Math.round(totalUsedArea)} sq.ft</div>
                        </div>
                        <div class="report-item">
                            <div class="report-label">Utilization</div>
                            <div class="report-value">${utilizationPercent}%</div>
                        </div>
                    </div>
                </div>
                
                ${utilizationPercent > 100 ? `
                <div class="info-box" style="background: #fef2f2; border-color: #ef4444;">
                    <p style="color: #991b1b;"><strong>⚠️ Warning:</strong> Room requirements exceed plot size by ${utilizationPercent - 100}%. Consider reducing room sizes or selecting a larger plot.</p>
                </div>
                ` : ''}
                
                ${recommendations.length > 0 ? `
                <div class="report-section">
                    <h4>Vastu Recommendations</h4>
                    <ul class="vastu-recommendations">
                        ${recommendations.map(rec => `<li>${rec}</li>`).join('')}
                    </ul>
                </div>
                ` : ''}
            </div>
        </div>
    `;
}
