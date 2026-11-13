import { icon } from './icons.mjs'
import { fields, types, technicians, models, components, cases, examples, parts, typeIcons, modelFor, fieldFor, localDay, shiftDay, displayDate, policyEnd, activeOn, diagnosisFor, availableParts, validateCoverage, initialState } from './data.mjs'
import { roleInfo, page, button, iconButton, badge, esc, diagnosticBlock, jobBadge, jobMachine, photoSrc, fleetResults, partResults } from './views.mjs'

const $ = selector => document.querySelector(selector)
const main = $('#main')
const dialog = $('#dialog')
const storageKey = 'trexo-demo-v1'
let state = initialState()
try {
  const saved = localStorage.getItem(storageKey)
  if (saved) state = JSON.parse(saved)
} catch { /* Start with the demonstration data if browser storage is unavailable. */ }
const ui = { role:'producer', page:'fleet', filter:'Todas', query:'', searchOpen:false, navOpen:false, roleOpen:false }
let modal = null
let lastFocus
let disposeViewer
let toastTimer
let reportPhoto = ''
let photoRead
let reportVersion = 0

function notify(message) {
  const toast = $('#toast')
  toast.innerHTML = icon('check') + '<span>' + esc(message) + '</span>'
  toast.hidden = false
  clearTimeout(toastTimer)
  toastTimer = setTimeout(() => { toast.hidden = true }, 3600)
}

function commit(change) {
  const updated = structuredClone(state)
  change(updated)
  try {
    localStorage.setItem(storageKey, JSON.stringify(updated))
  } catch {
    notify('No se pudo guardar el cambio. Revisá el espacio disponible en el navegador.')
    return false
  }
  state = updated
  render()
  return true
}

function pendingFor(pageId) {
  if (pageId === 'requests') return state.jobs.filter(job => job.owner === 'andres' && job.status === 'open').length
  if (pageId === 'jobs') return state.jobs.filter(job => job.status === 'open').length
  if (pageId === 'orders') return state.orders.filter(order => order.status === 'pending').length
  return 0
}

function render() {
  const role = roleInfo[ui.role]
  const navItem = role.nav.find(item => item[0] === ui.page)
  $('#sidebar').classList.toggle('mobile-open', ui.navOpen)
  $('#sidebar').innerHTML = `<button class="brand" data-action="navigate" data-id="${role.nav[0][0]}" aria-label="Trexo, inicio">
    <img src="./assets/trexo.svg" alt=""><span>trexo<span>.</span></span></button>
    <div class="sidebar-main"><span class="nav-label">ESPACIO DE TRABAJO</span>
    <nav>${role.nav.map(([id,label,symbol]) => {
      const count = pendingFor(id)
      return `<button type="button" data-action="navigate" data-id="${id}" class="nav-button ${ui.page === id ? 'current' : ''}" ${ui.page === id ? 'aria-current="page"' : ''}>
        ${icon(symbol)} <span>${label}</span>${count ? `<small>${count}</small>` : ''}</button>`
    }).join('')}</nav></div>
    <div class="sidebar-bottom"><button class="nav-button help-link" data-action="help">${icon('help')} <span>Ayuda</span>${icon('external')}</button>
      <div class="sidebar-profile"><span class="avatar green">${role.initials}</span><div><strong>${role.name}</strong><small>${role.label}</small></div></div>
    </div>`
  $('#topbar').innerHTML = `<div class="breadcrumbs">${iconButton('Abrir menú','menu','mobile-menu')}
    <span>Espacio ${role.label.toLowerCase()}</span>${icon('chevron')}<strong>${navItem[1]}</strong></div>
    <div class="top-actions"><span class="demo-label"><i class="dot"></i> Modo demo</span>
      <div class="role-selector"><button type="button" class="role-button" data-action="role-menu" aria-expanded="${ui.roleOpen}" aria-label="Cambiar perfil. Perfil actual: ${role.label}">${icon('user')}<span>${role.label}</span>${icon('arrows')}</button>
      ${ui.roleOpen ? `<div class="role-menu"><div>Cambiar perfil</div>${Object.entries(roleInfo).map(([key,item]) => `<button type="button" data-action="role" data-id="${key}" ${key === ui.role ? 'aria-current="true"' : ''}>${icon(key === 'producer' ? 'tractor' : key === 'tech' ? 'wrench' : 'box')}<span>${item.label}</span>${key === ui.role ? icon('check') : ''}</button>`).join('')}</div>` : ''}</div>
      ${iconButton('Notificaciones','bell','notifications')}</div>`
  main.innerHTML = page(state,ui)
}

function navigate(pageId) {
  if (!roleInfo[ui.role].nav.some(([id]) => id === pageId)) return
  close()
  Object.assign(ui, { page:pageId, filter:'Todas', query:'', searchOpen:false, navOpen:false, roleOpen:false })
  render()
  window.scrollTo(0,0)
}

function show(title, body, { wide = false, className = '', back = '' } = {}) {
  disposeViewer?.()
  disposeViewer = null
  if (!dialog.open) lastFocus = document.activeElement
  dialog.className = 'dialog ' + (wide ? 'dialog-wide ' : '') + className
  dialog.innerHTML = `<header class="dialog-header"><div>${back}</div><h2 id="dialog-title">${esc(title)}</h2>${iconButton('Cerrar','close','close')}</header>${body}`
  if (!dialog.open) dialog.showModal()
  else dialog.querySelector('.dialog-header [data-action="close"]')?.focus()
  dialog.scrollTop = 0
}

function close() {
  if (dialog.open) dialog.close()
}

dialog.addEventListener('close', () => {
  if (dialog.open) return
  disposeViewer?.()
  disposeViewer = null
  modal = null
  reportVersion += 1
  if (lastFocus?.isConnected) lastFocus.focus()
})

dialog.addEventListener('click', event => {
  if (event.target !== dialog) return
  const rect = dialog.getBoundingClientRect()
  if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) close()
})

const fieldOptions = (values, selected) => values.map(([value,label]) => `<option value="${esc(value)}"${value === selected ? ' selected' : ''}>${esc(label)}</option>`).join('')
const own = () => state.machines.filter(item => item.owner === 'andres')
const machineOptions = selected => fieldOptions(own().map(item => [item.id,item.model + ' · ' + item.field + (item.serial ? ' · ' + item.serial : '')]),selected)
const error = (form, message) => { form.querySelector('.form-error').textContent = message }
const errorSlot = '<p class="form-error" role="alert"></p>'
const submit = (label, symbol) => `<button type="submit" class="button primary">${icon(symbol)}${label}</button>`
const formFooter = action => `${errorSlot}<div class="dialog-actions">${button('Cancelar','close')}${action}</div>`

function addMachine() {
  modal = { type:'add-machine' }
  show('Nueva máquina',`<form class="dialog-body form" id="machine-form">
    <p class="dialog-intro">Registrá el equipo y el campo donde opera.</p>
    <div class="form-grid">
      <label>Modelo <input name="model" list="models" placeholder="Ej. John Deere S780" maxlength="70" required><datalist id="models">${fieldOptions(models.map(model => [model.name,model.name]))}</datalist></label>
      <label>Tipo <select name="type" required><option value="">Seleccioná un tipo</option>${fieldOptions(types.map(type => [type,type]))}</select></label>
      <label>Campo <select name="field" required>${fieldOptions(fields.map(field => [field.name,field.name]))}</select></label>
      <label>Año <input name="year" type="number" min="1900" max="${Number(localDay().slice(0,4)) + 1}" placeholder="2024" required></label>
      <label>Horas de uso <input name="hours" type="number" min="0" max="999999" placeholder="0" required></label>
      <label>Número de serie <span>Opcional</span><input name="serial" maxlength="45" placeholder="Ej. S780-0328"></label>
    </div>
    ${formFooter(submit('Registrar máquina','plus'))}</form>`)
}

function machineDetails(id) {
  const machine = state.machines.find(item => item.id === id)
  if (!machine) return
  modal = { type:'machine', id }
  const model = modelFor(machine.model)
  const insured = state.policies.find(policy => policy.machineId === id && activeOn(policy,localDay()))
  show(machine.model,`<div class="dialog-body">
    ${model?.image ? `<div class="detail-image"><img src="./assets/${model.image}.jpg" alt="${esc(machine.model)}"></div>` : ''}
    <div class="detail-info"><div><small>Tipo</small><strong>${esc(machine.type)}</strong></div><div><small>Campo</small><strong>${esc(machine.field)}</strong></div><div><small>Año</small><strong>${machine.year}</strong></div><div><small>Horas de uso</small><strong>${machine.hours} h</strong></div><div><small>Número de serie</small><strong>${esc(machine.serial || '—')}</strong></div><div><small>Seguro</small><strong>${insured ? 'Vigente hasta ' + displayDate(policyEnd(insured)) : 'Sin cobertura vigente'}</strong></div></div>
    <div class="dialog-actions split">${model?.viewer ? button('Explorar en 3D','viewer',{id,icon:'cube'}) : ''}${button('Contratar seguro','coverage',{id,icon:'shield'})}${button('Solicitar asistencia','report',{id,icon:'wrench',className:'primary'})}</div>
    </div>`)
}

function technicianDetails(id) {
  const tech = technicians.find(item => item.id === id)
  modal = { type:'technician', id }
  show(tech.name,`<div class="dialog-body">
    <div class="profile-top"><span class="avatar ${tech.color}">${tech.initials}</span><div><h3>${tech.name}</h3><p>${tech.company}</p></div><span class="rating">${icon('star')} ${tech.score} <small>(${tech.ratings})</small></span></div>
    <div class="detail-info"><div><small>Ubicación</small><strong>${tech.location}</strong></div><div><small>Especialidad</small><strong>${tech.specialty}</strong></div>${tech.official ? `<div><small>Certificación AgroNorte</small><strong>${tech.certification}</strong></div>` : ''}</div>
    <div class="dialog-actions">${button('Cerrar','close')}</div></div>`)
}

function insuranceDates(form) {
  const start = form.elements.start.value
  const days = Number(form.elements.duration.value)
  form.querySelector('output').textContent = start ? displayDate(start) + ' – ' + displayDate(shiftDay(start,days - 1)) : 'Elegí una fecha de inicio.'
}

function coverage(id) {
  modal = { type:'coverage', id }
  show('Contratar seguro',`<form class="dialog-body form" id="coverage-form"><p class="dialog-intro">Seleccioná la máquina y el intervalo de cobertura.</p>
    <label>Máquina <select name="machine">${machineOptions(id)}</select></label>
    <div class="form-grid"><label>Fecha de inicio <input name="start" type="date" value="${localDay()}" min="${localDay()}" required></label>
    <label>Plazo <select name="duration">${fieldOptions([30,90,180,365].map(days => [days,days + ' días']),90)}</select></label></div>
    <div class="callout">${icon('calendar')}<div><strong>Vigencia de la póliza</strong><p><output></output></p></div></div>
    <p class="muted">Póliza simulada para esta demostración.</p>${formFooter(submit('Confirmar cobertura','shield'))}
  </form>`)
  insuranceDates($('#coverage-form'))
}

function report(id) {
  modal = { type:'report' }
  reportVersion += 1
  reportPhoto = ''
  photoRead = null
  show('Solicitar asistencia',`<form class="dialog-body form" id="report-form">
    <p class="dialog-intro">Describí qué pasó y adjuntá una foto para que un técnico pueda revisar el caso.</p>
    <label>Máquina <select name="machine">${machineOptions(id)}</select></label>
    <label>¿Qué problema tiene? <textarea name="description" rows="4" required maxlength="1500" placeholder="Ej. La plataforma se traba al arrancar y hace un ruido intermitente."></textarea></label>
    <div class="example-row">${examples.map(item => button(item.text,'example',{id:item.key,className:'example-chip'})).join('')}</div>
    <div class="upload-row"><label class="upload"><input type="file" name="photo" accept="image/*" aria-label="Adjuntar foto">${icon('image')} <span>Adjuntar foto</span></label>
      ${button('Usar foto de ejemplo','example-photo',{className:'text'})}</div>
    <div id="photo-preview" hidden></div>
    ${formFooter(submit('Ver diagnóstico','sparkles'))}
  </form>`)
}

function setPhoto(url, label) {
  reportPhoto = url
  const preview = $('#photo-preview')
  if (!preview) return
  preview.hidden = !url
  preview.innerHTML = url ? `<div class="photo-preview"><img src="${photoSrc(url)}" alt="Foto adjunta"><span>${esc(label)}</span>${iconButton('Quitar foto','close','remove-photo')}</div>` : ''
}

async function readPhoto(file) {
  if (!file) return
  const form = $('#report-form')
  const version = reportVersion
  error(form,'')
  setPhoto('','')
  const objectURL = URL.createObjectURL(file)
  try {
    const img = new Image()
    img.src = objectURL
    await img.decode()
    if (version !== reportVersion) return
    const canvas = document.createElement('canvas')
    const scale = Math.min(1, 900 / Math.max(img.naturalWidth,img.naturalHeight))
    canvas.width = Math.max(1, Math.round(img.naturalWidth * scale))
    canvas.height = Math.max(1, Math.round(img.naturalHeight * scale))
    const context = canvas.getContext('2d')
    context.fillStyle = '#fff'
    context.fillRect(0,0,canvas.width,canvas.height)
    context.drawImage(img,0,0,canvas.width,canvas.height)
    setPhoto(canvas.toDataURL('image/jpeg',0.77),file.name)
  } catch {
    if (version === reportVersion) error(form,'No se pudo abrir esa imagen. Probá con una foto JPG, PNG o WebP.')
  } finally { URL.revokeObjectURL(objectURL) }
}

function reviewReport(draft) {
  modal = { type:'review-report', draft }
  const machine = state.machines.find(item => item.id === draft.machineId)
  show('Revisá el diagnóstico',`<div class="dialog-body">
    <div class="case-context"><span class="tile-icon green">${icon(typeIcons[machine.type])}</span><div><strong>${esc(machine.model)}</strong><p>${esc(machine.field)}</p></div></div>
    ${diagnosticBlock(draft.diagnosis,{expanded:true})}
    <p class="muted">El técnico recibirá este diagnóstico de demostración junto con tu descripción y la foto.</p>
    <div class="dialog-actions">${button('Editar reporte','edit-report')}${button('Publicar solicitud','publish-report',{icon:'arrow',className:'primary'})}</div>
  </div>`)
}

function jobDetails(id) {
  const job = state.jobs.find(item => item.id === id)
  if (!job) return
  const machine = jobMachine(state,job)
  const viewer = modelFor(machine.model)?.viewer ? machine.id : ''
  const tech = technicians.find(item => item.id === job.techId)
  const canAccept = ui.role === 'tech' && job.status === 'open'
  const canChat = job.status === 'accepted'
  modal = { type:'job', id }
  show('Solicitud ' + job.id,`<div class="dialog-body">
    <div class="case-context"><span class="tile-icon green">${icon(typeIcons[machine.type])}</span><div><strong>${esc(machine.model)}</strong><p>${esc(machine.field)} · ${esc(fieldFor(machine.field)?.location)}${ui.role === 'tech' ? ' · ' + esc(job.producer) : ''}</p></div>${jobBadge(job.status)}</div>
    <div class="case-report"><div><h3>Problema reportado</h3><p>${esc(job.description)}</p></div>${photoSrc(job.photo) ? `<button class="evidence" data-action="evidence" data-id="${id}" title="Ampliar foto" aria-label="Ampliar foto del reporte"><img src="${photoSrc(job.photo)}" alt="Foto del problema reportado"></button>` : ''}</div>
    ${diagnosticBlock(job.diagnosis,{expanded:true,viewer})}
    ${tech && ui.role === 'producer' ? `<div class="callout">${icon('user')}<div><strong>${tech.name}</strong><p>${tech.company} · Técnico asignado</p></div></div>` : ''}
    <div class="dialog-actions">${canAccept ? button('Aceptar trabajo','accept',{id,icon:'check',className:'primary'}) : ''}
      ${canChat && ui.role === 'tech' ? button('Buscar repuesto','navigate',{id:'catalog',icon:'box'}) : ''}
      ${canChat ? button('Abrir chat','chat',{id,icon:'chat',className:'primary'}) : ''}</div>
  </div>`)
}

function chat(id) {
  const job = state.jobs.find(item => item.id === id && item.status === 'accepted')
  if (!job || (ui.role === 'producer' ? job.owner !== 'andres' : ui.role !== 'tech' || job.techId !== 'mateo')) return
  const partner = ui.role === 'producer' ? technicians.find(item => item.id === job.techId).name : job.producer
  modal = { type:'chat', id }
  show(partner,`<div class="dialog-body chat-body"><div class="chat-context">${icon('wrench')} ${esc(jobMachine(state,job).model)} <span>·</span> ${job.id}</div>
    <div class="chat-log" role="log" aria-label="Conversación">${job.messages.length ? job.messages.map(message => {
      const ownMessage = message.from === ui.role
      return `<div class="chat-line ${ownMessage ? 'mine' : ''}"><div><small>${ownMessage ? 'Vos' : esc(partner)} · ${esc(message.time)}</small><p>${esc(message.text)}</p></div></div>`
    }).join('') : '<p class="chat-empty">El trabajo fue aceptado. Enviá un mensaje para coordinar la visita.</p>'}</div>
    <form id="chat-form" class="chat-compose"><input name="message" aria-label="Escribí un mensaje" placeholder="Escribí un mensaje…" maxlength="1000" required autocomplete="off"><button class="button primary" type="submit" aria-label="Enviar mensaje">${icon('send')}</button></form>
    ${errorSlot}</div>`,{back:iconButton('Volver a la solicitud','back','job',id)})
  const log = dialog.querySelector('.chat-log')
  log.scrollTop = log.scrollHeight
}

function requestPart(id) {
  const part = parts.find(item => item.id === id)
  const stock = availableParts(state,id)
  const jobs = state.jobs.filter(job => job.techId === 'mateo' && modelFor(jobMachine(state,job).model)?.name === part.model)
  modal = { type:'part-request', id }
  show(part.name,`<form class="dialog-body form" id="part-form"><p class="dialog-intro">${part.sku} · ${part.model} · ${stock} unidades disponibles</p>
    ${jobs.length ? `<label>Trabajo asociado <select name="job">${fieldOptions(jobs.map(job => [job.id,job.id + ' · ' + jobMachine(state,job).field]))}</select></label>
      <label>Cantidad <input name="quantity" type="number" value="1" min="1" max="${stock}" required></label>
      ${formFooter(submit('Solicitar repuesto','box'))}` :
      `<div class="callout">${icon('wrench')} <div><strong>Hace falta un trabajo compatible</strong><p>Aceptá un trabajo para ${part.model} antes de solicitar este repuesto.</p></div></div>
      <div class="dialog-actions">${button('Ver trabajos disponibles','navigate',{id:'jobs',className:'primary',endIcon:'arrow'})}</div>`}
  </form>`)
}

async function openViewer(machineId, selection) {
  const machine = state.machines.find(item => item.id === machineId)
  const from = modal
  modal = { type:'viewer', id:machineId, selection }
  const current = modal
  const back = from?.type === 'job' ? iconButton('Volver a la solicitud','back','job',from.id) :
    from?.type === 'machine' ? iconButton('Volver a la máquina','back','machine',machineId) : ''
  show(machine.model,`<div class="viewer-layout"><div class="viewer-stage">
    <div class="viewer-toolbar"><div class="segmented" role="group" aria-label="Vista del equipo">
      <button type="button" data-view="assembled" aria-pressed="true">${icon('cube')} Ensamblado</button>
      <button type="button" data-view="exploded" aria-pressed="false">${icon('layers')} Por subsistemas</button></div>
      <button type="button" class="button secondary compact" id="viewer-labels" aria-pressed="true">Etiquetas</button></div>
    <div class="scene" id="scene" aria-label="Modelo 3D interactivo de la cosechadora"><p class="scene-loading">Cargando modelo 3D…</p>
      <div class="camera-tools">${['plus','minus','rotate'].map((item,index) => `<button type="button" class="icon-button" data-camera="${item}" aria-label="${['Acercar','Alejar','Restablecer vista'][index]}">${icon(item)}</button>`).join('')}</div>
      <div class="scene-hint">Arrastrá para rotar · Usá los controles para acercar</div>
    </div>
    <label class="explosion">Separación de conjuntos <input type="range" id="viewer-explosion" min="0" max="100" value="0"><output id="viewer-percent">0%</output></label>
    <p class="muted viewer-note">Modelo esquemático de demostración.</p></div>
    <aside class="viewer-panel"><div class="viewer-panel-header"><span class="tile-icon green">${icon('layers')}</span><div><h3>Componentes</h3><p>Explorá los conjuntos de la cosechadora.</p></div></div>
      <div id="component-info" class="component-info"></div>
      <div class="component-list">${components.map(item => `<button type="button" data-component="${item.id}" aria-pressed="false"><span><strong>${item.name}</strong><small>${item.category}</small></span>${icon('chevron')}</button>`).join('')}</div></aside></div>`,{wide:true,className:'viewer-dialog',back})
  const scene = $('#scene')
  try {
    const { createViewer } = await import('./viewer.mjs')
    if (!dialog.open || modal !== current) return
    disposeViewer = createViewer(scene,dialog,selection)
  } catch {
    if (modal === current && dialog.open) {
      scene.classList.add('scene-fallback')
      scene.querySelector('.scene-loading').textContent = 'El visor 3D no está disponible en este navegador.'
      const choose = id => {
        const item = components.find(component => component.id === id)
        $('#component-info').innerHTML = `<strong>${item.name}</strong><p>${item.description}</p>`
        dialog.querySelectorAll('[data-component]').forEach(control => control.setAttribute('aria-pressed',String(control.dataset.component === id)))
      }
      dialog.querySelectorAll('[data-component]').forEach(control => control.addEventListener('click',() => choose(control.dataset.component)))
      if (selection) choose(selection)
    }
  }
}

function finishOrder(id, status) {
  const order = state.orders.find(item => item.id === id)
  if (!order || order.status !== 'pending' || ui.role !== 'dealer') return
  if (status === 'approved' && availableParts(state,order.partId) < order.quantity) {
    notify('El stock actual no alcanza para aprobar este pedido.')
    return
  }
  if (commit(updated => { updated.orders.find(item => item.id === id).status = status })) notify(status === 'approved' ? 'Pedido aprobado. Stock actualizado.' : 'Pedido denegado.')
}

const actions = {
  navigate: id => navigate(id),
  'mobile-menu': () => { ui.navOpen = !ui.navOpen; render() },
  'role-menu': () => {
    ui.roleOpen = !ui.roleOpen
    render()
    $(ui.roleOpen ? '.role-menu button' : '.role-button')?.focus()
  },
  role: id => { ui.role = id; navigate(roleInfo[id].nav[0][0]); $('.role-button')?.focus() },
  close,
  'add-machine': addMachine,
  machine: machineDetails,
  technician: technicianDetails,
  coverage,
  report,
  viewer: (id = '') => openViewer(...id.split('|')),
  job: jobDetails,
  chat,
  evidence: id => {
    const job = state.jobs.find(item => item.id === id)
    show('Foto del reporte',`<div class="dialog-body"><img class="evidence-full" src="${photoSrc(job.photo)}" alt="Foto ampliada del problema reportado"></div>`,
      {back:iconButton('Volver a la solicitud','back','job',id)})
  },
  accept: id => {
    if (ui.role !== 'tech' || state.jobs.find(job => job.id === id)?.status !== 'open') return
    if (commit(updated => Object.assign(updated.jobs.find(job => job.id === id), { status:'accepted', techId:'mateo' }))) {
      chat(id)
      notify('Trabajo aceptado. El chat ya está habilitado.')
    }
  },
  'part-request': requestPart,
  approve: id => finishOrder(id,'approved'),
  deny: id => finishOrder(id,'denied'),
  'fleet-filter': id => {
    ui.filter = id
    main.querySelectorAll('[data-action="fleet-filter"]').forEach(control => {
      const selected = control.dataset.id === id
      control.classList.toggle('selected', selected)
      control.setAttribute('aria-pressed', String(selected))
    })
    $('#fleet-results').innerHTML = fleetResults(state,ui)
  },
  'fleet-search': () => {
    ui.searchOpen = !ui.searchOpen
    if (!ui.searchOpen) ui.query = ''
    render()
    $(ui.searchOpen ? '#fleet-query' : '.search-toggle')?.focus()
  },
  example: id => {
    const example = examples.find(item => item.key === id)
    $('#report-form').elements.description.value = example.description
    $('#report-form').elements.description.focus()
  },
  'example-photo': () => {
    reportVersion += 1
    photoRead = null
    error($('#report-form'),'')
    setPhoto('./assets/example.jpg','Foto de ejemplo')
  },
  'remove-photo': () => {
    reportVersion += 1
    photoRead = null
    $('#report-form').elements.photo.value = ''
    setPhoto('','')
  },
  'edit-report': () => {
    const draft = modal.draft
    report(draft.machineId)
    $('#report-form').elements.description.value = draft.description
    setPhoto(draft.photo,draft.photo === './assets/example.jpg' ? 'Foto de ejemplo' : 'Foto adjunta')
  },
  'publish-report': () => {
    const draft = modal.draft
    if (commit(updated => {
      updated.jobs.unshift({
        id:'TR-' + updated.nextJob++, machineId:draft.machineId, owner:'andres', producer:'Andrés Molina',
        status:'open', date:localDay(), description:draft.description, diagnosis:draft.diagnosis, photo:draft.photo, messages:[],
      })
    })) {
      navigate('requests')
      notify('Solicitud publicada en el marketplace.')
    }
  },
  help: () => show('Cómo probar Trexo',`<div class="dialog-body help-content">
    <p>Usá el selector de perfil para recorrer la misma operación.</p>
    <ol><li>Como <strong>productor</strong>, cargá una máquina o publicá una solicitud con una foto.</li>
    <li>Como <strong>técnico</strong>, revisá el diagnóstico, aceptá el trabajo y abrí el chat. Solicitá un repuesto del catálogo.</li>
    <li>Como <strong>concesionaria</strong>, resolvé el pedido y consultá las reservas de las pólizas vigentes.</li></ol>
    <p class="muted">La demo guarda los cambios en este navegador.</p></div>`),
  notifications: () => {
    const target = { producer:'requests', tech:'jobs', dealer:'orders' }[ui.role]
    const count = pendingFor(target)
    const label = { producer:count === 1 ? 'solicitud por asignar' : 'solicitudes por asignar', tech:count === 1 ? 'trabajo disponible' : 'trabajos disponibles', dealer:count === 1 ? 'pedido pendiente' : 'pedidos pendientes' }[ui.role]
    show('Notificaciones',`<div class="dialog-body"><p class="dialog-intro">${count ? count + ' ' + label : 'Estás al día.'}</p>${count ? `<div class="dialog-actions">${button('Ver actividad','navigate',{id:target,endIcon:'arrow'})}</div>` : ''}</div>`)
  },
}

document.addEventListener('click', event => {
  const control = event.target.closest('[data-action]')
  if (ui.roleOpen && !event.target.closest('.role-selector')) {
    ui.roleOpen = false
    $('.role-menu')?.remove()
    $('.role-button')?.setAttribute('aria-expanded','false')
  }
  if (control && !control.disabled) actions[control.dataset.action]?.(control.dataset.id)
})

document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && ui.roleOpen) {
    ui.roleOpen = false
    $('.role-menu')?.remove()
    $('.role-button')?.setAttribute('aria-expanded','false')
    $('.role-button')?.focus()
  }
})

document.addEventListener('input', event => {
  const input = event.target
  if (input.id === 'fleet-query') {
    ui.query = input.value
    $('#fleet-results').innerHTML = fleetResults(state,ui)
  }
  if (input.id === 'part-query') {
    ui.query = input.value
    $('#part-results').innerHTML = partResults(state,ui)
  }
  if (input.form?.id === 'coverage-form') insuranceDates(input.form)
})

dialog.addEventListener('change', event => {
  const input = event.target
  if (input.form?.id === 'machine-form' && input.name === 'model') {
    const model = modelFor(input.value)
    if (model) input.form.elements.type.value = model.type
  }
  if (input.form?.id === 'report-form' && input.name === 'photo' && input.files[0]) {
    reportVersion += 1
    photoRead = readPhoto(input.files[0])
  }
})

const forms = {
  'machine-form': (form,data) => {
    const modelName = data.get('model').trim()
    if (!modelName) return error(form,'Ingresá el modelo de la máquina.')
    const known = modelFor(modelName)
    const serial = data.get('serial').trim()
    if (serial && own().some(machine => machine.serial?.toLowerCase() === serial.toLowerCase())) return error(form,'Ya registraste una máquina con ese número de serie.')
    const newMachine = {
      id:crypto.randomUUID(), model:known?.name ?? modelName, type:known?.type ?? data.get('type'),
      field:data.get('field'), year:Number(data.get('year')), hours:Number(data.get('hours')), serial, owner:'andres',
    }
    if (commit(updated => { updated.machines.push(newMachine) })) {
      navigate('fleet')
      notify('Máquina registrada.')
    }
  },
  'coverage-form': (form,data) => {
    const machine = own().find(item => item.id === data.get('machine'))
    const start = data.get('start')
    const duration = Number(data.get('duration'))
    if (!machine || !start || start < localDay() || ![30,90,180,365].includes(duration)) return error(form,'Revisá la máquina, la fecha y el plazo.')
    const end = shiftDay(start,duration)
    const issue = validateCoverage(state,machine,start,end)
    if (issue) return error(form,issue)
    if (commit(updated => { updated.policies.unshift({ id:'TX-' + updated.nextPolicy++, machineId:machine.id, start, end }) })) {
      navigate('insurance')
      notify('Cobertura simulada registrada.')
    }
  },
  'report-form': async (form,data) => {
    const context = modal
    await photoRead
    if (context !== modal || !dialog.open) return
    const description = data.get('description').trim()
    if (!description) return error(form,'Describí el problema para continuar.')
    if (!reportPhoto) return error(form,'Adjuntá una foto o usá la foto de ejemplo.')
    const machine = own().find(item => item.id === data.get('machine'))
    if (!machine) return error(form,'Seleccioná una máquina.')
    const diagnosis = modelFor(machine.model)?.viewer ? diagnosisFor(description) :
      diagnosisFor(description) === 'hydraulic' ? 'hydraulic' : 'general'
    reviewReport({ machineId:machine.id, description, diagnosis, photo:reportPhoto })
  },
  'chat-form': (form,data) => {
    const id = modal.id
    const text = data.get('message').trim()
    if (!text) return error(form,'Escribí un mensaje antes de enviarlo.')
    const time = new Intl.DateTimeFormat('es-AR',{hour:'2-digit',minute:'2-digit',timeZone:'America/Argentina/Buenos_Aires'}).format(new Date())
    if (commit(updated => { updated.jobs.find(job => job.id === id).messages.push({ from:ui.role,text,time }) })) {
      chat(id)
      $('#chat-form').elements.message.focus()
    }
  },
  'part-form': (form,data) => {
    const partId = modal.id
    const quantity = Number(data.get('quantity'))
    const job = state.jobs.find(item => item.id === data.get('job') && item.techId === 'mateo')
    if (!job || modelFor(jobMachine(state,job).model)?.name !== parts.find(part => part.id === partId).model) return error(form,'Seleccioná un trabajo compatible.')
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > availableParts(state,partId)) return error(form,'Ingresá una cantidad disponible en stock.')
    if (commit(updated => {
      updated.orders.unshift({ id:'RP-' + updated.nextOrder++, partId, quantity, jobId:job.id, techId:'mateo', date:localDay(), status:'pending' })
    })) {
      navigate('my-orders')
      notify('Pedido enviado a AgroNorte.')
    }
  },
}

dialog.addEventListener('submit', event => {
  event.preventDefault()
  const form = event.target
  forms[form.id]?.(form,new FormData(form))
})

window.addEventListener('storage', event => {
  if (event.key !== storageKey) return
  try {
    state = event.newValue ? JSON.parse(event.newValue) : initialState()
    render()
    if (modal?.type === 'chat' && dialog.open) chat(modal.id)
  } catch { /* Keep the current view if another tab wrote unusable data. */ }
})

render()
