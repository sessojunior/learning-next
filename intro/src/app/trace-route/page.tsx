'use client'

import React, { useEffect, useRef, useState } from 'react'

type LatLngLiteral = google.maps.LatLngLiteral
type Map = google.maps.Map
type DirectionsRenderer = google.maps.DirectionsRenderer

const DEFAULT_ORIGIN: LatLngLiteral = {
	lat: -23.55052, // Ex: São Paulo
	lng: -46.633308,
}

const GOOGLE_MAPS_API_KEY = 'SUA_CHAVE_AQUI' // 🔐 Substitua pela sua chave

const MapRoute: React.FC = () => {
	const mapRef = useRef<HTMLDivElement>(null)
	const mapInstance = useRef<Map | null>(null)
	const directionsRendererRef = useRef<DirectionsRenderer | null>(null)
	const [destinationInput, setDestinationInput] = useState('')
	const [origin] = useState(DEFAULT_ORIGIN)

	// Carrega o script do Google Maps
	const loadGoogleMaps = (): Promise<void> => {
		return new Promise((resolve, reject) => {
			if (typeof window.google !== 'undefined') return resolve()

			const script = document.createElement('script')
			script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`
			script.async = true
			script.onload = () => resolve()
			script.onerror = () => reject('Google Maps failed to load.')
			document.body.appendChild(script)
		})
	}

	// Inicializa o mapa
	const initMap = async () => {
		await loadGoogleMaps()

		if (mapRef.current && !mapInstance.current) {
			const map = new google.maps.Map(mapRef.current, {
				center: origin,
				zoom: 13,
			})
			mapInstance.current = map

			// Marcador de origem
			new google.maps.Marker({
				position: origin,
				map,
				label: 'Origem',
			})

			// Inicializa o renderer
			directionsRendererRef.current = new google.maps.DirectionsRenderer()
			directionsRendererRef.current.setMap(map)

			// Clique no mapa para definir destino
			map.addListener('click', (e: google.maps.MapMouseEvent) => {
				if (e.latLng) {
					calculateRoute(origin, {
						lat: e.latLng.lat(),
						lng: e.latLng.lng(),
					})
				}
			})
		}
	}

	// Calcula e exibe a rota
	const calculateRoute = (origin: LatLngLiteral, destination: LatLngLiteral) => {
		const directionsService = new google.maps.DirectionsService()

		directionsService.route(
			{
				origin,
				destination,
				travelMode: google.maps.TravelMode.DRIVING,
			},
			(result, status) => {
				if (status === 'OK' && result) {
					directionsRendererRef.current?.setDirections(result)
				} else {
					alert('Erro ao calcular rota: ' + status)
				}
			},
		)
	}

	// Geocodifica o endereço digitado
	const handleSearch = () => {
		const geocoder = new google.maps.Geocoder()
		geocoder.geocode({ address: destinationInput }, (results, status) => {
			if (status === 'OK' && results && results[0]) {
				const location = results[0].geometry.location
				calculateRoute(origin, {
					lat: location.lat(),
					lng: location.lng(),
				})
			} else {
				alert('Endereço não encontrado: ' + status)
			}
		})
	}

	useEffect(() => {
		initMap()
	}, [])

	return (
		<div className='flex flex-col gap-4 p-4'>
			<h1 className='text-xl font-bold mb-4'>Rota no Google Maps</h1>
			<div className='flex gap-2'>
				<input type='text' placeholder='Digite um endereço de destino' value={destinationInput} onChange={(e) => setDestinationInput(e.target.value)} className='border p-2 rounded w-full' />
				<button onClick={handleSearch} className='bg-blue-600 text-white px-4 py-2 rounded'>
					Traçar rota
				</button>
			</div>

			<div ref={mapRef} style={{ width: '100%', height: '500px', borderRadius: '12px' }} />
		</div>
	)
}

export default MapRoute
