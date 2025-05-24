'use client'

import { useState, useMemo, useCallback, ChangeEvent } from 'react'

/** Tipagens das entidades principais **/

// Tamanho da pizza
interface PizzaSize {
	id: 'P' | 'M' | 'G' | 'GG'
	name: string
	description: string
	size: string
	maxQtyFlavors: number
	available: boolean
}

// Sabor de pizza
interface PizzaFlavor {
	id: string
	name: string
	ingredients: string[] // IDs dos ingredientes padrões
	prices: Record<PizzaSize['id'], number>
	available: boolean
}

// Tipo de borda
interface PizzaCrustType {
	id: string
	name: string
	price: number
	available: boolean
}

// Tipo de massa
interface PizzaDoughType {
	id: string
	name: string
	price: number
	available: boolean
}

// Ingrediente genérico (usado para remover/adicionar)
interface PizzaIngredient {
	id: string
	name: string
}

// Ingrediente extra (que é cobrado)
interface PizzaExtraIngredient {
	id: string
	name: string
	price: number
	available: boolean
}

// Bebida
interface Drink {
	id: string
	name: string
	price: number
	stock: number
}

// Flavor selecionado (já com preço e ingredientes ajustados para aquele sabor)
interface SelectedFlavor {
	id: string
	name: string
	price: number // preço deste flavor de acordo com o tamanho
	ingredients: string[] // IDs dos ingredientes atualmente selecionados
	extraIngredients: Array<{ id: string; price: number }> // extras adicionados a este flavor
}

// Item de carrinho (pode ser pizza ou produto genérico)
type CartItem =
	| {
			id: number
			qty: number
			type: 'pizza'
			price: number
			data: {
				size: PizzaSize
				qtyFlavors: number
				flavors: SelectedFlavor[]
				crust: PizzaCrustType
				dough: PizzaDoughType
				observations: string
			}
	  }
	| {
			id: number
			qty: number
			type: 'product'
			price: number
			data: {
				id: Drink['id']
				name: string
			}
	  }

// Dados do cliente
interface CustomerInfo {
	name: string
	address: string
	phone: string
	email: string
}

// Pedido final
interface Order {
	customer: CustomerInfo
	cart: CartItem[]
	total: number
}

/** DADOS ESTÁTICOS (poderiam vir de uma chamada à API) **/

const pizzaSizes: PizzaSize[] = [
	{ id: 'P', name: 'Pequena', description: '4 fatias', size: '35 cm', maxQtyFlavors: 1, available: true },
	{ id: 'M', name: 'Média', description: '4 fatias', size: '30 cm', maxQtyFlavors: 2, available: true },
	{ id: 'G', name: 'Grande', description: '8 fatias', size: '35 cm', maxQtyFlavors: 3, available: true },
	{ id: 'GG', name: 'Gigante', description: '8 fatias', size: '40 cm', maxQtyFlavors: 4, available: false },
]

const pizzaFlavors: PizzaFlavor[] = [
	{
		id: 'MARGUERITA',
		name: 'Marguerita',
		ingredients: ['TOMATE', 'MUSSARELA', 'MANJERICAO'],
		prices: { P: 24, M: 31, G: 45, GG: 69 },
		available: true,
	},
	{
		id: 'PEPERONI',
		name: 'Pepperoni',
		ingredients: ['PEPPERONI', 'MUSSARELA'],
		prices: { P: 25, M: 32, G: 46, GG: 70 },
		available: true,
	},
	{
		id: 'FRANGO_CATUPIRY',
		name: 'Frango com Catupiry',
		ingredients: ['FRANGO', 'CATUPIRY', 'CEBOLA', 'TOMATE'],
		prices: { P: 26, M: 33, G: 47, GG: 71 },
		available: true,
	},
]

const pizzaCrustTypes: PizzaCrustType[] = [
	{ id: 'NORMAL', name: 'Normal', price: 0, available: true },
	{ id: 'CHEDDAR', name: 'Com Cheddar', price: 5, available: true },
	{ id: 'CATUPIRY', name: 'Com Catupiry', price: 5, available: true },
]

const pizzaDoughTypes: PizzaDoughType[] = [
	{ id: 'TRADICIONAL', name: 'Tradicional', price: 0, available: true },
	{ id: 'SEM_LACTOSE', name: 'Sem lactose', price: 5, available: true },
]

const pizzaIngredients: PizzaIngredient[] = [
	{ id: 'TOMATE', name: 'Tomate' },
	{ id: 'MUSSARELA', name: 'Mussarela' },
	{ id: 'CEBOLA', name: 'Cebola' },
	{ id: 'MANJERICAO', name: 'Manjericão' },
	{ id: 'PEPPERONI', name: 'Pepperoni' },
	{ id: 'CATUPIRY', name: 'Catupiry' },
	{ id: 'FRANGO', name: 'Frango' },
]

const pizzaExtraIngredients: PizzaExtraIngredient[] = [
	{ id: 'AZEITONA', name: 'Azeitona', price: 3, available: true },
	{ id: 'MILHO', name: 'Milho', price: 3, available: false },
	{ id: 'BACON', name: 'Bacon', price: 5, available: true },
]

const drinks: Drink[] = [
	{ id: 'SODA_LIMONADA', name: 'Soda Limonada', price: 6, stock: 5 },
	{ id: 'COCACOLA', name: 'Coca Cola', price: 7, stock: 4 },
	{ id: 'GUARANA', name: 'Guaraná', price: 5, stock: 8 },
	{ id: 'AGUA', name: 'Água', price: 2, stock: 9 },
]

/**
 * Componente principal da página de delivery.
 */
export default function DeliveryPage() {
	/** ===========================
	 *   STATES PRINCIPAIS
	 *  ===========================
	 */

	// Tamanho da pizza selecionado (inicial = Média)
	const [selectedSize, setSelectedSize] = useState<PizzaSize>(pizzaSizes[1])

	// Borda selecionada (inicial = Normal)
	const [selectedCrust, setSelectedCrust] = useState<PizzaCrustType>(pizzaCrustTypes[0])

	// Massa selecionada (inicial = Tradicional)
	const [selectedDough, setSelectedDough] = useState<PizzaDoughType>(pizzaDoughTypes[0])

	// Quantidade de sabores que o usuário quer (inicial = 1)
	const [selectFlavorQty, setSelectFlavorQty] = useState<number>(1)

	// Lista de sabores selecionados (tamanho dinâmico de acordo com selectFlavorQty)
	const [selectedFlavors, setSelectedFlavors] = useState<Array<SelectedFlavor | undefined>>([])

	// Observações livres sobre a pizza
	const [observations, setObservations] = useState<string>('')

	// Estado do carrinho (pode conter pizzas e/ou outros produtos)
	const [cart, setCart] = useState<CartItem[]>([])

	// Dados do cliente para finalizar o pedido
	const [customer, setCustomer] = useState<CustomerInfo>({
		name: '',
		address: '',
		phone: '',
		email: '',
	})

	// Forma de pagamento selecionada
	const [paymentMethod, setPaymentMethod] = useState<'cartao' | 'dinheiro'>('cartao')

	// Pedido final (será preenchido ao clicar em "Finalizar pedido")
	const [order, setOrder] = useState<Order | null>(null)

	/** ===========================
	 *   MANIPULADORES DE ESTADO
	 *  ===========================
	 */

	// Quando o usuário troca o tamanho da pizza:
	const handleSize = useCallback((size: PizzaSize) => {
		setSelectedSize(size)

		// Ao mudar o tamanho, resetamos a quantidade de sabores para 1 e limpamos sabores prévios
		setSelectFlavorQty(1)
		setSelectedFlavors([])
	}, [])

	// Trocar borda da pizza
	const handleCrust = useCallback((crust: PizzaCrustType) => {
		setSelectedCrust(crust)
	}, [])

	// Trocar massa da pizza
	const handleDough = useCallback((dough: PizzaDoughType) => {
		setSelectedDough(dough)
	}, [])

	// Trocar a quantidade de sabores (por select)
	const handleFlavorQty = useCallback((flavorQty: number) => {
		setSelectFlavorQty(flavorQty)

		// Se diminuir a quantidade, removemos sabores extras do array
		setSelectedFlavors((prev) => prev.slice(0, flavorQty))
	}, [])

	// Quando o usuário escolhe um flavor no select
	const handleFlavor = useCallback(
		(index: number, flavorId: string) => {
			// Se limpou a seleção (escolheu opção em branco)
			if (flavorId === '') {
				setSelectedFlavors((prev) => {
					const newFlavors = [...prev]
					newFlavors[index] = undefined
					return newFlavors
				})
				return
			}

			// Encontra o flavor pelo ID
			const flavorMeta = pizzaFlavors.find((f) => f.id === flavorId)
			if (!flavorMeta) return

			// Monta o objeto SelectedFlavor, já com preço adequado (de acordo com selectedSize)
			const newFlavor: SelectedFlavor = {
				id: flavorMeta.id,
				name: flavorMeta.name,
				price: flavorMeta.prices[selectedSize.id],
				ingredients: [...flavorMeta.ingredients],
				extraIngredients: [],
			}

			setSelectedFlavors((prev) => {
				const newFlavors = [...prev]
				newFlavors[index] = newFlavor
				return newFlavors
			})
		},
		[selectedSize],
	)

	// Adicionar/remover ingrediente de um flavor
	const handleFlavorIngredient = useCallback((flavorIndex: number, ingredientId: string) => {
		setSelectedFlavors((prev) => {
			const flavor = prev[flavorIndex]
			if (!flavor) return prev // se não houver flavor selecionado ainda, não faz nada

			// Se o ingrediente já existe: tenta remover
			const hasIngredient = flavor.ingredients.includes(ingredientId)

			let updatedIngredients: string[]
			if (hasIngredient) {
				// Se for remover o último ingrediente, bloqueia (pelo menos 1 ingrediente deve existir)
				if (flavor.ingredients.length <= 1) {
					alert('A pizza deve ter pelo menos um ingrediente.')
					return prev
				}
				updatedIngredients = flavor.ingredients.filter((ing) => ing !== ingredientId)
			} else {
				// Adiciona ingrediente
				updatedIngredients = [...flavor.ingredients, ingredientId]
			}

			const newFlavors = [...prev]
			newFlavors[flavorIndex] = {
				...flavor,
				ingredients: updatedIngredients,
			}
			return newFlavors
		})
	}, [])

	// Adicionar/remover ingrediente extra de um flavor
	// O preço do extra é dividido pela quantidade de sabores (selectFlavorQty)
	const handleFlavorExtra = useCallback(
		(flavorIndex: number, extraId: string) => {
			setSelectedFlavors((prev) => {
				const flavor = prev[flavorIndex]
				if (!flavor) return prev

				const newFlavors = [...prev]
				const existingExtra = flavor.extraIngredients.find((e) => e.id === extraId)
				const extraMeta = pizzaExtraIngredients.find((e) => e.id === extraId)
				if (!extraMeta) return prev

				if (existingExtra) {
					// Remove se já estiver selecionado
					newFlavors[flavorIndex] = {
						...flavor,
						extraIngredients: flavor.extraIngredients.filter((e) => e.id !== extraId),
					}
				} else {
					// Adiciona o extra, dividindo preço pelo número de sabores
					const pricePortion = extraMeta.price > 0 ? extraMeta.price / selectFlavorQty : 0
					newFlavors[flavorIndex] = {
						...flavor,
						extraIngredients: [...flavor.extraIngredients, { id: extraMeta.id, price: pricePortion }],
					}
				}

				return newFlavors
			})
		},
		[selectFlavorQty],
	)

	// Observações da pizza
	const handleObservations = useCallback((obs: string) => {
		setObservations(obs)
	}, [])

	// Atualiza campos do cliente
	const handleCustomerChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target
		setCustomer((prev) => ({ ...prev, [name]: value }))
	}, [])

	// Seleciona forma de pagamento
	const handlePaymentChange = useCallback((e: ChangeEvent<HTMLSelectElement>) => {
		const val = e.target.value as 'cartao' | 'dinheiro'
		setPaymentMethod(val)
	}, [])

	/** ===========================
	 *   CÁLCULOS COM MEMOIZAÇÃO
	 *  ===========================
	 */

	// Calcula o preço total de uma pizza, dado seus sabores, borda e massa
	const calculatePizzaPrice = useCallback((flavors: SelectedFlavor[], crust: PizzaCrustType, dough: PizzaDoughType): number => {
		// Preço base: massa + borda
		let price = crust.price + dough.price

		if (flavors.length === 0) return price

		// Encontra o sabor mais caro (preço unitário)
		const maxFlavorPrice = Math.max(...flavors.map((fl) => fl.price))
		price += maxFlavorPrice

		// Soma todos os extras
		flavors.forEach((fl) => {
			fl.extraIngredients.forEach((ex) => {
				price += ex.price
			})
		})

		return price
	}, [])

	// Cálculo do total do carrinho
	const totalCartPrice = useMemo(() => {
		return cart.reduce((acc, item) => acc + item.price * item.qty, 0)
	}, [cart])

	// Reseta seleções de pizza
	const handleResetSelections = useCallback(() => {
		setSelectedSize(pizzaSizes[1])
		setSelectedCrust(pizzaCrustTypes[0])
		setSelectedDough(pizzaDoughTypes[0])
		setSelectFlavorQty(1)
		setSelectedFlavors([])
		setObservations('')
	}, [])

	/** ===========================
	 *   MANIPULAÇÃO DO CARRINHO
	 *  ===========================
	 */

	// Adiciona pizza ou produto no carrinho
	const handleAddCart = useCallback(
		(args: { product?: Drink; type: 'pizza' | 'product' }) => {
			if (args.type === 'pizza') {
				// Verifica se selecionou todos os sabores antes de adicionar
				if (selectedFlavors.length < selectFlavorQty || selectedFlavors.some((fl) => !fl)) {
					alert('Você deve selecionar todos os sabores antes de adicionar a pizza.')
					return
				}

				// Gera preço da pizza atual
				const pizzaPrice = calculatePizzaPrice(selectedFlavors as SelectedFlavor[], selectedCrust, selectedDough)

				// Monta o objeto pizza
				const pizzaData = {
					size: selectedSize,
					qtyFlavors: selectFlavorQty,
					flavors: selectedFlavors as SelectedFlavor[],
					crust: selectedCrust,
					dough: selectedDough,
					observations: observations,
				}

				// Adiciona ao carrinho
				setCart((prev) => [
					...prev,
					{
						id: Math.floor(Math.random() * 10 ** 8),
						qty: 1,
						price: pizzaPrice,
						type: 'pizza',
						data: pizzaData,
					},
				])

				// Reseta seleções para nova pizza
				handleResetSelections()
			} else {
				// Produto genérico (bebida, etc.)
				const product = args.product!
				setCart((prev) => {
					// Se já existe no carrinho, apenas incrementa qty
					const exists = prev.find((item) => item.type === 'product' && item.data.id === product.id)
					if (exists) {
						return prev.map((item) => (item.id === exists.id ? { ...item, qty: item.qty + 1 } : item))
					}
					// Caso contrário, adiciona novo
					return [
						...prev,
						{
							id: Math.floor(Math.random() * 10 ** 8),
							qty: 1,
							price: product.price,
							type: 'product',
							data: { id: product.id, name: product.name },
						},
					]
				})
			}
		},
		[selectedFlavors, selectFlavorQty, selectedCrust, selectedDough, selectedSize, observations, calculatePizzaPrice, handleResetSelections],
	)

	// Remove item do carrinho (pelo ID do item)
	const handleRemoveCart = useCallback((itemId: number) => {
		setCart((prev) => prev.filter((item) => item.id !== itemId))
	}, [])

	// Aumenta quantidade de um item do carrinho
	const handleIncreaseQty = useCallback((itemId: number) => {
		setCart((prev) => prev.map((item) => (item.id === itemId ? { ...item, qty: item.qty + 1 } : item)))
	}, [])

	// Diminui quantidade de um item do carrinho (mínimo 1)
	const handleDecreaseQty = useCallback((itemId: number) => {
		setCart((prev) => prev.map((item) => (item.id === itemId ? { ...item, qty: Math.max(item.qty - 1, 1) } : item)))
	}, [])

	/** ===========================
	 *   FINALIZAR PEDIDO
	 *  ===========================
	 */

	const handleCheckout = useCallback(() => {
		// Valida carrinho não vazio
		if (cart.length === 0) {
			alert('Adicione itens ao carrinho antes de finalizar o pedido.')
			return
		}
		// Valida campos do cliente
		if (!customer.name || !customer.address || !customer.phone || !customer.email) {
			alert('Preencha todos os dados do cliente antes de finalizar o pedido.')
			return
		}

		const orderDetails: Order = {
			customer,
			cart,
			total: totalCartPrice,
		}
		setOrder(orderDetails)

		console.log('Order final:', orderDetails)
		alert('Seu pedido foi realizado com sucesso! Verifique o console para detalhes.')
	}, [cart, customer, totalCartPrice])

	/** ===========================
	 *   JSX: RENDERIZAÇÃO DA PÁGINA
	 *  ===========================
	 */

	return (
		<>
			<h1 className='text-4xl font-bold text-center mt-8 mb-4'>Pizzaria</h1>

			<div className='flex flex-col sm:flex-row gap-8 justify-between p-8'>
				{/* ====== COLUNA ESQUERDA: MONTAGEM DA PIZZA E BEBIDAS ====== */}
				<div className='flex flex-col w-full sm:w-1/3'>
					{/* === Montar Pizza === */}
					<div>
						<h2 className='text-2xl font-bold mb-4'>Monte sua pizza</h2>

						{/* --- 1) Seleção de Tamanho --- */}
						<h3 className='text-xl font-semibold mb-4'>Escolha o tamanho da pizza</h3>
						{pizzaSizes
							.filter((size) => size.available)
							.map((size) => (
								<div key={size.id} className='mb-2'>
									<input type='radio' id={size.id} name='pizza-size' checked={selectedSize.id === size.id} onChange={() => handleSize(size)} className='mr-2' />
									<label htmlFor={size.id} className='text-md'>
										{size.name} – {size.description} – {size.size}
									</label>
								</div>
							))}

						{/* Se um tamanho está selecionado (sempre haverá) */}
						{selectedSize && (
							<>
								{/* --- 2) Seleção de Borda --- */}
								<h3 className='text-xl font-semibold mt-6 mb-4'>Escolha a borda da pizza</h3>
								{pizzaCrustTypes
									.filter((crust) => crust.available)
									.map((crust) => (
										<div key={crust.id} className='mb-2'>
											<input type='radio' id={crust.id} name='pizza-crust' checked={selectedCrust.id === crust.id} onChange={() => handleCrust(crust)} className='mr-2' />
											<label htmlFor={crust.id} className='text-md'>
												{crust.name} {crust.price > 0 && `(+R$ ${crust.price.toFixed(2)})`}
											</label>
										</div>
									))}

								{/* --- 3) Seleção de Massa --- */}
								<h3 className='text-xl font-semibold mt-6 mb-4'>Escolha a massa da pizza</h3>
								{pizzaDoughTypes
									.filter((dough) => dough.available)
									.map((dough) => (
										<div key={dough.id} className='mb-2'>
											<input type='radio' id={dough.id} name='pizza-dough' checked={selectedDough.id === dough.id} onChange={() => handleDough(dough)} className='mr-2' />
											<label htmlFor={dough.id} className='text-md'>
												{dough.name} {dough.price > 0 && `(+R$ ${dough.price.toFixed(2)})`}
											</label>
										</div>
									))}

								{/* --- 4) Quantidade de Sabores --- */}
								<h3 className='text-xl font-semibold mt-6 mb-4'>Escolha a quantidade de sabores</h3>
								<select onChange={(e) => handleFlavorQty(Number(e.target.value))} value={selectFlavorQty} className='w-full border border-gray-300 p-2 rounded'>
									{Array.from({ length: selectedSize.maxQtyFlavors }, (_, i) => i + 1).map((qty) => (
										<option key={qty} value={qty}>
											{qty} sabor{qty > 1 ? 'es' : ''}
										</option>
									))}
								</select>

								{/* --- 5) Seleção de cada flavor (e seus ingredientes/extras) --- */}
								{Array.from({ length: selectFlavorQty }, (_, index) => (
									<div key={index}>
										<h3 className='text-xl font-semibold mt-6 mb-4'>Escolha o {index + 1}º sabor</h3>
										<select onChange={(e) => handleFlavor(index, e.target.value)} value={selectedFlavors[index]?.id || ''} className='w-full border border-gray-300 p-2 rounded'>
											<option value=''>Selecione um sabor</option>
											{pizzaFlavors
												.filter((fl) => fl.available)
												.map((fl) => (
													<option key={fl.id} value={fl.id}>
														{fl.name} – R$ {fl.prices[selectedSize.id].toFixed(2)}
													</option>
												))}
										</select>

										{selectedFlavors[index] && (
											<>
												{/* Ingredientes do flavor */}
												<h4 className='text-md font-semibold mt-6 mb-4'>
													Ingredientes do {index + 1}º sabor: <span className='font-normal'>{selectedFlavors[index]?.name}</span>
												</h4>
												<ul>
													{pizzaFlavors.map((origFlavor) =>
														origFlavor.id === selectedFlavors[index]?.id
															? origFlavor.ingredients.map((ingredientId) => (
																	<div key={ingredientId} className='mb-2'>
																		<input type='checkbox' checked={selectedFlavors[index]?.ingredients.includes(ingredientId)} onChange={() => handleFlavorIngredient(index, ingredientId)} className='mr-1' />
																		<label className='text-md'>{pizzaIngredients.find((i) => i.id === ingredientId)?.name}</label>
																	</div>
															  ))
															: null,
													)}
												</ul>

												{/* Ingredientes extras */}
												<h4 className='text-md font-semibold mt-6 mb-4'>Ingredientes extras:</h4>
												<ul>
													{pizzaExtraIngredients.map((extra) => (
														<div key={extra.id} className='mb-2'>
															<input type='checkbox' checked={!!selectedFlavors[index]?.extraIngredients.find((i) => i.id === extra.id)} onChange={() => handleFlavorExtra(index, extra.id)} disabled={!extra.available} className='mr-1' />
															<label className='text-md'>
																{extra.name} {extra.price > 0 && <span className='text-red-500'>(+R$ {(extra.price / selectFlavorQty).toFixed(2)})</span>}
																{!extra.available && <span className='text-gray-400'> (indisponível)</span>}
															</label>
														</div>
													))}
												</ul>
											</>
										)}
									</div>
								))}

								{/* --- 6) Observações da pizza --- */}
								<h3 className='text-xl font-semibold mt-6 mb-4'>Observações sobre a pizza:</h3>
								<textarea value={observations} onChange={(e) => handleObservations(e.target.value)} placeholder='Observações adicionais' className='w-full border rounded-md p-2' rows={3} />

								{/* --- 7) Botão Adicionar Pizza ao Carrinho --- */}
								<button onClick={() => handleAddCart({ type: 'pizza' })} className='mt-6 p-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition'>
									Adicionar pizza ao carrinho
								</button>
							</>
						)}
					</div>

					{/* === Bebidas === */}
					<div className='pt-8'>
						<h2 className='text-2xl font-bold mb-4'>Bebidas</h2>

						<h3 className='text-xl font-semibold mt-6 mb-4'>Escolha uma bebida</h3>
						{drinks.map((drink) => (
							<div key={drink.id} className='mb-2 flex items-center justify-between'>
								<div>
									{drink.name} – R$ {drink.price.toFixed(2)} {drink.stock <= 0 && <span className='text-gray-400'>(Esgotado)</span>}
								</div>
								<button onClick={() => handleAddCart({ product: drink, type: 'product' })} disabled={drink.stock <= 0} className={`p-2 text-white rounded ${drink.stock > 0 ? 'bg-blue-500 hover:bg-blue-600' : 'bg-gray-300 cursor-not-allowed'} transition`}>
									Adicionar ao carrinho
								</button>
							</div>
						))}
					</div>
				</div>

				{/* ====== COLUNA MEIO: CARRINHO DE COMPRAS ====== */}
				<div className='w-full sm:w-1/3'>
					<h2 className='text-2xl font-bold mb-4'>Carrinho de compras</h2>

					{cart.length > 0 ? (
						<div>
							<h3 className='text-xl font-semibold mt-6 mb-4'>Pizzas:</h3>
							{cart.filter((it) => it.type === 'pizza').length === 0 ? (
								<p>Nenhuma pizza no carrinho</p>
							) : (
								cart
									.filter((it) => it.type === 'pizza')
									.map((item) => (
										<div key={item.id} className='mb-6 border-b pb-4'>
											{/* Dados gerais da pizza */}
											<h4 className='text-md font-medium'>
												Pizza {item.data.size.name} – {item.data.size.description}
											</h4>
											<button onClick={() => handleRemoveCart(item.id)} className='mt-2 mb-2 bg-red-500 text-white rounded px-2 hover:bg-red-600 transition'>
												Remover
											</button>

											{/* Massa e Borda */}
											<p>
												Massa: {item.data.dough.name} {item.data.dough.price > 0 && <span className='text-red-500'>(+R$ {item.data.dough.price.toFixed(2)})</span>}
											</p>
											<p>
												Borda: {item.data.crust.name} {item.data.crust.price > 0 && <span className='text-red-500'>(+R$ {item.data.crust.price.toFixed(2)})</span>}
											</p>

											{/* Lista de sabores */}
											<p>Sabores: ({item.data.qtyFlavors})</p>
											<ul className='ml-4 mb-2'>
												{item.data.flavors.map((flavor, idx) => {
													// Obtém ingredientes originais e calcula removidos
													const origem = pizzaFlavors.find((pf) => pf.name === flavor.name)
													const originalIngredients = origem ? [...origem.ingredients] : []
													const removedIngredients = originalIngredients
														.filter((ing) => !flavor.ingredients.includes(ing))
														.map((ing) => pizzaIngredients.find((pi) => pi.id === ing)?.name)
														.filter(Boolean)
														.join(', ')

													return (
														<li key={idx} className='mb-2'>
															<p className='font-medium'>
																{flavor.name} (R$ {flavor.price.toFixed(2)})
															</p>
															<p className='text-xs'>Ingredientes originais: {originalIngredients.map((ing) => pizzaIngredients.find((pi) => pi.id === ing)?.name).join(', ')}</p>
															{removedIngredients && <p className='text-xs'>Retirar: {removedIngredients}</p>}
															{flavor.extraIngredients.length > 0 && (
																<p className='text-xs'>
																	Extras:{' '}
																	{flavor.extraIngredients
																		.map((ex) => {
																			const found = pizzaExtraIngredients.find((pe) => pe.id === ex.id)
																			return found ? `${found.name} (R$ ${ex.price.toFixed(2)})` : ''
																		})
																		.join(', ')}
																</p>
															)}
														</li>
													)
												})}
											</ul>

											{/* Preço da pizza e observações */}
											<p>
												Preço da pizza:{' '}
												<span className='font-medium text-red-500'>
													R$ {item.price.toFixed(2)}
													{item.data.qtyFlavors > 1 && '*'}
												</span>
											</p>
											{item.data.observations && <p>Observação: {item.data.observations}</p>}
											{item.data.qtyFlavors > 1 && <p className='text-xs text-red-500'>* Quando há mais de um sabor, o valor base é do sabor mais caro. Os extras são divididos igualmente pelos sabores.</p>}
										</div>
									))
							)}

							<h3 className='text-xl font-semibold mt-6 mb-4'>Demais produtos:</h3>
							{cart
								.filter((it) => it.type === 'product')
								.map((item) => (
									<div key={item.id} className='mb-4 border-b pb-4'>
										<h4 className='text-md font-medium'>{item.data.name}</h4>
										<p className='flex items-center gap-2'>
											Quantidade:
											<button onClick={() => handleDecreaseQty(item.id)} className='bg-blue-500 text-white rounded px-2 hover:bg-blue-600 transition'>
												−
											</button>
											<span>{item.qty}</span>
											<button onClick={() => handleIncreaseQty(item.id)} className='bg-blue-500 text-white rounded px-2 hover:bg-blue-600 transition'>
												+
											</button>
											<button onClick={() => handleRemoveCart(item.id)} className='bg-red-500 text-white rounded px-2 hover:bg-red-600 transition'>
												Remover
											</button>
										</p>
										<p>Preço unitário: R$ {item.data.name ? item.price.toFixed(2) : '0,00'}</p>
									</div>
								))}

							<h3 className='text-xl font-semibold mt-6 mb-4'>Total a pagar: R$ {totalCartPrice.toFixed(2)}</h3>
						</div>
					) : (
						<p>O carrinho de compras está vazio.</p>
					)}
				</div>

				{/* ====== COLUNA DIREITA: INFORMAÇÕES DO CLIENTE E FINALIZAR ====== */}
				<div className='w-full sm:w-1/3'>
					<h2 className='text-2xl font-bold mb-4'>Informações do pedido</h2>

					{/* Nome do cliente */}
					<label className='block mb-4'>
						Nome:
						<input type='text' name='name' value={customer.name} onChange={handleCustomerChange} className='w-full border border-gray-300 p-2 rounded mt-1' />
					</label>

					{/* Endereço do cliente */}
					<label className='block mb-4'>
						Endereço:
						<input type='text' name='address' value={customer.address} onChange={handleCustomerChange} className='w-full border border-gray-300 p-2 rounded mt-1' />
					</label>

					{/* Telefone do cliente */}
					<label className='block mb-4'>
						Telefone:
						<input type='text' name='phone' value={customer.phone} onChange={handleCustomerChange} className='w-full border border-gray-300 p-2 rounded mt-1' />
					</label>

					{/* Email do cliente */}
					<label className='block mb-4'>
						E-mail:
						<input type='email' name='email' value={customer.email} onChange={handleCustomerChange} className='w-full border border-gray-300 p-2 rounded mt-1' />
					</label>

					{/* Seleção de forma de pagamento */}
					<label className='block mb-6'>
						Forma de Pagamento:
						<select name='paymentMethod' value={paymentMethod} onChange={handlePaymentChange} className='w-full border border-gray-300 p-2 rounded mt-1'>
							<option value='cartao'>Cartão</option>
							<option value='dinheiro'>Dinheiro</option>
						</select>
					</label>

					{/* Botão Finalizar pedido */}
					<button onClick={handleCheckout} className='w-full p-2 bg-green-500 text-white rounded hover:bg-green-600 transition'>
						Finalizar pedido
					</button>

					{/* Exibição dos dados do pedido se já finalizado */}
					{order && (
						<div className='mt-8 p-4 border border-gray-300 rounded bg-gray-50'>
							<h3 className='text-lg font-semibold mb-2'>Resumo do Pedido</h3>
							<p>
								Cliente: <strong>{order.customer.name}</strong>
							</p>
							<p>Endereço: {order.customer.address}</p>
							<p>Telefone: {order.customer.phone}</p>
							<p>E-mail: {order.customer.email}</p>
							<p className='mt-2 font-medium'>Total pago: R$ {order.total.toFixed(2)}</p>
							<p className='mt-2 text-sm text-gray-500'>
								Verifique o console (F12) para os detalhes completos do objeto
								<code>order</code>.
							</p>
						</div>
					)}
				</div>
			</div>
		</>
	)
}
