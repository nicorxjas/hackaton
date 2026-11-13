#!/usr/bin/env node
// Harness de validación de contratos para TREXO.
// Uso: node scripts/check.mjs  — Node puro, sin dependencias npm, sin navegador.
// Importa ../dist/data.mjs y ../dist/views.mjs, verifica contratos de datos,
// referencias cruzadas, tonos de badges y cobertura de pantallas.
// Sale con 0 si todos los contratos pasan, 1 si alguno falla.

import { readFileSync } from 'node:fs'

const data = await import(new URL('../dist/data.mjs', import.meta.url).href)
const views = await import(new URL('../dist/views.mjs', import.meta.url).href)
const stylesUrl = new URL('../dist/styles.css', import.meta.url)

const CONTRACTS = ['estado inicial', 'referencias cruzadas', 'pólizas', 'badges por tono', 'screens']
const failures = []
const fail = (contract, detail) => failures.push({ contract, detail })
const contractFailed = contract => failures.some(item => item.contract === contract)

function report() {
  console.log('')
  console.log('== Resumen de contratos ==')
  for (const contract of CONTRACTS) {
    if (contractFailed(contract)) {
      for (const item of failures.filter(entry => entry.contract === contract)) {
        console.log(`  FALLÓ [${contract}] ${item.detail}`)
      }
    } else {
      console.log(`  OK    [${contract}]`)
    }
  }
  const okCount = CONTRACTS.length - new Set(failures.map(item => item.contract)).size
  console.log(`${okCount}/${CONTRACTS.length} contratos verificados, ${failures.length} fallo(s).`)
}

function exit() {
  report()
  process.exit(failures.length ? 1 : 0)
}

// ---------- Contrato 1: estado inicial ----------
let state
try {
  state = data.initialState()
} catch (error) {
  fail('estado inicial', `initialState() lanzó: ${error.message}`)
  exit()
}
if (!state || typeof state !== 'object') {
  fail('estado inicial', `initialState() devolvió ${state === null ? 'null' : typeof state}, se esperaba un objeto`)
  exit()
}
for (const key of ['machines', 'jobs', 'policies', 'orders']) {
  const value = state[key]
  if (!Array.isArray(value)) {
    fail('estado inicial', `'${key}' no es un array (recibido: ${typeof value})`)
  } else if (value.length === 0) {
    fail('estado inicial', `'${key}' es un array vacío, se esperaba longitud > 0`)
  }
}
if (contractFailed('estado inicial')) exit()

// ---------- Contratos 2 y 3: referencias cruzadas ----------
const machineIds = new Set(state.machines.map(machine => machine.id))
const jobIds = new Set(state.jobs.map(job => job.id))
const partIds = new Set(data.parts.map(part => part.id))

for (const job of state.jobs) {
  if (!machineIds.has(job.machineId)) {
    fail('referencias cruzadas', `job '${job.id}': machineId '${job.machineId}' no existe en machines`)
  }
}
for (const order of state.orders) {
  if (!partIds.has(order.partId)) {
    fail('referencias cruzadas', `order '${order.id}': partId '${order.partId}' no existe en parts`)
  }
  if (!jobIds.has(order.jobId)) {
    fail('referencias cruzadas', `order '${order.id}': jobId '${order.jobId}' no existe en jobs`)
  }
}
for (const policy of state.policies) {
  if (!machineIds.has(policy.machineId)) {
    fail('pólizas', `policy '${policy.id}': machineId '${policy.machineId}' no existe en machines`)
  }
}

// ---------- Contrato 5 (render): pantalla por pantalla de roleInfo ----------
const pageIds = []
for (const [, info] of Object.entries(views.roleInfo)) {
  for (const [pageId] of info.nav) {
    if (!pageIds.includes(pageId)) pageIds.push(pageId)
  }
}
const roleForPage = pageId => Object.entries(views.roleInfo)
  .find(([, info]) => info.nav.some(entry => entry[0] === pageId))?.[0]
const rendered = new Map()
for (const pageId of pageIds) {
  const ui = {
    page: pageId,
    role: roleForPage(pageId),
    filter: 'Todas',
    query: '',
    searchOpen: false,
    navOpen: false,
    roleOpen: false,
  }
  try {
    rendered.set(pageId, views.page(state, ui))
  } catch (error) {
    if (error instanceof TypeError && /is not a function/.test(error.message)) {
      fail('screens', `falta ${pageId}`)
    } else {
      fail('screens', `la página '${pageId}' lanzó: ${error.message}`)
    }
  }
}

// ---------- Contrato 4: badges por tono ----------
const css = readFileSync(stylesUrl, 'utf8')
const definedTones = new Set([...css.matchAll(/\.badge\.([A-Za-z0-9_-]+)/g)].map(match => match[1]))
const REQUIRED_LABELS = ['Vencido', 'Aprobado', 'Denegado'] // 'Completado' solo si algún job lo tuviera
const seenLabels = new Set()
for (const [pageId, html] of rendered) {
  for (const match of html.matchAll(/<span class="badge ([^"]*)">([\s\S]*?)<\/span>/g)) {
    const tone = match[1].trim().split(/\s+/)[0]
    const label = match[2].replace(/<[^>]*>/g, '').trim()
    if (![...REQUIRED_LABELS, 'Completado'].includes(label)) continue
    seenLabels.add(label)
    if (!definedTones.has(tone)) {
      fail('badges por tono', `etiqueta '${label}' (página '${pageId}') usa tono '${tone}', que no está definido en dist/styles.css`)
    }
  }
}
for (const label of REQUIRED_LABELS) {
  if (!seenLabels.has(label)) {
    fail('badges por tono', `etiqueta '${label}' no se renderiza en ninguna página con initialState()`)
  }
}

exit()
