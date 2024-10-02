import { useEffect, useState } from 'react'
import '../../global.css'
import { useNavigate } from 'react-router-dom';
import {jwtDecode} from 'jwt-decode'
import styles from './login.module.css'
import '../../LogInGlobalOverride.css'
import useAuth from '../../Authentification/useAuth';
import axios from 'axios';
const backendURL = import.meta.env.VITE_SERVER_URL;

function LogIn() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const {user} = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (user) {
            navigate('/')
        }
    })

    const handleFormSubmit = async (event) => {
        event.preventDefault();

        if (!username.trim() || !password.trim()) {
            setError('Username and password are required.');
            return;
        }

        try {
            const response = await axios.post(`${backendURL}/users/login`, {
                username,
                password
            })

            if (response.status === 200) {
                const data = await response.json();
                const token = data.token;

                // Store in local storage
                localStorage.setItem('token', token);

                const decodedToken = jwtDecode(token);
                console.log(decodedToken)
                navigate('/');
            }
        } catch (err) {
            if (err.response && err.response.status === 400) {
                setError('Invalid username or password.');
            } else {
                setError('Log in failed. Please try again.');
            }    
        }
    }

    const navigateSignUp = () => {
        navigate('/users/signup');
    }

  return (
    <>
        <div className={styles['login-body']}>
            <div className={styles["login-form-container"]}>
                <h1 className={styles.title}>Log In</h1>
                {error && <h3 className={styles['error']}>{error}</h3>}
                <form onSubmit={handleFormSubmit}>
                    <input 
                        type='text'
                        name='username'
                        placeholder='Username'
                        value={username}
                        onChange={e => setUsername(e.target.value)}
                    />
                    <input
                        type='password'
                        name='password'
                        placeholder='*********'
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                    />
                    <div className={styles['btn-container']}>
                        <button type='button' onClick={navigateSignUp} className={styles['signup-btn']}>Sign Up</button>
                        <button type='submit' className={styles['login-btn']}>Log In</button>
                    </div>
                </form>       
            </div>
        </div>
    </>
  )
}

export default LogIn;
