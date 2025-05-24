'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Header() {
	const pathname = usePathname()

	return (
		<header className='p-8'>
			<p className='mb-4'>Pathname: {pathname}</p>
			<nav>
				<ul className='flex flex-row gap-2'>
					<li>
						<Link
							href='/'
							className='px-4 py-2 border border-zinc-200 rounded-lg'
						>
							Home {pathname === '/' ? ' (atual)' : ''}
						</Link>
					</li>
					<li>
						<Link
							href='/sobre'
							className='px-4 py-2 border border-zinc-200 rounded-lg'
						>
							Sobre {pathname === '/sobre' ? ' (atual)' : ''}
						</Link>
					</li>
					<li>
						<Link
							href='/posts'
							className='px-4 py-2 border border-zinc-200 rounded-lg'
						>
							Posts {pathname === '/posts' ? ' (atual)' : ''}
						</Link>
					</li>
					<li>
						<Link
							href='/delivery'
							className='px-4 py-2 border border-zinc-200 rounded-lg'
						>
							Delivery {pathname === '/delivery' ? ' (atual)' : ''}
						</Link>
					</li>
					<li>
						<Link
							href='/searchparams?parametro1=valordoslug1&parametro2=valordoslug2'
							className='px-4 py-2 border border-zinc-200 rounded-lg'
						>
							Página com searchparams
						</Link>
					</li>
					<li>
						<Link
							href='/fetch'
							className='px-4 py-2 border border-zinc-200 rounded-lg'
						>
							Fetch {pathname === '/fetch' ? ' (atual)' : ''}
						</Link>
					</li>
				</ul>
			</nav>
		</header>
	)
}
