/**
 * ObjectPool.js
 * High-performance generic object pool for reusing scenery and rendering descriptor instances.
 */

export class ObjectPool {
  /**
   * Initializes pool with factory function, reset function, and initial allocation capacity.
   */
  constructor(fn_factory, fn_reset = null, initialCapacity = 60) {
    this.fn_factory = fn_factory;
    this.fn_reset = fn_reset;
    this.arr_free = [];
    this.arr_active = [];

    // Pre-allocate initial instances
    for (let tmp_i = 0; tmp_i < initialCapacity; tmp_i++) {
      this.arr_free.push(this.fn_factory());
    }
  }

  /**
   * Acquires an idle object from free list or creates a new one if pool is depleted.
   */
  acquire() {
    let obj_item;
    if (this.arr_free.length > 0) {
      obj_item = this.arr_free.pop();
    } else {
      obj_item = this.fn_factory();
    }

    this.arr_active.push(obj_item);
    return obj_item;
  }

  /**
   * Releases an active object back to the idle pool.
   */
  release(obj_item) {
    const tmp_idx = this.arr_active.indexOf(obj_item);
    if (tmp_idx !== -1) {
      this.arr_active.splice(tmp_idx, 1);
      if (this.fn_reset) {
        this.fn_reset(obj_item);
      }
      this.arr_free.push(obj_item);
    }
  }

  /**
   * Releases all currently active objects back to the pool in a single pass.
   */
  releaseAll() {
    while (this.arr_active.length > 0) {
      const obj_item = this.arr_active.pop();
      if (this.fn_reset) {
        this.fn_reset(obj_item);
      }
      this.arr_free.push(obj_item);
    }
  }

  /**
   * Returns read-only reference to currently active instances array.
   */
  getActive() {
    return this.arr_active;
  }
}
