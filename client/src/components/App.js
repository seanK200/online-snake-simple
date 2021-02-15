import { useState } from "react";
import { GameDataProvider } from "../contexts/GameDataProvider";
import SocketProvider from "../contexts/SocketProvider";
import Login from "./Login";
import Snake from './Snake';

function App() {
  const [myUserId, setMyUserId] = useState('');
  const [matchId, setMatchId] = useState('');

  function handleLogin(newUserId, newMatchId) {
    setMyUserId(newUserId);
    setMatchId(newMatchId);
  }

  function handleLogout() {
    setMyUserId('');
    setMatchId('');
  }

  const loginView = (
    <Login onLogin={handleLogin} /> 
  );

  const gameView = (
    <SocketProvider myUserId={myUserId} matchId={matchId}>
      <GameDataProvider myUserId={myUserId} matchId={matchId}>
        <Snake myUserId={myUserId} onLogout={handleLogout} />
      </GameDataProvider>
    </SocketProvider>
  );

  return (
    <div 
      className="w-100 vh-100 d-flex flex-column justify-content-center align-items-center"
      style={{ background: '#282c34', color: 'white' }}
    >
        {myUserId==='' ? loginView : gameView }
    </div>
  );
}

export default App;
