import { Navigate, useLocation } from "react-router-dom";

export const UserProtectedWrapper = ({children}) => {

    const token = localStorage.getItem('userToken')
    const location = useLocation();

    if(!token){
        return(
            <Navigate
                to="/user-auth"
                replace
                state={{from : location}}
            />
        )
    }

    return children
}