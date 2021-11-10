/* eslint-disable @next/next/no-img-element */
import React from 'react'
import { Disclosure } from '@headlessui/react'

export default function Navbar({page, setPage}) {
	
	const navigation = [
		{ name: 'Stats', onClick: () => setPage(0), current: (page==0) },
		{ name: 'Graphs', onClick: () => setPage(1), current: (page==1) },
		{ name: 'Masteries', onClick: () => setPage(2), current: (page==2) },
	]

	return (
		<Disclosure as="nav" className="bg-gray-800">
			{({ open }) => (
				<>
					<div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
						<div className="relative flex items-center justify-between h-16">
							<div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
								{/* Mobile menu button*/}
								<Disclosure.Button className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white">
									<span className="sr-only">Open main menu</span>
									{open ? <i className="bi bi-x-lg"></i> : <i className="bi bi-list"></i>}
								</Disclosure.Button>
							</div>
							<div className="flex-1 flex items-center justify-center sm:items-stretch sm:justify-start">
								<div className="flex-shrink-0 flex items-center">
									<img className="block h-8 w-auto" src="https://tailwindui.com/img/logos/workflow-mark-indigo-500.svg" alt="Hexastats" />
									<h1 className="text-2xl text-white ml-2 hidden lg:block">Hexastats</h1>
								</div>
								<div className="hidden sm:block sm:ml-6">
									<div className="flex space-x-4">
										{navigation.map((item) => (
											<button
												key={item.name}
												onClick={item.onClick}
												className={'px-3 py-2 rounded-md text-sm font-medium ' + 
													(item.current ? 'bg-gray-900 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white')
												}
												aria-current={item.current ? 'page' : undefined}
											>{item.name}</button>
										))}
									</div>
								</div>
							</div>
							<div className="absolute right-0">
								<a href="https://github.com/dawichi" target="_blank" className="text-white text-2xl" rel="noreferrer">다 위 치</a>
							</div>
						</div>
					</div>

					<Disclosure.Panel className="sm:hidden">
						<div className="px-2 pt-2 pb-3 space-y-1">
							{navigation.map((item) => (
								<button key={item.name} onClick={item.onClick}
									className={'block px-3 py-2 rounded-md text-base font-medium ' + 
										(item.current ? 'bg-gray-900 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white')
									}
									aria-current={item.current ? 'page' : undefined}
								>{item.name}</button>
							))}
						</div>
					</Disclosure.Panel>
				</>
			)}
		</Disclosure>
	)
	
}