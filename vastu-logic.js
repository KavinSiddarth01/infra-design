// Vastu rules database
const vastuRules = {
    mainDoor: {
        north: {
            rating: 'favorable',
            message: 'North entrance is highly auspicious in Vastu. It brings prosperity and positive energy.',
            alternatives: []
        },
        northeast: {
            rating: 'favorable',
            message: 'North-East is the most auspicious direction for main entrance. Known as "Ishan Kon", it brings divine blessings.',
            alternatives: []
        },
        east: {
            rating: 'favorable',
            message: 'East entrance is excellent as per Vastu. It allows morning sunlight and positive energy.',
            alternatives: []
        },
        northwest: {
            rating: 'neutral',
            message: 'North-West entrance is acceptable but not ideal. It may bring frequent travel.',
            alternatives: ['North', 'North-East', 'East']
        },
        west: {
            rating: 'neutral',
            message: 'West entrance is acceptable for commercial properties but less favorable for residential.',
            alternatives: ['North', 'North-East', 'East']
        },
        south: {
            rating: 'unfavorable',
            message: 'South entrance is generally not recommended in Vastu. Consider alternate directions.',
            alternatives: ['North', 'North-East', 'East']
        },
        southeast: {
            rating: 'unfavorable',
            message: 'South-East entrance should be avoided. This is the Agni (fire) corner.',
            alternatives: ['North', 'North-East', 'East']
        },
        southwest: {
            rating: 'unfavorable',
            message: 'South-West entrance is highly unfavorable. This corner should remain heavy and closed.',
            alternatives: ['North', 'North-East', 'East']
        }
    },
    kitchen: {
        southeast: {
            rating: 'favorable',
            message: 'South-East is the ideal direction for kitchen as it represents the Fire element (Agni).',
            alternatives: []
        },
        northwest: {
            rating: 'neutral',
            message: 'North-West kitchen is acceptable but South-East is more favorable.',
            alternatives: ['South-East']
        },
        south: {
            rating: 'neutral',
            message: 'South kitchen is acceptable but ideally should be in South-East corner.',
            alternatives: ['South-East']
        },
        east: {
            rating: 'neutral',
            message: 'East kitchen is acceptable but South-East would be better for fire element.',
            alternatives: ['South-East']
        },
        northeast: {
            rating: 'unfavorable',
            message: 'North-East kitchen is not recommended. This is the sacred zone and should be kept light.',
            alternatives: ['South-East', 'North-West']
        },
        southwest: {
            rating: 'unfavorable',
            message: 'South-West kitchen should be avoided as this corner should remain heavy.',
            alternatives: ['South-East', 'North-West']
        },
        north: {
            rating: 'unfavorable',
            message: 'North kitchen is not ideal as per Vastu principles.',
            alternatives: ['South-East', 'North-West']
        },
        west: {
            rating: 'neutral',
            message: 'West kitchen is acceptable but not ideal.',
            alternatives: ['South-East']
        }
    },
    bedroom: {
        southwest: {
            rating: 'favorable',
            message: 'South-West is the best direction for master bedroom. It brings stability and good sleep.',
            alternatives: []
        },
        south: {
            rating: 'favorable',
            message: 'South bedroom is good for master bedroom, providing stability.',
            alternatives: []
        },
        west: {
            rating: 'neutral',
            message: 'West bedroom is acceptable, especially for youngsters.',
            alternatives: ['South-West', 'South']
        },
        northwest: {
            rating: 'neutral',
            message: 'North-West is acceptable for guest rooms but not ideal for master bedroom.',
            alternatives: ['South-West', 'South']
        },
        north: {
            rating: 'neutral',
            message: 'North bedroom is suitable for children or guests.',
            alternatives: ['South-West', 'South']
        },
        east: {
            rating: 'neutral',
            message: 'East bedroom is suitable for young children.',
            alternatives: ['South-West', 'South']
        },
        northeast: {
            rating: 'unfavorable',
            message: 'North-East bedroom is not recommended. This zone should be kept light for meditation/prayer.',
            alternatives: ['South-West', 'South']
        },
        southeast: {
            rating: 'unfavorable',
            message: 'South-East bedroom may cause health issues and restlessness.',
            alternatives: ['South-West', 'South']
        }
    },
    bathroom: {
        northwest: {
            rating: 'favorable',
            message: 'North-West is ideal for bathrooms and toilets as per Vastu.',
            alternatives: []
        },
        west: {
            rating: 'favorable',
            message: 'West direction is good for bathrooms and waste disposal.',
            alternatives: []
        },
        north: {
            rating: 'neutral',
            message: 'North bathroom is acceptable but North-West is better.',
            alternatives: ['North-West', 'West']
        },
        south: {
            rating: 'neutral',
            message: 'South bathroom is acceptable.',
            alternatives: ['North-West', 'West']
        },
        east: {
            rating: 'neutral',
            message: 'East bathroom is acceptable for attached bathrooms.',
            alternatives: ['North-West', 'West']
        },
        northeast: {
            rating: 'unfavorable',
            message: 'North-East bathroom is highly unfavorable. This sacred zone should be kept clean and light.',
            alternatives: ['North-West', 'West']
        },
        southwest: {
            rating: 'unfavorable',
            message: 'South-West bathroom can cause health and financial issues.',
            alternatives: ['North-West', 'West']
        },
        southeast: {
            rating: 'neutral',
            message: 'South-East bathroom is acceptable but not ideal.',
            alternatives: ['North-West', 'West']
        }
    },
    hall: {
        north: {
            rating: 'favorable',
            message: 'North is excellent for living room/hall. It brings prosperity and social harmony.',
            alternatives: []
        },
        east: {
            rating: 'favorable',
            message: 'East is ideal for hall as it receives morning sunlight and positive energy.',
            alternatives: []
        },
        northeast: {
            rating: 'favorable',
            message: 'North-East hall is highly auspicious. Keep this area open and well-lit.',
            alternatives: []
        },
        northwest: {
            rating: 'neutral',
            message: 'North-West hall is acceptable and suitable for gatherings.',
            alternatives: ['North', 'East', 'North-East']
        },
        west: {
            rating: 'neutral',
            message: 'West hall is acceptable but not ideal.',
            alternatives: ['North', 'East', 'North-East']
        },
        south: {
            rating: 'neutral',
            message: 'South hall is acceptable but keep it well-ventilated.',
            alternatives: ['North', 'East', 'North-East']
        },
        southeast: {
            rating: 'neutral',
            message: 'South-East hall is acceptable but ensure good ventilation.',
            alternatives: ['North', 'East', 'North-East']
        },
        southwest: {
            rating: 'unfavorable',
            message: 'South-West hall is not recommended. This area should have heavy structures.',
            alternatives: ['North', 'East', 'North-East']
        }
    }
};

function getVastuRecommendation(roomType, direction) {
    const rules = vastuRules[roomType];
    if (!rules || !rules[direction]) {
        return {
            rating: 'neutral',
            message: 'No specific Vastu guidelines available for this combination.',
            alternatives: []
        };
    }
    return rules[direction];
}

function calculateFeasibility(plotSizeSqft, roomCounts) {
    // Typical room sizes (in sqft)
    const roomSizes = {
        hall: 200,
        dining: 150,
        kitchen: 100,
        bedroom: 150,
        bathroom: 50,
        circulation: 0.15 // 15% for corridors, walls, etc.
    };

    const totalRequired =
        roomCounts.halls * roomSizes.hall +
        roomCounts.dining * roomSizes.dining +
        roomCounts.kitchens * roomSizes.kitchen +
        roomCounts.bedrooms * roomSizes.bedroom +
        roomCounts.bathrooms * roomSizes.bathroom;

    const withCirculation = totalRequired * (1 + roomSizes.circulation);

    const isFeasible = plotSizeSqft >= withCirculation;
    const utilizationPercent = (withCirculation / plotSizeSqft) * 100;

    return {
        isFeasible,
        totalRequired: withCirculation,
        utilizationPercent,
        remainingArea: plotSizeSqft - withCirculation,
        roomBreakdown: {
            halls: roomCounts.halls * roomSizes.hall,
            dining: roomCounts.dining * roomSizes.dining,
            kitchens: roomCounts.kitchens * roomSizes.kitchen,
            bedrooms: roomCounts.bedrooms * roomSizes.bedroom,
            bathrooms: roomCounts.bathrooms * roomSizes.bathroom,
            circulation: totalRequired * roomSizes.circulation
        }
    };
}
