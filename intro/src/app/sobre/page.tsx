'use client'

import { useRouter } from 'next/navigation'

export default function SobrePage() {
	const router = useRouter()

	return (
		<div>
			<h1>Sobre</h1>
			<button onClick={() => router.push('/posts')}>Posts</button>
			<button onClick={() => router.back()}>Voltar</button>
		</div>
	)
}
