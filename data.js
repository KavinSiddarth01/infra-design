// Zodiac and Room Data
const ZODIAC_VASTU_DATA = {
    aries: {
        name: 'Aries (Mesha)',
        element: 'Fire',
        ruler: 'Mars',
        description: 'Fire element brings energy. East and North directions enhance vitality.',
        directions: {
            main_entrance: ['East', 'North', 'Northeast'],
            bedroom: ['South', 'Southwest', 'West'],
            kitchen: ['Southeast', 'South'],
            hall: ['North', 'Northeast', 'East'],
            dining: ['East', 'West'],
            bathroom: ['West', 'Northwest'],
            toilet: ['Northwest', 'West'],
            garden: ['North', 'East', 'Northeast'],
            balcony: ['East', 'North'],
            store_room: ['Southwest', 'South']
        }
    },
    taurus: {
        name: 'Taurus (Vrishabha)',
        element: 'Earth',
        ruler: 'Venus',
        description: 'Earth element provides stability. Northeast and East bring prosperity.',
        directions: {
            main_entrance: ['Northeast', 'North', 'East'],
            bedroom: ['Southwest', 'South'],
            kitchen: ['Southeast', 'East'],
            hall: ['Northeast', 'North'],
            dining: ['West', 'Northwest'],
            bathroom: ['West', 'Southwest'],
            toilet: ['West', 'Northwest'],
            garden: ['Northeast', 'East'],
            balcony: ['North', 'East'],
            store_room: ['Southwest', 'West']
        }
    },
    gemini: {
        name: 'Gemini (Mithuna)',
        element: 'Air',
        ruler: 'Mercury',
        description: 'Air element enhances communication. North and East are favorable.',
        directions: {
            main_entrance: ['North', 'Northeast', 'East'],
            bedroom: ['Northwest', 'Southwest'],
            kitchen: ['Southeast', 'Northwest'],
            hall: ['North', 'East', 'Northeast'],
            dining: ['East', 'North'],
            bathroom: ['Northwest', 'West'],
            toilet: ['Northwest', 'Southeast'],
            garden: ['North', 'East'],
            balcony: ['North', 'Northeast'],
            store_room: ['Southwest', 'South']
        }
    },
    cancer: {
        name: 'Cancer (Karka)',
        element: 'Water',
        ruler: 'Moon',
        description: 'Water element brings emotional balance. Northwest and North are ideal.',
        directions: {
            main_entrance: ['North', 'East', 'Northeast'],
            bedroom: ['Southwest', 'Northwest'],
            kitchen: ['Southeast', 'South'],
            hall: ['North', 'Northeast'],
            dining: ['Northwest', 'West'],
            bathroom: ['Northwest', 'North'],
            toilet: ['Northwest', 'West'],
            garden: ['North', 'Northeast'],
            balcony: ['Northeast', 'North'],
            store_room: ['Southwest', 'South']
        }
    },
    leo: {
        name: 'Leo (Simha)',
        element: 'Fire',
        ruler: 'Sun',
        description: 'Fire element brings leadership. East and Northeast are powerful.',
        directions: {
            main_entrance: ['East', 'Northeast', 'North'],
            bedroom: ['South', 'Southwest'],
            kitchen: ['Southeast', 'East'],
            hall: ['East', 'North', 'Northeast'],
            dining: ['East', 'Southeast'],
            bathroom: ['East', 'West'],
            toilet: ['East', 'Southeast'],
            garden: ['East', 'Northeast'],
            balcony: ['East', 'North'],
            store_room: ['Southwest', 'West']
        }
    },
    virgo: {
        name: 'Virgo (Kanya)',
        element: 'Earth',
        ruler: 'Mercury',
        description: 'Earth element promotes organization. North and East enhance clarity.',
        directions: {
            main_entrance: ['North', 'East', 'Northeast'],
            bedroom: ['Southwest', 'Northwest'],
            kitchen: ['Southeast', 'Northwest'],
            hall: ['North', 'Northeast', 'East'],
            dining: ['West', 'East'],
            bathroom: ['Northwest', 'West'],
            toilet: ['Northwest', 'West'],
            garden: ['Northeast', 'North'],
            balcony: ['North', 'East'],
            store_room: ['Southwest', 'South']
        }
    },
    libra: {
        name: 'Libra (Tula)',
        element: 'Air',
        ruler: 'Venus',
        description: 'Air element brings harmony. West and North create balance.',
        directions: {
            main_entrance: ['North', 'East', 'Northeast'],
            bedroom: ['Southwest', 'Northwest'],
            kitchen: ['Southeast', 'Northwest'],
            hall: ['North', 'Northeast'],
            dining: ['West', 'Northwest'],
            bathroom: ['West', 'Northwest'],
            toilet: ['West', 'Northwest'],
            garden: ['North', 'West'],
            balcony: ['North', 'West'],
            store_room: ['Southwest', 'West']
        }
    },
    scorpio: {
        name: 'Scorpio (Vrishchika)',
        element: 'Water',
        ruler: 'Mars',
        description: 'Water element intensifies energy. North and East are transformative.',
        directions: {
            main_entrance: ['North', 'East', 'Northeast'],
            bedroom: ['South', 'Southwest'],
            kitchen: ['Southeast', 'South'],
            hall: ['North', 'East'],
            dining: ['East', 'Southeast'],
            bathroom: ['Northwest', 'North'],
            toilet: ['Northwest', 'Southeast'],
            garden: ['North', 'Northeast'],
            balcony: ['East', 'North'],
            store_room: ['Southwest', 'South']
        }
    },
    sagittarius: {
        name: 'Sagittarius (Dhanu)',
        element: 'Fire',
        ruler: 'Jupiter',
        description: 'Fire element expands opportunities. Northeast brings wisdom.',
        directions: {
            main_entrance: ['Northeast', 'North', 'East'],
            bedroom: ['Southwest', 'West'],
            kitchen: ['Southeast', 'South'],
            hall: ['Northeast', 'North', 'East'],
            dining: ['East', 'West'],
            bathroom: ['West', 'Northwest'],
            toilet: ['Northwest', 'West'],
            garden: ['Northeast', 'North'],
            balcony: ['Northeast', 'East'],
            store_room: ['Southwest', 'South']
        }
    },
    capricorn: {
        name: 'Capricorn (Makara)',
        element: 'Earth',
        ruler: 'Saturn',
        description: 'Earth element builds structure. West and South provide stability.',
        directions: {
            main_entrance: ['North', 'East', 'Northeast'],
            bedroom: ['Southwest', 'West'],
            kitchen: ['Southeast', 'South'],
            hall: ['North', 'Northeast'],
            dining: ['West', 'Northwest'],
            bathroom: ['West', 'Southwest'],
            toilet: ['West', 'Northwest'],
            garden: ['North', 'Northeast'],
            balcony: ['North', 'East'],
            store_room: ['Southwest', 'West']
        }
    },
    aquarius: {
        name: 'Aquarius (Kumbha)',
        element: 'Air',
        ruler: 'Saturn',
        description: 'Air element fosters innovation. North and Northwest are ideal.',
        directions: {
            main_entrance: ['North', 'Northeast', 'East'],
            bedroom: ['Southwest', 'Northwest'],
            kitchen: ['Southeast', 'Northwest'],
            hall: ['North', 'Northeast', 'East'],
            dining: ['Northwest', 'West'],
            bathroom: ['Northwest', 'West'],
            toilet: ['Northwest', 'West'],
            garden: ['North', 'Northeast'],
            balcony: ['North', 'Northwest'],
            store_room: ['Southwest', 'South']
        }
    },
    pisces: {
        name: 'Pisces (Meena)',
        element: 'Water',
        ruler: 'Jupiter',
        description: 'Water element enhances intuition. Northeast is spiritually powerful.',
        directions: {
            main_entrance: ['Northeast', 'North', 'East'],
            bedroom: ['Southwest', 'Northwest'],
            kitchen: ['Southeast', 'South'],
            hall: ['Northeast', 'North'],
            dining: ['Northwest', 'East'],
            bathroom: ['Northwest', 'North'],
            toilet: ['Northwest', 'West'],
            garden: ['Northeast', 'North'],
            balcony: ['Northeast', 'North'],
            store_room: ['Southwest', 'South']
        }
    }
};

const ROOM_LABELS = {
    main_entrance: 'Main Entrance',
    bedroom: 'Bedroom',
    kitchen: 'Kitchen',
    hall: 'Hall',
    dining: 'Dining Area',
    bathroom: 'Bathroom',
    toilet: 'Toilet',
    garden: 'Garden',
    balcony: 'Balcony',
    store_room: 'Store Room'
};

const ROOM_SIZES = {
    main_entrance: 50,
    bedroom: 150,
    kitchen: 120,
    hall: 200,
    dining: 120,
    bathroom: 60,
    toilet: 40,
    garden: 100,
    balcony: 60,
    store_room: 80
};

const ROOM_COLORS = {
    main_entrance: '#10b981',
    bedroom: '#3b82f6',
    kitchen: '#ef4444',
    hall: '#8b5cf6',
    dining: '#f59e0b',
    bathroom: '#06b6d4',
    toilet: '#14b8a6',
    garden: '#22c55e',
    balcony: '#a855f7',
    store_room: '#6b7280'
};

const STANDARD_VASTU = {
    main_entrance: ['North', 'Northeast', 'East'],
    bedroom: ['Southwest', 'South', 'West'],
    kitchen: ['Southeast', 'Northwest'],
    hall: ['North', 'Northeast', 'East'],
    dining: ['West', 'East'],
    bathroom: ['West', 'Northwest'],
    toilet: ['Northwest', 'West', 'Southeast'],
    garden: ['North', 'East', 'Northeast'],
    balcony: ['North', 'East'],
    store_room: ['Southwest', 'South', 'West']
};

const DIRECTIONS = ['North', 'Northeast', 'East', 'Southeast', 'South', 'Southwest', 'West', 'Northwest'];
