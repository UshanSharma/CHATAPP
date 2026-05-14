import { Link } from "react-router-dom"
import "./homepage.css"
import { TypeAnimation } from "react-type-animation"
import { useState } from "react"

const Homepage = () => {

  const [typingStatus,setTypingStatus] = useState("Ushan")

  return (
    <div className="homepage">
      <img src="/orbital.png" alt="" className= "orbital"/>
      <div className= "left" >
        <h1>CHAT APP</h1>
        <h2>SuperCharge your creativity and productivity</h2>
        <h3>Lorem ipsum dolor sit, amet consectetur adipisicing elit. Placeat sint
          dolorem doloribus, architecto dolor.
        </h3>
        <Link to="/dashboard">Get Started</Link>
      </div>
      <div className="right">
        <div className= "imgContainer">
          <div className="bgContainer">
            <div className="bg"></div>
          </div>
          <img src= "/bot.png" alt="" className="bot"/>
          <div className="chat">
            <img src={typingStatus === "Ushan"
            ? "/human1.jpeg" 
            : typingStatus === "Meghna" 
            ? "/human2.jpeg"
            : typingStatus === "Vineet"
            ? "/human1.jpeg" 
            : "/bot.png"
            } alt=""/>
              <TypeAnimation
                sequence={[
                  'Ushan : We produce food for Mice',
                  2000, ()=>{
                    setTypingStatus("bot")
                  },
                  'Bot: We produce food for Hamsters',
                  2000, ()=>{
                    setTypingStatus("Meghna")
                  },
                  'Meghna: We produce food for Guinea Pigs',
                  2000, ()=>{
                     setTypingStatus("bot") 
                  },
                  'Bot: We produce food for Chinchillas',
                  2000, () =>{
                    setTypingStatus("Vineet")
                  },
                  'Vineet: We produce food for Rats',
                  2000, () =>{
                    setTypingStatus("bot")
                  },
                  'Bot: We produce food for Gerbils',
                  2000, () => {
                    setTypingStatus("Ushan")
                  }
                ]}
                wrapper="span"
                repeat={Infinity}
                cursor={true}
                omitDeletionAnimation={true}
                />
          </div>
        </div>
      </div>
      <div className="terms">
        <img src="logo.png" alt="" />
        <div className="links">
          <Link to= "/">Terms of Service</Link>
          <span>|</span>
          <Link to = "/">Privacy Policy</Link>
        </div>
      </div>
    </div>
  )
}

export default Homepage

