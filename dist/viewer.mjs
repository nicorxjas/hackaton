import * as THREE from 'three'
import { OrbitControls } from './vendor/OrbitControls.js'
import { RoomEnvironment } from './vendor/RoomEnvironment.js'
import { components } from './data.mjs'

const rad = Math.PI / 2
const materials = {}
const dimensions = {
  header: { origin:[0,0,3.6], offset:[0,0,2.45], pin:[0,1.5,.45] },
  feeder: { origin:[0,0,1.9], offset:[-2.15,.42,1.45], pin:[-.7,1.45,.6] },
  rotor: { origin:[0,0,-.85], offset:[2.3,.65,-.55], pin:[1.05,2.9,-.25] },
  auger: { origin:[1.4,0,-1.25], offset:[1.55,1.1,-1.1], pin:[.45,3.78,-1.2] },
  cab: { origin:[0,0,1.25], offset:[-1.9,1.7,.42], pin:[-.48,3.42,.75] },
  drive: { origin:[0,0,0], offset:[0,-.48,-1.3], pin:[1.65,.9,1.1] },
}

function material(name, color, metalness = 0, roughness = .55) {
  const mat = new THREE.MeshStandardMaterial({color,metalness,roughness})
  materials[name] = mat
  return mat
}

function makeMachine(scene) {
  const green = material('green','#4a682b',.38,.39)
  const light = material('light','#617e35',.32,.41)
  const dark = material('dark','#2e4523',.32,.48)
  const gold = material('gold','#e9b84c',.37,.43)
  const black = material('black','#272e28',.22,.48)
  const rubber = material('rubber','#202321',0,.86)
  const tread = material('tread','#2a2d29',0,.83)
  const steel = material('steel','#a5aea1',.68,.36)
  const glass = material('glass','#364f4a',.58,.18)
  const lamp = material('lamp','#fcf3ce',.22,.19)
  const amber = material('amber','#d68429',.22,.39)
  const groups = Object.fromEntries(Object.entries(dimensions).map(([id,part]) => {
    const group = new THREE.Group()
    group.position.fromArray(part.origin)
    group.userData.id = id
    scene.add(group)
    return [id,group]
  }))

  function mesh(group, geometry, appearance, position, rotation = [0,0,0]) {
    const object = new THREE.Mesh(geometry, appearance)
    object.position.fromArray(position)
    object.rotation.fromArray(rotation)
    object.castShadow = true
    object.receiveShadow = true
    group.add(object)
    return object
  }
  const box = (g, size, mat, p, r) => mesh(g,new THREE.BoxGeometry(...size),mat,p,r)
  const cylinder = (g, radius, width, mat, p, r, second = radius, segments = 32) =>
    mesh(g,new THREE.CylinderGeometry(radius,second,width,segments),mat,p,r)
  const pipe = (g, start, end, radius, mat) => {
    const a = new THREE.Vector3(...start)
    const b = new THREE.Vector3(...end)
    const object = cylinder(g,radius,a.distanceTo(b),mat,a.clone().lerp(b,.5).toArray())
    object.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),b.sub(a).normalize())
    return object
  }
  const ring = (g,radius,tube,mat,p,r) => mesh(g,new THREE.TorusGeometry(radius,tube,8,32),mat,p,r)
  function loft(g, lower, upper, mat) {
    const geometry = new THREE.BufferGeometry()
    const points = [...lower,...upper]
    const faces = [
      [0,1,2,3], [4,7,6,5], [0,4,5,1], [1,5,6,2], [2,6,7,3], [3,7,4,0],
    ]
    const triangles = faces.flatMap(([a,b,c,d]) => [a,b,c,a,c,d].flatMap(index => points[index]))
    geometry.setAttribute('position',new THREE.Float32BufferAttribute(triangles,3))
    geometry.computeVertexNormals()
    return mesh(g,geometry,mat,[0,0,0])
  }
  const rectangle = (x,y,z,depth) => [[-x,y,z+depth],[-x,y,z-depth],[x,y,z-depth],[x,y,z+depth]]

  const rotor = groups.rotor
  loft(rotor,rectangle(1.17,1.26,0,1.64),rectangle(1.36,2.98,-.01,1.88),green)
  box(rotor,[2.55,.16,3.2],dark,[0,1.5,0])
  box(rotor,[2.65,.13,3.65],light,[0,3.01,-.015])
  loft(rotor,rectangle(.99,3.06,-.13,1.05),rectangle(1.33,3.55,-.18,1.22),dark)
  box(rotor,[2.49,.04,2.3],black,[0,3.57,-.18])
  box(rotor,[1.91,.1,1.62],dark,[0,3.6,-.16])
  for (const side of [-1,1]) {
    box(rotor,[.047,.09,3.38],gold,[side * 1.26,2.32,0],[0,0,side * -.11])
    box(rotor,[.047,.43,1.18],dark,[side * 1.30,2.67,-.97])
    for (let line = 0; line < 6; line++) box(rotor,[.055,.022,1.04],black,[side * 1.33,2.53 + line * .047,-.97])
    box(rotor,[.065,.05,2.12],dark,[side * 1.34,2.93,.33])
    for (const z of [-.28,.43,1.11]) box(rotor,[.03,.045,.08],steel,[side * 1.35,2.78,z])
  }
  cylinder(rotor,.27,2.65,steel,[0,1.2,-.15],[rad,0,0])
  for (let i = 0; i < 7; i++) ring(rotor,.275,.036,dark,[0,1.2,-1.3 + i * .36])
  box(rotor,[2.27,.14,.14],black,[0,1.52,-1.83])
  for (const side of [-1,1]) box(rotor,[.29,.095,.05],amber,[side * .95,1.55,-1.917])

  const cab = groups.cab
  box(cab,[1.88,.27,1.4],green,[0,2.01,.18])
  loft(cab,rectangle(.81,2.14,.16,.59),rectangle(.92,3.34,.09,.64),glass)
  box(cab,[2.01,.14,1.46],black,[0,3.38,.1])
  box(cab,[1.99,.09,1.43],light,[0,3.48,.1])
  for (const side of [-1,1]) {
    for (const z of [-.49,.74]) pipe(cab,[side*.82,2.13,z*.94],[side*.93,3.35,z],.035,black)
    pipe(cab,[side*.94,3.29,.36],[side*1.17,3.26,.5],.027,black)
    box(cab,[.11,.31,.14],black,[side*1.2,3.2,.53])
    box(cab,[.04,.06,.66],black,[side*.86,2.43,.14])
  }
  for (const x of [-.68,-.45,.45,.68]) box(cab,[.19,.085,.08],lamp,[x,3.38,.86])
  cylinder(cab,.065,.13,amber,[-.72,3.59,.58])
  for (const side of [-1,1]) pipe(cab,[1.04+side*.12,1.45,.53],[.87+side*.12,2.35,.53],.022,steel)
  for (let i=0;i<4;i++) box(cab,[.36,.056,.15],black,[1.12 - i*.053,1.25+i*.24,.55])

  const feeder = groups.feeder
  box(feeder,[1.37,.62,1.96],green,[0,1.08,.34],[.34,0,0])
  box(feeder,[1.12,.1,1.86],dark,[0,1.40,.42],[.34,0,0])
  for (const x of [-.65,.65]) pipe(feeder,[x,.79,1.23],[x,1.43,-.52],.064,steel)
  for (const x of [-.39,0,.39]) box(feeder,[.083,.025,1.32],black,[x,1.41,.46],[.34,0,0])
  cylinder(feeder,.18,1.19,steel,[0,.85,1.22],[0,0,rad])

  const header = groups.header
  box(header,[6.2,.26,1.4],dark,[0,.48,.08])
  box(header,[6.25,.12,.32],steel,[0,.37,.84])
  box(header,[6.19,.38,.15],green,[0,.77,-.52])
  cylinder(header,.20,5.94,black,[0,.71,-.21],[0,0,rad])
  for (let i = 0; i < 26; i++) {
    const x = -2.91 + i * .23
    box(header,[.099,.035,.28],gold,[x,.365,.89],[0,Math.PI/4,0])
    box(header,[.014,.095,.38],black,[x,.80,.37],[-.34,0,0])
  }
  for (const x of [-3.04,3.04]) {
    box(header,[.21,.69,1.5],green,[x,.68,.18],[-.19,0,0])
    pipe(header,[x,.99,-.46],[x,1.5,.31],.072,dark)
    ring(header,.44,.049,black,[x,1.24,.37],[0,rad,0])
  }
  cylinder(header,.065,6.11,black,[0,1.24,.37],[0,0,rad])
  for (let i=0;i<6;i++) {
    const angle = i * Math.PI / 3
    const y = 1.24 + .42 * Math.sin(angle)
    const z = .37 + .42 * Math.cos(angle)
    pipe(header,[-3.05,y,z],[3.05,y,z],.027,black)
    for (const x of [-3.04,-1.53,0,1.53,3.04]) pipe(header,[x,1.24,.37],[x,y,z],.024,black)
    for (let j=0;j<24;j++) pipe(header,[-2.9 + j*.25,y,z],[-2.9 + j*.25,y-.087,z+.055],.012,steel)
  }

  const auger = groups.auger
  cylinder(auger,.23,.58,green,[-.1,2.96,.6],[0,0,rad])
  pipe(auger,[.11,2.97,.6],[.30,3.29,.01],.135,light)
  pipe(auger,[.30,3.29,.01],[.43,3.33,-2.34],.126,green)
  pipe(auger,[.43,3.33,-2.26],[.5,3.08,-2.68],.14,black)
  cylinder(auger,.152,.06,dark,[.41,3.31,-1.68],[rad,0,0])

  const drive = groups.drive
  box(drive,[1.7,.44,3.97],black,[0,1.11,-.6])
  for (const wheel of [{z:.8,r:.9,w:.48},{z:-1.98,r:.64,w:.39}]) {
    const {z,r,w} = wheel
    const center = r + .01
    cylinder(drive,.14,2.74,steel,[0,center,z],[0,0,rad])
    for (const side of [-1,1]) {
      const x = side*(1.29+w/2)
      cylinder(drive,r*.94,w,rubber,[x,center,z],[0,0,rad])
      for (const face of [-1,1]) ring(drive,r*.80,r*.14,rubber,[x+face*w*.38,center,z],[0,rad,0])
      cylinder(drive,r*.54,w+.055,gold,[x,center,z],[0,0,rad])
      const hub = x+side*(w/2+.035)
      ring(drive,r*.43,.026,steel,[hub,center,z],[0,rad,0])
      cylinder(drive,r*.24,.075,dark,[hub,center,z],[0,0,rad])
      for (let i=0;i<8;i++) {
        const angle = i*Math.PI/4
        cylinder(drive,.028,.07,steel,[hub+side*.024,center+Math.cos(angle)*r*.33,z+Math.sin(angle)*r*.33],[0,0,rad],.028,6)
      }
      for (let i=0;i<28;i++) {
        const angle = i*Math.PI/14
        for (const sideOfTread of [-1,1]) {
          const stagger = angle + sideOfTread*.035
          const lug = box(drive,[w*.53,.094,r*.105],tread,[x+sideOfTread*w*.2,center+Math.cos(stagger)*r*.95,z+Math.sin(stagger)*r*.95])
          lug.rotation.set(stagger,0,sideOfTread*.25)
        }
      }
    }
  }
  return groups
}

export function createViewer(container, dialog, initialSelection) {
  const renderer = new THREE.WebGLRenderer({antialias:true,alpha:false})
  renderer.setPixelRatio(Math.min(devicePixelRatio,1.65))
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.12
  renderer.domElement.setAttribute('aria-hidden','true')
  container.prepend(renderer.domElement)
  container.querySelector('.scene-loading')?.remove()
  const scene = new THREE.Scene()
  scene.background = new THREE.Color('#0A0B0A')
  const camera = new THREE.PerspectiveCamera(39,1,.1,100)
  const controls = new OrbitControls(camera,renderer.domElement)
  controls.enableDamping = true
  controls.minDistance = 4.8
  controls.maxDistance = 35
  controls.maxPolarAngle = Math.PI * .495
  const pmrem = new THREE.PMREMGenerator(renderer)
  const room = new RoomEnvironment()
  const environment = pmrem.fromScene(room,.045)
  scene.environment = environment.texture
  scene.environmentIntensity = .57
  room.dispose()
  pmrem.dispose()
  scene.add(new THREE.HemisphereLight(0xf8fff3,0xa7ab91,1.08))
  const sun = new THREE.DirectionalLight(0xfff9df,2.8)
  sun.position.set(4,9,5)
  sun.castShadow = true
  sun.shadow.mapSize.set(2048,2048)
  Object.assign(sun.shadow.camera,{left:-9,right:9,top:9,bottom:-9,near:.1,far:25})
  sun.shadow.bias = -.00015
  sun.shadow.normalBias = .026
  scene.add(sun)
  const plane = new THREE.Mesh(new THREE.PlaneGeometry(160,160),new THREE.ShadowMaterial({color:0x000000,opacity:.5}))
  plane.rotation.x = -rad
  plane.position.y = -.055
  plane.receiveShadow = true
  scene.add(plane)
  const grid = new THREE.GridHelper(26,52,0x9CA3AF,0x2C302E)
  grid.position.y = -.05
  grid.material.transparent = true
  grid.material.opacity = .55
  scene.add(grid)

  const groups = makeMachine(scene)
  const hotSpots = components.map((component,index) => {
    const label = document.createElement('button')
    label.type = 'button'
    label.className = 'hotspot'
    label.textContent = index + 1
    label.title = component.name
    label.setAttribute('aria-label',component.name + ' en el modelo')
    label.setAttribute('aria-pressed','false')
    label.addEventListener('click',() => select(component.id))
    container.append(label)
    return {component,label,point:new THREE.Vector3(...dimensions[component.id].pin)}
  })
  const componentControls = [...dialog.querySelectorAll('[data-component]')]
  const slider = dialog.querySelector('#viewer-explosion')
  const percent = dialog.querySelector('#viewer-percent')
  const info = dialog.querySelector('#component-info')
  const viewButtons = [...dialog.querySelectorAll('[data-view]')]
  const labelsButton = dialog.querySelector('#viewer-labels')
  const targets = Object.fromEntries(Object.entries(dimensions).map(([id,item]) => [id,new THREE.Vector3(...item.origin)]))
  const original = new Map()
  const focusMaterial = new THREE.MeshStandardMaterial({color:'#A9FC67',emissive:'#A9FC67',emissiveIntensity:.16,roughness:.47,metalness:.2})
  let selected
  let labels = true
  let width
  let height
  let frame

  function select(id) {
    if (selected) groups[selected].traverse(object => {
      if (original.has(object)) object.material = original.get(object)
    })
    original.clear()
    selected = id
    groups[id].traverse(object => {
      if (!object.isMesh || object.material === materials.rubber || object.material === materials.glass) return
      original.set(object,object.material)
      object.material = focusMaterial
    })
    const part = components.find(component => component.id === id)
    info.innerHTML = `<strong>${part.name}</strong><p>${part.description}</p>`
    componentControls.forEach(control => control.setAttribute('aria-pressed',String(control.dataset.component === id)))
    hotSpots.forEach(({component,label}) => label.setAttribute('aria-pressed',String(component.id === id)))
  }

  function fit() {
    controls.target.set(0,1.58,.58)
    const size = width / height < 1.15 ? 1.31 : 1
    camera.position.set(8.2*size,5.55*size,10.2*size)
    controls.update()
  }

  function explode(value) {
    const amount = value / 100
    for (const [id,part] of Object.entries(dimensions)) {
      targets[id].set(...part.origin).addScaledVector(new THREE.Vector3(...part.offset),amount)
    }
    slider.value = value
    percent.value = value + '%'
    viewButtons.forEach(button => button.setAttribute('aria-pressed',String(button.dataset.view === (value ? 'exploded' : 'assembled'))))
  }

  componentControls.forEach(control => control.addEventListener('click',() => select(control.dataset.component)))
  viewButtons.forEach(control => control.addEventListener('click',() => explode(control.dataset.view === 'exploded' ? 66 : 0)))
  slider.addEventListener('input',() => explode(Number(slider.value)))
  labelsButton.addEventListener('click',() => {
    labels = !labels
    labelsButton.setAttribute('aria-pressed',String(labels))
  })
  dialog.querySelectorAll('[data-camera]').forEach(control => control.addEventListener('click',() => {
    if (control.dataset.camera === 'rotate') {
      fit()
      return
    }
    const offset = camera.position.clone().sub(controls.target)
    const scale = control.dataset.camera === 'plus' ? .83 : 1.2
    const distance = THREE.MathUtils.clamp(offset.length()*scale,controls.minDistance,controls.maxDistance)
    camera.position.copy(controls.target).add(offset.setLength(distance))
    controls.update()
  }))

  function resize() {
    width = container.clientWidth
    height = container.clientHeight
    camera.aspect = width / Math.max(1,height)
    camera.updateProjectionMatrix()
    renderer.setSize(width,height,false)
  }
  const observer = new ResizeObserver(resize)
  observer.observe(container)
  resize()
  fit()
  if (initialSelection) select(initialSelection)
  const pointer = new THREE.Vector2()
  const cast = new THREE.Raycaster()
  let start
  renderer.domElement.addEventListener('pointerdown',event => { start = [event.clientX,event.clientY] })
  renderer.domElement.addEventListener('pointerup',event => {
    if (!start || Math.hypot(event.clientX-start[0],event.clientY-start[1]) > 5) return
    const rect = renderer.domElement.getBoundingClientRect()
    pointer.set((event.clientX-rect.left)/rect.width*2-1,1-(event.clientY-rect.top)/rect.height*2)
    cast.setFromCamera(pointer,camera)
    const hit = cast.intersectObjects(Object.values(groups),true)[0]
    if (hit) select(hit.object.parent.userData.id)
  })

  const projected = new THREE.Vector3()
  function animate() {
    controls.update()
    for (const [id,group] of Object.entries(groups)) group.position.lerp(targets[id],.16)
    renderer.render(scene,camera)
    for (const {component,label,point} of hotSpots) {
      projected.copy(point).add(groups[component.id].position).project(camera)
      label.hidden = !labels || Math.abs(projected.x) > .97 || Math.abs(projected.y) > .95 || projected.z > 1
      label.style.left = (projected.x*.5+.5)*width + 'px'
      label.style.top = (.5-projected.y*.5)*height + 'px'
    }
    frame = requestAnimationFrame(animate)
  }
  animate()

  return () => {
    cancelAnimationFrame(frame)
    observer.disconnect()
    controls.dispose()
    const disposable = new Set([...Object.values(materials),focusMaterial])
    scene.traverse(object => {
      if (object.geometry) disposable.add(object.geometry)
      if (object.material) disposable.add(object.material)
    })
    disposable.forEach(resource => resource.dispose())
    environment.dispose()
    renderer.dispose()
    renderer.forceContextLoss()
    renderer.domElement.remove()
  }
}
