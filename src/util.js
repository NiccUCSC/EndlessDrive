function getAngularDiff(angle1, angle2) {
    return Math.atan2(Math.sin(angle1 - angle2), Math.cos(angle1 - angle2))
}

function generateGameID(length, segments) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789#$'
    const power = chars.length
    let id = ""
    for (let i = 0; i < segments; i++) {
        for (let j = 0; j < length; j++) {
            let char = chars.charAt(Math.floor(Math.random() * power))
            id += char
        }
        if (i < segments - 1) id += '-'
    }
    return id
}