import { useState, useEffect } from 'react'
import { supabase } from '..dbConnection'

function TripChat({tripId, currUserId}){
    const [messages, setMessages] = useState([])
    const [newMessage, setNewMessage] = useState("")

    useEffect(() => {
        fetch(`/api/trips/${tripId}/messages`)
            .then(res => res.json())
            .then(data => setMessages(data))

        const chatChannel = supabase.channel(`chat_${tripId}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'trip_messages',
                    filter: `trip_id=eq.${tripId}`
                },
                (payload) => {
                    setMessages((prev) => [...prev, payload.new])
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(chatChannel)
        }
    }, [tripId])

    const handleSendMessage = async (e) => {
        e.preventDefault()

        await fetch(`/api/trips/${tripId}/messages`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({text: newMessage})
        })
        setNewMessage('')
    }

    return(
        <div className="chat-container">
      <div className="message-history">
        {messages.map((msg) => (
          <div key={msg.id} className={msg.user_id === currUserId ? 'my-message' : 'their-message'}>
            <p>{msg.text}</p>
          </div>
        ))}
      </div>

      <form onSubmit={handleSendMessage}>
        <input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)} 
          placeholder="Say hello!" 
        />
        <button type="submit">Send</button>
      </form>
    </div>
  )
}

export default TripChat