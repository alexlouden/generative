const canvasSketch = require('canvas-sketch')
const random = require('canvas-sketch-util/random')
const { clamp, linspace } = require('canvas-sketch-util/math')

const settings = {
  dimensions: [800, 600],
}
const gridSize = 50

const isogrid = ({ context, width, height }) => {
  let ar = []
  const aspect = width / height
  console.log({ aspect })
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
  context.fillStyle = 'rgb(50, 50, 50)'
  ar.map(([x, y]) => context.fillRect(x - 1, y - 1, 2, 2))
  console.log({ ar })
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
  console.log({ i, grid, offset, x, y })

  let points = []
  // top left
  if (x > 0 && y >= offset) points.push(grid[i - 1 - gridSize * offset])
  // top
  if (x >= 0 && y > 0) points.push(grid[i - gridSize])
  // top right
  if (x < gridSize - offset && y >= offset) points.push(grid[i + 1 - gridSize * offset])
  // bottom left
  if (x > offset && y < yGridSize + offset) points.push(grid[i - 1 + gridSize * (1 - offset)])
  // bottom
  if (x >= 0 && y < yGridSize) points.push(grid[i + gridSize])
  // bottom right
  if (x < gridSize - offset && y < yGridSize + offset)
    points.push(grid[i + 1 + gridSize * (1 - offset)])

  return points
}

const walkGrid = ({ context, grid }) => {
  // let pointIndex = random.rangeFloor(grid.length)
  let pointIndex = 1800
  const neighbours = getNeighbours(pointIndex, grid)

  context.strokeStyle = 'rgb(255, 0, 0)'
  const [x, y] = grid[pointIndex]
  console.log({ pointIndex, neighbours })
  drawCircle(context, x, y, 5)

  context.strokeStyle = 'rgb(0, 0, 255)'
  neighbours.map(([x, y]) => {
    drawCircle(context, x, y, 5)
  })
}

const sketch = () => {
  return ({ context, width, height }) => {
    // bg
    context.fillStyle = 'white'
    context.fillRect(0, 0, width, height)

    // grid
    const grid = isogrid({ context, width, height })

    // walk
    walkGrid({ context, grid })
  }
}

canvasSketch(sketch, settings)
