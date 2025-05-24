import { useState } from 'react'
import { Table } from './types'

interface Props {
	table: Table | null
	onClose: () => void
	onSave: (table: Table) => void
}

export const TableDetailsModal: React.FC<Props> = ({ table, onClose, onSave }) => {
	if (!table) return null

	const [editable, setEditable] = useState(table)

	return (
		<div className='fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center'>
			<div className='bg-white p-6 rounded shadow-lg w-[400px]'>
				<h2 className='text-lg font-bold mb-4'>Editar Mesa {editable.name}</h2>

				<label className='block mb-2'>
					Nome do cliente:
					<input type='text' value={editable.customerName || ''} onChange={(e) => setEditable((prev) => ({ ...prev, customerName: e.target.value }))} className='border rounded w-full px-2 py-1 mt-1' />
				</label>

				<label className='block mb-2'>
					Status:
					<select value={editable.status} onChange={(e) => setEditable((prev) => ({ ...prev, status: e.target.value as any }))} className='border rounded w-full px-2 py-1 mt-1'>
						<option value='available'>Disponível</option>
						<option value='reserved'>Reservada</option>
						<option value='on-dine'>Em Uso</option>
					</select>
				</label>

				<label className='block mb-4'>
					Mesa unida com:
					<input
						type='number'
						value={editable.joinedWith || ''}
						onChange={(e) =>
							setEditable((prev) => ({
								...prev,
								joinedWith: Number(e.target.value) || undefined,
							}))
						}
						className='border rounded w-full px-2 py-1 mt-1'
					/>
				</label>

				<div className='flex justify-end gap-2'>
					<button onClick={onClose} className='px-3 py-1 border rounded'>
						Cancelar
					</button>
					<button
						onClick={() => {
							onSave(editable)
							onClose()
						}}
						className='px-3 py-1 bg-green-500 text-white rounded'
					>
						Salvar
					</button>
				</div>
			</div>
		</div>
	)
}
