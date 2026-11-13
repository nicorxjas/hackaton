export const fields = [
  { name: 'La Esperanza', location: 'Pergamino, Buenos Aires' },
  { name: 'El Ombú', location: 'Rojas, Buenos Aires' },
  { name: 'San Agustín', location: 'Colón, Buenos Aires' },
]

export const types = ['Cosechadora', 'Tractor', 'Sembradora', 'Pulverizadora', 'Otro']
export const typeIcons = { Cosechadora: 'combine', Tractor: 'tractor', Sembradora: 'sprout', Pulverizadora: 'droplet', Otro: 'settings' }
export const technicians = [
  { id: 'mateo', name: 'Mateo Ríos', initials: 'MR', company: 'AgroNorte Servicios', location: 'Pergamino, Buenos Aires', score: '4,9', ratings: 48, specialty: 'Cosecha e hidráulica', distance: 12, color: 'green', official: true, certification: 'Sistemas de cosecha e hidráulica' },
  { id: 'lucia', name: 'Lucía Ferrer', initials: 'LF', company: 'AgroNorte Servicios', location: 'Rojas, Buenos Aires', score: '4,8', ratings: 36, specialty: 'Electrónica y siembra', distance: 38, color: 'lilac', official: true, certification: 'Diagnóstico electrónico y siembra' },
  { id: 'santiago', name: 'Santiago López', initials: 'SL', company: 'Taller Rural del Centro', location: 'Colón, Buenos Aires', score: '4,7', ratings: 29, specialty: 'Motores y transmisión', distance: 51, color: 'sand', official: false },
]

export const models = [
  { name: 'John Deere S780', type: 'Cosechadora', stock: 5, image: 'combine', viewer: true },
  { name: 'John Deere 8R 340', type: 'Tractor', stock: 3, image: 'tractor' },
  { name: 'Crucianelli Gringa', type: 'Sembradora', stock: 2, image: 'planter' },
]

export const components = [
  { id: 'header', name: 'Plataforma de corte', category: 'Cosecha', description: 'El molinete guía el cultivo hacia la barra de corte. El sinfín lo lleva al canal de alimentación.' },
  { id: 'feeder', name: 'Canal de alimentación', category: 'Alimentación', description: 'La cadena transportadora transfiere el material desde la plataforma hacia el sistema de trilla.' },
  { id: 'rotor', name: 'Rotor de trilla', category: 'Trilla', description: 'El rotor separa el grano del resto del material dentro del cuerpo principal.' },
  { id: 'auger', name: 'Sinfín de descarga', category: 'Descarga', description: 'Transporta el grano desde la tolva hacia el acoplado de descarga.' },
  { id: 'cab', name: 'Cabina de operación', category: 'Control', description: 'Contiene los mandos, el puesto del operador y el panel de avisos de la máquina.' },
  { id: 'drive', name: 'Tren de rodaje', category: 'Tracción', description: 'El conjunto de ruedas y ejes transmite el movimiento y soporta el peso de la máquina.' },
]

export const cases = {
  feeder: {
    title: 'Posible obstrucción en la alimentación',
    summary: 'La pérdida de caudal y el ruido intermitente son compatibles con una acumulación de material en el canal de alimentación.',
    steps: ['Confirmar con el productor cuándo aparece el ruido.', 'Inspeccionar el canal y verificar el estado de la cadena con el equipo detenido.'],
    source: 'Ficha demo · Alimentación y plataforma', part: 'feeder', suggested: 'cadena',
  },
  header: {
    title: 'Posible desalineación en la plataforma de corte',
    summary: 'El corte irregular y la vibración reportada coinciden con un caso de demostración de desgaste o desalineación de la barra de corte.',
    steps: ['Confirmar si la vibración se concentra en un lado de la plataforma.', 'Verificar el estado de las secciones de cuchilla y sus guías.'],
    source: 'Ficha demo · Plataforma de corte', part: 'header', suggested: 'cuchilla',
  },
  auger: {
    title: 'Descarga irregular de la tolva',
    summary: 'El síntoma coincide con el caso de demostración de una restricción o desgaste en el sistema de descarga.',
    steps: ['Confirmar si el aviso aparece con la tolva cargada.', 'Revisar el acople y el estado del sinfín con el equipo detenido.'],
    source: 'Ficha demo · Sistema de descarga', part: 'auger', suggested: 'rodamiento',
  },
  hydraulic: {
    title: 'Posible pérdida de presión hidráulica',
    summary: 'La respuesta lenta de los actuadores coincide con un caso de demostración de restricción o pérdida en el circuito.',
    steps: ['Pedir el código de alarma y confirmar qué actuador está afectado.', 'Revisar visualmente conexiones y registro de mantenimiento antes de intervenir.'],
    source: 'Ficha demo · Circuito hidráulico', part: 'feeder', suggested: 'filtro',
  },
  general: {
    title: 'Revisión técnica inicial',
    summary: 'El reporte requiere una inspección para identificar el sistema afectado. El técnico puede tomar el trabajo con la descripción y la foto adjuntas.',
    steps: ['Solicitar el código de aviso, si está disponible.', 'Confirmar en qué condiciones se reproduce la falla.'],
    source: 'Ficha demo · Inspección inicial', part: null, suggested: null,
  },
}

export const examples = [
  { text: 'Se traba la alimentación', key: 'feeder', description: 'La cosechadora pierde caudal y hace un ruido intermitente. Parece que se traba la alimentación.' },
  { text: 'El corte es irregular', key: 'header', description: 'La plataforma vibra y la barra de corte deja franjas sin cortar.' },
  { text: 'No descarga el grano', key: 'auger', description: 'El sinfín de descarga arranca, pero el grano sale de forma irregular.' },
]

export const parts = [
  { id: 'cadena', sku: 'AN-1042', name: 'Cadena de alimentación', model: 'John Deere S780', stock: 8, icon: 'link' },
  { id: 'cuchilla', sku: 'AN-1218', name: 'Sección de cuchilla', model: 'John Deere S780', stock: 24, icon: 'scissors' },
  { id: 'rodamiento', sku: 'AN-1330', name: 'Rodamiento de sinfín', model: 'John Deere S780', stock: 4, icon: 'settings' },
  { id: 'filtro', sku: 'AN-2045', name: 'Filtro hidráulico', model: 'John Deere 8R 340', stock: 12, icon: 'filter' },
  { id: 'correa', sku: 'AN-2232', name: 'Correa de transmisión', model: 'John Deere S780', stock: 0, icon: 'link' },
  { id: 'disco', sku: 'AN-3410', name: 'Disco de siembra', model: 'Crucianelli Gringa', stock: 16, icon: 'disc' },
]

export const clean = value => String(value ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim()
export const modelFor = name => models.find(model => clean(model.name) === clean(name))
export const fieldFor = name => fields.find(field => field.name === name)
export const localDay = () => new Intl.DateTimeFormat('sv-SE', { timeZone: 'America/Argentina/Buenos_Aires' }).format(new Date())
export function shiftDay(day, count) {
  const date = new Date(day + 'T12:00:00Z')
  date.setUTCDate(date.getUTCDate() + count)
  return date.toISOString().slice(0, 10)
}
export const displayDate = day => new Intl.DateTimeFormat('es-AR', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' }).format(new Date(day + 'T12:00:00Z'))
export const activeOn = (policy, day) => policy.start <= day && day < policy.end
export const policyStatus = (policy, day = localDay()) => day < policy.start ? 'Programado' : day >= policy.end ? 'Vencido' : 'Vigente'
export const policyEnd = policy => shiftDay(policy.end, -1)

export function diagnosisFor(description) {
  const text = clean(description)
  if (/hidraulic|presion|actuador/.test(text)) return 'hydraulic'
  if (/sinf[ií]n|descarg|tolva/.test(text)) return 'auger'
  if (/cuchill|corte|molinete/.test(text)) return 'header'
  if (/aliment|atasc|traba|cadena/.test(text)) return 'feeder'
  return 'general'
}

export function availableParts(state, partId) {
  return parts.find(part => part.id === partId).stock
    - state.orders.filter(order => order.partId === partId && order.status === 'approved')
      .reduce((sum, order) => sum + order.quantity, 0)
}

export function validateCoverage(state, machine, start, end) {
  const matching = state.policies.filter(policy => policy.start < end && policy.end > start)
  if (matching.some(policy => policy.machineId === machine.id)) return 'La máquina ya tiene cobertura en parte de ese período.'
  const model = modelFor(machine.model)
  if (!model) return ''
  const modelPolicies = matching.filter(policy => {
    const insured = state.machines.find(item => item.id === policy.machineId)
    return modelFor(insured?.model)?.name === model.name
  })
  const dates = [start, ...modelPolicies.map(policy => policy.start).filter(day => day > start)]
  return dates.some(day => modelPolicies.filter(policy => activeOn(policy, day)).length >= model.stock)
    ? 'La concesionaria ya comprometió todas las unidades del modelo para ese período.' : ''
}

export function initialState() {
  const today = localDay()
  return {
    machines: [
      { id: 's780', model: 'John Deere S780', type: 'Cosechadora', field: 'La Esperanza', year: 2023, hours: 1240, serial: 'S780-0328', owner: 'andres' },
      { id: '8r', model: 'John Deere 8R 340', type: 'Tractor', field: 'La Esperanza', year: 2022, hours: 1850, serial: '8R340-0421', owner: 'andres' },
      { id: 'gringa', model: 'Crucianelli Gringa', type: 'Sembradora', field: 'El Ombú', year: 2024, hours: 420, serial: 'CG-0882', owner: 'andres' },
      { id: 'red1', model: 'John Deere S780', type: 'Cosechadora', field: 'San Agustín', owner: 'red', year: 2023, hours: 920 },
      { id: 'red2', model: 'John Deere S780', type: 'Cosechadora', field: 'San Agustín', owner: 'red', year: 2024, hours: 815 },
      { id: 'red3', model: 'John Deere 8R 340', type: 'Tractor', field: 'El Ombú', owner: 'red', year: 2022, hours: 1275 },
      { id: 'red4', model: 'Crucianelli Gringa', type: 'Sembradora', field: 'La Esperanza', owner: 'red', year: 2024, hours: 380 },
    ],
    jobs: [
      { id: 'TR-1042', machineId: 's780', owner: 'andres', producer: 'Andrés Molina', status: 'open', date: today, description: examples[0].description, diagnosis: 'feeder', photo: './assets/example.jpg', messages: [] },
      { id: 'TR-1041', machineId: 'red1', owner: 'red', producer: 'Clara Benítez', status: 'open', date: shiftDay(today, -1), description: examples[2].description, diagnosis: 'auger', photo: './assets/example.jpg', messages: [] },
      { id: 'TR-1038', machineId: 'red2', owner: 'red', producer: 'Clara Benítez', status: 'accepted', techId: 'mateo', date: shiftDay(today, -2), description: examples[1].description, diagnosis: 'header', photo: './assets/example.jpg', messages: [{ from: 'producer', text: 'Hola, Mateo. La cosechadora está en el galpón de San Agustín.', time: '09:15' }] },
    ],
    policies: [
      { id: 'TX-8021', machineId: 's780', start: shiftDay(today, -30), end: shiftDay(today, 150) },
      { id: 'TX-8022', machineId: '8r', start: shiftDay(today, -20), end: shiftDay(today, 70) },
      { id: 'TX-8023', machineId: 'red1', start: shiftDay(today, -15), end: shiftDay(today, 75) },
      { id: 'TX-8024', machineId: 'red2', start: shiftDay(today, -10), end: shiftDay(today, 80) },
    ],
    orders: [
      { id: 'RP-301', partId: 'cuchilla', quantity: 2, jobId: 'TR-1038', techId: 'mateo', date: today, status: 'pending' },
    ],
    nextJob: 1043, nextPolicy: 8025, nextOrder: 302,
  }
}
