/**
 * TrainComponent.js
 * Base visual component for all train sub-assemblies supporting spatial transforms,
 * visibility, dynamic animation time, damage/wear states, and lighting conditions.
 */

export class TrainComponent {
  /**
   * Initializes component identification, local transform, visibility, and state registers.
   */
  constructor(name = 'component') {
    this.name = name;
    this.position = { x: 0, y: 0 };
    this.rotation = 0;
    this.scale = { x: 1, y: 1 };
    this.visibility = true;
    this.animationTime = 0;
    this.damageState = 0; // 0.0 pristine, 1.0 heavily weathered / scuffed
    this.lightingState = {
      on: false,
      intensity: 1.0,
      color: '#ffffff',
    };
  }

  /**
   * Advances component internal animation timers and responds to operating conditions.
   */
  update(deltaTime, velocityMps, isUnderLoad = false) {
    if (!this.visibility) return;
    this.animationTime += deltaTime;
  }

  /**
   * Applies local translation, rotation, and scale transformations to the 2D canvas context.
   */
  applyTransform(ctx) {
    ctx.save();
    ctx.translate(this.position.x, this.position.y);
    if (this.rotation !== 0) {
      ctx.rotate(this.rotation);
    }
    if (this.scale.x !== 1 || this.scale.y !== 1) {
      ctx.scale(this.scale.x, this.scale.y);
    }
  }

  /**
   * Restores the 2D canvas context after rendering this component.
   */
  restoreTransform(ctx) {
    ctx.restore();
  }

  /**
   * Base render method to be overridden by specialized train visual sub-components.
   */
  render(ctx, options = {}) {
    // Overridden by subclasses
  }
}
