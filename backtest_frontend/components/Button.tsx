import React from 'react'

interface ButtonProps{
    title:string
}

const Button:React.FC<ButtonProps> = ({title}) => {
  return (
    <div className='bg-green-500 rounded-lg hover:text-white px-[1rem] py-[1rem]'>
        {title}
    </div>
  )
}

export default Button