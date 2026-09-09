
const MarketPrice = require('../models/MarketPrice');

class MarketService {
    async getMarketPrices(query) {
        const filter = {};
        if (query.crop) filter.crop = query.crop;
        if (query.state) filter.state = query.state;
        if (query.market) filter.market = query.market;
        
        const page = parseInt(query.page) || 1;
        const limit = parseInt(query.limit) || 10;
        const skip = (page - 1) * limit;
        
        const data = await MarketPrice.find(filter).skip(skip).limit(limit);
        const total = await MarketPrice.countDocuments(filter);
        return { data, total, page, limit };
    }

    async getMarketAnalytics(crop, state) {
        const prices = await MarketPrice.find({ crop, state });
        if (!prices.length) return null;
        let max = prices[0].price;
        let min = prices[0].price;
        let sum = 0;
        prices.forEach(p => {
            if (p.price > max) max = p.price;
            if (p.price < min) min = p.price;
            sum += p.price;
        });
        return {
            highest: max,
            lowest: min,
            average: sum / prices.length,
            trend: 'stable'
        };
    }

    async addMarketPrice(data) {
        return await MarketPrice.create(data);
    }

    async updateMarketPrice(id, data) {
        return await MarketPrice.findByIdAndUpdate(id, data, { new: true });
    }

    async deleteMarketPrice(id) {
        return await MarketPrice.findByIdAndDelete(id);
    }
}
module.exports = new MarketService();
