import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider} from "react-router-dom"

import App from './pages/App.tsx'
import Charts from './pages/Charts.tsx'
import Tutorial from './pages/Tutorial.tsx'
import Predictions from './pages/Predictions.tsx'

const router = createBrowserRouter([
  {
    path: "/" ,
    element: <App />
  }, 
  {
    path: "/charts" ,
    element: <Charts />
  }, 
  {
    path: "/tutorial" ,
    element: <Tutorial />
  },
  {
    path: "/predictions" ,
    element: <Predictions savedPredictions={[]} />
  },
]);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router = {router} />
  </StrictMode>,
)