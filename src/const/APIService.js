import axios from "axios";
import {UserAPIs} from "./APIs";


export const UpdateUser = async (data) => {
    await axios.put(UserAPIs.update, data).then(res => {
        return res
    }).catch(err => {
        return err
    })
}