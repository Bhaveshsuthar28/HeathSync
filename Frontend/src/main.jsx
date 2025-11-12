import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { UserProvider } from './Users/context/UserContext.context.jsx'
import { DoctorProvider } from './Doctors/context/DoctorContext.context.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <DoctorProvider>
      <UserProvider>
        <BrowserRouter>
          <App />
          <ToastContainer
            position="top-right"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
          />
        </BrowserRouter>
      </UserProvider>
    </DoctorProvider>
  </StrictMode>,
)
