import React, { useState, useEffect } from "react";
import Web3 from "web3";
import { CONTRACT_ADDRESS, ABI } from "./config";
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import './App.css';  

const App = () => {
  const [web3, setWeb3] = useState(null);
  const [contract, setContract] = useState(null);
  const [account, setAccount] = useState("");
  const [policyId, setPolicyId] = useState("");
  const [claimProof, setClaimProof] = useState("");
  const [claimMssg, setClaimMssg] = useState("");
  const [premium, setPremium] = useState("");
  const [coverageAmount, setCoverageAmount] = useState(1);
  const [duration, setDuration] = useState("");
  const [policyDetails, setPolicyDetails] = useState(null);
  const [claimDetails, setClaimDetails] = useState(null);

  useEffect(() => {
    const initialize = async () => {
      if (window.ethereum) {
        const web3Instance = new Web3(window.ethereum);
        setWeb3(web3Instance);

        const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
        setAccount(accounts[0]);

        const contractInstance = new web3Instance.eth.Contract(ABI, CONTRACT_ADDRESS);
        setContract(contractInstance);
      } else {
        toast.error("MetaMask not found! Please install it.");
      }
    };

    initialize();
  }, []);

  const createPolicy = async () => {
    if (!premium || isNaN(premium) || Number(premium) <= 0) {
      toast.error("Please enter a valid premium value greater than 0.");
      return;
    }
    if (!coverageAmount || isNaN(coverageAmount) || Number(coverageAmount) <= 0) {
      toast.error("Please enter a valid coverage amount.");
      return;
    }
    if (!duration || isNaN(duration) || Number(duration) <= 0) {
      toast.error("Please enter a valid duration.");
      return;
    }

    const premiumInWei = web3.utils.toWei(premium, "ether");
    try {
      const accounts = await web3.eth.getAccounts();
      await contract.methods.createPolicy(premiumInWei, coverageAmount, duration)
        .send({ from: accounts[0], value: premiumInWei });
      toast.success("Policy created successfully!");
    } catch (error) {
      toast.error(error.message || "Error creating policy");
    }
  };

  const submitClaim = async () => {
    try {
      const accounts = await web3.eth.getAccounts();
      await contract.methods.submitClaim(policyId, claimProof, claimMssg).send({ from: accounts[0] });
      toast.success("Claim submitted successfully!");
    } catch (error) {
      toast.error(error.message || "Error submitting claim");
    }
  };

  const approveClaim = async () => {
    try {
      const accounts = await web3.eth.getAccounts();
      await contract.methods.approveClaim(policyId).send({ from: accounts[0] });
      toast.success("Claim approved successfully!");
    } catch (error) {
      toast.error(error.message || "Error approving claim");
    }
  };

  const rejectClaim = async () => {
    try {
      const accounts = await web3.eth.getAccounts();
      await contract.methods.rejectClaim(policyId).send({ from: accounts[0] });
      toast.success("Claim rejected!");
    } catch (error) {
      toast.error(error.message || "Error rejecting claim");
    }
  };

  const getPolicyDetails = async () => {
    try {
      const details = await contract.methods.getPolicyDetails(policyId).call();
      setPolicyDetails({
        id: policyId,
        premium: web3.utils.fromWei(details.premium, "ether"),
        coverageAmount: details.coverageAmount,
        duration: details.duration,
        isActive: details.isActive,
      });
      toast.success("Policy details fetched successfully!");
    } catch (error) {
      toast.error(error.message || "Error fetching policy details");
    }
  };

  const getClaimDetails = async () => {
    try {
      const details = await contract.methods.getClaimDetails(policyId).call();
      setClaimDetails({
        claimId: details.claimId,
        policyId: details.policyId,
        claimant: details.claimant,
        proof: details.proof,
        message: details.message,
        isApproved: details.isApproved,
      });
      toast.success("Claim details fetched successfully!");
    } catch (error) {
      toast.error(error.message || "Error fetching claim details");
    }
  };

  return (
    <div className="app-container">
      <h1>Insurance DApp</h1>
      <ToastContainer />
      <p className="account-info">Connected Account: {account}</p>

      <div className="form-container">
        <h2>Create Policy</h2>
        <input
          type="text"
          placeholder="Premium (in Ether)"
          onChange={(e) => setPremium(e.target.value)}
          className="input-field"
        />
        <input
          type="number"
          placeholder="Coverage Amount"
          onChange={(e) => setCoverageAmount(e.target.value)}
          className="input-field"
        />
        <input
          type="number"
          placeholder="Duration (in seconds)"
          onChange={(e) => setDuration(e.target.value)}
          className="input-field"
        />
        <button onClick={createPolicy} className="button">Create Policy</button>

        <h2>Submit Claim</h2>
        <input
          type="number"
          placeholder="Policy ID"
          onChange={(e) => setPolicyId(e.target.value)}
          className="input-field"
        />
        <input
          type="text"
          placeholder="Proof URL"
          onChange={(e) => setClaimProof(e.target.value)}
          className="input-field"
        />
        <input
          type="text"
          placeholder="Message"
          onChange={(e) => setClaimMssg(e.target.value)}
          className="input-field"
        />
        <button onClick={submitClaim} className="button">Submit Claim</button>

        <h2>Get Policy Details</h2>
        <input
          type="number"
          placeholder="Policy ID"
          onChange={(e) => setPolicyId(e.target.value)}
          className="input-field"
        />
        <button onClick={getPolicyDetails} className="button">Get Policy Details</button>
        {policyDetails && (
          <div>
            <p><strong>Premium:</strong> {policyDetails.premium} ETH</p>
            <p><strong>Coverage Amount:</strong> {policyDetails.coverageAmount}</p>
            <p><strong>Duration:</strong> {policyDetails.duration} seconds</p>
            <p><strong>Active:</strong> {policyDetails.isActive ? "Yes" : "No"}</p>
          </div>
        )}

        <h2>Get Claim Details</h2>
        <button onClick={getClaimDetails} className="button">Get Claim Details</button>
        {claimDetails && (
          <div>
            <p><strong>Claim ID:</strong> {claimDetails.claimId}</p>
            <p><strong>Policy ID:</strong> {claimDetails.policyId}</p>
            <p><strong>Claimant:</strong> {claimDetails.claimant}</p>
            <p><strong>Proof:</strong> {claimDetails.proof}</p>
            <p><strong>Message:</strong> {claimDetails.message}</p>
            <p><strong>Approved:</strong> {claimDetails.isApproved ? "Yes" : "No"}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
