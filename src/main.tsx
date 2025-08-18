import '@/styles/main.scss'

import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router'
import router from '@/router/index.tsx'

createRoot(document.getElementById('root')!).render(
  <>
    <RouterProvider router={router} />
  </>
)
