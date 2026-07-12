export type PartCatalogItem = {
  id: string
  name: string
  category: string
}

export type PartCatalogCategory = {
  label: string
  items: string[]
}

export const partCatalogCategories: PartCatalogCategory[] = [
  {
    label: 'Engine & Mechanical',
    items: [
      'Engine',
      'Transmission',
      'Radiator',
      'Alternator',
      'Starter Motor',
      'Water Pump',
      'Fuel Pump',
      'Timing Belt',
      'Serpentine Belt',
      'Spark Plugs',
      'Engine Mount',
      'Oil Filter',
      'Air Filter',
    ],
  },
  {
    label: 'Brakes & Suspension',
    items: [
      'Brake Pads',
      'Brake Rotors',
      'Brake Calipers',
      'Shock Absorbers',
      'Struts',
      'Control Arms',
      'Ball Joints',
      'Tie Rods',
      'Wheel Bearings',
    ],
  },
  {
    label: 'Body & Exterior',
    items: [
      'Front Bumper',
      'Rear Bumper',
      'Hood',
      'Fender',
      'Door',
      'Trunk Lid',
      'Grille',
      'Side Mirror',
      'Windshield',
      'Rear Glass',
      'Headlight',
      'Taillight',
      'Fog Light',
    ],
  },
  {
    label: 'Electrical',
    items: [
      'Battery',
      'Fuse',
      'Relay',
      'Wiring Harness',
      'Sensor',
      'ECU',
      'Ignition Coil',
    ],
  },
  {
    label: 'Interior',
    items: [
      'Seat',
      'Seat Belt',
      'Dashboard',
      'Steering Wheel',
      'Airbag',
      'Window Switch',
      'Door Handle',
      'Floor Mat',
    ],
  },
  {
    label: 'Wheels & Tires',
    items: ['Tire', 'Wheel/Rim', 'Lug Nuts', 'Spare Tire'],
  },
  {
    label: 'Cooling & AC',
    items: [
      'AC Compressor',
      'Condenser',
      'Evaporator',
      'Cooling Fan',
      'Thermostat',
    ],
  },
  {
    label: 'Exhaust',
    items: ['Catalytic Converter', 'Muffler', 'Exhaust Pipe', 'Oxygen Sensor'],
  },
  {
    label: 'Other',
    items: ['Custom Part / Other'],
  },
]

export const defaultPartCatalogItems = partCatalogCategories.flatMap((group) =>
  group.items.map((name) => ({
    id: slugifyPartName(name),
    name,
    category: group.label,
  }))
)

function slugifyPartName(name: string) {
  return `part-${name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')}`
}
