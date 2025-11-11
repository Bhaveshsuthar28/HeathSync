import {Routes , Route} from 'react-router-dom'
import { Start } from './Users/Start.jsx'
import { UserAuth} from './Users/Pages/UsersAuth.page.jsx'

function App() {
return(
  <Routes>
    <Route path="/" element={<Start />} />
    <Route path='/user-auth' element={<UserAuth/>}/>
  </Routes>
)
}

export default App
