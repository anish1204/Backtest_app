import Link from 'next/link'
import React from 'react'

const Header = () => {
    let urls = [
        {
            url: "/companies"
            , title: "Companies"
        }
        ,
        {
            url: "/strategies"
            , title: "Strategy"
        },
        {
            url: "/backtest"
            , title: "BackTest"
        }

    ]
    return (
        <div className='w-[100%] z-4 fixed top-0 flex items-center h-[5vw] justify-between bg-purple-800 px-[2rem] lg:px-[2rem]'>
            <p className='text-md  text-white'>
                BackTesteng
            </p>
            <div className='flex lg:gap-[1vw]'>
                {
                    urls?.map((item, index) => (

                        <Link href={item?.url || "/"}  className='text-md  text-white'>
                            {item?.title}
                        </Link>
                    ))
                }
            </div>
        </div>
    )
}

export default Header