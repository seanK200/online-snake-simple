import React, { useState, useRef, useEffect } from 'react'
import { Form, Button } from 'react-bootstrap';

export default function Login({ onLogin }) {
    const [id, setId] = useState('');
    const loginFormRef = useRef();

    function handleSubmit(e) {
        e.preventDefault();
        onLogin(id);
    }

    useEffect(()=> {
        loginFormRef.current.focus();
    }, [])

    return (
        <div className="w-25">
            <h1>Online Snake</h1>
            <Form onSubmit={handleSubmit} className="mt-4">
                <Form.Group>
                    <Form.Label>Enter ID</Form.Label>
                    <Form.Control 
                        type="text"
                        value={id}
                        onChange={(e) => setId(e.target.value)}
                        ref={loginFormRef}
                    />
                    {id==='' ? <Button type="submit" className="mt-3" disabled>Login</Button> : <Button type="submit" className="mt-3">Login</Button>}
                    
                </Form.Group>
            </Form>
        </div>
    )
}
