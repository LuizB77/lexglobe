export function generateChecklist(destination, tripType) {
  const items = [
    'Check passport validity (must be valid 6 months beyond travel)',
    'Save emergency numbers',
    'Download offline maps',
    'Notify bank of travel dates',
    'Apply for visa if required',
    'Check vaccination requirements',
  ]

  if (tripType === 'tourism' || tripType === 'moving') {
    items.push('Get International Driving Permit')
  }

  return items.map((label, index) => ({ id: `item-${index}`, label, done: false }))
}
