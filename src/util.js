function getAngularDiff(angle1, angle2) {
    return Math.atan2(Math.sin(angle1 - angle2), Math.cos(angle1 - angle2))
}

function generateGameID(length, segments) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789#$'
    const power = chars.length
    let id = ""
    for (let i = 0; i < segments; i++) {
        for (let j = 0; j < length; j++) {
            let char = chars.charAt(Math.floor(Math.random() * power))  // Do not link to phasers random gen
            id += char
        }
        if (i < segments - 1) id += '-'
    }
    return id
}

// Chat GPT debug function
function drawDebugGraphics() {
    let world = World.PlayScene.world
    let graphics = World.PlayScene.debugGraphics
    graphics.clear()
    graphics.depth = 1000

    // Iterate over all Box2D bodies
    for (let body = world.getBodyList(); body; body = body.getNext()) {
        const pos = body.getPosition()
        const angle = body.getAngle() // Get body's rotation in radians

        // Convert Box2D world coordinates to Phaser pixels (1m = 16px)
        const x = pos.x * 16
        const y = pos.y * 16

        for (let fixture = body.getFixtureList(); fixture; fixture = fixture.getNext()) {
            if (fixture.isSensor() == true) {
                graphics.lineStyle(1, 0xff00ff, 1)
                graphics.fillStyle(0xff00ff, 0.2)
            } else {
                graphics.lineStyle(1, 0x00ff00, 1)
                graphics.fillStyle(0x00ff00, 0.2)
            }

            const shape = fixture.getShape()

            if (shape.getType() == 'polygon') { // Polygons & Boxes
                const vertices = shape.m_vertices.map(v => {
                    // Rotate the vertex around (0,0) and apply body's position
                    const rotatedX = v.x * Math.cos(angle) - v.y * Math.sin(angle)
                    const rotatedY = v.x * Math.sin(angle) + v.y * Math.cos(angle)

                    return {
                        x: (rotatedX + pos.x) * 16, 
                        y: (rotatedY + pos.y) * 16
                    }
                })

                graphics.beginPath()
                graphics.moveTo(vertices[0].x, vertices[0].y)

                for (let i = 1; i < vertices.length; i++) {
                    graphics.lineTo(vertices[i].x, vertices[i].y)
                }

                graphics.closePath()
                graphics.strokePath()
                graphics.fillPath()
            }
            else if (shape.getType() == 'circle') { // Circles
                const radius = shape.m_radius * 16
                graphics.strokeCircle(x, y, radius)
                graphics.fillCircle(x, y, radius)
            }
        }
    }
}

function stringToSeed(string) {
    const num = 0x9e3779b97f4a7c15n
    let hash = 0
    for (let i = 0; i < string.length; i++) {
        let charCode = string.charCodeAt(i)
        hash = (hash << 5) - hash + charCode
        hash |= 0; 
    }
    return (BigInt(hash) * num) & 0xFFFFFFFFFFFFFFFFn
}

function ParseDigits(num, digits) {
    num = Math.round(num)
    let parsed = []
    for (let i = 0; i < digits; i++) {
        let digit = num % 10
        num = (num-digit) / 10
        parsed.push(digit)
    }
    parsed.reverse()
    return parsed
}

function map(x, x0, x1, y0 = 0, y1 = 1) {
    return (x - x0) / (x1 - x0) * (y1 - y0) + y0
}

function clampedMap(x, x0, x1, y0 = 0, y1 = 1) {
    return Phaser.Math.Clamp((x - x0) / (x1 - x0) * (y1 - y0) + y0, y0, y1)
}

function letterToIndex(letter) {
    if (typeof letter !== 'string' || letter.length !== 1) {
        throw new Error('Input must be a single letter')
    }
    letter = letter.toLowerCase()
    if (letter < 'a' || letter > 'z') {
        throw new Error('Input must be a letter from A to Z')
    }
    return letter.charCodeAt(0) - 'a'.charCodeAt(0)
}