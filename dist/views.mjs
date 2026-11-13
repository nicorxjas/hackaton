import { icon } from './icons.mjs'
import { fields, types, technicians, models, cases, components, parts, typeIcons, clean, modelFor, fieldFor, localDay, displayDate, policyStatus, policyEnd, activeOn, availableParts } from './data.mjs'

export const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char])
const number = new Intl.NumberFormat('es-AR', { useGrouping: 'always' })
export const roleInfo = {
  producer: { label: 'Productor', name: 'Andrés Molina', initials: 'AM', nav: [['fleet','Mi flota','tractor'], ['market','Técnicos','users'], ['requests','Solicitudes','clipboard'], ['insurance','Seguros','shield'], ['messages','Mensajes','chat']] },
  tech: { label: 'Técnico', name: 'Mateo Ríos', initials: 'MR', nav: [['jobs','Trabajos disponibles','grid'], ['my-jobs','Mis trabajos','wrench'], ['catalog','Catálogo de repuestos','box'], ['my-orders','Mis pedidos','clipboard'], ['messages','Mensajes','chat']] },
  dealer: { label: 'Concesionaria', name: 'AgroNorte', initials: 'AN', nav: [['overview','Panel general','grid'], ['academy','Técnicos oficiales','school'], ['inventory','Stock de repuestos','box'], ['orders','Pedidos de repuestos','clipboard'], ['reserved','Stock reservado','shield']] },
}

export const jobBadge = status => status === 'open' ? badge('Pendiente', 'amber', 'dot') : status === 'completed' ? badge('Completado', 'green', 'dot') : badge('Aceptado', 'green', 'dot')
const orderBadge = status => ({ pending: badge('Pendiente', 'amber', 'dot'), approved: badge('Aprobado', 'green', 'dot'), denied: badge('Denegado', 'red', 'dot') })[status]
export const badge = (label, tone = 'neutral', symbol = '') => `<span class="badge ${tone}">${symbol === 'dot' ? '<i class="dot"></i>' : symbol ? icon(symbol) : ''}${esc(label)}</span>`
export const button = (label, action, options = {}) => `<button type="button" class="button ${options.className ?? 'secondary'}" data-action="${action}"${options.id ? ` data-id="${esc(options.id)}"` : ''}${options.disabled ? ' disabled' : ''}>${options.icon ? icon(options.icon) : ''}${esc(label)}${options.endIcon ? icon(options.endIcon) : ''}</button>`
export const iconButton = (label, symbol, action, id) => `<button type="button" class="icon-button" aria-label="${esc(label)}" title="${esc(label)}" data-action="${action}"${id ? ` data-id="${esc(id)}"` : ''}>${icon(symbol)}</button>`
export const heading = (title, description, actions = '') => `<div class="page-heading"><div><h1>${title}</h1><p>${description}</p></div>${actions ? `<div class="heading-actions">${actions}</div>` : ''}</div>`
const stat = (symbol, value, label, tone, note = '') => `<article class="stat"><span class="tile-icon ${tone}">${icon(symbol)}</span><div class="stat-text"><div>${label}</div><strong>${value}</strong></div>${note ? `<small>${note}</small>` : ''}</article>`
const empty = (symbol, title, detail, action = '') => `<div class="empty"><span class="tile-icon green">${icon(symbol)}</span><h3>${title}</h3><p>${detail}</p>${action}</div>`
const searchable = (entity, values) => values.some(value => clean(value).includes(clean(entity)))
const ownerMachines = state => state.machines.filter(machine => machine.owner === 'andres')
const filterNames = { Todas:'Todas', Cosechadora:'Cosechadoras', Tractor:'Tractores', Sembradora:'Sembradoras', Pulverizadora:'Pulverizadoras', Otro:'Otros' }
export const jobMachine = (state, job) => state.machines.find(machine => machine.id === job.machineId)
export const photoSrc = url => url === './assets/example.jpg' || /^data:image\/jpeg;base64,[a-z0-9+/=]+$/i.test(url) ? url : ''
const activePolicy = (state, machine) => state.policies.find(policy => policy.machineId === machine.id && activeOn(policy, localDay()))
const avatar = (initials, color = 'green') => `<span class="avatar ${color}">${initials}</span>`

function machineCard(state, machine) {
  const model = modelFor(machine.model)
  const insured = activePolicy(state, machine)
  return `<article class="machine-card" data-action="machine" data-id="${machine.id}" tabindex="0" role="button">
    <div class="machine-visual ${model?.image ?? 'placeholder'}">
      ${model?.image ? `<img src="./assets/${model.image}.jpg" alt="${esc(machine.type)} ${esc(machine.model)}">` : icon(typeIcons[machine.type])}
      <div class="machine-badges">${badge(insured ? 'Asegurada' : 'Sin seguro', insured ? 'green' : 'sand', insured ? 'shield' : 'dot')}
        ${model?.viewer ? `<button class="badge white viewer-badge" data-action="viewer" data-id="${machine.id}" aria-label="Explorar ${esc(machine.model)} en 3D">${icon('cube')} Vista 3D</button>` : ''}
      </div>
    </div>
    <div class="machine-body"><div class="machine-type">${esc(machine.type)}</div><h3>${esc(machine.model)}</h3>
      <div class="machine-location">${icon('pin')} ${esc(machine.field)}</div>
      <div class="machine-footer"><span>${icon('calendar')} ${machine.year}</span><span>${icon('clock')} ${number.format(machine.hours)} h</span>
        ${iconButton('Ver detalles de ' + machine.model, 'arrow', 'machine', machine.id)}</div></div>
  </article>`
}

function fleet(state, ui) {
  const machines = ownerMachines(state)
  const covered = machines.filter(machine => activePolicy(state, machine)).length
  const count = state.jobs.filter(job => job.owner === 'andres' && job.status === 'open').length
  return `${heading('Mi flota', 'Administrá tus máquinas, coberturas y servicios en un solo lugar.', button('Nueva máquina','add-machine',{icon:'plus',className:'secondary'}))}
    <section class="hero" aria-label="Asistencia para tu flota">
      <div class="hero-copy"><h2>Asistencia en campo</h2>
      <p>Reportá una falla y conectá con un técnico<br class="desktop-br"> para volver al campo.</p>
      ${button('Solicitar asistencia','report',{icon:'wrench',endIcon:'arrow',className:'hero-button'})}</div>
    </section>
    <section class="stats" aria-label="Resumen de la flota">
      ${stat('tractor', machines.length, 'Máquinas registradas', 'green', new Set(machines.map(machine => machine.field)).size + ' campos')}
      ${stat('shield', covered, 'Con seguro vigente', 'green', covered + ' de ' + machines.length)}
      ${stat('wrench', count, 'Solicitudes abiertas', 'amber', count ? 'Por asignar' : 'Al día')}
    </section>
    <section class="fleet-section">
      <div class="section-head"><div class="title-inline"><h2>Maquinaria</h2><span class="count">${machines.length}</span></div>
        <button class="search-toggle" type="button" data-action="fleet-search" aria-expanded="${ui.searchOpen}">${icon('search')} <span>Buscar</span></button>
      </div>
      <div class="fleet-filters" role="group" aria-label="Filtrar maquinaria">
        ${['Todas', ...types.filter(type => machines.some(machine => machine.type === type))].map(type => `<button type="button" class="filter-chip ${ui.filter === type ? 'selected' : ''}" data-action="fleet-filter" data-id="${type}" aria-pressed="${ui.filter === type}">${filterNames[type]}</button>`).join('')}
        ${ui.searchOpen ? `<label class="search-field fleet-search">${icon('search')}<input type="search" id="fleet-query" value="${esc(ui.query)}" placeholder="Buscar por modelo o campo" aria-label="Buscar maquinaria" autocomplete="off"></label>` : ''}
      </div>
      <div id="fleet-results">${fleetResults(state,ui)}</div>
    </section>`
}

export function fleetResults(state, ui) {
  const filtered = ownerMachines(state).filter(machine =>
    (ui.filter === 'Todas' || ui.filter === machine.type) && searchable(ui.query, [machine.model, machine.field, machine.type, machine.serial]))
  return filtered.length ? `<div class="cards-grid">${filtered.map(machine => machineCard(state,machine)).join('')}</div>`
    : empty('search','Sin coincidencias','Probá con otro modelo, campo o tipo de máquina.')
}

function technicianCard(tech, official = false) {
  return `<article class="profile-card">
    <div class="profile-top">${avatar(tech.initials,tech.color)}<div><h3>${tech.name}</h3><p>${tech.company}</p></div><span class="rating">${icon('star')} ${tech.score}</span></div>
    <div class="profile-detail"><span>${icon('pin')} ${tech.location}</span><span>${icon(official ? 'school' : 'wrench')} ${official ? tech.certification : tech.specialty}</span></div>
    <div class="profile-footer">${official || tech.official ? badge('Técnico oficial','green','check') : `<span class="subtle">A ${tech.distance} km</span>`}
      <div class="row-actions">${official ? '' : button('Contratar','hire-tech',{id:tech.id,className:'secondary compact',icon:'user-plus'})}${button('Ver perfil','technician',{id:tech.id,className:'text',endIcon:'arrow'})}</div></div></article>`
}

function market() {
  return `${heading('Marketplace de técnicos','Encontrá especialistas cerca de tu campo y consultá sus valoraciones.',button('Solicitar asistencia','report',{className:'primary',icon:'plus'}))}
    <div class="section-head roomy"><h2>Técnicos disponibles</h2><span class="soft-label">${icon('pin')} Zona norte · Buenos Aires</span></div>
    <div class="cards-grid">${technicians.map(tech => technicianCard(tech)).join('')}</div>`
}

export function diagnosticBlock(key, { expanded = false, viewer = '', showButton = true } = {}) {
  const diagnostic = cases[key]
  const component = components.find(item => item.id === diagnostic.part)
  return `<section class="diagnostic"><div class="diagnostic-label">${icon('sparkles')} Diagnóstico IA <span>Simulado</span></div>
    <h3>${diagnostic.title}</h3><p>${diagnostic.summary}</p>
    ${expanded ? `<ul>${diagnostic.steps.map(step => `<li>${step}</li>`).join('')}</ul><div class="source">${icon('book')} ${diagnostic.source}</div>` : ''}
    ${showButton && viewer && component ? button('Ver ' + component.name.toLowerCase() + ' en 3D','viewer',{id:viewer + '|' + component.id,className:'text',icon:'cube'}) : ''}
  </section>`
}

function jobCard(state, job, asTech) {
  const machine = jobMachine(state,job)
  return `<article class="job-card">
    <div class="job-top"><div><div class="case-id">${job.id} <span>·</span> ${displayDate(job.date)}</div><h3>${esc(machine.model)}</h3></div>${jobBadge(job.status)}</div>
    <div class="job-location">${icon('pin')} ${esc(machine.field)} · ${esc(fieldFor(machine.field)?.location)}${asTech ? ' · ' + esc(job.producer) : ''}</div>
    ${diagnosticBlock(job.diagnosis,{showButton:false})}
    <div class="job-footer">${button(asTech && job.status === 'open' ? 'Revisar pedido' : 'Ver solicitud','job',{id:job.id,endIcon:'arrow'})}
      ${job.status === 'accepted' ? button('Abrir chat','chat',{id:job.id,icon:'chat',className:'primary'}) : ''}</div>
  </article>`
}

function jobList(state, ui) {
  const asTech = ui.role === 'tech'
  const available = ui.page === 'jobs'
  const jobs = state.jobs.filter(job => !asTech ? job.owner === 'andres' : available ? job.status === 'open' : job.techId === 'mateo')
  const title = asTech ? available ? 'Trabajos disponibles' : 'Mis trabajos' : 'Solicitudes'
  const description = asTech
    ? available ? 'Revisá el diagnóstico, la foto y la ubicación antes de tomar un trabajo.' : 'Coordiná con productores y gestioná los trabajos que aceptaste.'
    : 'Consultá el diagnóstico y seguí el estado de tus pedidos de asistencia.'
  return `${heading(title,description,!asTech ? button('Nueva solicitud','report',{className:'primary',icon:'plus'}) : '')}
    ${jobs.length ? `<div class="jobs-grid">${jobs.map(job => jobCard(state,job,asTech)).join('')}</div>` : empty('clipboard','No hay trabajos para mostrar','Los pedidos aparecerán acá cuando estén disponibles.')}`
}

function insurance(state) {
  const machineIds = ownerMachines(state).map(machine => machine.id)
  const policies = state.policies.filter(policy => machineIds.includes(policy.machineId))
  const rows = policies.map(policy => {
    const machine = state.machines.find(item => item.id === policy.machineId)
    const status = policyStatus(policy)
    return `<tr><td><strong>${esc(machine.model)}</strong><small>${policy.id}</small></td><td>${esc(machine.field)}</td>
      <td>${displayDate(policy.start)} – ${displayDate(policyEnd(policy))}</td><td>${badge(status,status === 'Vigente' ? 'green' : status === 'Programado' ? 'amber' : 'neutral','dot')}</td></tr>`
  }).join('')
  return `${heading('Seguros','Elegí la fecha de inicio y el plazo de cobertura para cada máquina.',button('Contratar seguro','coverage',{className:'primary',icon:'shield'}))}
    <div class="callout">${icon('shield')} <div><strong>Cobertura de demostración</strong><p>Las contrataciones son simuladas. Los modelos con stock asignan una unidad de respaldo durante la vigencia.</p></div></div>
    <div class="section-head roomy"><h2>Mis pólizas</h2><span class="count">${policies.length}</span></div>
    ${policies.length ? table(['Máquina','Campo','Vigencia','Estado'],rows) : empty('shield','Todavía no hay pólizas','Elegí una máquina para simular una cobertura.')}`
}

function messages(state, ui) {
  const jobs = state.jobs.filter(job => job.status === 'accepted' && (ui.role === 'producer' ? job.owner === 'andres' : job.techId === 'mateo'))
  return `${heading('Mensajes','Coordiná la asistencia desde las conversaciones de tus trabajos aceptados.')}
    ${jobs.length ? `<div class="conversation-list">${jobs.map(job => {
      const partner = ui.role === 'producer' ? technicians.find(tech => tech.id === job.techId).name : job.producer
      const latest = job.messages.at(-1)
      return `<button class="conversation" data-action="chat" data-id="${job.id}">${avatar(partner.split(' ').map(part => part[0]).slice(0,2).join(''))}<span><strong>${esc(partner)}</strong><small>${esc(jobMachine(state,job).model)} · ${esc(latest?.text ?? 'Conversación habilitada')}</small></span>${icon('chevron')}</button>`
    }).join('')}</div>` : empty('chat','Todavía no hay conversaciones','El chat se habilita cuando un técnico acepta tu solicitud.',button('Ver solicitudes','navigate',{id:'requests',endIcon:'arrow'}))}`
}

function table(headers, rows) {
  return `<div class="table-wrap"><table><thead><tr>${headers.map(label => `<th scope="col">${label}</th>`).join('')}</tr></thead><tbody>${rows}</tbody></table></div>`
}

function overview(state) {
  const counts = fields.map(field => ({ ...field, machines: state.machines.filter(machine => machine.field === field.name) }))
  const max = Math.max(1, ...counts.map(field => field.machines.length))
  const pending = state.orders.filter(order => order.status === 'pending').length
  return `${heading('Panel general','Seguí la flota en campo y la operación de AgroNorte.')}
    <div class="stats">${stat('tractor',state.machines.length,'Máquinas en campo','green')}${stat('pin',counts.filter(field=>field.machines.length).length,'Campos registrados','green')}${stat('box',pending,'Pedidos por revisar','amber')}</div>
    <div class="overview-grid"><section class="panel"><div class="panel-heading"><span class="tile-icon green">${icon('chart')}</span><div><h2>Máquinas por campo</h2><p>Distribución de la flota registrada</p></div></div>
    <div class="chart">${counts.map(field => `<div class="bar-row"><div><strong>${field.name}</strong><small>${field.location}</small></div><div class="bar-track" role="meter" aria-label="${field.name}" aria-valuenow="${field.machines.length}" aria-valuemin="0" aria-valuemax="${max}"><span style="width:${field.machines.length / max * 100}%"></span></div><b>${field.machines.length}</b></div>`).join('')}</div></section>
    <section class="panel"><div class="panel-heading"><span class="tile-icon amber">${icon('clipboard')}</span><div><h2>Pedidos de repuestos</h2><p>Revisá las solicitudes de tus técnicos</p></div></div><div class="overview-pending"><strong>${pending}</strong><span>${pending === 1 ? 'pedido pendiente' : 'pedidos pendientes'}</span></div>${button('Revisar pedidos','navigate',{id:'orders',endIcon:'arrow'})}</section></div>
    <div class="section-head roomy"><h2>Detalle por establecimiento</h2></div>
    ${table(['Campo','Ubicación','Cosechadoras','Tractores','Sembradoras','Otros','Total'],counts.map(field => `<tr><td><strong>${field.name}</strong></td><td>${field.location}</td>${types.slice(0,3).map(type => `<td>${field.machines.filter(machine => machine.type === type).length}</td>`).join('')}<td>${field.machines.filter(machine => !types.slice(0,3).includes(machine.type)).length}</td><td><strong>${field.machines.length}</strong></td></tr>`).join(''))}`
}

function academy() {
  return `${heading('Técnicos oficiales','Equipo certificado por la academia de AgroNorte.')}<div class="cards-grid">${technicians.filter(tech=>tech.official).map(tech=>technicianCard(tech,true)).join('')}</div>`
}

function inventory(state, ui) {
  const canOrder = ui.role === 'tech'
  return `${heading(canOrder ? 'Catálogo de repuestos' : 'Stock de repuestos',canOrder ? 'Consultá las piezas de AgroNorte y solicitalas para un trabajo aceptado.' : 'Disponibilidad actual de piezas en el catálogo de AgroNorte.')}
    <div class="section-head roomy"><h2>Catálogo AgroNorte</h2><label class="search-field">${icon('search')}<input id="part-query" type="search" value="${esc(ui.query)}" placeholder="Buscar por pieza o código" aria-label="Buscar repuestos" autocomplete="off"></label></div>
    <div id="part-results">${partResults(state,ui)}</div>`
}

export function partResults(state, ui) {
  const canOrder = ui.role === 'tech'
  const selected = parts.filter(part => searchable(ui.query,[part.name,part.sku,part.model]))
  return selected.length ? table(['Repuesto','Modelo compatible','Disponible',...(canOrder ? ['Acción'] : [])], selected.map(part => {
    const available = availableParts(state,part.id)
    return `<tr><td><div class="table-item"><span class="tile-icon green">${icon(part.icon)}</span><div><strong>${part.name}</strong><small>${part.sku}</small></div></div></td><td>${part.model}</td><td>${badge(available ? available + ' en stock' : 'Sin stock',available ? 'green' : 'sand','dot')}</td>
      ${canOrder ? `<td>${button('Solicitar','part-request',{id:part.id,disabled:!available})}</td>` : ''}</tr>`
  }).join('')) : empty('search','Sin coincidencias','Probá con el nombre de la pieza, el código o el modelo.')
}

function orders(state, ui) {
  const asDealer = ui.role === 'dealer'
  const rows = state.orders.filter(order => asDealer || order.techId === 'mateo').map(order => {
    const part = parts.find(item => item.id === order.partId)
    const tech = technicians.find(item => item.id === order.techId)
    return `<tr><td><strong>${part.name}</strong><small>${order.id} · ${order.jobId}</small></td><td>${asDealer ? tech.name : 'AgroNorte'}</td><td>${order.quantity}</td>
      <td>${orderBadge(order.status)}</td>${asDealer ? `<td>${order.status === 'pending' ? `<div class="inline-actions">${button('Aprobar','approve',{id:order.id,className:'primary compact'})}${button('Denegar','deny',{id:order.id,className:'secondary compact'})}</div>` : '—'}</td>` : ''}</tr>`
  }).join('')
  return `${heading(asDealer ? 'Pedidos de repuestos' : 'Mis pedidos',asDealer ? 'Aprobá o denegá las solicitudes de los técnicos.' : 'Seguí el estado de tus solicitudes a la concesionaria.',!asDealer ? button('Ver catálogo','navigate',{id:'catalog',icon:'box'}) : '')}
    ${rows ? table(['Repuesto',asDealer ? 'Técnico' : 'Concesionaria','Cantidad','Estado',...(asDealer ? ['Acciones'] : [])],rows) : empty('box','Todavía no hay pedidos','Las solicitudes de repuestos aparecerán acá.')}`
}

function reserved(state) {
  const today = localDay()
  const byModel = models.map(model => ({
    ...model,
    policies: state.policies.filter(policy => activeOn(policy,today) && modelFor(state.machines.find(machine => machine.id === policy.machineId)?.model)?.name === model.name),
  })).filter(model => model.policies.length)
  const rows = byModel.flatMap(model => model.policies.map(policy => {
    const machine = state.machines.find(item => item.id === policy.machineId)
    return `<tr><td><strong>${model.name}</strong><small>${policy.id}</small></td><td>${esc(machine.field)}</td><td>1</td><td>${displayDate(policyEnd(policy))}</td></tr>`
  })).join('')
  return `${heading('Stock reservado','Unidades comprometidas por pólizas vigentes de la red.')}
    <div class="stats">${stat('shield',byModel.reduce((sum,model)=>sum+model.policies.length,0),'Unidades comprometidas','green')}${stat('tractor',byModel.length,'Modelos con reserva','green')}</div>
    <div class="section-head roomy"><h2>Reservas por modelo</h2></div>
    ${byModel.length ? `<div class="cards-grid">${byModel.map(model => `<article class="panel reserve-card"><div class="panel-heading"><span class="tile-icon green">${icon(typeIcons[model.type])}</span><div><h3>${model.name}</h3><p>${model.type}</p></div></div><div><strong>${model.policies.length}</strong> ${model.policies.length === 1 ? 'unidad comprometida' : 'unidades comprometidas'}</div></article>`).join('')}</div>
    <div class="section-head roomy"><h2>Detalle de reservas vigentes</h2></div>${table(['Modelo','Campo','Reservadas','Vence'],rows)}` : empty('shield','No hay reservas vigentes','Las unidades comprometidas aparecerán cuando empiece la cobertura.')}`
}

const screens = { fleet, market, requests:jobList, insurance, messages, jobs:jobList, 'my-jobs':jobList, catalog:inventory, 'my-orders':orders, overview, academy, inventory, orders, reserved }
export const page = (state, ui) => screens[ui.page](state,ui)
