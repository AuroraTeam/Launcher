import { SkinViewer2D } from './viewer'

class SkinObject2D {
  private skinview: SkinViewer2D

  constructor(skinview: SkinViewer2D) {
    this.skinview = skinview
  }

  drawHeadFront(ctx: CanvasRenderingContext2D, skinTexture: HTMLImageElement): void {
    const { width, height } = this.skinview.getCanvas()
    ctx.drawImage(skinTexture, (skinTexture.width / 8), (skinTexture.width / 8), (skinTexture.width / 8), (skinTexture.width / 8), 0, 0, (width / (skinTexture.width / 8)) * (skinTexture.width / 8), (height / (skinTexture.width / 8)) * (skinTexture.width / 8))
  }

  drawHeadBack(ctx: CanvasRenderingContext2D, skinTexture: HTMLImageElement): void {
    const { width, height } = this.skinview.getCanvas()
    ctx.drawImage(skinTexture, (width / 8 * 3), (skinTexture.width / 8), (skinTexture.width / 8), (skinTexture.width / 8), 4, 0, (width / (skinTexture.width / 8)) * (skinTexture.width / 8), (height / (skinTexture.width / 8)) * (skinTexture.width / 8))
  }
}

export { SkinObject2D }
