import React, { useState } from 'react'

import { MdGroups2 } from "react-icons/md";
import ".././styles/components/nestedMoreOptions.css"
import { useParams } from 'react-router-dom';
import { IoIosCopy } from "react-icons/io";
import { FaRegCopy } from "react-icons/fa";



const NestedMoreOptions = () => {

    const [isCopied, setCopied] = useState(false);

    const [joinLink, setJoinLink] = useState('');



    const copyToClipBoard = () => {

        setCopied(true);

        console.log(joinLink, 'joinLink');

        navigator.clipboard.writeText(`http://localhost:3000/room/v1/${roomId}`).then(() => {

            console.log("copied");

        }, (err: any) => {

            console.log(err, 'er');

        });



        setTimeout(() => {

            setCopied(false);

        }, 1000)

    }

    const { roomId } = useParams();

    return (

        <div className='nestedOptionsContainer'>

            <ul>

                <li className='list'><input type='text' value={`http://localhost:3000/room/v1/${roomId}`} onChange={(e) => setJoinLink(e.target.value)} /><span className="listIconContainer">{isCopied ? <FaRegCopy className='icon participiansIcon' onClick={(e) => copyToClipBoard()} /> : <IoIosCopy className='icon participiansIcon' onClick={(e) => copyToClipBoard()} />}</span></li>
                <li className='list'> participiants<span className="listIconContainer"><MdGroups2 className='icon participiansIcon' /></span></li>
                <li className='list'> participiants<span className="listIconContainer"><MdGroups2 className='icon participiansIcon' /></span></li>
                <li className='list'> participiants<span className="listIconContainer"><MdGroups2 className='icon participiansIcon' /></span></li>
                <li className='list'> participiants<span className="listIconContainer"><MdGroups2 className='icon participiansIcon' /></span></li>
                <li className='list'> participiants<span className="listIconContainer"><MdGroups2 className='icon participiansIcon' /></span></li>
                <li className='list'> participiants<span className="listIconContainer"><MdGroups2 className='icon participiansIcon' /></span></li>
                <li className='list'> participiants<span className="listIconContainer"><MdGroups2 className='icon participiansIcon' /></span></li>

            </ul>

        </div>

    )
}

export default NestedMoreOptions