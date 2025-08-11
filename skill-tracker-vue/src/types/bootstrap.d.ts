declare module 'bootstrap' {
  export class Modal {
    constructor(element: string | Element, options?: Record<string, unknown>)
    show(): void
    hide(): void
    toggle(): void
    dispose(): void
    static getInstance(element: Element): Modal | null
    static getOrCreateInstance(element: Element, options?: Record<string, unknown>): Modal
  }
  
  export class Toast {
    constructor(element: string | Element, options?: Record<string, unknown>)
    show(): void
    hide(): void
    dispose(): void
    static getInstance(element: Element): Toast | null
    static getOrCreateInstance(element: Element, options?: Record<string, unknown>): Toast
  }
  
  export class Dropdown {
    constructor(element: string | Element, options?: Record<string, unknown>)
    show(): void
    hide(): void
    toggle(): void
    dispose(): void
    static getInstance(element: Element): Dropdown | null
    static getOrCreateInstance(element: Element, options?: Record<string, unknown>): Dropdown
  }
}