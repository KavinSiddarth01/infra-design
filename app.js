// Application state
let appState = {
    currentStep: 0,
    plotData: {
        size: 0,
        unit: 'sqft'
    },
    roomCounts: {
        mainDoors: 1,
        halls: 1,
        dining: 1,
        kitchens: 1,
        bedrooms: 2,
        bathrooms: 2
    },
    directions: {
        mainDoor: 'north',
        hall: 'north',
        kitchen: 'southeast',
        bedroom: 'southwest',
        bathroom: 'northwest',
        enableVastu: true
    }
};

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
    const size = parseFloat(document.getElementById('plotSize').value);
    const unit = document.querySelector('input[name="unit"]:checked').value;
    const summaryDiv = document.getElementById('plotSummary');

    if (size && size > 0) {
        const convertedSize = unit === 'cents' ? size * 435.6 : size;
        summaryDiv.style.display = 'block';
        summaryDiv.innerHTML = `
            <p style="color: #1e3a8a; margin-bottom: 0;">
                <span>Plot Size: </span>
                <span>${size.toLocaleString()} ${unit}</span>
            </p>
            ${unit === 'cents' ? `<p style="color: #1e40af; margin: 0;">≈ ${convertedSize.toLocaleString()} sq ft</p>` : ''}
        `;
    } else {
        summaryDiv.style.display = 'none';
    }
}

// Step 1: Room Count
function initializeStep1() {
    const roomTypes = [
        { key: 'mainDoors', label: 'Main Entrance', min: 1 },
        { key: 'halls', label: 'Living Room/Hall', min: 0 },
        { key: 'dining', label: 'Dining Area', min: 0 },
        { key: 'kitchens', label: 'Kitchen', min: 0 },
        { key: 'bedrooms', label: 'Bedroom', min: 0 },
        { key: 'bathrooms', label: 'Bathroom/Toilet', min: 0 }
    ];

    const grid = document.getElementById('roomCountGrid');
    grid.innerHTML = '';

    roomTypes.forEach(({ key, label, min }) => {
        const item = document.createElement('div');
        item.className = 'room-count-item';
        item.innerHTML = `
            <label>${label}</label>
            <div class="room-count-controls">
                <button onclick="updateRoomCount('${key}', -1, ${min})" ${appState.roomCounts[key] <= min ? 'disabled' : ''}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                    </svg>
                </button>
                <span class="room-count-value" data-key="${key}">${appState.roomCounts[key]}</span>
                <button onclick="updateRoomCount('${key}', 1, ${min})" ${appState.roomCounts[key] >= 10 ? 'disabled' : ''}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="12" y1="5" x2="12" y2="19"></line>
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                    </svg>
                </button>
            </div>
        `;
        grid.appendChild(item);
    });

    updateTotalRooms();
}

function updateRoomCount(key, delta, min) {
    const newValue = Math.max(min, Math.min(10, appState.roomCounts[key] + delta));
    appState.roomCounts[key] = newValue;
    initializeStep1();
}

function updateTotalRooms() {
    const total = appState.roomCounts.halls + appState.roomCounts.dining + 
                  appState.roomCounts.kitchens + appState.roomCounts.bedrooms + 
                  appState.roomCounts.bathrooms;
    document.getElementById('totalRooms').textContent = `Total Rooms: ${total}`;
}

// Step 2: Direction Preferences
function initializeStep2() {
    const enableVastuCheckbox = document.getElementById('enableVastu');
    enableVastuCheckbox.checked = appState.directions.enableVastu;
    enableVastuCheckbox.addEventListener('change', (e) => {
        appState.directions.enableVastu = e.target.checked;
        renderDirectionGrid();
    });

    renderDirectionGrid();
}

function renderDirectionGrid() {
    const grid = document.getElementById('directionGrid');
    grid.innerHTML = '';

    const roomConfig = getRoomConfig();
    const directions = [
        { value: 'north', label: 'North' },
        { value: 'south', label: 'South' },
        { value: 'east', label: 'East' },
        { value: 'west', label: 'West' },
        { value: 'northeast', label: 'North-East' },
        { value: 'northwest', label: 'North-West' },
        { value: 'southeast', label: 'South-East' },
        { value: 'southwest', label: 'South-West' }
    ];

    roomConfig.forEach(({ key, label, description }) => {
        const direction = appState.directions[key];
        const vastu = getVastuRecommendation(key, direction);

        const item = document.createElement('div');
        item.className = 'direction-item';
        
        const selectOptions = directions.map(d => 
            `<option value="${d.value}" ${d.value === direction ? 'selected' : ''}>${d.label}</option>`
        ).join('');

        let vastuFeedbackHTML = '';
        if (appState.directions.enableVastu) {
            const vastuClass = vastu.rating === 'favorable' ? 'favorable' : 
                             vastu.rating === 'neutral' ? 'neutral' : 'unfavorable';
            
            const iconSVG = vastu.rating === 'favorable' 
                ? '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>'
                : '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>';

            vastuFeedbackHTML = `
                <div class="vastu-feedback ${vastuClass}">
                    ${iconSVG}
                    <div>
                        <p class="vastu-message">${vastu.message}</p>
                        ${vastu.alternatives.length > 0 ? `<p class="vastu-alternatives">Better alternatives: ${vastu.alternatives.join(', ')}</p>` : ''}
                    </div>
                </div>
            `;
        }

        item.innerHTML = `
            <div class="direction-header">
                <div class="direction-label-group">
                    <div class="direction-label">
                        <label>${label}</label>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" title="${description}">
                            <circle cx="12" cy="12" r="10"></circle>
                            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                            <line x1="12" y1="17" x2="12.01" y2="17"></line>
                        </svg>
                    </div>
                    <p class="direction-description">${description}</p>
                </div>
            </div>
            <select class="direction-select" onchange="updateDirection('${key}', this.value)">
                ${selectOptions}
            </select>
            ${vastuFeedbackHTML}
        `;

        grid.appendChild(item);
    });
}

function getRoomConfig() {
    const config = [];
    if (appState.roomCounts.mainDoors > 0) {
        config.push({
            key: 'mainDoor',
            label: 'Main Entrance',
            description: 'Direction where the main door faces'
        });
    }
    if (appState.roomCounts.halls > 0) {
        config.push({
            key: 'hall',
            label: 'Living Room/Hall',
            description: 'Primary living space orientation'
        });
    }
    if (appState.roomCounts.kitchens > 0) {
        config.push({
            key: 'kitchen',
            label: 'Kitchen',
            description: 'Kitchen entrance/main area direction'
        });
    }
    if (appState.roomCounts.bedrooms > 0) {
        config.push({
            key: 'bedroom',
            label: 'Master Bedroom',
            description: 'Primary bedroom orientation'
        });
    }
    if (appState.roomCounts.bathrooms > 0) {
        config.push({
            key: 'bathroom',
            label: 'Bathroom/Toilet',
            description: 'Bathroom area direction'
        });
    }
    return config;
}

function updateDirection(key, value) {
    appState.directions[key] = value;
    renderDirectionGrid();
}

// Step 3: Blueprint and Reports
function initializeStep3() {
    // Draw blueprint
    drawBlueprint(appState.plotData, appState.roomCounts, appState.directions);

    // Generate reports
    generateReports();
}

function generateReports() {
    const container = document.getElementById('reportsContainer');
    const plotSizeSqft = appState.plotData.unit === 'cents' 
        ? appState.plotData.size * 435.6 
        : appState.plotData.size;
    
    const feasibility = calculateFeasibility(plotSizeSqft, appState.roomCounts);

    // Feasibility Report
    const feasibilityHTML = generateFeasibilityReport(plotSizeSqft, feasibility);
    
    // Vastu Report
    const vastuHTML = appState.directions.enableVastu ? generateVastuReport() : '';

    container.innerHTML = feasibilityHTML + vastuHTML;
}

function generateFeasibilityReport(plotSizeSqft, feasibility) {
    const statusIcon = feasibility.isFeasible
        ? '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>'
        : '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>';

    const statusClass = feasibility.isFeasible ? 'success' : 'error';
    const statusText = feasibility.isFeasible 
        ? 'Your plot can accommodate the requested rooms!'
        : 'Your plot may be too small for the requested rooms.';

    const progressClass = feasibility.utilizationPercent > 100 ? 'red' : 
                         feasibility.utilizationPercent > 80 ? 'yellow' : 'green';

    let breakdownHTML = '';
    if (appState.roomCounts.halls > 0) {
        breakdownHTML += `<div class="breakdown-item"><span>Hall/Living Room (${appState.roomCounts.halls})</span><span>${feasibility.roomBreakdown.halls} sq ft</span></div>`;
    }
    if (appState.roomCounts.dining > 0) {
        breakdownHTML += `<div class="breakdown-item"><span>Dining Area (${appState.roomCounts.dining})</span><span>${feasibility.roomBreakdown.dining} sq ft</span></div>`;
    }
    if (appState.roomCounts.kitchens > 0) {
        breakdownHTML += `<div class="breakdown-item"><span>Kitchen (${appState.roomCounts.kitchens})</span><span>${feasibility.roomBreakdown.kitchens} sq ft</span></div>`;
    }
    if (appState.roomCounts.bedrooms > 0) {
        breakdownHTML += `<div class="breakdown-item"><span>Bedrooms (${appState.roomCounts.bedrooms})</span><span>${feasibility.roomBreakdown.bedrooms} sq ft</span></div>`;
    }
    if (appState.roomCounts.bathrooms > 0) {
        breakdownHTML += `<div class="breakdown-item"><span>Bathrooms (${appState.roomCounts.bathrooms})</span><span>${feasibility.roomBreakdown.bathrooms} sq ft</span></div>`;
    }

    return `
        <div class="card">
            <div class="card-header">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                    <polyline points="9 22 9 12 15 12 15 22"></polyline>
                </svg>
                <h3>Plot Feasibility Report</h3>
            </div>
            <div class="card-body">
                <div class="feasibility-summary ${statusClass}">
                    ${statusIcon}
                    <span>${statusText}</span>
                </div>

                <div class="stats-grid">
                    <div class="stat-box blue">
                        <p class="stat-label">Total Plot Area</p>
                        <p class="stat-value">${plotSizeSqft.toLocaleString()} sq ft</p>
                    </div>
                    <div class="stat-box purple">
                        <p class="stat-label">Required Area</p>
                        <p class="stat-value">${Math.round(feasibility.totalRequired).toLocaleString()} sq ft</p>
                    </div>
                    <div class="stat-box green">
                        <p class="stat-label">Remaining Area</p>
                        <p class="stat-value">${Math.round(feasibility.remainingArea).toLocaleString()} sq ft</p>
                    </div>
                </div>

                <div class="progress-bar-container">
                    <div class="progress-bar-header">
                        <span>Area Utilization</span>
                        <span class="progress-value">${Math.round(feasibility.utilizationPercent)}%</span>
                    </div>
                    <div class="progress-bar-bg">
                        <div class="progress-bar-fill ${progressClass}" style="width: ${Math.min(feasibility.utilizationPercent, 100)}%"></div>
                    </div>
                </div>

                <div class="room-breakdown">
                    <p>Room Area Breakdown:</p>
                    ${breakdownHTML}
                    <div class="breakdown-item total">
                        <span>Walls & Circulation (15%)</span>
                        <span>${Math.round(feasibility.roomBreakdown.circulation)} sq ft</span>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function generateVastuReport() {
    const roomDirections = [
        { name: 'Main Entrance', direction: appState.directions.mainDoor, key: 'mainDoor' },
        { name: 'Hall/Living Room', direction: appState.directions.hall, key: 'hall' },
        { name: 'Kitchen', direction: appState.directions.kitchen, key: 'kitchen' },
        { name: 'Master Bedroom', direction: appState.directions.bedroom, key: 'bedroom' },
        { name: 'Bathroom', direction: appState.directions.bathroom, key: 'bathroom' }
    ];

    const vastuRatings = roomDirections.map(room => {
        const vastu = getVastuRecommendation(room.key, room.direction);
        return { ...room, vastu };
    });

    const favorableCount = vastuRatings.filter(r => r.vastu.rating === 'favorable').length;
    const totalCount = vastuRatings.length;
    const vastuScore = Math.round((favorableCount / totalCount) * 100);

    const scoreClass = vastuScore >= 70 ? 'green' : vastuScore >= 40 ? 'yellow' : 'orange';
    const scoreProgressClass = vastuScore >= 70 ? 'green' : vastuScore >= 40 ? 'yellow' : 'red';
    const scoreText = vastuScore >= 70 
        ? 'Excellent! Your floor plan follows Vastu principles very well.'
        : vastuScore >= 40 
        ? 'Good. Consider the suggestions below to improve Vastu compliance.'
        : 'Several improvements can be made to align with Vastu principles.';

    const ratingsHTML = vastuRatings.map(room => {
        const ratingClass = room.vastu.rating === 'favorable' ? 'favorable' :
                          room.vastu.rating === 'neutral' ? 'neutral' : 'unfavorable';
        
        const iconSVG = room.vastu.rating === 'favorable'
            ? '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>'
            : '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>';

        const alternativesHTML = room.vastu.alternatives.length > 0 
            ? `<p class="vastu-alternatives">Recommended: ${room.vastu.alternatives.join(', ')}</p>`
            : '';

        return `
            <div class="vastu-rating-item vastu-feedback ${ratingClass}">
                ${iconSVG}
                <div class="vastu-rating-content">
                    <div class="vastu-rating-header">
                        <span class="vastu-rating-name">${room.name}</span>
                        <span class="badge outline">${room.direction}</span>
                    </div>
                    <p class="vastu-message">${room.vastu.message}</p>
                    ${alternativesHTML}
                </div>
            </div>
        `;
    }).join('');

    return `
        <div class="card">
            <div class="card-header">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
                </svg>
                <h3>Vastu Compatibility Report</h3>
            </div>
            <div class="card-body">
                <div class="vastu-score-box">
                    <div class="vastu-score-header">
                        <span>Overall Vastu Score</span>
                        <span class="badge ${scoreClass}">${vastuScore}%</span>
                    </div>
                    <div class="progress-bar-bg">
                        <div class="progress-bar-fill ${scoreProgressClass}" style="width: ${vastuScore}%"></div>
                    </div>
                    <p class="vastu-score-description">${scoreText}</p>
                </div>

                <div class="vastu-ratings">
                    ${ratingsHTML}
                </div>
            </div>
        </div>
    `;
}

// Navigation functions
function nextStep(step) {
    if (step === 0) {
        const size = parseFloat(document.getElementById('plotSize').value);
        const unit = document.querySelector('input[name="unit"]:checked').value;
        if (!size || size <= 0) return;
        
        appState.plotData = { size, unit };
        goToStep(1);
    } else if (step === 1) {
        goToStep(2);
    } else if (step === 2) {
        goToStep(3);
    }
}

function previousStep(step) {
    goToStep(step - 1);
}

function goToStep(step) {
    // Hide all steps
    for (let i = 0; i <= 3; i++) {
        document.getElementById(`step${i}`).style.display = 'none';
    }

    // Show target step
    document.getElementById(`step${step}`).style.display = 'block';
    appState.currentStep = step;

    // Update progress steps
    updateProgressSteps(step);

    // Initialize step
    if (step === 1) initializeStep1();
    if (step === 2) initializeStep2();
    if (step === 3) initializeStep3();

    // Scroll to top
    window.scrollTo(0, 0);
}

function updateProgressSteps(currentStep) {
    const circles = document.querySelectorAll('.step-circle');
    const lines = document.querySelectorAll('.step-line');

    circles.forEach((circle, index) => {
        if (index <= currentStep) {
            circle.classList.add('active');
        } else {
            circle.classList.remove('active');
        }
    });

    lines.forEach((line, index) => {
        if (index < currentStep) {
            line.classList.add('active');
        } else {
            line.classList.remove('active');
        }
    });

    // Hide progress steps on result page
    const progressSteps = document.getElementById('progressSteps');
    if (currentStep === 3) {
        progressSteps.style.display = 'none';
    } else {
        progressSteps.style.display = 'flex';
    }
}

function resetApp() {
    appState = {
        currentStep: 0,
        plotData: {
            size: 0,
            unit: 'sqft'
        },
        roomCounts: {
            mainDoors: 1,
            halls: 1,
            dining: 1,
            kitchens: 1,
            bedrooms: 2,
            bathrooms: 2
        },
        directions: {
            mainDoor: 'north',
            hall: 'north',
            kitchen: 'southeast',
            bedroom: 'southwest',
            bathroom: 'northwest',
            enableVastu: true
        }
    };

    document.getElementById('plotSize').value = '';
    document.getElementById('plotSummary').style.display = 'none';
    
    goToStep(0);
}
