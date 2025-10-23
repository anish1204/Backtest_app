import Button from '@/components/Button';
import Link from 'next/link';
import React from 'react';

const index = () => {



  return (
    <>
    <div className="min-h-screen max-lg:px-[0.9rem] w-full bg-[#f5ffe3]">

      <div className='w-full flex-col gap-[1rem] lg:gap-[1vw] h-[100vh] flex justify-center items-center'>
        <h1 className='text-black cormorant text-[2rem]  lg:text-[4vw]'>
          TradeMo
        </h1>
        <p className='roboto text-center text-[0.8rem] lg:text-[0.93vw] lg:mb-[0.4vw]'>
          A full fledge place for investors and fund manangers to analyze, track and test their strategies.
        </p>
        <div>

          <Link href={"/companies"}>
            <Button color={"green"} title='Start Testing' />
          </Link>
        </div>
      </div>
    </div>
    
    </>

  )
}

export default index