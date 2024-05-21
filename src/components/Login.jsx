import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { logIn as storeLogin } from '../store/authSlice'
import authService from '../appwrite/auth'
import { Input, Button, Logo } from './index'
import Loader from './Loader'

const Login = () => {
  const [error, setError] = useState('')
  const [loader, setLoader] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm()

  const dispatch = useDispatch()
  const navigate = useNavigate()

  const login = async (data) => {
    setLoader(true)
    setError('')
    try {
      console.log(data, '71')
      const session = await authService.login(data)
      console.log(session, 72)
      if (session) {
        const userData = await authService.getCurrentUser()
        console.log(userData, 73)
        if (userData) {
          dispatch(storeLogin({ userData: userData }))
        }
        console.log(data, '74')

        navigate('/')
      }
    } catch (error) {
      setError(error.message)
    }
    setLoader(false)
  }


  if (loader) {
    return <Loader />
  }
  else {
    return (
      <div className='flex items-center justify-center w-full py-12'>
        <div className={`mx-auto w-full max-w-lg bg-gray-100 rounded-xl p-10 border border-black/10`}>
          <h2 className="text-center text-2xl font-bold">Sign in to your account</h2>
          <p className="mt-2 text-center text-base text-black/60">
            Don't have any account?&nbsp;
            <Link
              to="/signup"
              className="font-medium text-primary transition-all duration-200 hover:underline"
            >
              Sign Up
            </Link>
          </p>

          <form onSubmit={handleSubmit(login)}>
            <div>
              <Input
                placeholder={'Enter your email'}
                label={'Email : '}
                type={'email'}

                {...register("email", {
                  required: true,
                  validate: {
                    matchPatern: (value) => /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(value) ||
                      "Email address must be a valid address",
                  }
                })}
              />


              <Input
                placeholder={'Enter your password'}
                label={'Password :'}
                type={"password"}

                {...register('password', {
                  required: true
                })}
              />
              {errors.password && <p className="text-red-600">Password is required</p>}

              <Button
                type={'submit'}
                Children={'Next'}
                className='bg-[#6a5acd] mt-2 text-white px-3 pb-0.5 rounded-md hover:bg-[#7878DC]'
              />
            </div>
            {error && <p className="text-red-600 mt-8 text-center">{error}</p>}
          </form>
        </div>
      </div>
    )
  }
}

export default Login