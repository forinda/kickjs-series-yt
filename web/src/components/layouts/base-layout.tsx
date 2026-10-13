import { useAuth } from '@/context/auth-context'
import React from 'react'
import Footer from '../footer';
import PageHeader from '../page-header';


type Props = {
  children: React.ReactNode;
};
export default function BaseLayout({ children }: Props) {
    const auth = useAuth()
  return (
    <main className='w-full'>
    <PageHeader/>   
    
     <div className='mx-auto max-w-7xl'>

      {children}
     </div>
    <Footer/>
    </main>
  )
}
