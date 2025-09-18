import '@testing-library/jest-dom'
import 'whatwg-fetch'

// Mock Next.js router
jest.mock('next/router', () => ({
  useRouter() {
    return {
      route: '/',
      pathname: '/',
      query: {},
      asPath: '/',
      push: jest.fn(),
      pop: jest.fn(),
      reload: jest.fn(),
      back: jest.fn(),
      prefetch: jest.fn().mockResolvedValue(undefined),
      beforePopState: jest.fn(),
      events: {
        on: jest.fn(),
        off: jest.fn(),
        emit: jest.fn(),
      },
      isFallback: false,
    }
  },
}))

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
    }
  },
  useSearchParams() {
    return new URLSearchParams()
  },
  usePathname() {
    return '/'
  },
}))

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: 'div',
    span: 'span',
    h1: 'h1',
    h2: 'h2',
    h3: 'h3',
    p: 'p',
    button: 'button',
    section: 'section',
    article: 'article',
    header: 'header',
    footer: 'footer',
    nav: 'nav',
    main: 'main',
    aside: 'aside',
    ul: 'ul',
    ol: 'ol',
    li: 'li',
    a: 'a',
    img: 'img',
    input: 'input',
    textarea: 'textarea',
    select: 'select',
    option: 'option',
    form: 'form',
    label: 'label',
    fieldset: 'fieldset',
    legend: 'legend',
    table: 'table',
    thead: 'thead',
    tbody: 'tbody',
    tr: 'tr',
    th: 'th',
    td: 'td',
    caption: 'caption',
    colgroup: 'colgroup',
    col: 'col',
    tfoot: 'tfoot',
    details: 'details',
    summary: 'summary',
    dialog: 'dialog',
    menu: 'menu',
    menuitem: 'menuitem',
    meter: 'meter',
    progress: 'progress',
    output: 'output',
    canvas: 'canvas',
    svg: 'svg',
    path: 'path',
    rect: 'rect',
    circle: 'circle',
    ellipse: 'ellipse',
    line: 'line',
    polyline: 'polyline',
    polygon: 'polygon',
    text: 'text',
    tspan: 'tspan',
    textPath: 'textPath',
    defs: 'defs',
    g: 'g',
    symbol: 'symbol',
    use: 'use',
    marker: 'marker',
    pattern: 'pattern',
    clipPath: 'clipPath',
    mask: 'mask',
    linearGradient: 'linearGradient',
    radialGradient: 'radialGradient',
    stop: 'stop',
    image: 'image',
    foreignObject: 'foreignObject',
    switch: 'switch',
    view: 'view',
    animate: 'animate',
    animateMotion: 'animateMotion',
    animateTransform: 'animateTransform',
    set: 'set',
    desc: 'desc',
    metadata: 'metadata',
    title: 'title',
  },
  AnimatePresence: ({ children }) => children,
  useAnimation: () => ({
    start: jest.fn(),
    stop: jest.fn(),
    set: jest.fn(),
  }),
  useInView: () => true,
  useMotionValue: (initial) => ({
    get: () => initial,
    set: jest.fn(),
    onChange: jest.fn(),
  }),
  useTransform: (value, inputRange, outputRange) => value,
  useSpring: (value) => value,
  useScroll: () => ({
    scrollX: { get: () => 0 },
    scrollY: { get: () => 0 },
  }),
  useViewportScroll: () => ({
    scrollX: { get: () => 0 },
    scrollY: { get: () => 0 },
  }),
}))

// Mock environment variables
process.env.NODE_ENV = 'test'
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test_db'

// Polyfill TextEncoder and TextDecoder for Node.js environment
const { TextEncoder, TextDecoder } = require('util')
global.TextEncoder = TextEncoder
global.TextDecoder = TextDecoder

// Mock fetch API
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    status: 200,
    json: () => Promise.resolve({
      dau_trend: [100, 120, 110, 130, 125, 140, 135],
      liked: false
    }),
    text: () => Promise.resolve(''),
  })
)

// Mock Response for Next.js
global.Response = class Response {
  constructor(body, init = {}) {
    this.body = body
    this.status = init.status || 200
    this.statusText = init.statusText || 'OK'
    this.headers = new Map(Object.entries(init.headers || {}))
    this.ok = this.status >= 200 && this.status < 300
  }
  
  json() {
    return Promise.resolve(JSON.parse(this.body))
  }
  
  text() {
    return Promise.resolve(this.body)
  }
  
  clone() {
    return new Response(this.body, {
      status: this.status,
      statusText: this.statusText,
      headers: Object.fromEntries(this.headers)
    })
  }
}

// Mock NextResponse
global.NextResponse = {
  json: (data, init = {}) => {
    const response = new Response(JSON.stringify(data), {
      status: init.status || 200,
      headers: {
        'Content-Type': 'application/json',
        ...init.headers
      }
    })
    // Add json method to the response
    response.json = () => Promise.resolve(data)
    return response
  }
}

// Mock FormData
global.FormData = class FormData {
  constructor() {
    this.data = new Map()
  }
  
  append(key, value) {
    this.data.set(key, value)
  }
  
  get(key) {
    return this.data.get(key)
  }
  
  has(key) {
    return this.data.has(key)
  }
  
  delete(key) {
    this.data.delete(key)
  }
  
  entries() {
    return this.data.entries()
  }
  
  keys() {
    return this.data.keys()
  }
  
  values() {
    return this.data.values()
  }
}

// Mock BroadcastChannel
global.BroadcastChannel = class BroadcastChannel {
  constructor(name) {
    this.name = name
    this.onmessage = null
    this.onmessageerror = null
  }
  
  postMessage(message) {
    // Mock implementation
  }
  
  close() {
    // Mock implementation
  }
}

// Mock TransformStream
global.TransformStream = class TransformStream {
  constructor() {
    this.readable = new ReadableStream()
    this.writable = new WritableStream()
  }
}

// Mock ReadableStream
global.ReadableStream = class ReadableStream {
  constructor() {
    this.locked = false
  }
  
  getReader() {
    return {
      read: () => Promise.resolve({ done: true, value: undefined }),
      releaseLock: () => {}
    }
  }
}

// Mock WritableStream
global.WritableStream = class WritableStream {
  constructor() {
    this.locked = false
  }
  
  getWriter() {
    return {
      write: () => Promise.resolve(),
      close: () => Promise.resolve(),
      releaseLock: () => {}
    }
  }
}

// Mock Highcharts
jest.mock('highcharts', () => ({
  chart: jest.fn(),
  setOptions: jest.fn(),
  getOptions: jest.fn(),
  format: jest.fn(),
  dateFormat: jest.fn(),
  numberFormat: jest.fn(),
  color: jest.fn(),
  CSS: {
    supports: jest.fn(() => true)
  }
}))

jest.mock('highcharts-react-official', () => {
  return function HighchartsReact() {
    return null
  }
})

// Global test utilities
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}))

// Mock IntersectionObserver
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}))

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})

// Suppress console warnings in tests
const originalError = console.error
beforeAll(() => {
  console.error = (...args) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Warning: ReactDOM.render is no longer supported')
    ) {
      return
    }
    originalError.call(console, ...args)
  }
})

afterAll(() => {
  console.error = originalError
})
