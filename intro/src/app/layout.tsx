import type { Metadata } from 'next'
import './globals.css'

import Header from '@/components/Header'
import Footer from '@/components/Footer'

export const metadata: Metadata = {
	title: 'Introdução ao Next.js',
	description: 'Projeto de introdução ao Next.js',
}

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode
}>) {
	return (
		<html lang='pt-br'>
			<body>
				<div className='flex flex-col min-h-screen justify-between'>
					<Header />
					{children}
					<Footer />
				</div>
			</body>
		</html>
	)
}
