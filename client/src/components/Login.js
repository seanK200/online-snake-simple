import React, { useState, useRef, useEffect } from 'react'
import { Form, Button } from 'react-bootstrap';

export default function Login({ onLogin }) {
    const [userId, setUserId] = useState('');
    const [matchId, setMatchId] = useState('');
    const loginFormRef = useRef();

    function handleSubmit(e) {
        e.preventDefault();
        // userJoin(id);
        onLogin(userId, matchId);
    }

    useEffect(()=> {
        loginFormRef.current.focus();
    }, [])

    return (
        <div className="w-25">
            <h1>Online Snake</h1>
            <Form onSubmit={handleSubmit} className="mt-4">
                <Form.Group className="mb-3">
                    <Form.Label>Enter User ID</Form.Label>
                    <Form.Control 
                        type="text"
                        value={userId}
                        onChange={(e) => setUserId(e.target.value)}
                        ref={loginFormRef}
                    />
                </Form.Group>
                <Form.Group>
                    <Form.Label>Enter Match ID</Form.Label>
                    <Form.Control 
                        type="text"
                        value={matchId}
                        onChange={(e) => setMatchId(e.target.value)}
                    />
                </Form.Group>
                {(userId==='' || matchId==='') 
                    ? <Button type="submit" className="mt-4" disabled>Join</Button> 
                    : <Button type="submit" className="mt-4">Join</Button>}
            </Form>
        </div>
    )
}
