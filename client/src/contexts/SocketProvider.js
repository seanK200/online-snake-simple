import React, { useContext, useEffect, useState } from 'react'
import io from 'socket.io-client';

const SocketContext = React.createContext();

export function useSocket() {
    return useContext(SocketContext);
}

export default function SocketProvider({ myUserId, matchId, children }) {
    // console.log("Rendering socketprovider");
    const [socket, setSocket] = useState(null);

    useEffect(() => {
        const newSocket = io(
            'http://localhost:5000',
            { query: { userId: myUserId, matchId }}
        );
        setSocket(newSocket);
        console.log("Socket connection established");
        return () => newSocket.close();
    }, [myUserId, matchId]);

    useEffect(() => {
        if(socket==null) return;
        socket.on("disconnect", () => {
            console.log("disconnect");
        })
    }, [socket])

    return (
        <SocketContext.Provider value={socket}>
            {socket!==null && children}
        </SocketContext.Provider>
    )
}
