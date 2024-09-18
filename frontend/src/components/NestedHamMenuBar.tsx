import React from 'react'

import "../styles/components/nestedHamMenuBar.css"
import { RxCross2 } from "react-icons/rx";
const NestedHamMenuBar = () => {



    return (

        <div className='menu-options-container'>

            <ul>
               
                <li> Helllo <span className='iconContainer'> <RxCross2 className='icon' /></span></li>

            </ul>

        </div>

    )
}

export default NestedHamMenuBar