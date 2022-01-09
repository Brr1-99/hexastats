import React from 'react'

const Container = ({ title, description, children }) => {
	return (
        <div className='animate__animated animate__fadeIn'>
            <div className='container mx-auto py-5'>
                <h1 className='text-center text-4xl mt-10'>{ title }</h1>
				<br />
                <p className='text-center'>{ description }</p>
				<br />
				<br />
				{ children }
			</div>
		</div>
	)
}

export default Container
