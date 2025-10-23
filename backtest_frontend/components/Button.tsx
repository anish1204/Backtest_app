import React from 'react'

interface ButtonProps {
  title: string;
  color: any;
}

const Button: React.FC<ButtonProps> = ({ title, color }) => {
  return (
    <div
      className={`${color === "white"
          ? "bg-white !text-green-900"
          : color === "yellow"
            ? "bg-yellow-400 !text-black"
            : "bg-green-800"
        } cursor-pointer shadow-md roboto rounded-lg hover:scale-105 content transition-all duration-100 text-white px-[1rem] lg:py-[0.8vw] py-[0.4rem]`}
    >
      {title}
    </div>
  )
}

export default Button