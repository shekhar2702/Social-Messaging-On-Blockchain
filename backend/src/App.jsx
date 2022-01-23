import React,{useEffect,useState} from "react";
import { ethers } from "ethers";
import './App.css';
import abi from './utils/WavePortal.json';

export default function App() {

  const [message,setMessage] = useState("");
  const [allWaves,setAllWaves] = useState([]);
  const [currentAccount,setCurrentAccount] = useState("");
  const contractAddress = "0xd4cc8BC3a8B2B318b51bea369bb838f312C9Ba66";
  const contractABI = abi.abi;

  const getAllWaves = async () => {
    try{
      const {ethereum} = window;
      if(ethereum){
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(contractAddress,contractABI,signer);
        const waves = await wavePortalContract.getAllWaves();
        console.log(waves);
        let pureWaves = [];
        waves.forEach(wave =>{
          pureWaves.push({
            address:wave.waver,
            timestamp:new Date(wave.timestamp * 1000),
            message:wave.message
          })
        })
        setAllWaves(pureWaves);
      }
      else{
        console.log("Metamask not found.....");
      }
    } catch(error){
      console.log(error);
    }
  }

  const checkIfWalletIsConnected = async () => {
    try{
    const {ethereum} = window;
    if(!ethereum){
      console.log("Metamask not present!");
    }
    else{
      console.log("Congrats! you have the metamask object",ethereum)
    }
    const accounts = await ethereum.request({method:"eth_accounts"});
    if(accounts.length !==0){
      const account = accounts[0];
      console.log("Authorized account found",account);
      setCurrentAccount(account);
      getAllWaves();
    }
    else{
      console.log("No authorized account found.Please login to a valid account on metamask.");
    }
    }catch(error){
      console.log(error);
    }
    
  }
  useEffect(()=>{
    checkIfWalletIsConnected();
  },[]);
  
  const connectWallet = async ()=> {
    try{
      const {ethereum} = window;
      if(!ethereum){
        alert("Get Metamask extension installed for your browser");
        return;
      }
      console.log("Testtt");
      const accounts = await ethereum.request({method:"eth_requestAccounts"});
      console.log("Congrats !! Account connected",accounts[0]);
      setCurrentAccount(accounts[0]);
      getAllWaves();
    }catch(error){
      console.log(error);
    }
  }
  const handleSubmit = (event)=>{
    event.preventDefault();
    // alert("message is:- "+ message);
    console.log(message);
    wave();
    setMessage("");
  }
  const wave = async () => {
    try {
      const {ethereum} = window;
      if(ethereum){
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(contractAddress,contractABI,signer);

        let count = await wavePortalContract.getTotalWaves();
        console.log("Total wave count : ",count.toNumber());
        //Writing data (new waves) to backend(blockchain).
        const waveTxn = await wavePortalContract.wave(message,{ gasLimit: 300000 });
        console.log("Mining.....");

        await waveTxn.wait();
        console.log("Mined:- ",waveTxn.hash);

        await getAllWaves();

        count = await wavePortalContract.getTotalWaves();
        console.log("Retrieved total wave count.....",count.toNumber());
      }
      else{
        console.log("Metamask not present");
      }
    }catch(error){
      console.log(error);
    }
  }
  return (
    <div className="mainContainer">

      <div className="dataContainer">
        <div className="header">
        👋 Hey World !
        </div>

        <div className="bio">
        I am Somya Shekhar and I worked on self-driving cars so that's pretty cool right? Connect your Ethereum wallet and wave at me!
        </div>
        <form onSubmit={handleSubmit}>
        <input type="text"
         placeholder="Enter your message" 
         style={{margin:"10px",padding:"10px"}}
         value={message}
         onChange={(e)=>setMessage(e.target.value)}>
         </input>
        <button className="waveButton" type="submit">
          Wave at Me
        </button>
         </form>
       {!currentAccount && (
        <button className="waveButton" onClick={connectWallet}>
        Connect wallet
        </button>
       )}
       {allWaves.map((wave,index)=>{
         return (
           <div key={index}
           style={{backgroundColor: "OldLace", marginTop: "16px", padding: "8px"}}>
              <div>Sent By: {wave.address}</div>
              <div>Time: {wave.timestamp.toString()}</div>
              <div>Message: {wave.message}</div>
           </div>
         )
       })}
      </div>
    </div>
  );
}
