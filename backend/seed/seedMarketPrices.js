const MarketPrice = require('../models/MarketPrice');

const marketPricesData = [
  // Maharashtra
  {
    crop: 'Wheat',
    market: 'Pune Mandi',
    state: 'Maharashtra',
    district: 'Pune',
    price: 2450,
    minPrice: 2300,
    maxPrice: 2600,
    unit: 'quintal',
    date: new Date(),
    source: 'APMC Pune',
    trend: 'rising',
    isVerified: true
  },
  {
    crop: 'Onion',
    market: 'Lasalgaon Mandi',
    state: 'Maharashtra',
    district: 'Nashik',
    price: 1850,
    minPrice: 1500,
    maxPrice: 2200,
    unit: 'quintal',
    date: new Date(),
    source: 'APMC Lasalgaon',
    trend: 'falling',
    isVerified: true
  },
  {
    crop: 'Soybean',
    market: 'Nagpur Mandi',
    state: 'Maharashtra',
    district: 'Nagpur',
    price: 4620,
    minPrice: 4400,
    maxPrice: 4850,
    unit: 'quintal',
    date: new Date(),
    source: 'APMC Nagpur',
    trend: 'stable',
    isVerified: true
  },
  {
    crop: 'Cotton',
    market: 'Aurangabad Mandi',
    state: 'Maharashtra',
    district: 'Aurangabad',
    price: 7100,
    minPrice: 6800,
    maxPrice: 7400,
    unit: 'quintal',
    date: new Date(),
    source: 'APMC Aurangabad',
    trend: 'rising',
    isVerified: true
  },
  {
    crop: 'Tomato',
    market: 'Narayangaon Mandi',
    state: 'Maharashtra',
    district: 'Pune',
    price: 1200,
    minPrice: 900,
    maxPrice: 1500,
    unit: 'quintal',
    date: new Date(),
    source: 'APMC Narayangaon',
    trend: 'stable',
    isVerified: true
  },
  {
    crop: 'Sugarcane',
    market: 'Kolhapur Mandi',
    state: 'Maharashtra',
    district: 'Kolhapur',
    price: 3150,
    minPrice: 3000,
    maxPrice: 3300,
    unit: 'tonne',
    date: new Date(),
    source: 'APMC Kolhapur',
    trend: 'stable',
    isVerified: true
  },
  // Punjab
  {
    crop: 'Wheat',
    market: 'Khanna Mandi',
    state: 'Punjab',
    district: 'Ludhiana',
    price: 2375,
    minPrice: 2275,
    maxPrice: 2450,
    unit: 'quintal',
    date: new Date(),
    source: 'Punjab Mandi Board',
    trend: 'stable',
    isVerified: true
  },
  {
    crop: 'Rice',
    market: 'Amritsar Grain Market',
    state: 'Punjab',
    district: 'Amritsar',
    price: 3800,
    minPrice: 3500,
    maxPrice: 4100,
    unit: 'quintal',
    date: new Date(),
    source: 'Punjab Mandi Board',
    trend: 'rising',
    isVerified: true
  },
  {
    crop: 'Maize',
    market: 'Jalandhar Mandi',
    state: 'Punjab',
    district: 'Jalandhar',
    price: 2100,
    minPrice: 1950,
    maxPrice: 2250,
    unit: 'quintal',
    date: new Date(),
    source: 'Punjab Mandi Board',
    trend: 'rising',
    isVerified: true
  },
  // Madhya Pradesh
  {
    crop: 'Soybean',
    market: 'Indore Mandi',
    state: 'Madhya Pradesh',
    district: 'Indore',
    price: 4750,
    minPrice: 4500,
    maxPrice: 4950,
    unit: 'quintal',
    date: new Date(),
    source: 'MP Mandi Board',
    trend: 'rising',
    isVerified: true
  },
  {
    crop: 'Gram',
    market: 'Ujjain Mandi',
    state: 'Madhya Pradesh',
    district: 'Ujjain',
    price: 5800,
    minPrice: 5500,
    maxPrice: 6100,
    unit: 'quintal',
    date: new Date(),
    source: 'MP Mandi Board',
    trend: 'rising',
    isVerified: true
  },
  {
    crop: 'Wheat',
    market: 'Bhopal Mandi',
    state: 'Madhya Pradesh',
    district: 'Bhopal',
    price: 2420,
    minPrice: 2300,
    maxPrice: 2550,
    unit: 'quintal',
    date: new Date(),
    source: 'MP Mandi Board',
    trend: 'stable',
    isVerified: true
  },
  // Uttar Pradesh
  {
    crop: 'Potato',
    market: 'Agra Mandi',
    state: 'Uttar Pradesh',
    district: 'Agra',
    price: 1100,
    minPrice: 950,
    maxPrice: 1300,
    unit: 'quintal',
    date: new Date(),
    source: 'UP Agmarknet',
    trend: 'falling',
    isVerified: true
  },
  {
    crop: 'Rice',
    market: 'Varanasi Mandi',
    state: 'Uttar Pradesh',
    district: 'Varanasi',
    price: 2600,
    minPrice: 2400,
    maxPrice: 2800,
    unit: 'quintal',
    date: new Date(),
    source: 'UP Agmarknet',
    trend: 'stable',
    isVerified: true
  },
  {
    crop: 'Mustard',
    market: 'Kanpur Mandi',
    state: 'Uttar Pradesh',
    district: 'Kanpur',
    price: 5400,
    minPrice: 5100,
    maxPrice: 5650,
    unit: 'quintal',
    date: new Date(),
    source: 'UP Agmarknet',
    trend: 'rising',
    isVerified: true
  },
  // Gujarat
  {
    crop: 'Cotton',
    market: 'Rajkot Mandi',
    state: 'Gujarat',
    district: 'Rajkot',
    price: 7250,
    minPrice: 6900,
    maxPrice: 7500,
    unit: 'quintal',
    date: new Date(),
    source: 'Gujarat APMC',
    trend: 'rising',
    isVerified: true
  },
  {
    crop: 'Groundnut',
    market: 'Junagadh Mandi',
    state: 'Gujarat',
    district: 'Junagadh',
    price: 6100,
    minPrice: 5800,
    maxPrice: 6400,
    unit: 'quintal',
    date: new Date(),
    source: 'Gujarat APMC',
    trend: 'stable',
    isVerified: true
  },
  {
    crop: 'Onion',
    market: 'Mahuva Mandi',
    state: 'Gujarat',
    district: 'Bhavnagar',
    price: 1700,
    minPrice: 1400,
    maxPrice: 2000,
    unit: 'quintal',
    date: new Date(),
    source: 'Gujarat APMC',
    trend: 'falling',
    isVerified: true
  }
];

async function seedMarketPrices() {
  try {
    for (const item of marketPricesData) {
      await MarketPrice.findOneAndUpdate(
        { crop: item.crop, market: item.market },
        item,
        { upsert: true, new: true }
      );
    }
    console.log(`Seeded ${marketPricesData.length} market prices successfully`);
  } catch (error) {
    console.error('Error seeding market prices:', error);
    throw error;
  }
}

module.exports = seedMarketPrices;
