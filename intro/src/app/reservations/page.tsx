'use client'

import React, { useState } from 'react'
import { Table } from './components/types'
import { TableGrid } from './components/TableGrid'
import { TableDetailsModal } from './components/TableDetailsModal'

const initialTables: Table[] = [
	{ id: 1, name: 'Mesa #1', seats: 4, status: 'available', orders: [] },
	{ id: 2, name: 'Mesa #2', seats: 2, status: 'reserved', customerName: 'João', orders: [] },
	{ id: 3, name: 'Mesa #3', seats: 6, status: 'on-dine', customerName: 'Maria', orders: [] },
	// ...mais mesas
]

export default function ManageTablesPage() {
	const [tables, setTables] = useState<Table[]>(initialTables)
	const [selectedTable, setSelectedTable] = useState<Table | null>(null)

	const handleSave = (updated: Table) => {
		setTables((prev) => prev.map((t) => (t.id === updated.id ? updated : t)))
	}

	return (
		<div className='p-8'>
			<h1 className='text-2xl font-bold mb-6'>Gerenciar Mesas</h1>
			<TableGrid tables={tables} onSelect={setSelectedTable} />
			<TableDetailsModal table={selectedTable} onClose={() => setSelectedTable(null)} onSave={handleSave} />
		</div>
	)
}
