import Link from 'next/link'
import React, { useState } from 'react'
import Button from './Button';

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
    const [Authenticated, isAuthenticated] = useState(false);
    return (
        <div className='w-[100%] z-[5] fixed top-0 flex items-center max-lg:py-[1rem] lg:h-[5vw] justify-between bg-green-900 px-[2rem] lg:px-[2rem]'>
            <p className='text-md cormorant lg:text-[1.4vw]  text-white'>
                TradeMo
            </p>

            {
                Authenticated ?
                    (<div className='flex lg:gap-[1vw]'>
                        {
                            urls?.map((item, index) => (

                                <Link href={item?.url || "/"} className='text-md  text-white'>
                                    {item?.title}
                                </Link>
                            ))
                        }
                    </div>) : (
                        <div>
                            <Button color={"white"} title='Login' />
                        </div>
                    )
            }
        </div>
    )
}

export default Header