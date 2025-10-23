import React from 'react'

const Footer = () => {
    return (
        <div className='bg-[#f5ffe3] border-t-[2px] border-green-900'>

            <div className='lg:py-[3vw] px-[1rem] py-[1rem] lg:px-[6vw]  '>
                <div className='flex max-lg:flex-col justify-between'>
                    <div className='flex flex-col gap-[0.5rem] lg:gap-[0.4vw]'>
                        <p className='cormorant text-[1.4rem] font-semibold lg:text-[1.2vw]'>
                            TradeMo
                        </p>
                        <p className='content'>
                            About Us
                        </p>
                        <p className='content'>
                            Connect to Us : 8355995075
                        </p>
                    </div>
                    <div className='max-lg:mt-[0.6rem]'>
                        <p className='cormorant font-bold content'>
                            Email:
                            </p>
                        <input className='lg:px-[0.8vw] max-lg:w-[8rem] max-lg:py-[0.6rem] max-lg:placeholder:px-[0.4rem] max-lg:px-[0.4rem] max-lg:rounded-[1rem]  max-lg:text-[0.7rem] lg:py-[0.4vw] text-[0.9vw] placeholder:lg:px-[0.2vw] placeholder:lg:text-[0.8vw] outline-none lg:mt-[0.4vw] rounded-[2vw] bg-gray-200' placeholder='Your Email Address' />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Footer