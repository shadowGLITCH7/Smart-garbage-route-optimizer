require('dotenv').config();
const mongoose = require('mongoose');
const Bin = require('./models/Bin');
const Truck = require('./models/Truck');

const bins = [
  { binId: 'BIN-A01', location: { lat: 23.3441, lon: 85.3096, address: 'Main Road, Ranchi' }, zone: 'Zone A', fillLevel: 85, type: 'general' },
  { binId: 'BIN-A02', location: { lat: 23.3510, lon: 85.3150, address: 'Station Road, Ranchi' }, zone: 'Zone A', fillLevel: 60, type: 'general' },
  { binId: 'BIN-A03', location: { lat: 23.3480, lon: 85.3080, address: 'Church Road, Ranchi' }, zone: 'Zone A', fillLevel: 92, type: 'recyclable' },
  { binId: 'BIN-A04', location: { lat: 23.3420, lon: 85.3200, address: 'Firayalal Chowk' }, zone: 'Zone A', fillLevel: 30, type: 'organic' },
  { binId: 'BIN-A05', location: { lat: 23.3550, lon: 85.3120, address: 'Albert Ekka Chowk' }, zone: 'Zone A', fillLevel: 75, type: 'general' },
  { binId: 'BIN-B01', location: { lat: 23.3600, lon: 85.2950, address: 'Harmu Road' }, zone: 'Zone B', fillLevel: 88, type: 'general' },
  { binId: 'BIN-B02', location: { lat: 23.3650, lon: 85.2900, address: 'Harmu Housing Colony' }, zone: 'Zone B', fillLevel: 45, type: 'recyclable' },
  { binId: 'BIN-B03', location: { lat: 23.3580, lon: 85.2870, address: 'Harmu Market' }, zone: 'Zone B', fillLevel: 95, type: 'general' },
  { binId: 'BIN-B04', location: { lat: 23.3620, lon: 85.3000, address: 'Harmu River Road' }, zone: 'Zone B', fillLevel: 20, type: 'organic' },
  { binId: 'BIN-B05', location: { lat: 23.3700, lon: 85.2980, address: 'Harmu North' }, zone: 'Zone B', fillLevel: 67, type: 'general' },
  { binId: 'BIN-C01', location: { lat: 23.3350, lon: 85.3300, address: 'Lalpur Chowk' }, zone: 'Zone C', fillLevel: 78, type: 'general' },
  { binId: 'BIN-C02', location: { lat: 23.3300, lon: 85.3350, address: 'Lalpur Main Market' }, zone: 'Zone C', fillLevel: 55, type: 'recyclable' },
  { binId: 'BIN-C03', location: { lat: 23.3380, lon: 85.3400, address: 'Lalpur East' }, zone: 'Zone C', fillLevel: 82, type: 'general' },
  { binId: 'BIN-C04', location: { lat: 23.3250, lon: 85.3280, address: 'Lalpur West' }, zone: 'Zone C', fillLevel: 15, type: 'organic' },
  { binId: 'BIN-C05', location: { lat: 23.3320, lon: 85.3420, address: 'Lalpur Colony' }, zone: 'Zone C', fillLevel: 90, type: 'general' },
  { binId: 'BIN-D01', location: { lat: 23.3800, lon: 85.3100, address: 'Kanke Road' }, zone: 'Zone D', fillLevel: 70, type: 'general' },
  { binId: 'BIN-D02', location: { lat: 23.3850, lon: 85.3050, address: 'Kanke Dam Area' }, zone: 'Zone D', fillLevel: 40, type: 'recyclable' },
  { binId: 'BIN-D03', location: { lat: 23.3900, lon: 85.3150, address: 'Kanke Market' }, zone: 'Zone D', fillLevel: 85, type: 'general' },
  { binId: 'BIN-D04', location: { lat: 23.3750, lon: 85.3200, address: 'Kanke South' }, zone: 'Zone D', fillLevel: 50, type: 'organic' },
  { binId: 'BIN-D05', location: { lat: 23.3820, lon: 85.3250, address: 'Kanke Residential' }, zone: 'Zone D', fillLevel: 63, type: 'general' },
];

const trucks = [
  { truckId: 'T-01', driver: 'Adweya Padhi',  phone: '9801234567', capacity: 5000, status: 'available', zone: 'Zone A' },
  { truckId: 'T-02', driver: 'Chiraag Dubey',  phone: '9812345678', capacity: 5000, status: 'available', zone: 'Zone B' },
  { truckId: 'T-03', driver: 'Ayush Samantary',  phone: '9823456789', capacity: 4000, status: 'available', zone: 'Zone C' },
  { truckId: 'T-04', driver: 'Cristiano Ronaldo', phone: '9834567890', capacity: 4000, status: 'available', zone: 'Zone D' },
];

mongoose.connect(process.env.MONGO_URI).then(async () => {
  await Bin.deleteMany({});
  await Truck.deleteMany({});
  await Bin.insertMany(bins);
  await Truck.insertMany(trucks);
  console.log('Seeded ' + bins.length + ' bins and ' + trucks.length + ' trucks');
  process.exit(0);
}).catch(err => { console.error(err); process.exit(1); });
