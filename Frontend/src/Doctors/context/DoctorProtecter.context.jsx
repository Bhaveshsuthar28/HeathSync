import { Navigate, useLocation } from "react-router-dom";

export const DoctorProtectedWrapper = ({children}) => {

    const token = localStorage.getItem('doctorToken')
    const location = useLocation();

    if(!token){
        return(
            <Navigate
                to="/doctor-auth"
                replace
                state={{from : location}}
            />
        )
    }

    return children
}