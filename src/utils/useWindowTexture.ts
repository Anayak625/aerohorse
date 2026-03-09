import { useMemo } from 'react'
import * as THREE from 'three'

interface WindowTextureOptions {
    width?: number
    height?: number
    rows?: number
    cols?: number
    litProbability?: number
    windowColor?: string
    litColor?: string
    litColorVariation?: string
    wallColor?: string
}

export function useWindowTexture({
    width = 512,
    height = 512,
    rows = 20,
    cols = 10,
    litProbability = 0.3,
    windowColor = '#94a3b8', // slate-400 (base window)
    litColor = '#e2e8f0', // slate-200 (cloud reflection)
    litColorVariation = '#cbd5e1', // slate-300
    wallColor = '#f8fafc', // slate-50 (light wall)
}: WindowTextureOptions = {}) {
    const texture = useMemo(() => {
        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        if (!ctx) return null

        // Draw base wall
        ctx.fillStyle = wallColor
        ctx.fillRect(0, 0, width, height)

        // Calculate window sizes and spacing
        const paddingX = width * 0.05
        const paddingY = height * 0.05
        const usableWidth = width - paddingX * 2
        const usableHeight = height - paddingY * 2

        const cellWidth = usableWidth / cols
        const cellHeight = usableHeight / rows

        const windowWidth = cellWidth * 0.7
        const windowHeight = cellHeight * 0.8
        const spacingX = cellWidth * 0.3
        const spacingY = cellHeight * 0.2

        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                const x = paddingX + c * cellWidth + spacingX / 2
                const y = paddingY + r * cellHeight + spacingY / 2

                // Determine if window is lit
                const isLit = Math.random() < litProbability

                if (isLit) {
                    // Vary the lit color slightly for realism
                    ctx.fillStyle = Math.random() > 0.5 ? litColor : litColorVariation

                    // Add a subtle glow/bloom effect directly on canvas (optional, bloom pass usually handles this)
                    ctx.shadowColor = ctx.fillStyle
                    ctx.shadowBlur = 0
                } else {
                    ctx.fillStyle = windowColor
                    ctx.shadowBlur = 0
                }

                ctx.fillRect(x, y, windowWidth, windowHeight)
            }
        }

        const tex = new THREE.CanvasTexture(canvas)
        tex.wrapS = THREE.RepeatWrapping
        tex.wrapT = THREE.RepeatWrapping
        tex.anisotropy = 16
        return tex
    }, [width, height, rows, cols, litProbability, windowColor, litColor, litColorVariation, wallColor])

    return texture
}
