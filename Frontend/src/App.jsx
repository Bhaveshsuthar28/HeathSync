import {Routes , Route} from 'react-router-dom'
import { Start } from './Users/Start.jsx'
import { UserAuth} from './Users/Pages/UsersAuth.page.jsx'
import { UserHome } from './Users/Pages/UserHome.page.jsx'
import { UserProtectedWrapper } from './Users/context/UserProtecter.context.jsx'
import { DoctorAuth } from './Doctors/Pages/DoctorAuth.page.jsx'
import { DoctorProtectedWrapper } from './Doctors/context/DoctorProtecter.context.jsx'
import { DoctorHome } from './Doctors/Pages/DoctorHome.page.jsx'

function App() {
return(
  <Routes>
    <Route path="/" element={<Start />} />
    <Route path='/user-auth' element={<UserAuth/>}/>
    <Route path='/user-home' element={
      <UserProtectedWrapper>
        <UserHome/>
      </UserProtectedWrapper>
    }/>

    <Route path='/doctor-auth' element={<DoctorAuth/>}/>
    <Route path='/doctor-home' element={
      <DoctorProtectedWrapper>
        <DoctorHome/>
      </DoctorProtectedWrapper>
    }/>
  </Routes>
)
}

export default App
