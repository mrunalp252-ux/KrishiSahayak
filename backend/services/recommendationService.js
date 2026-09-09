const Crop = require('../models/Crop');

class RecommendationService {
  async getRecommendations(inputs) {
    const { soilType, season, temperature, waterAvailability, landSize, state, district, previousCrop, irrigationType } = inputs;
    const crops = await Crop.find({ isActive: true });

    if (!crops.length) {
      return [];
    }

    const recommendations = crops.map(crop => {
      const reasons = [];
      const considerations = [];
      let score = 0;

      // Soil score (0-30)
      const soilScore = this._calculateSoilScore(crop, soilType);
      score += soilScore;
      if (soilScore >= 25) reasons.push(`Excellent soil match: ${soilType} soil is ideal for ${crop.name}`);
      else if (soilScore >= 15) reasons.push(`${soilType} soil is suitable for ${crop.name}`);
      else if (soilScore === 0) considerations.push(`${soilType} soil may not be ideal for ${crop.name}`);

      // Season score (0-25)
      const seasonScore = this._calculateSeasonScore(crop, season);
      score += seasonScore;
      if (seasonScore >= 20) reasons.push(`${crop.name} grows well in ${season} season`);
      else if (seasonScore >= 10) reasons.push(`Can be grown in ${season} season with care`);
      else considerations.push(`${season} season may not be optimal`);

      // Water score (0-20)
      const waterScore = this._calculateWaterScore(crop, waterAvailability, irrigationType);
      score += waterScore;
      if (waterScore >= 15) reasons.push(`Water requirement matches your availability (${waterAvailability})`);
      else if (waterScore >= 8) reasons.push(`Water needs are manageable with ${irrigationType || 'available'} irrigation`);
      else considerations.push(`May need more water than available`);

      // Temperature score (0-15)
      const tempScore = this._calculateTempScore(crop, temperature);
      score += tempScore;
      if (tempScore >= 12) reasons.push(`Temperature ${temperature}°C is within ideal range (${crop.tempRange?.min}-${crop.tempRange?.max}°C)`);
      else if (tempScore >= 6) reasons.push(`Temperature is close to suitable range`);

      // Irrigation bonus (0-10)
      const irrigationBonus = this._calculateIrrigationBonus(crop, irrigationType, waterAvailability);
      score += irrigationBonus;
      if (irrigationBonus > 5) reasons.push(`${irrigationType} irrigation well-suited for this crop`);

      // Previous crop consideration
      if (previousCrop && previousCrop.toLowerCase() === crop.name.toLowerCase()) {
        score -= 5;
        considerations.push('Crop rotation recommended - same crop was grown previously');
      }

      // Build duration info
      const expectedDuration = crop.duration 
        ? `${crop.duration.min || '?'}-${crop.duration.max || '?'} days`
        : 'Variable';

      return {
        crop: crop._id,
        cropName: crop.name,
        localNames: crop.localNames,
        score: Math.min(100, Math.max(0, score)),
        reasons,
        waterRequirement: crop.waterRequirement,
        expectedDuration,
        guidance: crop.cultivationPractices || 'Follow standard cultivation practices for your region.',
        considerations: considerations.length ? considerations : ['Monitor weather conditions regularly']
      };
    });

    // Filter crops with score > 25 and sort by score
    const filtered = recommendations.filter(r => r.score > 25);
    filtered.sort((a, b) => b.score - a.score);
    return filtered.slice(0, 8);
  }

  _calculateSoilScore(crop, soilType) {
    if (!crop.suitableSoils || !crop.suitableSoils.length || !soilType) return 5;
    const normalizedSoil = soilType.toLowerCase();
    const suitableLower = crop.suitableSoils.map(s => s.toLowerCase());
    
    if (suitableLower.includes(normalizedSoil)) return 30;
    
    // Partial compatibility map
    const compatible = {
      'alluvial': ['loamy', 'sandy', 'silt'],
      'loamy': ['alluvial', 'clay', 'silt'],
      'clay': ['black', 'loamy'],
      'black': ['clay', 'loamy'],
      'sandy': ['loamy', 'alluvial', 'red'],
      'red': ['laterite', 'sandy', 'loamy'],
      'laterite': ['red', 'loamy'],
      'silt': ['alluvial', 'loamy'],
      'mountain': ['loamy'],
      'desert': ['sandy']
    };
    
    const compatibleSoils = compatible[normalizedSoil] || [];
    const hasPartialMatch = suitableLower.some(s => compatibleSoils.includes(s));
    if (hasPartialMatch) return 15;
    
    return 0;
  }

  _calculateSeasonScore(crop, season) {
    if (!crop.suitableSeasons || !crop.suitableSeasons.length || !season) return 5;
    const normalizedSeason = season.toLowerCase();
    const suitableLower = crop.suitableSeasons.map(s => s.toLowerCase());
    
    if (suitableLower.includes(normalizedSeason)) return 25;
    if (suitableLower.includes('annual')) return 20;
    
    // Adjacent season partial match
    const adjacent = {
      'kharif': ['zaid'],
      'rabi': ['zaid'],
      'zaid': ['kharif', 'rabi']
    };
    const adjacentSeasons = adjacent[normalizedSeason] || [];
    if (suitableLower.some(s => adjacentSeasons.includes(s))) return 10;
    
    return 0;
  }

  _calculateWaterScore(crop, waterAvailability, irrigationType) {
    if (!crop.waterRequirement || !waterAvailability) return 10;
    
    const waterMap = { 'low': 1, 'moderate': 2, 'high': 3 };
    const availMap = { 'scarce': 1, 'moderate': 2, 'abundant': 3 };
    
    const cropNeed = waterMap[crop.waterRequirement] || 2;
    const available = availMap[waterAvailability] || 2;
    
    if (available >= cropNeed) return 20;
    if (available === cropNeed - 1) {
      // Can manage with good irrigation
      if (irrigationType && ['drip', 'sprinkler', 'canal'].includes(irrigationType)) return 15;
      return 8;
    }
    return 3;
  }

  _calculateTempScore(crop, temperature) {
    if (!crop.tempRange || !temperature) return 7;
    const temp = parseFloat(temperature);
    const { min, max } = crop.tempRange;
    
    if (min === undefined || max === undefined) return 7;
    
    if (temp >= min && temp <= max) return 15;
    
    const margin = 5;
    if (temp >= min - margin && temp <= max + margin) return 8;
    
    return 0;
  }

  _calculateIrrigationBonus(crop, irrigationType, waterAvailability) {
    if (!irrigationType) return 0;
    
    // High-efficiency irrigation with high-water crops
    if (crop.waterRequirement === 'high' && ['drip', 'sprinkler', 'canal'].includes(irrigationType)) return 10;
    if (crop.waterRequirement === 'moderate' && ['drip', 'sprinkler'].includes(irrigationType)) return 8;
    if (crop.waterRequirement === 'low' && irrigationType === 'rainfed') return 7;
    
    return 3;
  }
}

module.exports = new RecommendationService();
