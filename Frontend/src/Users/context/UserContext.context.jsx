import axios from "axios";
import { createContext, useEffect, useState } from "react"

export const UserContext = createContext();

export const UserProvider = ({children})=> {
    const [user , setUser] = useState(null);
    const [loading , setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem("userToken");

        if(!token){
            setLoading(false);
            return;
        }

        const fetchProfile = async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/users/profile` , {
                    headers : {
                        Authorization : `Bearer ${token}`
                    }
                });
                setUser(response.data?.data);
            } catch (error) {
                console.error("error : " , error);
                localStorage.removeItem("token");
            }finally{
                setLoading(false);
            }
        }

        fetchProfile();
    } , [])

    return(
        <UserContext.Provider value={{user , setUser , loading}}>
            {children}
        </UserContext.Provider>
    )
}