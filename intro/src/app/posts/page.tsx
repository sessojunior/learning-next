import Link from 'next/link'

export default function PostsPage() {
	const posts = [
		{ id: 1, slug: 'post-1', title: 'Post 1' },
		{ id: 2, slug: 'post-2', title: 'Post 2' },
		{ id: 3, slug: 'post-3', title: 'Post 3' },
	]
	return (
		<div>
			<h1>Posts</h1>
			<ul>
				{posts.map((post) => (
					<li key={post.id}>
						<Link href={`/posts/${post.slug}`}>Ver post: {post.title}</Link>
					</li>
				))}
			</ul>
		</div>
	)
}
