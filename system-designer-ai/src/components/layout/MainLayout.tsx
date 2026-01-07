import Header from './Header'
import Footer from './Footer'

interface MainLayoutProps {
  children: React.ReactNode
  isLoggedIn?: boolean
  userEmail?: string
  hideFooter?: boolean
}

export default function MainLayout({ children, isLoggedIn, userEmail, hideFooter }: MainLayoutProps) {
  return (
    <div className="flex flex-col min-h-screen">
      <Header isLoggedIn={isLoggedIn} userEmail={userEmail} />
      <main className="flex-grow">
        {children}
      </main>
      {hideFooter ? null : <Footer />}
    </div>
  )
}
