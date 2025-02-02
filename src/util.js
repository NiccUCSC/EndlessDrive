function getAngularDiff(angle1, angle2) {
    return Math.atan2(Math.sin(angle1 - angle2), Math.cos(angle1 - angle2))
}