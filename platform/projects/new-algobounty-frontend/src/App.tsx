import { useState } from 'react'
function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="max-w-5xl mx-auto p-8 text-center">
      <div>
        <a href="https://vite.dev" target="_blank" className="inline-block">
          <img
            src="/vite.svg"
            className="h-24 p-6 transition-[filter] duration-300 hover:[filter:drop-shadow(0_0_2em_#646cffaa)] will-change-[filter]"
            alt="Vite logo"
          />
        </a>
        <a href="https://react.dev" target="_blank" className="inline-block motion-safe:animate-spin" style={{ animationDuration: '20s' }}>
          <img
            src='/src/assets/react.svg'
            className="h-24 p-6 transition-[filter] duration-300 hover:[filter:drop-shadow(0_0_2em_#61dafbaa)] will-change-[filter]"
            alt="React logo"
          />
        </a>
      </div>
      <h1 className="text-4xl font-bold my-4">Vite + React</h1>
      <div className="p-8">
        <button
          onClick={() => setCount((count) => count + 1)}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          count is {count}
        </button>
        <p className="mt-4">
          Edit <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-sm">src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="text-gray-500 dark:text-gray-400">
        Click on the Vite and React logos to learn more
      </p>
    </div>
  )
}

export default App
