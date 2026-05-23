export const provincesAndCities: Record<string, string[]> = {
  'Ontario': ['Toronto', 'Ottawa', 'Mississauga', 'Hamilton', 'London', 'Kitchener', 'Windsor', 'Brampton'],
  'British Columbia': ['Vancouver', 'Victoria', 'Surrey', 'Burnaby', 'Kelowna', 'Nanaimo'],
  'Alberta': ['Calgary', 'Edmonton', 'Red Deer', 'Lethbridge'],
  'Quebec': ['Montreal', 'Quebec City', 'Gatineau', 'Laval', 'Sherbrooke'],
  'Manitoba': ['Winnipeg', 'Brandon'],
  'Saskatchewan': ['Saskatoon', 'Regina'],
  'Nova Scotia': ['Halifax', 'Sydney'],
  'New Brunswick': ['Fredericton', 'Moncton', 'Saint John'],
  'Newfoundland and Labrador': ['St. John\'s'],
  'Prince Edward Island': ['Charlottetown'],
  'Northwest Territories': ['Yellowknife'],
  'Yukon': ['Whitehorse'],
  'Nunavut': ['Iqaluit'],
};

export const provinceList = Object.keys(provincesAndCities);
