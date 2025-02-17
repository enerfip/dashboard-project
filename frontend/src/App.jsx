import { Route, Routes } from 'react-router-dom'
import './App.css'
import AmountsCollected from './pages/AmountsCollected'
import ChartRepresentation from './pages/ChartRepresentation'


function App() {

  return (
    <>
      <Routes>
        <Route path='/' element={<AmountsCollected />} />
        <Route path='/chartRepresentation' element={<ChartRepresentation />} />
      </Routes>
    </>
  )
}

export default App
