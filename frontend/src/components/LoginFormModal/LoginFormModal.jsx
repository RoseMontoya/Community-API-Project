import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { login } from '../../store/session.js';
import { useModal } from '../../context/modal.jsx';
import './LoginForm.css';

const LoginFormModal = () => {
    const dispatch = useDispatch();

    const [credential, setCredential] = useState('');
    const [password, setPassword] = useState('');
    const [errors, setErrors] = useState({});
    const { closeModal } = useModal();

    const handleSumbit = async (e) => {
        e.preventDefault();
        setErrors({});

        const payload = {
            credential,
            password
        }
        return dispatch(login(payload))
            .then(closeModal)
            .catch(async (res) => {
                const data = await res.json();
                if (data && data.errors) {
                    setErrors(data.errors)
                }
            });
    }

    return (
        <div>
        <form onSubmit={handleSumbit} className='userForm'>
        <h2 >Log In</h2>
            <label>
                Username or Email
                <input
                    type="text"
                    placeholder="username or email"
                    value={credential}
                    onChange={(e) => setCredential(e.target.value)}
                    name="credential"
                />
                {errors.credential && <p className='error'>{errors.credential}</p>}
            </label>
            <label>
                Password
                <input
                    type="text"
                    placeholder="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    name="password"
                />
                {errors.password && <p className='error'>{errors.password}</p>}
            </label>
            {errors.message && <p className='error'>{errors.message}</p>}
            <button type='submit'>Log In</button>
        </form>
        </div>
    )
}

export default LoginFormModal;
