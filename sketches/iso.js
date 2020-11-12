const canvasSketch = require('canvas-sketch')
const random = require('canvas-sketch-util/random')
const { clamp, linspace } = require('canvas-sketch-util/math')

const settings = {
  dimensions: [800, 600],
  animate: true,
}
// must be an even number or everything breaks
const gridSize = 44

const isogrid = ({ context, width, height }) => {
  let ar = []
  const aspect = width / height
  // console.log({ aspect })
  for (let y = 0; y < gridSize / aspect - 1; y++) {
    for (let x = 0; x < gridSize; x++) {
      const yOffset = x % 2 ? 0 : 0.5
      ar.push([
        // x
        ((x + 0.5) / gridSize) * width,
        // y
        ((y + 0.5 + yOffset) / gridSize) * height * aspect,
      ])
    }
  }
  context.fillStyle = 'rgb(200, 200, 200)'
  ar.map(([x, y]) => context.fillRect(x - 1, y - 1, 2, 2))
  // console.log({ ar })
  return ar
}

const drawCircle = (context, x, y, radius) => {
  context.beginPath()
  context.arc(x, y, radius, 0, Math.PI * 2, true)
  context.stroke()
}

const getNeighbours = (i, grid) => {
  const offset = i % 2
  const x = i % gridSize
  const y = Math.floor(i / gridSize)
  const yGridSize = grid.length / gridSize - 1
  // console.log({ i, grid, offset, x, y })

  let points = []
  // top left
  if (x > 0 && y >= offset) points.push(i - 1 - gridSize * offset)
  // top
  if (x >= 0 && y > 0) points.push(i - gridSize)
  // top right
  if (x < gridSize - offset && y >= offset) points.push(i + 1 - gridSize * offset)
  // bottom left
  if (x > 0 && y < yGridSize + offset) points.push(i - 1 + gridSize * (1 - offset))
  // bottom
  if (x >= 0 && y < yGridSize) points.push(i + gridSize)
  // bottom right
  if (x < gridSize - offset && y < yGridSize + offset) points.push(i + 1 + gridSize * (1 - offset))

  return points
}

const getFreeNeighbour = ({ visited, pointIndex, grid }) => {
  const neighbours = random.shuffle(getNeighbours(pointIndex, grid))
  // console.log({ neighbours })

  for (const neighbour of neighbours) {
    if (!visited.has(neighbour)) return neighbour
  }
  return null
}

const drawLine = (context, grid, p1, p2) => {
  const [x1, y1] = grid[p1]
  const [x2, y2] = grid[p2]
  context.lineWidth = 4
  context.strokeStyle = 'black'
  context.beginPath()
  context.moveTo(x1, y1)
  context.lineTo(x2, y2)
  context.stroke()
  context.lineWidth = 3
  context.strokeStyle = 'white'
  context.beginPath()
  context.moveTo(x1, y1)
  context.lineTo(x2, y2)
  context.stroke()
}

const walkGrid = ({ context, grid }) => {
  let pointIndex = random.rangeFloor(grid.length)
  let nextPointIndex = 0
  let visited = new Set()
  let available = new Set([...Array(grid.length).keys()])

  context.strokeStyle = 'rgb(50, 50, 50)'

  let stuck = 0

  const step = (frame) => {
    if (stuck > 100) return null

    if (visited.has(pointIndex)) {
      // already been here - jump somewhere new
      pointIndex = random.pick(Array.from(available.values()))
      return
    }

    // pick a random neighbour
    nextPointIndex = getFreeNeighbour({ visited, pointIndex, grid })
    if (nextPointIndex == null) {
      // already visited all my neighbours - jump somewhere new
      pointIndex = random.pick(Array.from(available.values()))
      stuck++
      return
    }

    // draw a line between them
    drawLine(context, grid, pointIndex, nextPointIndex)
    // console.log({ pointIndex, nextPointIndex })

    // keep track of where we've been
    visited.add(pointIndex)
    available.delete(pointIndex)

    pointIndex = nextPointIndex
    stuck = 0
  }
  return step
}

const sketch = ({ context, width, height }) => {
  // bg
  context.fillStyle = 'white'
  context.fillRect(0, 0, width, height)

  // grid
  const grid = isogrid({ context, width, height })

  // walk
  const step = walkGrid({ context, grid })

  return ({ frame }) => {
    step(frame)
  }
}

canvasSketch(sketch, settings)
