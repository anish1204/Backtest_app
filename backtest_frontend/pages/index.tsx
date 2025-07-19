import Button from '@/components/Button';
import Link from 'next/link';
import React from 'react';

const index = () => {



  return (
    <div className="min-h-screen w-full bg-white">

      <div className='w-full flex-col lg:gap-[1vw] h-[100vh] flex justify-center items-center'>
        <h1 className='text-black text-lg'>
          Welcome to Backtesting App
        </h1>
        <div>

          <Link href={"/companies"}>
            <Button title='Start Here' />
          </Link>
        </div>
      </div>
    </div>
  )
}

export default index