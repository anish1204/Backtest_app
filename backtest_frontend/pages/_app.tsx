import Header from '@/components/Header';
import Footer from '@/components/Footer';
import '../styles/globals.css';
import type { AppProps } from "next/app";

// export default function Ap1p({ Component, pageProps }: AppProps) {
//     let urls = [
//     {
//       url: "/companies"
//       , title: "Companies"
//     }
//     ,
//     {
//       url: "/strategy"
//       , title: "Strategy"
//     }

//   ]
//   return
//   <>
    
     
    
//   </>
  
// }

import React from 'react'

const App = ({ Component, pageProps }: AppProps) => {
   let urls = [
    {
      url: "/companies"
      , title: "Companies"
    }
    ,
    {
      url: "/strategy"
      , title: "Strategy"
    }

  ]
  return (
    <div>
       <Header/>
      <Component {...pageProps} />
      <Footer/>
    </div>
  )
}

export default App
