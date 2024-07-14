import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useModal } from '../../context/modal.jsx'
import { signup } from '../../store/session.js';
import './SignupForm.css';

const SignupFormModal = () => {
    const dispatch = useDispatch();
    const { closeModal } = useModal()

    const [username, setUsername] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [errors, setErrors] = useState({});

    // if (sessionUser) return <Navigate to="/" replace={true} />;

    const handleSumbit = async (e) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            setErrors({confirmPassword: 'Passwords do not match'});
        } else {
            const payload = {
                username,
                firstName,
                lastName,
                email,
                password
            }

           dispatch(signup(payload))
                .then(closeModal)
                .catch(async (res) => {
                    const data = await res.json();
                    if (data?.errors) {
                        setErrors(data.errors);
                    }
                })

        }

    }

    return (
        <>
        <h2>Signup</h2>
        <form onSubmit={handleSumbit} className='userForm'>
            <label>
                Email
            <input
                type="text"
                placeholder="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                name="email"
            />
            {errors.email && <p className='error'>{errors.email}</p>}
            </label>
            <label>
                Username
                <input
                    type="text"
                    placeholder="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    name="username"
                />
                {errors.username && <p className='error'>{errors.username}</p>}
            </label>
            <label>
                First Name
                <input
                    type="text"
                    placeholder="first name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    name="firstName"
                />
                {errors.firstName && <p className='error'>{errors.firstName}</p>}
            </label>
            <label>
                Last Name
                <input
                    type="text"
                    placeholder="last name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    name="lastName"
                />
                {errors.lastName && <p className='error'>{errors.lastName}</p>}
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
            <label>
                Confirm Password
                <input
                    type="text"
                    placeholder="confirm password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    name="confirmPassword"
                />
                {errors.confirmPassword && <p className='error'>{errors.confirmPassword}</p>}
            </label>
            <button type='submit'>Signup</button>
        </form>
        </>
    )
}

export default SignupFormModal;
