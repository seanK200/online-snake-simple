import { useState } from "react";
import Login from "./Login";
import Snake from './Snake';

function App() {
  const [id, setId] = useState('');

  function handleLogin(newId) {
    setId(newId);
  }

  function handleLogout() {
    setId('');
  }

  return (
    <div 
      className="w-100 vh-100 d-flex flex-column justify-content-center align-items-center"
      style={{ background: '#282c34', color: 'white' }}
    >
      {id==='' ? <Login onLogin={handleLogin}/> : <Snake myId={id} onLogout={handleLogout} />}
    </div>
  );
}

export default App;
