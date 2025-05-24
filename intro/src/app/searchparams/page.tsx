type SearchParams = Promise<{ parametro1?: string; parametro2?: string }>

export default async function SearchParamsPage({ searchParams }: { searchParams: SearchParams }) {
	const { parametro1, parametro2 } = await searchParams

	return (
		<div>
			<h1>Página com parâmetro (SSR)</h1>
			<p>Parâmetro 1: {parametro1}</p>
			<p>Parâmetro 2: {parametro2}</p>
		</div>
	)
}
