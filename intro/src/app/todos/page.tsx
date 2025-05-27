import Link from 'next/link'
import { db } from '../../../prisma/db'

export default async function FetchPage() {
	const todos = await db.todo.findMany()

	console.log(todos)

	return (
		<div className='p-8 flex flex-col'>
			<h1 className='text-2xl font-bold mb-4'>Lista de tarefas</h1>
			<div className='flex flex-row gap-2'>
				<Link
					href='/todos/create'
					className='px-4 py-2 border border-zinc-200 rounded-lg'
				>
					Criar tarefa
				</Link>
			</div>
			<p className='my-4'>Lista de tarefas:</p>
			{todos.map((todo) => (
				<div
					key={todo.id}
					className='mb-2 border border-zinc-200 rounded-lg p-4'
				>
					<Link href={`/todos/${todo.id}`} className='font-bold'>
						{todo.titulo}
					</Link>
					<p>{todo.descricao}</p>
				</div>
			))}
		</div>
	)
}
