import React from 'react'
import "./chatList.css";
import { Link } from "react-router-dom";

const ChatList = () => {
  return (
    <div className="chatList">
        <span className="title">DASHBOARD</span>
        <Link to="/dashboard">Create a New Chat</Link>
        <Link to="/">Explore CHAT APP</Link>
        <Link to="/">Contact</Link>
        <hr />
        <span className="title">RECENT CHATS</span>
        <div className="list">
            <Link to="/">My chat title</Link>
            <Link to="/">My chat title</Link>
            <Link to="/">My chat title</Link>
            <Link to="/">My chat title</Link>
            <Link to="/">My chat title</Link>
            <Link to="/">My chat title</Link>
            <Link to="/">My chat title</Link>
        </div>
        <hr className="bottomHr" />
        <div className="upgrade">
            <img src="/logo.png" alt="" />
            <div className="texts">
                <span>Upgrade to AI CHATAPP Pro</span>
                <span>Future Version - Coming Soon</span>
            </div>
        </div>
    </div>
  )
}

export default ChatList