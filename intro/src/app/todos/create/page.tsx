import { redirect } from 'next/navigation'
import { db } from '../../../../prisma/db'

export default function TodosCreatePage() {
	async function addTodo(formData: FormData) {
		'use server'

		const titulo = formData.get('title') as string
		const descricao = formData.get('description') as string

		// Inserir no banco de dados
		await db.todo.create({
			data: {
				titulo,
				descricao,
				status: 'pendente',
			},
		})

		redirect('/todos/')
	}

	return (
		<div className='p-8 flex flex-col'>
			<h1 className='text-2xl font-bold mb-4'>Criar nova tarefa</h1>
			<form action={addTodo}>
				<div>
					<label htmlFor='title' className='block'>
						Titulo
					</label>
					<input
						type='text'
						name='title'
						id='title'
						required
						className='border rounded px-2 py-1 mt-1'
					/>
				</div>
				<div>
					<label htmlFor='description' className='block'>
						Descrição
					</label>
					<textarea
						name='description'
						id='description'
						className='border rounded px-2 py-1 mt-1'
					></textarea>
				</div>
				<button
					type='submit'
					className='bg-blue-500 text-white px-4 py-2 rounded mt-4'
				>
					Cadastrar
				</button>
			</form>
		</div>
	)
}
