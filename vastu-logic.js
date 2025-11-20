// Vastu Shastra validation logic

const vastuRules = {
    mainDoor: {
        good: ['north', 'northeast', 'east'],
        neutral: ['west'],
        bad: ['south', 'southeast', 'southwest', 'northwest'],
        message: {
            good: '✓ Excellent! Main entrance in this direction brings prosperity and positive energy.',
            neutral: '~ Acceptable direction. Consider adding positive symbols near the entrance.',
            bad: '✗ Not ideal according to Vastu. North, Northeast, or East are recommended for main entrance.'
        }
    },
    hall: {
        good: ['north', 'northeast', 'east'],
        neutral: ['northwest', 'west'],
        bad: ['south', 'southeast', 'southwest'],
        message: {
            good: '✓ Perfect! Living room in this direction promotes family harmony and social interactions.',
            neutral: '~ Acceptable location. Ensure proper lighting and ventilation.',
            bad: '✗ Not recommended. North, Northeast, or East are better for living areas.'
        }
    },
    dining: {
        good: ['east', 'west'],
        neutral: ['north', 'south'],
        bad: ['northeast', 'southeast', 'southwest', 'northwest'],
        message: {
            good: '✓ Great choice! Dining in this direction aids digestion and family bonding.',
            neutral: '~ Acceptable. Ensure the dining table doesn\'t block pathways.',
            bad: '✗ Corner directions are not ideal for dining. East or West is preferred.'
        }
    },
    kitchen: {
        good: ['southeast'],
        neutral: ['northwest'],
        bad: ['north', 'northeast', 'east', 'south', 'southwest', 'west'],
        message: {
            good: '✓ Perfect! Southeast is the ideal direction for kitchen (Agni corner).',
            neutral: '~ Northwest is acceptable as a secondary option for kitchen.',
            bad: '✗ This direction is not recommended for kitchen. Southeast (Agni corner) is ideal.'
        }
    },
    bedroom: {
        good: ['southwest'],
        neutral: ['south', 'west', 'northwest'],
        bad: ['north', 'northeast', 'east', 'southeast'],
        message: {
            good: '✓ Excellent! Southwest direction provides stability and restful sleep for master bedroom.',
            neutral: '~ Acceptable direction. Ensure the bed head faces south or west.',
            bad: '✗ Not ideal for master bedroom. Southwest direction is most recommended.'
        }
    },
    bathroom: {
        good: ['northwest', 'west'],
        neutral: ['south'],
        bad: ['north', 'northeast', 'east', 'southeast', 'southwest'],
        message: {
            good: '✓ Good placement! This direction is suitable for bathrooms.',
            neutral: '~ Acceptable. Ensure proper drainage and ventilation.',
            bad: '✗ Not recommended for bathroom. Northwest or West are better choices.'
        }
    },
    toilet: {
        good: ['northwest', 'west', 'south'],
        neutral: ['southeast'],
        bad: ['north', 'northeast', 'east', 'southwest'],
        message: {
            good: '✓ Appropriate direction for toilet facilities.',
            neutral: '~ Acceptable location. Keep it clean and well-ventilated.',
            bad: '✗ Avoid this direction for toilets. Northwest, West, or South are preferred.'
        }
    },
    garden: {
        good: ['north', 'northeast', 'east'],
        neutral: ['northwest', 'west'],
        bad: ['south', 'southeast', 'southwest'],
        message: {
            good: '✓ Excellent! Garden in this direction brings freshness and positive energy.',
            neutral: '~ Acceptable for garden space. Add water features if possible.',
            bad: '✗ Heavy landscaping not recommended here. North, Northeast, or East are ideal.'
        }
    },
    balcony: {
        good: ['north', 'east', 'northeast'],
        neutral: ['west', 'northwest'],
        bad: ['south', 'southeast', 'southwest'],
        message: {
            good: '✓ Perfect! Balcony in this direction provides good ventilation and morning sunlight.',
            neutral: '~ Acceptable placement. Ensure adequate light and air flow.',
            bad: '✗ Not ideal for balcony. North, East, or Northeast are recommended.'
        }
    },
    storeRoom: {
        good: ['southwest', 'south', 'west'],
        neutral: ['northwest'],
        bad: ['north', 'northeast', 'east', 'southeast'],
        message: {
            good: '✓ Good placement! Storage in this direction helps maintain stability.',
            neutral: '~ Acceptable. Keep organized and avoid clutter.',
            bad: '✗ Not recommended for storage. Southwest, South, or West are better.'
        }
    }
};

function getVastuValidation(roomType, direction) {
    const rules = vastuRules[roomType];
    
    if (!rules) {
        return {
            status: 'neutral',
            message: 'No specific Vastu guidelines available for this room type.'
        };
    }
    
    let status = 'neutral';
    if (rules.good.includes(direction)) {
        status = 'good';
    } else if (rules.bad.includes(direction)) {
        status = 'bad';
    }
    
    return {
        status: status,
        message: rules.message[status]
    };
}

function calculateVastuScore(directions) {
    let totalScore = 0;
    let count = 0;
    
    Object.keys(directions).forEach(key => {
        if (key !== 'enableVastu') {
            const validation = getVastuValidation(key, directions[key]);
            count++;
            
            if (validation.status === 'good') {
                totalScore += 100;
            } else if (validation.status === 'neutral') {
                totalScore += 60;
            } else {
                totalScore += 20;
            }
        }
    });
    
    return count > 0 ? Math.round(totalScore / count) : 0;
}

function getVastuRecommendations(directions) {
    const recommendations = [];
    
    Object.keys(directions).forEach(key => {
        if (key !== 'enableVastu') {
            const validation = getVastuValidation(key, directions[key]);
            if (validation.status === 'bad') {
                recommendations.push({
                    room: key,
                    currentDirection: directions[key],
                    message: validation.message,
                    suggestedDirections: vastuRules[key]?.good || []
                });
            }
        }
    });
    
    return recommendations;
}
