type Params = Promise<{ slug: string }>

export default async function PostPage({ params }: { params: Params }) {
	const { slug } = await params
	return <h1>Post {slug}</h1>
}
